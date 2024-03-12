
// implements pushdown automata
export default class LexicalAnalyzer{
    state:string = "s";
    LexTokMap:any = {
        "%": "PERC",
        "$": "DOLL",
        "[": "BR_OP",
        "]": "BR_CL",
        "(": "PAR_OP",
        ")": "PAR_CL",
        "`": "BCKTCK",
    }

    productions = [['', 's', 'c1', 'c2', 'c3', 'lx1', 'lx2', 'lx3', 'lx4', 'lk1', 'lk2', 'lk3', 'lk4', 'lk5', 'lk6', 'cb1', 'cb2', 'cb3', 'cb4', 'cb5', 'cb6'], ['PERC', 'c1', 'c2', 'c3', 's', 'index', 's', 's', 's', 's', 's', 's', 'lk4', 's', 'lk6', 'cb6', 'cb2', 'cb3', 'cb4', 'cb5', 'cb6'], ['DOLL', 'lx1', 'c1', 'c2', 'c3', 'lx2', 'lx3', 's', 's', 's', 's', 's', 'lk4', 's', 'lk6', 'cb6', 'cb2', 'cb3', 'cb4', 'cb5', 'cb6'], ['BR_OP', 'lk1', 'c1', 'c2', 'c3', 'lx4', 'lx2', 'lx3', 'lx4', 'lk2', 'lk3', 's', 'lk4', 's', 'lk6', 'cb6', 'cb2', 'cb3', 'cb4', 'cb5', 'cb6'], ['BR_CL', 's', 'c1', 'c2', 'c3', 'lx4', 'lx2', 'lx3', 'lx4', 'lk5', 'lk3', 's', 'lk5', 's', 'lk6', 'cb6', 'cb2', 'cb3', 'cb4', 'cb5', 'cb6'], ['PAR_OP', 's', 'c1', 'c2', 'c3', 'lx4', 'lx2', 'lx3', 'lx4', 's', 's', 's', 'lk4', 'lk6', 'lk6', 'cb6', 'cb2', 'cb3', 'cb4', 'cb5', 'cb6'], ['PAR_CL', 's', 'c1', 'c2', 'c3', 'lx4', 'lx2', 'lx3', 'lx4', 's', 's', 's', 'lk4', 's', 's', 'cb6', 'cb2', 'cb3', 'cb4', 'cb5', 'cb6'], ['BCKTCK', 'cb1', 'c1', 'c2', 'c3', 'lx4', 'lx2', 'lx3', 'lx4', 'lk4', 'lk2', 'lk3', 'lk4', 's', 'lk6', 'cb2', 'cb3', 'cb4', 'cb5', 's', 's'], ['NS', 's', 'c1', 'c2', 'c3', 'lx4', 'lx2', 'lx3', 'lx4', 'lk4', 'lk2', 'lk3', 'lk4', 's', 'lk6', 'cb6', 'cb2', 'cb3', 'cb4', 'cb5', 'cb6']]
    productionsMapper:any = {'s': 1, 'c1': 2, 'c2': 3, 'c3': 4, 'lx1': 5, 'lx2': 6, 'lx3': 7, 'lx4': 8, 'lk1': 9, 'lk2': 10, 'lk3': 11, 'lk4': 12, 'lk5': 13, 'lk6': 14, 'cb1': 15, 'cb2': 16, 'cb3': 17, 'cb4': 18, 'cb5': 19, 'cb6': 20, 'PERC': 1, 'DOLL': 2, 'BR_OP': 3, 'BR_CL': 4, 'PAR_OP': 5, 'PAR_CL': 6, 'BCKTCK': 7, 'NS': 8}
    start:number;
    text: string;
    cleaned: string

    clean(text:string){
        this.text = text
        this.cleaned = text

        let len = text.length
        for (let i=0; i<len; i++){
            let char:string = text[i]
            let token = ""
            token = this.LexTokMap[ char ] ?? "NS"

            this.manageStates(token, i)
        }

        return this.cleaned

    }

    manageStates(token: string, idx:number){
        let stateIdx = this.productionsMapper[ this.state ]
        let tokIdx = this.productionsMapper[ token ]
        let currState = this.state
        let nextState = this.productions[tokIdx][stateIdx]
        console.log({
            currState: currState,
            nextState: nextState,
            token: token,
            idx: idx,
            start: this.start
        })

        if(this.isStartState(nextState)){
            this.start = idx
        }

        if(this.isRemoveState(nextState)){
            let toRemove = this.text.substring(this.start, idx+1    )
            console.log(toRemove)
            this.removeFromText(toRemove)
        }

        if(this.isExtractState(nextState)){
            let raw = this.text.substring(this.start, idx+1)
            let toExtract:string|undefined = ""

            // matches [[file.md]] || [[file.md|file]]
            if(currState == "lk3"){
                let rawInner = raw.substring(2, raw.length-2)

                if(raw.indexOf("|") > -1){
                    toExtract = rawInner.split("|").at(-1)
                } else if (raw.indexOf("#") > -1){
                    toExtract = rawInner.split("#").at(-1)
                } else {
                    toExtract = rawInner
                }
            } 

            // matches [name](link.md) || [](link.md)
            else if (currState == "lk6"){
                let BR_CL_idx = raw.indexOf("]")
                toExtract = raw.substring(1, BR_CL_idx)
            }

            // matches `code` 
            else if (currState == "cb6"){
                toExtract = raw.substring(1, raw.length-1)
            }

            this.cleaned = this.cleaned.replace(raw, toExtract??raw)

        }

        this.state = nextState
    }

    removeFromText(substring:string){
        this.cleaned = this.cleaned.replace(substring, "")
    }


    isRemoveState(nextState:string){
        const removeStates = ["c3", "lx3", "lx4", "cb5"] 
        if(removeStates.indexOf(this.state) > -1 && nextState == "s")
            return true 
        return false
    }

    isExtractState(nextState:string){   
        const extractStates = ["lk3", "lk6", "cb6"]

        if(extractStates.indexOf(this.state) > -1 && nextState == "s")
            return true
        return false
    }

    isStartState(nextState:string){
        const startStates = ["c1", "lx1", "lk1", "cb1"]
        if(startStates.indexOf(nextState) > -1)
            return true
        return false
    }

}