import { App, Modal } from 'obsidian';
import React from 'react';
import treeifyPaths, { PathTree } from "treeify-paths";
import FileItem from './file-tree/FileItem';
import FolderItem from './file-tree/FolderItem';
import FileTree from './file-tree/FileTree';

export default class FileSelectorModal extends Modal {
    private filePickerModalEl: HTMLElement;
    fileTree:FileTree;

	constructor(app: App) {
		super(app);
        this.fileTree = new FileTree(app)
	}

	async onOpen() {

		const {contentEl} = this;
		contentEl.setText('Obsidian KG!');

        let scrollArea = contentEl.createDiv({ cls: 'tree-scroll-area' });
        scrollArea.style.height = "100%";
        scrollArea.style.maxHeight = "60vh"
        scrollArea.style.width = "20vw";
        scrollArea.style.overflowY = "auto";
        scrollArea.style.overflowX = "hidden";
        scrollArea.style.padding = "1em";
        
        let files = this.app.vault.getMarkdownFiles();
        let paths = files.map(f => f.path)
        let dirTree = treeifyPaths(paths)


        // dirTree.children.forEach(child => {
        //     this.fileTree.addChild(child)
        // })

        this.fileTree.addChildren(dirTree.children)

        this.fileTree.generateHTML(scrollArea)
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

function generateFileItemHTML(file:PathTree, el:HTMLElement){
    let fileItem = el.createDiv()
    fileItem.style.display = "flex"
    fileItem.style.alignItems = "center"
    fileItem.style.marginTop = "0.5em"
    fileItem.style.marginBottom = "0.5em"

    let checkbox = fileItem.createEl("input")
    checkbox.setAttribute("type", "checkbox")

    let fileName = fileItem.createEl("p")
    fileName.setText(file.name)
    fileName.style.width = "fit-content"
    fileName.style.marginTop = "0"
    fileName.style.marginBottom = "0"

    // el.appendChild(fileItem)
}

function generateFolderItemHTML(folder:PathTree, el:HTMLElement){
    let folderItem = el.createDiv()
    folderItem.style.marginTop = "0.5em"
    folderItem.style.marginBottom = "0.5em"
    
    let folderNameEl = folderItem.createDiv()
    folderNameEl.style.display = "flex"
    folderNameEl.style.alignItems = "center"
    
    let checkbox = folderNameEl.createEl("input")
    checkbox.setAttribute("type", "checkbox")

    let chevronBtn = folderNameEl.createEl("button")
    chevronBtn.style.background = "transparent"
    chevronBtn.style.boxShadow = "none"
    chevronBtn.style.padding = "0.25em"
    chevronBtn.style.marginRight = "0.25em"

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

    let folderName = folderNameEl.createEl("p")
    
    folderName.setText(folder.path.split("/").at(-1) ?? "")
    folderName.style.display = "inline"
    folderName.style.marginTop = "0"
    folderName.style.marginBottom = "0"

    let folderChildren = folderItem.createDiv()
    folderChildren.style.paddingLeft = "1.5em"

    folder.children.forEach(dir => {
        if (dir.children.length == 0){
            generateFileItemHTML(dir, folderChildren)
        } else {
            generateFolderItemHTML(dir, folderChildren)
        }
    })
}

