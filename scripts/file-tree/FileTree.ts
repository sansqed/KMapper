import { App, Modal } from 'obsidian';
import { PathTree } from "treeify-paths";
import TreeItem from "./TreeItem";
import FolderItem from "./FolderItem";
import KGGenerator from 'scripts/KMapperPipeline';
import { MainSettings } from 'scripts/MainSettings';

export default class FileTree{
    root: FolderItem;
    children: Array<TreeItem> = []
    selectAllEl: HTMLElement;
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

    }

    addChildren(children:Array<PathTree>){
        this.root.populateChildren(children)
    }

    generateHTML(el:HTMLDivElement){
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
}