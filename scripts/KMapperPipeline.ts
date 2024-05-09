import { App, TFile, Notice } from 'obsidian';
import SelectedMD from './SelectedMD';
import TripletExtractor from './TripletExtractor';
import { Triple } from 'types/TripleType';
import DrawGraph from './DrawGraph';
import { MainSettings } from './MainSettings';
import Utils from './Utils';
import MainModal from './MainModal';
import { sampleTriples } from './sample-data/sampleTriplets';

export default class KMapperPipeline{
    app: App;
    files: Array<TFile> = []
    selectedMD: SelectedMD = new SelectedMD()
    tripletExtractor: TripletExtractor = new TripletExtractor()
    triples: Triple[] = []
    drawGraph: DrawGraph

    constructor(app: App){
        this.app = app
        this.drawGraph = new DrawGraph(app)
    }

    public async runPipeline(){
        Utils.handleLog("Kmapper", "info", "Running pipeline")

        MainSettings.settingsData.isGenerating = true
        await MainSettings.saveSettings()

        new Notice("Getting files from vault")
        this.getFiles()
        MainModal.progressBar.setValue(10)
        
        new Notice("Cleaning contents")
        await this.getContents()
        MainModal.progressBar.setValue(30)
        
        new Notice("Getting triples")
        const triples = await this.tripletExtractor.getTriples(this.selectedMD)
        this.triples.push(...triples)
        MainModal.progressBar.setValue(80)

        new Notice("Drawing graph")
        const canvas = await this.drawGraph.draw(this.triples)
        MainModal.progressBar.setValue(90)

        new Notice("Creating canvas file")
        let file = await Utils.writeCanvas(this.app, canvas.toString())
        
        if(MainSettings.settingsData.openAfterGenerate)
            Utils.openCanvas(this.app, file)
        
        MainModal.progressBar.setValue(100)

        MainSettings.settingsData.isGenerating = false
        await MainSettings.saveSettings()

        Utils.handleLog("Kmapper", "info", `Pipeline done`)
        return
    }

    private async getContents(){
        const { vault } = this.app

        const childPromises = this.files.map(async (f) => {
            const content = await vault.read(f);
            const fileName = f.name.split(/\.md$/)[0]

            return this.selectedMD.addMDContents(content)
        })

        await Promise.all(childPromises)
        return
    }

    private getFiles(){
        const filePaths = MainSettings.settingsData.selectedMD
        const { vault } = this.app
        
        Utils.handleLog("Kmapper", "info", `Getting files for ${filePaths.toString()}`)

        filePaths.forEach(fPath => {
            let FileAbstract = vault.getAbstractFileByPath(fPath)
            
            if (FileAbstract instanceof TFile)
                this.files.push(FileAbstract)         
        })
    }    
}