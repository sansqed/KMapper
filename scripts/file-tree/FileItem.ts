import FolderItem from "./FolderItem";
import TreeItem from "./TreeItem";
import { PathTree } from "treeify-paths";

export default class FileItem extends TreeItem{
    fileEl: HTMLDivElement;

    constructor(file:PathTree, parent?:FolderItem){
        super(file)
        this.name = file.name
        this.parent = parent
    }

    generateHTML(el:HTMLDivElement){
        this.fileEl = el.createDiv("tree-item-child tree-item-file")
        this.fileEl.style.display = "flex"
        this.fileEl.style.alignItems = "center"
        this.fileEl.style.marginTop = "0.5em"
        this.fileEl.style.marginBottom = "0.5em"

        let checkbox = this.fileEl.createEl("input", {cls: "tree-item-checkbox"})
        checkbox.setAttribute("type", "checkbox")
        checkbox.setAttribute("id", this.path)
        checkbox.addEventListener("click", event => {
            this.handleCheck()
        })

        let fileNameLabel = this.fileEl.createEl("label")
        fileNameLabel.setAttribute("for", this.path)

        let fileName = fileNameLabel.createEl("p")
        fileName.setText(this.name)
        fileName.style.width = "fit-content"
        fileName.style.marginTop = "0"
        fileName.style.marginBottom = "0"
    }

    handleCheck(check?:boolean){
        this.toggleCheck(check)
        let checkbox = this.fileEl.querySelector(".tree-item-checkbox") as HTMLInputElement
        checkbox.checked = this.checked

        // if uncheck, cascade uncheck to parent
        if(!this.checked){
            this.toggleCheckAllParents()
        }
        
    }

    toggleCheckAllParents(){
        if(this.parent != undefined){
            this.parent.handleCheck(false)
        }
    }


} 