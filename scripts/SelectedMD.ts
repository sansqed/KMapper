export default class SelectedMD{
    MDContents:string[] = []

    addMDContents(content:string){
        this.MDContents.push(this.cleanContents(content))
    }

    cleanContents(contents:string){
        let cleaned = contents
        let rule;

        // clean wikilinks
        rule = /\!?\[\[((?:(?![#\|])[\s\S])*)(?:#\^?((?:(?![#\|])[\s\S])*))?(?:\|((?:(?![#\|])[\s\S])*))?\]\]/gs
        cleaned = cleaned.replace(rule, (g1, g2, g3, g4) => {
            // follow pattern [[g2#g3|g4]]
            if(g4 && g4!=='')
                return g4
            if(g3 && g3!=='')
                return g3
            if(g2 && g2!=='')
                return g2
            return g1
        })

        // clean markdown links 
        rule = /\!?\[((?:(?![\[\]\(\)])[\s\S])*)\]\(((?:(?![\[\]\(\)])[\s\S])*)\)/gs
        cleaned = cleaned.replace(rule, (g1, g2, g3) => {
            // follow patter ![g2](g3)
            if(g2 && g2 != '')
                return g2
            return ''
        })

        // clean comments
        rule = /%%((?!%%)[\S\s])*%%/g
        cleaned = cleaned.replace(rule, '')

        // clean YAML frontmatter
        rule = /^---\n((?!---)[\s\S])*---/
        cleaned = cleaned.replace(rule, '')

        return cleaned
    }


}