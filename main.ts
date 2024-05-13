import { Plugin, TFile, addIcon } from 'obsidian';
import MainModal from 'scripts/MainModal';
import OptimizeCanvas from 'scripts/OptimizeCanvas';
import { MainSettings } from 'scripts/MainSettings';

export default class KMapperPlugin extends Plugin {
	static settings: MainSettings
	static plugin: KMapperPlugin

	async onload() {
		KMapperPlugin.plugin = this

		this.addSettingTab(new MainSettings(this.app, this));
		MainSettings.loadSettings()

		const ribbonIconEl = this.addRibbonIcon('brain-circuit', 'Generate concept map ', (evt: MouseEvent) => {
			new MainModal(this.app, MainSettings.settingsData).open()
		});		
		ribbonIconEl.addClass('kmapper-ribbon');

		this.addCommand({
			id: 'generate-concept-map',
			name: 'Generate concept map',
			callback: () => {
				new MainModal(this.app, MainSettings.settingsData).open();
			}
		});

		this.addCommand({
			id: 'optimize-canvas',
			name: 'Optimize canvas layout',
			checkCallback: (checking:boolean) => {
				const file = this.app.workspace.getActiveFile()
		
				if(file instanceof TFile && file.extension == "canvas"){
					if(!checking)
						new OptimizeCanvas(this.app).optimize(file)
					
					return true
				}
			}
		});
	}

	onunload() {

	}
}
