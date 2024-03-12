export default class ContentTree{
    type: string
    text: string
    pos: string[][]
    contents: ContentTree[]

    constructor(){
        this.type = ""
        this.text = ""
        this.pos = []
        this.contents = []
    }

    setText(text:string){
        this.text = text
        return this
    }

    appendText(text:string){
        this.text += text
        return this
    }

    trimText(){
        this.text = this.text.trim()
        return this
    }

    setType(type:string){
        this.type = type
        return this
    }

    pushContentsAtDepth(depth:number, toAppend:ContentTree, content:ContentTree=this){
        this.getContentAtDepth(depth, content).contents.push(structuredClone(toAppend))
    }

    getContentAtDepth(depth:number, content:ContentTree=this, ):ContentTree{
        if (depth==1 || content.contents.length == 0)
            return content
        return this.getContentAtDepth(depth-1, content.contents.at(-1))
    }

    getPOS(){    
        // Load wink-nlp package.
        const winkNLP = require( 'wink-nlp' );
        // Load english language model — light version.
        const model = require( 'wink-eng-lite-web-model' );
        // Instantiate winkNLP.
        const nlp = winkNLP( model );
        // Obtain "its" helper to extract item properties.
        const its = nlp.its;
        // Obtain "as" reducer helper to reduce a collection.
        const as = nlp.as;

        recur(this)

        function recur(content:ContentTree){
            const doc = nlp.readDoc( content.text );
            content.pos = [[doc.tokens().out( its.pos )], [doc.tokens().out( its.value )]]
            content.contents.forEach(content => recur(content))
        }

    }

    reset(){
        this.type = ""
        this.text = ""
        this.pos = []
        this.contents = []
    }

    printContentTree(){
        let str = ""
        recur(this, 0)
        function recur(contentTree:ContentTree, depth:number){
            str += "  ".repeat(depth) +  contentTree.text + '\n'
            contentTree.contents.forEach(content=>recur(content, depth+1))
        }
        console.log(str)
    }
}