import { App, TFile, WorkspaceLeaf, OpenViewState, TFolder } from "obsidian";
import { MainSettings } from "./MainSettings";
import { JSONCanvas, TextNode, Edge, EdgeSide, GenericNode} from "@trbn/jsoncanvas";

interface Expected{
    triples: {
        concept1: string,
        relation: string
        concept2: string,
    }[]
}

export default class Utils{
    static async writeCanvas(app:App, input:string){
        const { vault } = app
        
        const { generatedPath, generatedFileName, overwriteFile } = MainSettings.settingsData
        let canvasPath = Utils.constructAbsoluteFilePath(generatedPath, generatedFileName, "canvas")
    
        Utils.handleLog("writeCanvas", "info", `Writing canvas to ${canvasPath}`)
    
        if(generatedPath !== ''){
            let dir = vault.getAbstractFileByPath(generatedPath)
            if(dir == null)
                vault.createFolder(generatedPath)
            
        }
    
        let canvasFile = app.vault.getAbstractFileByPath(canvasPath)
        
        if(canvasFile){
            if(overwriteFile)
                vault.delete(canvasFile)
            else{
                const suffix = Utils.getNextCanvasSuffix(app, generatedPath, generatedFileName)
                const copyBaseName = generatedFileName + ` (${suffix})`
                canvasPath = Utils.constructAbsoluteFilePath(generatedPath, copyBaseName, "canvas")
            }
        } 
    
        const file = await vault.create(canvasPath, input)
        Utils.handleLog("writeCanvas", "info", `Canvas file created.`)
        return file
    }

    static getNextCanvasSuffix(app:App, path:string, basename:string){
        return recur(1)
    
        function recur(i:number): number{
            const {vault} = app
            const copyBaseName = basename + ` (${i})`
            const fileName = Utils.constructAbsoluteFilePath(path, copyBaseName, "canvas")
            const file = vault.getAbstractFileByPath(fileName)
    
            if(file)
                return recur(i+1)
            return i
        }
    }

    static constructAbsoluteFilePath(path:string, basename:string, extension:string){
        extension = Utils.sanitizeExtension(extension)
        if(path == '')  return basename + "." + extension
        else            return path + '/' + basename + "." + extension
    }

    static sanitizePath(path:string){
        return path.trim().replace(/^\//, '').replace(/\/$/, '')
    }
    
    static sanitizeCanvasName(name:string){
        return name.trim().replace(/^\//, '').replace(/(\.canvas)$/, '')
    }
    
    static sanitizeExtension(ext:string){
        return ext.replace(/^\./, '')
    }
    
    static openCanvas(app:App, file:TFile){
        app.workspace.getLeaf('tab').openFile(file)
    }
    
    
    static handleLog(source:string, level:"info"|"warn"|"error", log:string,){
        const winston = require('winston');
        const { combine, timestamp, printf, align } = winston.format;
    
        const logger = winston.createLogger({
            level: 'info',
            format: combine(
                timestamp({
                    format: 'YYYY-MM-DD hh:mm:ss.SSS A',
                }),
                align(),
                printf((info:any) => `[${info.timestamp}] ${source} [${info.level}]: ${info.message}`)
            ),
            defaultMeta: { service: source },
            transports: [
                new winston.transports.File({ filename: 'logs/kmapper-plugin.log' }),
            ],
        });
    
        switch(level){
            case "info":
                logger.info(log)
                break
            case "warn":
                logger.warn(log)
                break
    
            case "error":
                logger.error(log)
                break
        }
    }
    static isStringInArr(s:string, arr:string[]){
        return arr.indexOf(s) > -1
    }
    
    static obfuscateOpenAIKey(s:string){
        if(s.length > 0)
            return s.substring(0, 3) + "●●●●●" + s.substring(s.length-3)
        return ""
    }
    
    static sanitizeJSON(s:string){
        return s.replace(/"/g, "\"")
    }
    
    static isValidMarkdownFile(fileName:string){
        let fileNameSplits = fileName.split('.')
        let extension = fileNameSplits.at(-1)
        if(extension !== "md")
            return false
        if(fileNameSplits.at(-2) == "excalidraw")
            return false
    
        return true
    }
    
    static getFileNameWithoutExtension(fileName:string){
        return fileName.replace(/\.md/, "")
    }
    
    static isSettingsValid(){
        const apiKey = MainSettings.settingsData.openAISettings.key
        const { canvasPath, canvasFileName, llm, llmPrompt, selectedMD } = MainSettings.settingsData
    
        let isValid = true
        let reasons = []
    
        if(apiKey === ""){
            isValid = false
            reasons.push("API key is empty.")
        }
    
        if(canvasFileName === ""){
            isValid = false
            reasons.push("File name is empty.")
        }
    
        if(llm === ""){
            isValid = false
            reasons.push("No LLM selected.")
        }
    
        if(llmPrompt === ""){
            isValid = false
            reasons.push("LLM prompt is empty.")
        }
    
        if(selectedMD.length == 0){
            isValid = false
            reasons.push("No selected Markdown files.")
        }
    
        return {isValid, reasons}
    }
    
    
    
    static convertExampleCompletion(sample:string){
        let expected:Expected = {
            triples: []
        }
    
        sample.split('\n').forEach(line => {
            const split = line.split(';')
            expected.triples.push({
                "concept1": split[0],
                "relation": split[1],
                "concept2": split[2],
            })
        })
    
        return JSON.stringify(expected)
    }

    static isTextNode(n:GenericNode): n is TextNode{
        return "type" in <GenericNode>n
    }
}


