import TreeItem from "./TreeItem";
import { PathTree } from "treeify-paths";
import FileItem from "./FileItem";
import Utils from "scripts/Utils";

export default class FolderItem extends TreeItem{
    children: Array<TreeItem> = [];
    isCollapsed: boolean = false;
    folderEl: HTMLDivElement;
    isCollapsible:boolean = true
    
    constructor(file:PathTree, parent: FolderItem|undefined = undefined){
        super(file)
        this.name = this.path.split("/").at(-1) ?? "root"
        this.populateChildren(file.children)
        this.parent = parent
    }

    populateChildren(children: PathTree[]){
        children.forEach(child => {
            this.addChild(child)
        })
    }

    addChild(child:PathTree){
        if(child.children.length == 0){
            if(Utils.isValidMarkdownFile(child.name))
                this.children.push(new FileItem(child, this))
        } else {
            this.children.push(new FolderItem(child, this))
        }
    }

    handleCollapseChildren(){
        let children = this.folderEl.querySelector(".tree-item-children") as HTMLElement

        if (children == null) return
        
        if(this.isCollapsed){
            children.style.display = "block" 
        } else {
            children.style.display = "none"
        }

    }

    generateHTML(el:HTMLDivElement){
        this.folderEl = el.createDiv("tree-item-folder")
        this.generateFolderTitle(this.folderEl)
        this.generateChildren()
    }

    generateFolderTitle(el:HTMLDivElement){
        let folderItem = el.createDiv("tree-item-folder folder-title")
        folderItem.style.marginTop = "0.5em"
        folderItem.style.marginBottom = "0.5em"
        
        let folderNameEl = folderItem.createDiv()
        folderNameEl.style.display = "flex"
        folderNameEl.style.alignItems = "center"
        
        let checkbox = folderNameEl.createEl("input", {cls: "tree-item-checkbox"})
        checkbox.setAttribute("type", "checkbox")
        checkbox.addEventListener("click", event => {
            let ischecked = (<HTMLInputElement>event.target).checked
            this.handleCheck(ischecked,true)
        })

        if(this.isCollapsible){
            let chevronBtn = folderNameEl.createEl("button")
            chevronBtn.style.background = "transparent"
            chevronBtn.style.boxShadow = "none"
            chevronBtn.style.padding = "0.25em"
            chevronBtn.style.marginRight = "0.25em"
            chevronBtn.style.height = "1em"
    
            let chevronSvg = chevronBtn.createSvg("svg")
            let chevronSettings = {
                "width": "10",
                "height": "15",
                "fill": "none",
                "stroke": "currentColor",
                "stroke-width": "2",
                "stroke-linecap": "round",
                "stroke-linejoin": "round",
                "viewBox": "0 0 25 30",
            }
    
            Object.entries(chevronSettings).forEach(([key, value], idx) => {
                chevronSvg.setAttribute(key, value)
            })
            chevronSvg.style.marginTop = "0.25em"
    
            let chevron = chevronSvg.createSvg("path")
            chevron.setAttribute("d", "M3 8L12 17L21 8")
    
            if(this.isCollapsed)
                chevronSvg.style.transform = "rotate(-90deg)"
    
            chevronBtn.addEventListener("click", event => {
                this.handleCollapse(chevronSvg)
            })
        }

        let folderName = folderNameEl.createEl("p")
        
        folderName.setText(this.name)
        folderName.style.display = "inline"
        folderName.style.marginTop = "0"
        folderName.style.marginBottom = "0"
    }

    generateChildren(){
        let childrenEl = this.folderEl.createDiv("tree-item-children")
        childrenEl.style.paddingLeft = "0.5em"

        this.sortAlphabetically()

        this.generateChildrenRecursive(this.children, childrenEl)
        this.handleCollapseChildren()
    }

    generateChildrenRecursive(children: TreeItem[], el:HTMLDivElement){
        children.forEach(child => child.generateHTML(el))
    }

    toggleCollapse(isCollapsed?:boolean){
        this.isCollapsed = isCollapsed ?? !this.isCollapsed
    }

    handleCheck(check?:boolean, cascadeToChildren:boolean = false): void {
        this.toggleCheck(check)

        // cascade check to children
        let checkbox = this.folderEl.querySelector(".tree-item-checkbox") as HTMLInputElement
        checkbox.checked = this.checked

        if(cascadeToChildren)
            this.toggleCheckAllChildren(this.checked)

        // if uncheck, cascade to parent
        if(!this.checked){
            this.toggleCheckAllParents()
        }
        
    }
    toggleCheckAllChildren(check:boolean){
        if(this.children.length != 0){
            this.children.forEach( child => {
                if(child instanceof FolderItem)
                    child.handleCheck(check, true)
                else
                    child.handleCheck(check)
            })
        }
    }

    toggleCheckAllParents(check?:boolean){
        if(this.parent != undefined){
            this.parent.handleCheck(false)
        }
    }

    handleCollapse(chevronSvg:SVGSVGElement, isCollapsed?:boolean){
        this.toggleCollapse(isCollapsed)
        if(this.isCollapsed)
            chevronSvg.style.transform = "rotate(-90deg)"
        else
            chevronSvg.style.transform = "rotate(0)"

        this.handleCollapseChildren()
    }

    sortAlphabetically(){
        this.children.sort((a,b)=>a.name.localeCompare(b.name))
    }
    
}