import { App, Modal, TFile, TFolder, Vault } from 'obsidian';
import { Marked, MarkedExtension, TokenizerObject, marked, Token, TokensList } from 'marked';
import { comment, wikilink, latexInline, latexBlock, callout, list_item } from './markedExtensions';
import { docTest } from './NLPTest';
import { ContentTree, ContentFile, TextItem, HeadingItem } from 'types/ContentTreeType';
import { isStringInArr } from './helpers';

export default class KGGenerator{
    app: App;
    files: Array<TFile>;
    tokens2Remove = ["comment", "latex_block", "latex_inline"];
    filesContent: ContentTree[] = []
    currFileContent:ContentTree
    emptyAccumulator:ContentTree = {
        type: "",
        text: "",
        pos: [],
        values: [],
        contents: []
    }

    accumulator:ContentTree = JSON.parse(JSON.stringify(this.emptyAccumulator))
    
    // Load wink-nlp package.
    winkNLP = require( 'wink-nlp' );
    // Load english language model — light version.
    model = require( 'wink-eng-lite-web-model' );
    // Instantiate winkNLP.
    nlp = this.winkNLP( this.model );
    // Obtain "its" helper to extract item properties.
    its = this.nlp.its;
    // Obtain "as" reducer helper to reduce a collection.
    as = this.nlp.as;

    constructor(app: App){
        this.app = app
        this.files = []
        
    }

    async getFiles(filePaths:Array<string>){

        const { vault } = this.app

        filePaths.forEach(fPath => {
            let FileAbstract = vault.getAbstractFileByPath(fPath)
            
            if (FileAbstract instanceof TFile)
                this.files.push(FileAbstract)         
        })

        this.files.forEach(async (f) => {
            // console.log(f)
            const content = await vault.read(f);
            
            this.currFileContent = {
                type: "file",
                text: f.name,
                pos: [],
                values: [],
                contents: [],
            }
            this.parseMarkdown(content)            
            // this.getPOSCurrFile()
            console.log(this.currFileContent)
        })
    }

    async parseMarkdown(content:string){
        marked.use({extensions: [wikilink, latexInline, latexBlock, callout, comment]})

        let tokens:TokensList = marked.lexer(content)
        console.log(tokens)
        this.restructureTokens(tokens)
        this.printContentTree()
        // console.log(tokens)
    }

    getPOSCurrFile(){
        this.getPOSRecur(this.currFileContent)
    }

    getPOSRecur(content:ContentTree){
        const doc = this.nlp.readDoc( content.text );
        content.pos = doc.tokens().out( this.its.pos)
        content.values = doc.tokens().out( this.its.value)
        content.contents.forEach(content => this.getPOSRecur(content))
    }

    async restructureTokens(tokens:TokensList){
        let depth = 0;
        
        tokens.forEach(async(tok:Token, idx, arr)=>{
            if(tok.type=="heading")
                depth = JSON.parse(JSON.stringify(tok.depth))
            await this.walkTokens(tok, depth)
        })
    }

    async walkTokens(token:Token, depth:number){
        console.log(depth, token.type, token.raw)
        if("tokens" in token && token.tokens && token.tokens?.length>0){
            if(token.type == "list_item" || token.type == "callout")
                token.tokens.forEach(async(tok:Token) => await this.walkTokens(tok, depth))
            else
                token.tokens.forEach(async(tok:Token) => await this.walkTokens(tok, depth+1))
        }

        if(this.accumulator.text.length>0 && isStringInArr(token.type, ["heading", "paragraph", "list", "list_item"])){
            // console.log(depth, this.accumulator.text)
            
            this.accumulator.type = token.type
            this.accumulator.text = this.accumulator.text.trim()
            
            this.getContentAtDepth(this.currFileContent, depth).contents.push(this.accumulator)            
            this.accumulator = JSON.parse(JSON.stringify(this.emptyAccumulator))
        }
        
        if("text" in token && !("tokens" in token) && !isStringInArr(token.type, ["heading", "paragraph", "list", "list_item"])){
            this.accumulator.text += token?.text
        }

        
        if(token.type == "list")
            token.items.forEach(async (tok:Token) => await this.walkTokens(tok, depth+1))
    }

    getContentAtDepth(content:ContentTree, depth:number):ContentTree{
        if (depth==1)
            return content
        return this.getContentAtDepth(content.contents[content.contents.length-1], depth-1)
    }

    printContentTree(){
        let str = ""
        recur(this.currFileContent, 0)
        function recur(contentTree:ContentTree, depth:number){
            str += "  ".repeat(depth) +  contentTree.text + '\n'
            contentTree.contents.forEach(content=>recur(content, depth+1))
        }

        console.log(str)
    }

}