import { Token } from "corenlp-ts";
export const comment = {
    name: 'comment',
    level: 'block',                                     
    start(src:string) { return src.match(/%%/)?.index; },
    tokenizer(src:string, tokens:Token[]) {
        // console.log(src, tokens)
        const rule = /^%%((?!%%)[\S\s])*%%/;
        const match = rule.exec(src);
        if (match) {
            const token = {                                 
                type: 'comment',                      
                raw: match[0],                                
            };
            return token;
        }
    },
    renderer(token:any) {
        return ``;
    }
};

export const wikilink = {
    name: 'wikilink',
    level: 'inline',
    start(src:string){return src.match(/\!?\[\[/)?.index; },
    tokenizer(src:string, tokens:Token[]){
        const rule = /^\!?\[\[((?:(?![#\|])[\s\S])*)(?:#\^?((?:(?![#\|])[\s\S])*))?(?:\|((?:(?![#\|])[\s\S])*))?\]\]/;
        const match = rule.exec(src);
        if (match) {
            const token = {                                 
                type: 'wikilink',                      
                raw: match[0],
                text: match[3] ?? match[2] ?? match[1] ?? match[0],
                match: match
            };
            return token;
        }
    },
    renderer(token:any){
        return '';
    }
}

export const latexInline = {
    name: "latex_inline",
    level: "inline",
    start(src:string){return src.match(/\$/)?.index},
    tokenizer(src:string, tokens:Token[]){
        const rule = /^\$(?:(?!$)[\s\S])*\$/;
        const match = rule.exec(src);
        if (match) {
            const token = {                                 
                type: 'latex_inline',                      
                raw: match[0],
            };
            return token;
        }
    },
    renderer(token:any){
        return ''
    }
}

export const latexBlock = {
    name: "latex_block",
    level: "block",
    start(src:string){return src.match(/\$\$/)?.index},
    tokenizer(src:string, tokens:Token[]){
        const rule = /^\$\$[^($$)]*\$\$/;
        const match = rule.exec(src);
        if (match) {
            const token = {                                 
                type: 'latex_block',                      
                raw: match[0],
            };
            return token;
        }
    },
    renderer(tokens:any){
        return ''
    }
}

export const callout = {
    name: "callout",
    level: "block",
    start(src:string){return src.match(/^>/)?.index},
    tokenizer(src:string, tokens:Token[]){
        // handle block quotes with 
        const rule = /(?:^> ?\[!([\S]*)\][-+]? *([^\n\[\]]*))((?:\n>(?:[^\n])*)*)/;
        const match = rule.exec(src);
        if (match) {
            let token = {                                 
                type: 'callout',                      
                raw: match[0],
                header: match[2]?.length>0? match[2] : match[1],
                content: match[3].replace(/\n>/g, '\n'),
                tokens: [],
            };

            if(token.header.length > 0 && token.header[0] != '#')
                token.header = "# " + token.header

            this.lexer.blockTokens(token.header, token.tokens)
            this.lexer.blockTokens(token.content, token.tokens)
            return token;
        }
    },
    renderer(token:any){
        return ''
    }
}

export const list_item = {
    name: "list_item",
    level: "inline",
    start(src:string){return src.match(/^-/)?.index},
    tokenizer(src:string, tokens:Token[]){
        const rule = /^- +([^\n]*)/;
        const match = rule.exec(src);
        if(match){
            let token = {
                type: "list_item",
                raw: match[0],
                text: match[1],
                tokens: [],
                custom: true
            }
            this.lexer.inlineTokens(token.text, token.tokens)
            return token;
        }
    },
    renderer(token:any){
        return ''
    }
}

export const task = {
    name: "task",
    level: "inline",
    start(src:string){ return src.match(/^\[.\] +/)?.index },
    tokenizer(src:string, tokens:Token[]){
        const rule = /^\[.\] +([^\n]*)/
        const match = rule.exec(src)
        if(match){
            let token = {
                type: "task",
                raw: match[0],
                text: match[1],
                tokens: []
            }
            this.lexer.inlineTokens(token.text, token.tokens)

            return token;
        }
    },
    renderer(token:any){
        return ''
    }
}

export const highlight = {
    name: "highlight",
    level: "inline",
    start(src:string){ return src.match(/^==/)?.index },
    tokenizer(src:string, tokens:Token[]){
        const rule = /^==([^(==)\n]*)==/
        const match = rule.exec(src)

        if (match){
            let token = {
                type: "highlight",
                raw: match[0],
                text: match[1],
                tokens: []
            }

            this.lexer.inlineTokens(token.text, token.tokens)

            return token
        }
    },
    renderer(token:any){
        return ''
    }
}

export const file = {
    name: "file",
    level: "block",
    start(src:string){ return src.match(/./)?.index },
    tokenizer(src:string, tokens:Token[]){
        const rule = /^./
        const match = rule.exec(src)
        if (match){
            let token = {
                type: "file",
                title: "",
                tokens: []
            }
    
            this.lexer.blockTokens(src, token.tokens)
            
            return token
        }
    },
    renderer(token:any){
        return ''
    }
}