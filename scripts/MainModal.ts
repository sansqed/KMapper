import { App, Modal, Setting, Notice, TFolder, ProgressBarComponent, ButtonComponent } from 'obsidian';
import React from 'react';
import treeifyPaths, { PathTree } from "treeify-paths";
import FileItem from './file-tree/FileItem';
import FolderItem from './file-tree/FolderItem';
import FileTree from './file-tree/FileTree';
import KmapperPipeline from './KMapperPipeline';
import TreeItem from './file-tree/TreeItem';
import { MainSettings, MainSettingsData } from './MainSettings';
import { GenericTextSuggester } from './suggester/genericTestSuggester';
import Utils from './Utils';

export default class MainModal extends Modal {
    private filePickerModalEl: HTMLElement;
    fileTree:FileTree;
    selectedFilesPath: Array<string>;
    kmapperPipeline: KmapperPipeline;
    settings:MainSettingsData

    static progressBar:ProgressBarComponent
    static generateBtn:ButtonComponent

	constructor(app: App, settings:MainSettingsData) {
		super(app);
        this.fileTree = new FileTree(app)
        this.kmapperPipeline = new KmapperPipeline(app)
        this.settings = settings
	}

	async onOpen() {
        this.resetSettings()

		const {contentEl, titleEl, modalEl} = this;

        modalEl.style.width = "25vw"
        modalEl.style.height = "70vh"
        modalEl.style.boxShadow = "var(--shadow-s)"

        let titleText = titleEl.createEl("h2")
		
        titleEl.style.height = "3rem"
        titleText.setText('KMapper');

        this.showFileTreeArea(contentEl)
        this.showSettings(contentEl)
	}

    showFileTreeArea(container:HTMLElement){
        let fileTree = container.createDiv({ cls: 'file-tree-container' });
        fileTree.style.height = "100%";
        fileTree.style.width = "100%";
        fileTree.style.overflowY = "auto";
        fileTree.style.overflowX = "auto";
        fileTree.style.padding = "1em";
        
        let files = this.app.vault.getMarkdownFiles();
        let paths = files.map(f => f.path)
        let dirTree = treeifyPaths(paths)

        this.fileTree.addChildren(dirTree.children)

        this.fileTree.generateHTML(fileTree)
    }

    showSettings(container:HTMLElement){
        let settingsContainer = container.createDiv({cls: 'settings-container modal'})
        this.containerEl.insertAfter(settingsContainer, this.modalEl)
        settingsContainer.style.height = "fit-content"
        settingsContainer.style.width = "30vw"
        settingsContainer.style.marginLeft = "1rem"
        settingsContainer.style.boxShadow = "var(--shadow-s)"
        
        let titleWrapper = settingsContainer.createDiv({cls: 'title-wrapper'})
        let titleText = titleWrapper.createEl("h2")
        titleText.setText("Settings")

        let exportPath = new Setting(settingsContainer)
            .setName("Generate path")
            .addText(text => {
                text
                    .setPlaceholder("Path")
                    .setValue(MainSettings.settingsData.canvasPath)
                    .onChange(async(value) => {
                        MainSettings.settingsData.canvasPath = Utils.sanitizePath(value)
                        await MainSettings.saveSettings()
                    })
                new GenericTextSuggester(
                    this.app,
                    text.inputEl,
                    this.app.vault
                        .getAllLoadedFiles()
                        .filter((f) => f instanceof TFolder && f.path !== "/")
                        .map((f) => f.path)
                )
            })
        
        let pathSep = createEl("p")
        pathSep.setText("/")
        exportPath.controlEl.appendChild(pathSep)

        exportPath.addText((text) => {
            text.inputEl.style.width = '30%';
            text
                .setPlaceholder('File name')
                .setValue(MainSettings.settingsData.canvasFileName)
                .onChange(async(value) => {
                    MainSettings.settingsData.canvasFileName = Utils.sanitizeCanvasName(value)
                    await MainSettings.saveSettings()
                })
        })

        let extension = createEl("p")
        extension.setText(".canvas")

        exportPath.controlEl.appendChild(extension)
            
        let model = new Setting(settingsContainer)
            .setName("LLM to use")
            .addDropdown(dropdown => dropdown
                .addOption('gpt-3.5-turbo', 'GPT 3.5 Turbo')
                .addOption('gpt-3.5-turbo-0125', 'GPT 3.5 Turbo 0125')
                .addOption('gpt-4-turbo', 'GPT 4 Turbo')
                .setValue(MainSettings.settingsData.llm)
                .onChange(async(value) => {
                    MainSettings.settingsData.llm = value
                    await MainSettings.saveSettings()
                })
            )
        let openAfterGenerate = new Setting(settingsContainer)
            .setName("Open after generation")
            .addToggle(toggle => {
                toggle
                    .setValue(MainSettings.settingsData.openAfterGenerate)
                    .onChange(async(value)=>{
                        MainSettings.settingsData.openAfterGenerate = value
                        await MainSettings.saveSettings()
                    })

            })

        let overwrite = new Setting(settingsContainer)
        .setName("Overwrite file if exist")
        .addToggle(toggle => {
            toggle
                .setValue(MainSettings.settingsData.overwriteFile)
                .onChange(async(value)=>{
                    MainSettings.settingsData.overwriteFile = value
                    await MainSettings.saveSettings()
                })

        })

        this.showGenerateBtn(settingsContainer)
    }

    showGenerateBtn(container:HTMLElement){
        let generateBtn = new Setting(container)
            .addButton(button => {
                MainModal.generateBtn = button
                MainModal.generateBtn.buttonEl.style.backgroundColor = "var(--interactive-accent)"
                MainModal.generateBtn.buttonEl.style.marginTop = "1rem"
                MainModal.generateBtn.buttonEl.style.width = "100%"
                MainModal.generateBtn.buttonEl.style.color = "white"
                MainModal.generateBtn
                    .setButtonText("Generate concept map")
                    .onClick(() => {
                        let { isValid, reasons } = Utils.isSettingsValid()
                        if(isValid){
                            this.showProgressBar(container)
                            this.generateKnowledgeGraph()
                        }
                        else {
                            new Notice("ERROR: Cannot generate canvas.")
                            reasons.forEach(async (r) => {
                                await sleep(100)
                                let notice = new Notice(r)
                            }) 
                        }
                    })
            })
        generateBtn.nameEl.remove()
        generateBtn.infoEl.remove()
    }

    showProgressBar(container:HTMLElement){
        let progressBar = new Setting(container)
            .addProgressBar(bar => {
                MainModal.progressBar = bar
            })

        progressBar.infoEl.remove()
    }

    async generateKnowledgeGraph(){
        const { canvasPath, canvasFileName } = MainSettings.settingsData
        MainSettings.settingsData.generatedPath = canvasPath
        MainSettings.settingsData.generatedFileName =  canvasFileName
        MainModal.generateBtn.setDisabled(true)
        await this.kmapperPipeline.runPipeline()
        MainModal.generateBtn.setDisabled(false)
        this.close()
        return
    }

    resetSettings(){
        MainSettings.settingsData.canvasPath = ''
        MainSettings.settingsData.canvasFileName = ''
        MainSettings.settingsData.selectedMD = []
    }

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

