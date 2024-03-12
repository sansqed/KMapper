import { App, Modal, TFile, TFolder, Vault } from 'obsidian';
import { Marked, MarkedExtension, TokenizerObject, marked, Token, TokensList } from 'marked';
import { comment, wikilink, latexInline, latexBlock, callout, highlight, task } from './markedExtensions';
import { docTest } from './NLPTest';
import { isStringInArr } from './helpers';
import ContentTree from './content-tree/ContentTree';

export default class KGGenerator{
    app: App;
    files: Array<TFile>;
    filesContent: ContentTree[] = []
    currFileContent:ContentTree = new ContentTree()
    accumulator:ContentTree = new ContentTree()

    constructor(app: App){
        this.app = app
        this.files = []
    }

    public processFiles(filePaths:Array<string>){
        this.getFiles(filePaths)

        const { vault } = this.app

        this.files.forEach(async (f) => {
            // console.log(f)
            const content = await vault.read(f);

            this.currFileContent.reset()

            const fileName = f.name.split('.md')[0]

            this.currFileContent.setText(fileName).setType("file")
            this.parseMarkdown(content)
            // this.currFileContent.getPOS()

            this.filesContent.push(structuredClone(this.currFileContent))
            console.log(this.filesContent)
        })

    }

    private getFiles(filePaths:Array<string>){
        const { vault } = this.app

        filePaths.forEach(fPath => {
            let FileAbstract = vault.getAbstractFileByPath(fPath)
            
            if (FileAbstract instanceof TFile)
                this.files.push(FileAbstract)         
        })
    }

    private async parseMarkdown(content:string){
        marked.use({extensions: [wikilink, latexInline, latexBlock, callout, comment, highlight, task]})
        let tokens:TokensList = marked.lexer(content)
        console.log(tokens)

        this.restructureTokens(tokens)
        this.currFileContent.printContentTree()
        
    }

    private async restructureTokens(tokens:TokensList){
        let depth = 0;

        tokens.forEach(async(tok:Token, idx, arr)=>{
            if(tok.type=="heading")
                depth = JSON.parse(JSON.stringify(tok.depth))
            await this.walkTokens(tok, depth)
        })
    }

    private async walkTokens(token:Token, depth:number){
        if("tokens" in token && token.tokens && token.tokens?.length>0){
            if(token.type == "list_item")
                token.tokens.forEach(async(tok:Token) => await this.walkTokens(tok, depth))
            else if (token.type == "callout"){
                token.tokens.forEach(async(tok:Token, idx) => await this.walkTokens(tok, depth+1))
            }
            else
                token.tokens.forEach(async(tok:Token) => await this.walkTokens(tok, depth+1))
        }

        if(this.accumulator.text.length>0 && isStringInArr(token.type, ["heading", "paragraph", "list", "list_item", "callout"])){       
            console.log(depth, token.type, this.accumulator.text)
            this.accumulator.setType(token.type)
            
            this.currFileContent.pushContentsAtDepth(depth, this.accumulator)

            this.accumulator.reset()
        }
        
        if("text" in token && !("tokens" in token) && !isStringInArr(token.type, ["heading", "paragraph", "list", "list_item", "callout"])){
            this.accumulator.appendText(token?.text)
        }
        
        if(token.type == "list")
            token.items.forEach(async (tok:Token) => await this.walkTokens(tok, depth+1))
    }
}