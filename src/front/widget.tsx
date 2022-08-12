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
import React, { useMemo, useRef, useState } from 'react';
import { ITLabStore } from '../store/store';
import { ITLabFrontManager, ITLabWidget, ITLabWidgetProps } from './manager';

/**
 * TLab Lumino React widget wrapper.
 */
export class TLabShellWidget extends ReactWidget {
  constructor(
    private app: JupyterFrontEnd,
    private manager: ITLabFrontManager,
    private store: ITLabStore,
    options?: Widget.IOptions
  ) {
    super(options);
    this.id = UUID.uuid4();
    this.title.label = 'twiinIT Lab';
    this.title.closable = true;
    this.title.icon = listIcon;
  }

  render() {
    return <TLab manager={this.manager} store={this.store} />;
  }
}

/**
 * Flexlayout default layout.
 */
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

/**
 * TLab main React component.
 */
function TLab({ manager, store }: ITLabWidgetProps) {
  const [model, setModel] = useState<Model>(Model.fromJson(DEFAULT_LAYOUT));
  const layoutRef = useRef<Layout>(null);

  const factory = (node: TabNode) => {
    const id = node.getComponent();
    if (id) {
      let component;
      switch (id) {
        case 'welcome':
          component = <h1>Welcome on twiinIT Lab</h1>;
          break;

        default: {
          // Create widget from registry
          const widget = manager.widgets.get(id);
          component = widget?.component({ manager, store });
          break;
        }
      }

      // For plotly among others
      // FIXME: this is a hack to make sure the component is resized when the tab is resized
      node.setEventListener('resize', () => {
        window.dispatchEvent(new Event('resize'));
      });

      return component;
    }
  };

  const addWidget = (tabSetNode: TabSetNode, id: string) => {
    const layout = layoutRef.current;
    const widget = manager.widgets.get(id);
    if (layout && widget) {
      layout.addTabToTabSet(tabSetNode.getId(), {
        type: 'tab',
        name: widget.name,
        component: widget.id
      });
    }
  };

  const onRenderTabSet = (
    tabSetNode: TabSetNode | BorderNode,
    renderValues: ITabSetRenderValues
  ) => {
    renderValues.stickyButtons.push(
      <WidgetMenu
        widgets={manager.widgets}
        addWidget={addWidget.bind(null, tabSetNode as TabSetNode)}
      />
    );
  };

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

/**
 * Widget menu.
 */
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

  const onChange: React.ChangeEventHandler<HTMLSelectElement> = e => {
    e.preventDefault();
    const id = e.target.value;
    addWidget(id);
    setValue('');
  };

  return (
    <select value={value} onChange={onChange}>
      <option value="">Add Widget</option>
      {options}
    </select>
  );
}
