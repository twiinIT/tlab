# twiinIT Lab Architecture

## Overview

- Visualization widgets are registered in `TLabFrontManager`.
- These widgets use available data in store.
- Stores are managed by `ITLabStoreManager`. They have a front part `TLabStore` exposed to widgets and a kernel language-dependant side: a kernel store handler implementing `IKernelStoreHandler` and the in-kernel store.
- Kernel stores are fed by data sources.

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
        DataSource1 --> |feeds| KernelStore1
        DataSource2 --> |feeds| KernelStore1
    end
    subgraph Kernel2
        IKernelStoreHandler2 ..- |comm| KernelStore2
        DataSource3 --> |feeds| KernelStore2
    end
```

## Sequence diagrams

### Startup

Core plugins include `labFrontManagerPlugin` and `labStoreManagerPlugin`.
Other plugins include language support, data sources, models and widgets.

```mermaid
sequenceDiagram
    note right of JupyterLab : Extension startup
    JupyterLab ->>+ labStoreManagerPlugin : activate()
    labStoreManagerPlugin -->>- JupyterLab : ITLabStoreManager
    JupyterLab ->>+ labFrontManagerPlugin : activate(ITLabStoreManager)
    labFrontManagerPlugin ->> JupyterLab : register cmds
    labFrontManagerPlugin -->>- JupyterLab : ITLabFrontManager
    JupyterLab ->>+ anyLanguageSupportPlugin: activate(ITLabStoreManager)
    anyLanguageSupportPlugin ->> labStoreManagerPlugin : register kernel store handler
    anyLanguageSupportPlugin -->>- JupyterLab : ITLabLanguageSupport
    JupyterLab ->>+ anyDataSourceModelPlugin : activate(ITLabStoreManager, ITLabLanguageSupport)
    anyDataSourceModelPlugin ->> labStoreManagerPlugin : register models
    anyDataSourceModelPlugin ->>- anyLanguageSupportPlugin : register datasources
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
    participant ITLabStoreManager
    participant IKernelStoreHandler
    participant KernelStore
    participant Datasources
    note right of User : Store conn
    TLabStore ->> User : kernel selection
    User -->> TLabStore : kernel choice
    TLabStore ->> ITLabStoreManager : getKernelStoreHandler
    opt instantiate store backend if not present
        ITLabStoreManager ->> IKernelStoreHandler : create
        IKernelStoreHandler ->> JupyterLab : create conn
        JupyterLab ->> KernelStore : instantiate
        KernelStore ->> Datasources : add
        IKernelStoreHandler --> KernelStore : conn
    end
    ITLabStoreManager -->> TLabStore : handler
```

### Add variable

```mermaid
sequenceDiagram
    actor User
    participant StoreWidget
    participant TLabStore
    participant IKernelStoreHandler
    participant KernelStore
    participant Kernel
    participant BarDataSource
    note right of User : Add variables
    IKernelStoreHandler --> KernelStore : comm
    User ->> KernelStore : "add `foo` to store"
    KernelStore ->> Kernel : get `foo`
    Kernel -->> KernelStore : foo, of type bar
    KernelStore ->> BarDataSource : serialize foo
    BarDataSource -->> TLabStore : serialized foo, type bar
```

```mermaid
sequenceDiagram
    TLabStore ->> ITLabStoreManager : deserialize foo, type bar
    ITLabStoreManager ->> BarDataModel : deserialize foo
    BarDataModel -->> TLabStore : foo in JS data model
```

### Visualization

```mermaid
sequenceDiagram
    actor User
    participant TLab
    participant VisuWidget
    participant TLabStore
    note right of User : Visualization
    User ->> TLab : "add Visu"
    TLab ->> VisuWidget : create
    VisuWidget ->> TLabStore : getOfType(Type1)
    TLabStore -->> VisuWidget: Type1[]
    VisuWidget ->> TLabStore : getOfType(Type2)
    TLabStore -->> VisuWidget : Type2[]
    VisuWidget -->> User : ready
```
