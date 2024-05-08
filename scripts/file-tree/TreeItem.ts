import { PathTree } from "treeify-paths";
import FolderItem from "./FolderItem";
import { MainSettings } from "scripts/MainSettings";

export default class TreeItem{
    checked:boolean = false;
    file:PathTree;
    name:string
    path: string
    parent: FolderItem | undefined = undefined


    constructor(file:PathTree){
        this.file = file
        this.path = file.path
    }

    generateHTML(el:HTMLDivElement){

    }

    check(){
        this.checked = true
    }

    uncheck(){
        this.checked = false
    }

    toggleCheck(check?:boolean){
        this.checked = check ?? !this.checked
    }

    handleCheck(check:boolean){
        if(check){
            MainSettings.settingsData.selectedMD.push(this.path)
        } else {
            MainSettings.settingsData.selectedMD = MainSettings.settingsData.selectedMD.filter(path => path !== this.path)
        }
    }
}