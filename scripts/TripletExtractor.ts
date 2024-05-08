import SelectedMD from "./SelectedMD"
import OpenAI from "openai"
import { Triple } from "types/TripleType";
import { ChatCompletionMessageParam } from "openai/resources";
import { MainSettings } from "./MainSettings";
import Utils from "./Utils";

export default class TripletExtractor{
    OPENAI_KEY = MainSettings.settingsData.openAISettings.key
    openai = new OpenAI({
        apiKey: this.OPENAI_KEY,
        dangerouslyAllowBrowser: true 
    });

    triples: Triple[]    

    async getTriples(selectedMD:SelectedMD){
        this.triples = []

        const childPromises = selectedMD.MDContents.map(async(content) => {
            return await this.runOpenAI(content)
        })

        let triplesArr = await Promise.all(childPromises)
        let triples:Triple[] = []
        triplesArr.forEach(t => {
            triples = triples.concat(t)
        })
        triples.forEach(t => this.triples.push(t))
        Utils.handleLog("TripletExtractor", "info", `Extracted triples \n${this.stringifyTriples(this.triples)}`)
        return this.triples
    }

    async runOpenAI(content:string): Promise<Triple[]>{
        const examples = this.getOpenAIExamplesData()

        Utils.handleLog("TripletExtractor", "info", `Getting triples using config \n${JSON.stringify({
            prompt: MainSettings.settingsData.llmPrompt, 
            model: MainSettings.settingsData.llm,
            fineTuningData: examples,
            temperature: MainSettings.settingsData.openAISettings.temperature,
            content: content
        })}`)

        const completion = await this.openai.chat.completions.create({
            messages: [
                {"role": "system", "content": MainSettings.settingsData.llmPrompt},
                {"role": "assistant", "content": "Sure, please provide the data point data, and I'll assist you in extracting the concept-relation-concept triples."},
                ...examples,
                {"role": "user", "content": content}
            ],
            model: MainSettings.settingsData.llm,
            response_format:{ type: "json_object" },
            temperature: MainSettings.settingsData.openAISettings.temperature
        })

        let triples = JSON.parse(completion.choices[0].message.content?? "")
        let tripleArr = triples.triples.map((t:any)=>({
                subject: t.concept1,
                relation: t.relation,
                object: t.concept2
        }))

        return tripleArr
    }

    getOpenAIExamplesData(): ChatCompletionMessageParam[]{

        let examplesData : ChatCompletionMessageParam[] = []

        MainSettings.settingsData.openAISettings.examples.map(({prompt, completion}) => {
            let thisData:ChatCompletionMessageParam[] = [
                {
                    "role": "user",
                    "content": prompt, 
                },
                {
                    "role": "assistant",
                    "content": Utils.convertExampleCompletion(completion)
                }
            ]

            examplesData.push(...thisData)
        })

        return examplesData
    }

    getOpenAIModel(){
        return MainSettings.settingsData.llm
    }

    stringifyTriples(triples:Triple[]){
        return triples.map(t => JSON.stringify(t))
    }
}
