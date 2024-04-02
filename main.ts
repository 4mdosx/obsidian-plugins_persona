import { Plugin, WorkspaceLeaf } from "obsidian"
import { PluginMainView, VIEW_TYPE_TEXT } from "./main_view"

export default class Persona extends Plugin {
	async onload() {
		this.registerView(VIEW_TYPE_TEXT, (leaf) => new PluginMainView(leaf))
		this.addRibbonIcon("alarm-clock", "Open a view", () => {
			this.activateView()
		})
	}

	async onunload() {
		// Release any resources configured by the plugin.
	}

	async activateView() {
		const { workspace } = this.app

		let leaf: WorkspaceLeaf | null = null
		const leaves = workspace.getLeavesOfType(VIEW_TYPE_TEXT)

		if (leaves.length > 0) {
			// A leaf with our view already exists, use that
			leaf = leaves[0]
		} else {
			// Our view could not be found in the workspace, create a new leaf
			// in the right sidebar for it
			leaf = workspace.getRightLeaf(false)

			await leaf?.setViewState({ type: VIEW_TYPE_TEXT, active: true })
		}

		// "Reveal" the leaf in case it is in a collapsed sidebar
		leaf && workspace.revealLeaf(leaf)
	}
}
