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

