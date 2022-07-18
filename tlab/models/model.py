# Copyright (C) 2022, twiinIT
# SPDX-License-Identifier: BSD-3-Clause

from collections.abc import Iterable
from contextlib import contextmanager
from json import dumps as jsondumps
from json import loads as jsonloads

from ipykernel.comm import Comm
from traitlets import (Container, Dict, HasTraits, Instance, List, Set,
                       Undefined, Unicode, default)

__models_base_version__ = '1.0.0'

_binary_types = (memoryview, bytearray, bytes)


def _put_buffers(state, buffer_paths, buffers):
    """The inverse of _remove_buffers, except here we modify the existing dict/lists.
    Modifying should be fine, since this is used when state comes from the wire.
    """
    for buffer_path, buffer in zip(buffer_paths, buffers):
        # we'd like to set say sync_data['x'][0]['y'] = buffer
        # where buffer_path in this example would be ['x', 0, 'y']
        obj = state
        for key in buffer_path[:-1]:
            obj = obj[key]
        obj[buffer_path[-1]] = buffer


def _separate_buffers(substate, path, buffer_paths, buffers):
    """For internal, see _remove_buffers"""
    # remove binary types from dicts and lists, but keep track of their paths
    # any part of the dict/list that needs modification will be cloned, so the original stays untouched
    # e.g. {'x': {'ar': ar}, 'y': [ar2, ar3]}, where ar/ar2/ar3 are binary types
    # will result in {'x': {}, 'y': [None, None]}, [ar, ar2, ar3], [['x', 'ar'], ['y', 0], ['y', 1]]
    # instead of removing elements from the list, this will make replacing the buffers on the js side much easier
    if isinstance(substate, (list, tuple)):
        is_cloned = False
        for i, v in enumerate(substate):
            if isinstance(v, _binary_types):
                if not is_cloned:
                    substate = list(substate)  # shallow clone list/tuple
                    is_cloned = True
                substate[i] = None
                buffers.append(v)
                buffer_paths.append(path + [i])
            elif isinstance(v, (dict, list, tuple)):
                vnew = _separate_buffers(v, path + [i], buffer_paths, buffers)
                if v is not vnew:  # only assign when value changed
                    if not is_cloned:
                        substate = list(substate)  # clone list/tuple
                        is_cloned = True
                    substate[i] = vnew
    elif isinstance(substate, dict):
        is_cloned = False
        for k, v in substate.items():
            if isinstance(v, _binary_types):
                if not is_cloned:
                    substate = dict(substate)  # shallow clone dict
                    is_cloned = True
                del substate[k]
                buffers.append(v)
                buffer_paths.append(path + [k])
            elif isinstance(v, (dict, list, tuple)):
                vnew = _separate_buffers(v, path + [k], buffer_paths, buffers)
                if v is not vnew:  # only assign when value changed
                    if not is_cloned:
                        substate = dict(substate)  # clone list/tuple
                        is_cloned = True
                    substate[k] = vnew
    else:
        raise ValueError("expected state to be a list or dict, not %r" %
                         substate)
    return substate


def _remove_buffers(state):
    """Return (state_without_buffers, buffer_paths, buffers) for binary message parts

    A binary message part is a memoryview, bytearray, or python 3 bytes object.

    As an example:
    >>> state = {'plain': [0, 'text'], 'x': {'ar': memoryview(ar1)}, 'y': {'shape': (10,10), 'data': memoryview(ar2)}}
    >>> _remove_buffers(state)
    ({'plain': [0, 'text']}, {'x': {}, 'y': {'shape': (10, 10)}}, [['x', 'ar'], ['y', 'data']],
     [<memory at 0x107ffec48>, <memory at 0x107ffed08>])
    """
    buffer_paths, buffers = [], []
    state = _separate_buffers(state, [], buffer_paths, buffers)
    return state, buffer_paths, buffers


def _buffer_list_equal(a, b):
    """Compare two lists of buffers for equality.

    Used to decide whether two sequences of buffers (memoryviews,
    bytearrays, or python 3 bytes) differ, such that a sync is needed.

    Returns True if equal, False if unequal
    """
    if len(a) != len(b):
        return False
    if a == b:
        return True
    for ia, ib in zip(a, b):
        # Check byte equality, since bytes are what is actually synced
        # NOTE: Simple ia != ib does not always work as intended, as
        # e.g. memoryview(np.frombuffer(ia, dtype='float32')) !=
        # memoryview(np.frombuffer(b)), since the format info differs.
        # Compare without copying.
        if memoryview(ia).cast('B') != memoryview(ib).cast('B'):
            return False
    return True


class Model(HasTraits):
    #-------------------------------------------------------------------------
    # Traits
    #-------------------------------------------------------------------------
    _model_name = Unicode('Model', help="Name of the model.",
                          read_only=True).tag(sync=True)
    _model_module = Unicode('@tlab/base',
                            help="The namespace for the model.",
                            read_only=True).tag(sync=True)
    _model_module_version = Unicode(
        __models_base_version__,
        help="A semver requirement for namespace version containing the model.",
        read_only=True).tag(sync=True)

    comm = Instance('ipykernel.comm.Comm', allow_none=True)

    keys = List(help="The traits which are synced.")

    @default('keys')
    def _default_keys(self):
        return [name for name in self.traits(sync=True)]

    _property_lock = Dict()
    _holding_sync = False
    _states_to_send = Set()

    #-------------------------------------------------------------------------
    # (Con/de)structor
    #-------------------------------------------------------------------------
    def __init__(self, **kwargs):
        """Public constructor"""
        super().__init__(**kwargs)
        self.uuid = None

    def __del__(self):
        """Object disposal"""
        self.close()

    #-------------------------------------------------------------------------
    # Properties
    #-------------------------------------------------------------------------

    def open(self, comm: Comm, uuid: str, req_id: str):
        """Open a comm to the frontend if one isn't already open."""
        if self.comm is None:
            state, buffer_paths, buffers = _remove_buffers(self.get_state())

            metadata = {'method': 'reply', 'req_id': req_id}
            args = dict(
                data={
                    'state': state,
                    'buffer_paths': buffer_paths
                },
                buffers=buffers,
                metadata=metadata,
            )

            comm.send(**args)
            self.comm = comm
            self.uuid = uuid

    #-------------------------------------------------------------------------
    # Methods
    #-------------------------------------------------------------------------

    def close(self):
        """Close method."""
        self.comm = None

    def send_state(self, key=None):
        """Sends the Model state, or a piece of it, to the front-end, if it exists.

        Parameters
        ----------
        key : unicode, or iterable (optional)
            A single property's name or iterable of property names to sync with the front-end.
        """
        state = self.get_state(key=key)
        if len(state) > 0:
            if self._property_lock:  # we need to keep this dict up to date with the front-end values
                for name, value in state.items():
                    if name in self._property_lock:
                        self._property_lock[name] = value
            state, buffer_paths, buffers = _remove_buffers(state)
            msg = {
                'method': 'update',
                'state': state,
                'buffer_paths': buffer_paths
            }
            self._send(msg, buffers=buffers)

    def get_state(self, key=None, drop_defaults=False):
        """Gets the model state, or a piece of it.

        Parameters
        ----------
        key : unicode or iterable (optional)
            A single property's name or iterable of property names to get.

        Returns
        -------
        state : dict of states
        metadata : dict
            metadata for each field: {key: metadata}
        """
        if key is None:
            keys = self.keys
        elif isinstance(key, str):
            keys = [key]
        elif isinstance(key, Iterable):
            keys = key
        else:
            raise ValueError(
                "key must be a string, an iterable of keys, or None")
        state = {}
        traits = self.traits()
        for k in keys:
            to_json = self.trait_metadata(k, 'to_json', self._trait_to_json)
            value = to_json(getattr(self, k), self)
            if not drop_defaults or not self._compare(value,
                                                      traits[k].default_value):
                state[k] = value
        return state

    def _is_numpy(self, x):
        return x.__class__.__name__ == 'ndarray' and x.__class__.__module__ == 'numpy'

    def _compare(self, a, b):
        if self._is_numpy(a) or self._is_numpy(b):
            import numpy as np
            return np.array_equal(a, b)
        else:
            return a == b

    def set_state(self, sync_data):
        """Called when a state is received from the front-end."""
        # The order of these context managers is important. Properties must
        # be locked when the hold_trait_notification context manager is
        # released and notifications are fired.
        with self.hold_sync(), self._lock_property(
                **sync_data), self.hold_trait_notifications():
            for name in sync_data:
                if name in self.keys:
                    from_json = self.trait_metadata(name, 'from_json',
                                                    self._trait_from_json)
                    self.set_trait(name, from_json(sync_data[name], self))

    def send(self, content, buffers=None):
        """Sends a custom msg to the model in the front-end.

        Parameters
        ----------
        content : dict
            Content of the message to send.
        buffers : list of binary buffers
            Binary buffers to send with message
        """
        self._send({"method": "custom", "content": content}, buffers=buffers)

    def notify_change(self, change):
        """Called when a property has changed."""
        # Send the state to the frontend before the user-registered callbacks
        # are called.
        name = change['name']
        if self.comm is not None and self.comm.kernel is not None:
            # Make sure this isn't information that the front-end just sent us.
            if name in self.keys and self._should_send_property(
                    name, getattr(self, name)):
                # Send new state to front-end
                self.send_state(key=name)
        super().notify_change(change)

    def __repr__(self):
        return self._gen_repr_from_keys(self._repr_keys())

    #-------------------------------------------------------------------------
    # Support methods
    #-------------------------------------------------------------------------

    @contextmanager
    def _lock_property(self, **properties):
        """Lock a property-value pair.

        The value should be the JSON state of the property.

        NOTE: This, in addition to the single lock for all state changes, is
        flawed.  In the future we may want to look into buffering state changes
        back to the front-end."""
        self._property_lock = properties
        try:
            yield
        finally:
            self._property_lock = {}

    @contextmanager
    def hold_sync(self):
        """Hold syncing any state until the outermost context manager exits"""
        if self._holding_sync is True:
            yield
        else:
            try:
                self._holding_sync = True
                yield
            finally:
                self._holding_sync = False
                self.send_state(self._states_to_send)
                self._states_to_send.clear()

    def _should_send_property(self, key, value):
        """Check the property lock (property_lock)"""
        to_json = self.trait_metadata(key, 'to_json', self._trait_to_json)
        if key in self._property_lock:
            # model_state, buffer_paths, buffers
            split_value = _remove_buffers({key: to_json(value, self)})
            split_lock = _remove_buffers({key: self._property_lock[key]})
            # A roundtrip conversion through json in the comparison takes care of
            # idiosyncracies of how python data structures map to json, for example
            # tuples get converted to lists.
            if (jsonloads(jsondumps(split_value[0])) == split_lock[0] and
                    split_value[1] == split_lock[1] and
                    _buffer_list_equal(split_value[2], split_lock[2])):
                if self._holding_sync:
                    self._states_to_send.discard(key)
                return False
        if self._holding_sync:
            self._states_to_send.add(key)
            return False
        else:
            return True

    # Event handlers
    def _handle_msg(self, msg):
        """Called when a msg is received from the front-end"""
        data = msg['content']['data']
        method = data['method']

        if method == 'update':
            if 'state' in data:
                state = data['state']
                if 'buffer_paths' in data:
                    _put_buffers(state, data['buffer_paths'], msg['buffers'])
                self.set_state(state)

        # Handle a state request.
        elif method == 'request_state':
            self.send_state()

        # Handle a custom msg from the front-end.
        # elif method == 'custom':
        #     if 'content' in data:
        #         self._handle_custom_msg(data['content'], msg['buffers'])

        # Catch remainder.
        else:
            raise RuntimeError(
                'Unknown front-end to back-end model msg with method "%s"' %
                method)

    @staticmethod
    def _trait_to_json(x, self):
        """Convert a trait value to json."""
        return x

    @staticmethod
    def _trait_from_json(x, self):
        """Convert json values to objects."""
        return x

    def _send(self, msg, buffers=None):
        """Sends a message to the model in the front-end."""
        if self.comm is not None and self.comm.kernel is not None:
            self.comm.send(data=msg,
                           buffers=buffers,
                           metadata={'uuid': self.uuid})

    def _repr_keys(self):
        traits = self.traits()
        for key in sorted(self.keys):
            # Exclude traits that start with an underscore
            if key[0] == '_':
                continue
            # Exclude traits who are equal to their default value
            value = getattr(self, key)
            trait = traits[key]
            if self._compare(value, trait.default_value):
                continue
            elif (isinstance(trait, (Container, Dict)) and
                  trait.default_value == Undefined and
                  (value is None or len(value) == 0)):
                # Empty container, and dynamic default will be empty
                continue
            yield key

    def _gen_repr_from_keys(self, keys):
        class_name = self.__class__.__name__
        signature = ', '.join(
            '{}={!r}'.format(key, getattr(self, key)) for key in keys)
        return '{}({})'.format(class_name, signature)
