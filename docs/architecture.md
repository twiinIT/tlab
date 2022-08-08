# Architecture

## Overview

```mermaid
flowchart
    subgraph Front
        subgraph Panel1
            TLabShellWidget1 --> |shows| Widget1
            TLabShellWidget1 --> |shows| Widget2
            Widget1 --> |operates| TLabStore1
            Widget2 --> |operates| TLabStore1
        end
        subgraph Panel2
            TLabShellWidget2 --> |shows| Widget3
            Widget3 --> |operates| TLabStore2
        end
        subgraph Panel3
            TLabShellWidget3 --> |shows| Widget4
            TLabShellWidget3 --> |shows| Widget5
            Widget4 --> |operates| TLabStore3
            Widget5 --> |operates| TLabStore3
        end
        TLabStore1 --> |uses| IKernelStoreHandler1
        TLabStore2 --> |uses| IKernelStoreHandler1
        TLabStore3 --> |uses| IKernelStoreHandler2
        ITLabStoreManager ....-> |creates| TLabStore1
        ITLabStoreManager ....-> |creates| TLabStore2
        ITLabStoreManager ....-> |creates| TLabStore3
        ITLabStoreManager ....-> |creates| IKernelStoreHandler1
        ITLabStoreManager ....-> |creates| IKernelStoreHandler2
        ITLabFrontManager .-> |provides| TLabShellWidget1
        ITLabFrontManager .-> |provides| TLabShellWidget2
        ITLabFrontManager .-> |provides| TLabShellWidget3
    end
    subgraph Kernel1
        IKernelStoreHandler1 ..- |comm| KernelStore1
    end
    subgraph Kernel2
        IKernelStoreHandler2 ..- |comm| KernelStore2
    end
```

### Front

**Packages:**

- [Front](../src/front/)
- [Controller widget](../src/widget-controller/)
- [Kernel widget](../src/widget-kernel/)
- [Plotly widget](../src/widget-plotly/)

TLab inferface is based on [FlexLayout](https://github.com/caplin/FlexLayout). Each widget is registered in the `ITLabFrontManager` and consume models from the store.

### Store

**Packages:**

- [Store](../src/store/)
- [Python plugin](../src/python/)
- [Python module](../tlab/)

The store exposes data models to the widgets.

It is made of four entities: `ITLabStoreManager`, `ITLabStore`, `IKernelStoreHandler` on the frontend, and the store in kernel. The last two are kernel/language bounded.

```mermaid
flowchart LR
    ITLabStoreManager .-> |instantiate| ITLabStore
    ITLabStoreManager .-> |instantiate| IKernelStoreHandler
    Widgets <--> ITLabStore
    ITLabStore <--> IKernelStoreHandler
    subgraph Kernel-dependant
        IKernelStoreHandler <..-> |comm| KernelStore
        subgraph Kernel
            KernelStore
        end
    end
```

### Data models

**Packages:**

- [Built-in models – Front](../src/builtins/)
- [Built-in models – Python](../tlab/builtins.py)

Data models contains synced attributes.
They are defined both in the frontend and kernel.

## Sequence diagrams

### Startup

```mermaid
sequenceDiagram
    note right of JupyterLab : Extension startup
    JupyterLab ->>+ labStoreManagerPlugin : activate()
    labStoreManagerPlugin -->>- JupyterLab : ITLabStoreManager
    JupyterLab ->>+ labFrontManagerPlugin : activate(ITLabStoreManager)
    labFrontManagerPlugin ->> JupyterLab : register cmds
    labFrontManagerPlugin -->>- JupyterLab : ITLabFrontManager
    JupyterLab ->>+ anyLanguageSupportPlugin: activate(ITLabStoreManager)
    anyLanguageSupportPlugin ->>- labStoreManagerPlugin : register kernel store handler
    JupyterLab ->>+ anyModelPlugin : activate(ITLabStoreManager)
    anyModelPlugin ->>- labStoreManagerPlugin : register models
    JupyterLab ->>+ anyWidgetPlugin : activate(ITLabFrontManager)
    anyWidgetPlugin ->>- labFrontManagerPlugin : register widgets
```

### Launch

Each twiinIT Lab "view" (`TLabShellWidget`) gets its own `TLabStore` instance.

```mermaid
sequenceDiagram
    actor User
    note right of User : Launch
    User ->> JupyterLab : "Open twiinIT Lab"
    JupyterLab ->> ITLabFrontManager : execute command
    ITLabFrontManager ->> ITLabStoreManager : newStore()
    ITLabStoreManager -->> ITLabFrontManager : store
    ITLabFrontManager ->> TLabShellWidget : create(front, store)
    TLabShellWidget -->> ITLabFrontManager : widget
    ITLabFrontManager ->> JupyterLab : add widget to shell
    JupyterLab -->> User : twiinIT Lab pane
```

### Store connection

Each `TLabStore` has a language-specific `IKernelStoreHandler` shared by all stores on the same kernel. `IKernelStoreHandler` is responsible for instantiating the kernel store and establishing a connection with it.

```mermaid
sequenceDiagram
    actor User
    participant JupyterLab
    participant StoreWidget
    participant TLabStore
    participant TLabStoreManager
    participant IKernelStoreHandler
    participant KernelStore
    note right of User : Store conn
    TLabStore ->> User : kernel selection
    User -->> TLabStore : kernel choice
    TLabStore ->> TLabStoreManager : getKernelStoreHandler
    opt instantiate store backend if not present
        TLabStoreManager ->> IKernelStoreHandler : create
        IKernelStoreHandler ->> JupyterLab : open comm and instantiate
        JupyterLab ->> KernelStore : instantiate
        IKernelStoreHandler --> KernelStore : comm
    end
    TLabStoreManager -->> TLabStore : handler
```

### Add model

```mermaid
sequenceDiagram
    actor User
    participant StoreWidget
    participant TLabStore
    participant TLabStoreManager
    participant KernelStoreHandler
    participant KernelStore
    participant Kernel
    note right of User : Add model
    KernelStoreHandler --> KernelStore : comm
    User ->> StoreWidget : "add `foo`"
    StoreWidget ->> TLabStore : fetch(`foo`)
    TLabStore ->> KernelStoreHandler : fetch(`foo`)
    KernelStoreHandler ->> KernelStore : fetch(`foo`)
    KernelStore ->> Kernel : get `foo`
    Kernel -->> KernelStore: foo
    KernelStore -->> KernelStoreHandler : foo.dict()
    KernelStoreHandler -->> TLabStore : foo.dict()
    TLabStore ->> TLabStoreManager : parse(foo.dict())
    TLabStoreManager -->> TLabStore : foo
    TLabStore -->> StoreWidget : signal.emit(foo)
    StoreWidget -->> User : print(foo)
```

### Visualization

```mermaid
sequenceDiagram
    actor User
    participant TLab
    participant Widget
    participant TLabStore
    note right of User : Visualization
    User ->> TLab : "add Widget"
    TLab ->> Widget : create
    Widget ->> TLabStore : filter(ModelClass)
    TLabStore -->> Widget: Generator<ModelClass>
    Widget -->> User : ready
```
