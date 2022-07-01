// Copyright (C) 2022, twiinIT
// SPDX-License-Identifier: BSD-3-Clause

import { JupyterFrontEnd } from '@jupyterlab/application';
import { ReactWidget } from '@jupyterlab/apputils';
import { listIcon } from '@jupyterlab/ui-components';
import { UUID } from '@lumino/coreutils';
import { Widget } from '@lumino/widgets';
import {
  BorderNode,
  IJsonModel,
  ITabSetRenderValues,
  Layout,
  Model,
  TabNode,
  TabSetNode
} from 'flexlayout-react';
import 'flexlayout-react/style/light.css';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { TLabStore } from '../store/store';
import { ITLabFrontManager, ITLabWidget, ITLabWidgetProps } from './manager';

/**
 * TLab Lumino widget wrapping TLab.
 */
export class TLabShellWidget extends ReactWidget {
  constructor(
    private app: JupyterFrontEnd,
    private manager: ITLabFrontManager,
    private store: TLabStore,
    options?: Widget.IOptions
  ) {
    super(options);
    this.id = UUID.uuid4();
    this.title.label = 'twiinIT Lab';
    this.title.closable = true;
    this.title.icon = listIcon;
  }

  render(): JSX.Element {
    return <TLab manager={this.manager} store={this.store} />;
  }
}

const DEFAULT_LAYOUT: IJsonModel = {
  global: {
    tabEnableRename: true,
    tabSetTabLocation: 'bottom'
  },
  borders: [],
  layout: {
    type: 'row',
    children: [
      {
        type: 'tabset',
        children: [{ type: 'tab', name: 'Welcome', component: 'welcome' }]
      }
    ]
  }
};

function TLab({ manager, store }: ITLabWidgetProps) {
  const [model, setModel] = useState<Model>(Model.fromJson(DEFAULT_LAYOUT));
  const layoutRef = useRef<Layout>(null);

  const factory = useCallback(
    (node: TabNode) => {
      const id = node.getComponent();
      if (id) {
        let component;
        switch (id) {
          case 'welcome':
            component = <h1>Welcome on twiinIT Lab</h1>;
            break;

          default: {
            const widget = manager.widgets.get(id);
            component = widget?.component({ manager, store });
            break;
          }
        }
        return component;
      }
    },
    [manager, store]
  );

  const addWidget = useCallback(
    (tabSetNode: TabSetNode, id: string) => {
      const layout = layoutRef.current;
      const widget = manager.widgets.get(id);
      if (layout && widget) {
        layout.addTabToTabSet(tabSetNode.getId(), {
          type: 'tab',
          name: widget.name,
          component: widget.id
        });
      }
    },
    [manager.widgets]
  );

  const onRenderTabSet = useCallback(
    (
      tabSetNode: TabSetNode | BorderNode,
      renderValues: ITabSetRenderValues
    ) => {
      renderValues.stickyButtons.push(
        <WidgetMenu
          widgets={manager.widgets}
          addWidget={addWidget.bind(null, tabSetNode as TabSetNode)}
        />
      );
    },
    [addWidget, manager.widgets]
  );

  return (
    <Layout
      ref={layoutRef}
      model={model}
      factory={factory}
      onModelChange={setModel}
      onRenderTabSet={onRenderTabSet}
    />
  );
}

function WidgetMenu({
  widgets,
  addWidget
}: {
  widgets: Map<string, ITLabWidget>;
  addWidget: (id: string) => void;
}) {
  const [value, setValue] = useState('');

  const options = useMemo(() => {
    const _widgets = [...widgets.values()];
    _widgets.sort((a, b) => a.name.localeCompare(b.name));
    const options = _widgets.map(w => (
      <option value={w.id} key={w.id}>
        {w.name}
      </option>
    ));
    return options;
  }, [widgets]);

  const onChange = useCallback(
    e => {
      e.preventDefault();
      const id = e.target.value;
      addWidget(id);
      setValue('');
    },
    [addWidget]
  );

  return (
    <select value={value} onChange={onChange}>
      <option value="">Add Widget</option>
      {options}
    </select>
  );
}
