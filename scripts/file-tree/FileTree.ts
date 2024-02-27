import { App, Modal } from 'obsidian';
import { PathTree } from "treeify-paths";
import TreeItem from "./TreeItem";
import FileItem from "./FileItem";
import FolderItem from "./FolderItem";

export default class FileTree{
    root: FolderItem;
    children: Array<TreeItem> = []
    selectAllEl: HTMLElement;
    generateEl: HTMLElement;
    selectedFilesPath: Array<String>;
    app:App;

    constructor(app: App){
        this.app = app
        let root:PathTree = {
            "path": this.app.vault.getName(),
            "ctx": "",
            "name": this.app.vault.getName(),
            "children": []

        }
        this.root = new FolderItem(root)
        this.root
    }

    addChildren(children:Array<PathTree>){
        this.root.populateChildren(children)
    }

    generateHTML(el:HTMLDivElement){
        this.generateEl = el.createEl("button")
        this.generateEl.textContent = "Generate Knowledge Graph"
        this.generateEl.addEventListener("click", event => {
            this.getSelectedFiles()
            this.generateKnowledgeGraph()
        })

        this.root.isCollapsed = true
        this.root.isCollapsible = false
        this.root.generateHTML(el)
    }

    toggleCheckedAll(checked:boolean){
        this.children.forEach(child => {
            if(child instanceof FolderItem)
                child.handleCheck(checked, true)
            else 
                child.handleCheck(checked)
        })
    }

    getSelectedFiles(){
        this.selectedFilesPath = []
        this.getSelectedFilesRecursive(this.root.children)
        console.log(this.selectedFilesPath)
    }

    getSelectedFilesRecursive(children:Array<TreeItem>){
        children.forEach(child => {
            if(child instanceof FolderItem)
                this.getSelectedFilesRecursive(child.children)
            else{
                if(child.checked)
                    this.selectedFilesPath.push(child.path)
            }

        })
    }

    generateKnowledgeGraph(){
        
    }
    
}