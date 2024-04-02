import { StrictMode, createContext } from "react"
import { ItemView, WorkspaceLeaf, App } from "obsidian"
import { Root, createRoot } from "react-dom/client"
import { ReactView } from "./react_view"

export const AppContext = createContext<App | undefined>(undefined)
export const PluginContext = createContext<any | undefined>(undefined)
export const VIEW_TYPE_TEXT = "persona-view_tomato"

export class PluginMainView extends ItemView {
	root: Root | null = null

	constructor(leaf: WorkspaceLeaf) {
		super(leaf)
	}

	getViewType() {
		return VIEW_TYPE_TEXT
	}

  getIcon(): string {
    return "alarm-clock"
  }

	getDisplayText() {
		return "Persona"
	}

  async renderView () {
    // @ts-ignore
    const view: FileView = this.app.workspace.getActiveFileView()
    if (!view) return

    if (view.getViewType() === "markdown") {
      this.root?.render(
        <StrictMode>
          <AppContext.Provider value={this.app}>
            <ReactView />
          </AppContext.Provider>
        </StrictMode>
      )
    } else if (view.getViewType() === "kanban") {
      // TODO: get kanban links
    } else {
      // clean file links
    }
  }

	async onOpen() {
		this.root = createRoot(this.containerEl.children[1])
    this.renderView()
	}

	async onClose() {
		this.root?.unmount()
	}
}
