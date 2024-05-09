import { Triple } from "types/TripleType"

export interface Concept {
    id: string
    text: string
}

export interface Relation {
    id: string
    fromId: string
    toId: string
    text: string
}

export default class ConceptRelationAggregate{
    concepts: Concept[] = []
    relations: Relation[] = []
    conceptLastId = 0
    relLastId = 0

    async aggregate(triples: Triple[]){

        const childPromises = triples.map(async (t) => {
            let {subject, object, relation} = t
        
            const from = await this.processConcept(subject)
            const to = await this.processConcept(object) 

            return await this.processRelation(relation, from.id, to.id)
        })

        await Promise.all(childPromises)
        
        return this
    }

    async processConcept(conceptText:string){
        conceptText = conceptText.trim()
        
        let thisConcept = this.hasConcept(conceptText)
        if(thisConcept === undefined){
            thisConcept = {
                id: "c"+this.conceptLastId,
                text: conceptText
            }
            this.concepts.push(thisConcept)
            this.conceptLastId += 1
        }

        return thisConcept
    }

    async processRelation(relationText:string, fromId:string, toId:string){
        this.relations.push({
            id: 'r' + this.relLastId,
            text: relationText,
            fromId: fromId,
            toId: toId
        })
        this.relLastId += 1
        return
    }

    hasConcept(testConcept:string){
        return this.concepts.find(c => c.text === testConcept)
    }
}