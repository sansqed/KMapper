import {App, Plugin, PluginSettingTab, Setting, SliderComponent, TextAreaComponent } from "obsidian";
import ObsidianKG from "main";
import Utils from "./Utils";
import OpenAIExample from "types/OpenAIExample";
import { defaultPrompt, defaultExamples } from "./sample-data/defaultLLMData";

type LayoutOption = 'layered' | 'radial' | 'force' | 'stress'

export interface MainSettingsData{
    // Generation pipeline settings
    isGenerating: boolean
    canvasPath: string
    canvasFileName:string
    generatedPath: string
    generatedFileName:string
    selectedMD: string[]
    openAfterGenerate: boolean
    overwriteFile: boolean
    
    // Triple Extraction settings
    llm: string
    llmPrompt:string
    editLlmPrompt: boolean
    openAISettings: {
        key: string
        examples: OpenAIExample[]
        temperature: number
    }

    // Graph Layout settings
    eklConfig: {
        baseSpacing: number
        layout: LayoutOption
    }
    minTextBoxWidth: number
    maxTextBoxWidth: number

}

export const DEFAULT_SETTINGS:MainSettingsData = {
    // Generation pipeline settings
    isGenerating: false,
    canvasPath: '',
    canvasFileName: '',
    generatedPath: '',
    generatedFileName: '',
    selectedMD: [],
    openAfterGenerate: true,
    overwriteFile: false,

    // Triple Extraction settings
    llm: 'gpt-3.5-turbo-0125',
    llmPrompt: defaultPrompt,
    editLlmPrompt: false,
    openAISettings: {
        key: '',
        examples: defaultExamples,
        temperature: 0.01
    },

    // Graph Layout settigs
    eklConfig: {
        baseSpacing: 250,
        layout: 'layered'
    },
    minTextBoxWidth: 250,
    maxTextBoxWidth: 500,
}

export class MainSettings extends PluginSettingTab{
    static settingsData: MainSettingsData = DEFAULT_SETTINGS
    static plugin: ObsidianKG

    constructor(app: App, plugin: ObsidianKG){
        super(app, plugin)
        MainSettings.plugin = plugin
    }
    display(){
        const {containerEl} = this;

		containerEl.empty();
        this.displayTitle(containerEl)
        this.displayOpenAI(containerEl)
        this.displayGraphLayout(containerEl)
    }

    displayTitle(container:HTMLElement){
        let titleWrapper = container.createDiv("settings-title-wrapper")
        let titleText = titleWrapper.createEl("h1")
        let versionText = titleWrapper.createEl("p")
        
        titleWrapper.style.display = "flex"
        titleWrapper.style.alignItems = "center"
        titleText.setText("KMapper Settings")
        versionText.setText("v1.0")
        versionText.style.paddingTop = "0.25rem"
        versionText.style.marginLeft = "1rem"
    }

    displayOpenAI(container:HTMLElement){
        const settingContainer = container.createDiv({cls: "setting-container"})
        const titleWrapper = settingContainer.createDiv({cls: "setting-title"})
        const titleText = titleWrapper.createEl("h2")

        titleText.setText("OpenAI settings")
        titleText.style.fontSize = "1.25em"

        let openAIToken = new Setting(settingContainer)
        .setName("OpenAI API key")
        .setDesc("Provide your API key to use OpenAI's large language models")
        .setHeading()
        .addText(text => {
            text.inputEl.style.width = "80%"
            text
                .setPlaceholder("Set OpenAI API key")
                .setValue(Utils.obfuscateOpenAIKey(MainSettings.settingsData.openAISettings.key))
                .onChange(async(value) => {
                    MainSettings.settingsData.openAISettings.key = value.trim()
                    await MainSettings.saveSettings()
                })
        })

        let promptText: TextAreaComponent
        let llmPrompt:Setting

        let editLlmPrompt = new Setting(settingContainer)
            .setName("Edit LLM prompt")
            .setDesc("Enable to edit LLM Prompt. Set to disabled by default to prevent accidental changes to prompt.")
            .addToggle(toggle => {
                toggle
                    .setValue(false)
                    .onChange(async(value) => {
                        promptText.setDisabled(!value)
                        if(value)
                            llmPrompt.settingEl.style.display = 'flex'
                        else
                            llmPrompt.settingEl.style.display = 'none'
                    })
            })

        llmPrompt = new Setting(settingContainer)
            .setName('LLM prompt')
            .setDesc("Instruction prompt to be passed to the LLM in extracting the concept-relation-concept triples")
            .addTextArea(text => {

                text.inputEl.style.width = "120%"
                text.inputEl.style.height = "10rem"
                text.inputEl.style.resize = "none"
                text
                    .setValue(MainSettings.settingsData.llmPrompt)
                    .onChange(async(value) => {
                        MainSettings.settingsData.llmPrompt = value.trim()
                        await MainSettings.saveSettings()
                    }) 
                    .setDisabled(true)
                promptText = text                    
            })
        llmPrompt.infoEl.style.flex = "0 1 auto"
        llmPrompt.descEl.style.width = "10rem"
        llmPrompt.settingEl.style.display = 'none'
        
        let hline = settingContainer.createEl("hr")

        let examplesContainer = settingContainer.createDiv({cls: "example-container"})
        let ExampleSetting = new Setting(examplesContainer)
            .setName("OpenAI examples")
            .setHeading()
            .setDesc("These examples will guide the GPT models in the creating the ideal triples")
            .addButton(button => {
                button.setButtonText("Add new example").onClick(async() => {
                    this.insertEmptyExampleData()
                }) 
            })
        this.displayExamples(examplesContainer)
    }

    displayExamples(container:HTMLElement){
        const labelsContainer = container.createDiv()
        labelsContainer.style.display = "flex"
        labelsContainer.style.width = "90%"
        labelsContainer.style.justifyContent = "space-evenly"
        labelsContainer.style.marginBottom = "0.5rem"

        const promptText = labelsContainer.createEl("p")
        promptText.setText("Prompt")
        promptText.style.width = "50%"
        promptText.style.textAlign = "center"
        promptText.style.margin = "0"

        const completionText = labelsContainer.createEl("p")
        completionText.setText("Completion")
        completionText.style.width = "50%"
        completionText.style.textAlign = "center"
        completionText.style.margin = "0"

        MainSettings.settingsData.openAISettings.examples.forEach(({prompt, completion}, idx) => {
            let textbox = new Setting(container)
                .setName('')
                .addTextArea(text => {
                    text.inputEl.style.width = "100%"
                    text.inputEl.style.height = "10rem"
                    text.inputEl.style.resize = "none"
                    text.inputEl.setAttribute("onkeydown", "if(event.keyCode===9){var v=this.value,s=this.selectionStart,e=this.selectionEnd;this.value=v.substring(0, s)+'\t'+v.substring(e);this.selectionStart=this.selectionEnd=s+1;return false;}")
                    text
                        .setValue(prompt)
                        .setPlaceholder("Prompt")
                        .onChange(async(value) => {
                            MainSettings.settingsData.openAISettings.examples[idx].prompt = value
                            await MainSettings.saveSettings()
                        })

                })
                .addTextArea(text => {
                    text.inputEl.style.width = "100%"
                    text.inputEl.style.height = "10rem"
                    text.inputEl.style.resize = "none"
                    text.inputEl.setAttribute("onkeydown", "if(event.keyCode===9){var v=this.value,s=this.selectionStart,e=this.selectionEnd;this.value=v.substring(0, s)+'\t'+v.substring(e);this.selectionStart=this.selectionEnd=s+1;return false;}")
                    text
                        .setValue(completion)
                        .setPlaceholder("Completion")
                        .onChange(async(value) => {
                            MainSettings.settingsData.openAISettings.examples[idx].completion = value
                            await MainSettings.saveSettings()
                        })
                })
                .addButton(button => {
                    button.setButtonText("Delete")
                        .onClick(async() => {
                            this.deleteExampleData(idx)
                        })
                })
            textbox.nameEl.remove()
            textbox.infoEl.remove()
        })
    }

    displayGraphLayout(container:HTMLElement){
        const settingContainer = container.createDiv({cls: "setting-container"})

        let hline = settingContainer.createEl("hr")

        const titleWrapper = settingContainer.createDiv({cls: "setting-title"})
        const titleText = titleWrapper.createEl("h2")

        titleText.setText("Graph layout settings")
        titleText.style.fontSize = "1.25em"

        let minWidthSlider: SliderComponent, maxWidthSlider: SliderComponent

        const minTextBoxWidth = new Setting(settingContainer)
            .setName("Minimum text box width")
            .setDesc("This sets the minimum text box width in Canvas")
            .addSlider(slider => {
                minWidthSlider = slider
                minWidthSlider
                    .setLimits(100, 1000, 50)
                    .setDynamicTooltip()
                    .setValue(MainSettings.settingsData.minTextBoxWidth)
                    .onChange(async(value) => {
                        MainSettings.settingsData.minTextBoxWidth = value
                        if(value > MainSettings.settingsData.maxTextBoxWidth){
                            maxWidthSlider.setValue(value)
                            MainSettings.settingsData.maxTextBoxWidth = value
                        }
                        await MainSettings.saveSettings()
                    })
            })

        const maxTextBoxWidth = new Setting(settingContainer)
            .setName("Maximum text box width")
            .setDesc("This sets the maximum text box width in Canvas")
            .addSlider(slider => {
                maxWidthSlider = slider
                maxWidthSlider
                    .setLimits(100, 1000, 50)
                    .setDynamicTooltip()
                    .setValue(MainSettings.settingsData.maxTextBoxWidth)
                    .onChange(async(value) => {
                        MainSettings.settingsData.maxTextBoxWidth = value
                        if(value < MainSettings.settingsData.minTextBoxWidth){
                            minWidthSlider.setValue(value)
                            MainSettings.settingsData.minTextBoxWidth = value
                        }
                        await MainSettings.saveSettings()
                    })
                
            })

        const spacing = new Setting(settingContainer)
            .setName("Graph spacing")
            .setDesc("This sets the spacing of the text boxes with each other. It is recommended to set it at 100-150.")
            .addSlider(slider => {
                slider
                    .setLimits(50, 500, 50)
                    .setDynamicTooltip()
                    .setValue(MainSettings.settingsData.eklConfig.baseSpacing)
                    .onChange(async(value)=>{
                        MainSettings.settingsData.eklConfig.baseSpacing = value
                        await MainSettings.saveSettings()
                    })
                
            })

    }

    async insertEmptyExampleData(){
        MainSettings.settingsData.openAISettings.examples.push({prompt: "", completion: ""})
        await MainSettings.saveSettings()
        this.display()
    }

    async deleteExampleData(idx:number){
        MainSettings.settingsData.openAISettings.examples.splice(idx, 1)
        await MainSettings.saveSettings()
        this.display()
    }

    static async saveSettings(){
		await MainSettings.plugin.saveData(MainSettings.settingsData)
	}

    static async loadSettings(){
        MainSettings.settingsData = Object.assign({}, DEFAULT_SETTINGS, await MainSettings.plugin.loadData())
    }

    
}
