import { App, MarkdownView } from "obsidian";
import { Triple} from "types/TripleType";
import ConceptRelationAggregate from "./ConceptRelationAggregate";
import { JSONCanvas, TextNode, Edge, EdgeSide} from "@trbn/jsoncanvas";
import ELK, { ElkEdge, ElkExtendedEdge, ElkNode } from 'elkjs/lib/elk.bundled.js'
import assert from "assert";
import { MainSettings } from "./MainSettings";
import Utils from "./Utils";

interface Point{
    x: number
    y: number
}

interface Canvas{
    nodes: []
    edges: {}
}

export default class DrawGraph{
    app: App
    aggregate: ConceptRelationAggregate = new ConceptRelationAggregate()
    canvas = new JSONCanvas()
    elk = new ELK({
        algorithms: [MainSettings.settingsData.eklConfig.layout],
        defaultLayoutOptions: {
            "org.eclipse.elk.layered.spacing.baseValue": String(MainSettings.settingsData.eklConfig.baseSpacing),
        }
    })
    elkGraph:ElkNode

    constructor(app: App){
        this.app = app
    }

    async draw(triples: Triple[]){
        Utils.handleLog("DrawGraph", "info", `Drawing graph with settings \n${JSON.stringify({
            elkBaseSpacing: MainSettings.settingsData.eklConfig.baseSpacing,
            minTextBoxWidt: MainSettings.settingsData.minTextBoxWidth,
            maxTextBoxWidt: MainSettings.settingsData.maxTextBoxWidth
        })}`)
        const aggregate = await this.aggregate.aggregate(triples)
        await this.aggregateToElkGraph(aggregate)

        Utils.handleLog("DrawGraph", "info", `Aggregated elk graph \n${JSON.stringify(this.elkGraph)}`)

        let g = await this.elk.layout(this.elkGraph)

        await this.elkToCanvas(g)
        Utils.handleLog("DrawGraph", "info", `Canvas data \n${JSON.stringify(this.canvas)}`)

        return this.canvas
    }

    async elkToCanvas(elkGraph:ElkNode){
        assert(elkGraph !== undefined)
        
        const { children, edges } = elkGraph

        children && children.forEach(child => {
            assert(child.labels !== undefined)
            assert(child.width !== undefined)
            assert(child.height !== undefined)

            const canvasNode:TextNode = {
                id: child.id,
                type: 'text',
                text: child?.labels[0].text ?? "",
                x: child.x ?? 0,
                y: child.y ?? 0,
                width: child.width,
                height: child.height
            }
            this.canvas.addNode(canvasNode)
        })

        edges && edges.forEach(edge => {
            const fromNode = this.getNode(elkGraph, edge.sources[0])
            const toNode = this.getNode(elkGraph, edge.targets[0])
            
            assert(fromNode !== undefined)
            assert(toNode !== undefined)
            assert(edge.sections !== undefined)
            assert(edge.labels !== undefined)

            const fromSide = this.getConnectionSide(fromNode, edge?.sections[0].startPoint)
            const toSide = this.getConnectionSide(toNode, edge?.sections[0].endPoint)

            const canvasEdge:Edge = {
                id: edge.id,
                fromNode: edge.sources[0],
                fromSide: fromSide,
                toNode: edge.targets[0],
                toSide: toSide, 
                label: edge.labels[0].text,
            }

            this.canvas.addEdge(canvasEdge)
        })
        return
    }

    // calculates which side the node the connectionPoint connects to
    getConnectionSide(node:ElkNode, connectionPoint:Point):EdgeSide{

        const corners = this.getCorners(node)

        assert(corners !== undefined)

        const {tl, tr, bl, br} = corners

        if(this.isIntersect(tl, tr, connectionPoint))
            return 'top'

        if(this.isIntersect(tl,bl, connectionPoint))
            return 'left'

        if(this.isIntersect(bl, br, connectionPoint))
            return 'bottom'

        return 'right'

    }

    getCorners(node: ElkNode){
        const { x, y, width, height } = node

        if(x !== undefined && y !== undefined && width !== undefined && height !== undefined){
            return{
                tl: {x:x, y:y},
                tr: {x:x+width, y:y},
                bl: {x:x, y:y+height},
                br: {x:x+width, y:y+height}
            }
        }

        return undefined
    }

    isIntersect(startPoint:Point, endPoint:Point, testPoint:Point){
        // Check for colinearity (all points lie on the same line)
        if ((endPoint.x - startPoint.x) * (testPoint.y - startPoint.y) === (endPoint.y - startPoint.y) * (testPoint.x - startPoint.x)) {
            // Check if testPoint is within the line segment range (considering x and y coordinates separately)
            return (
            (testPoint.x >= Math.min(startPoint.x, endPoint.x) && testPoint.x <= Math.max(startPoint.x, endPoint.x)) &&
            (testPoint.y >= Math.min(startPoint.y, endPoint.y) && testPoint.y <= Math.max(startPoint.y, endPoint.y))
            );
        }
            return false;
    }

    getNode(elkGraph:ElkNode, nodeId:string){
        return elkGraph.children?.find( c => c.id===nodeId )
    }

    async aggregateToElkGraph(aggregate: ConceptRelationAggregate){
        const { concepts, relations } = aggregate

        const elkGraph:ElkNode = {
            id: 'root',
            children: [],
            edges: [],
        }

        concepts.forEach(c => {
            const { width, height } = this.calcTextBoxWidthHeight(c.text)
            const node:ElkNode = {
                id: c.id,
                labels: [{text:c.text}],
                width: width,
                height: height,
            }

            elkGraph.children?.push(node)
        })

        relations.forEach(r => {
            const edge:ElkExtendedEdge = {
                id: r.id,
                sources: [r.fromId],
                targets: [r.toId],
                labels: [{text: r.text}]
            }

            elkGraph.edges?.push(edge)
        })

        this.elkGraph = elkGraph
        return elkGraph
    }

    calcTextBoxWidthHeight(str:string){
        const { minTextBoxWidth, maxTextBoxWidth } = MainSettings.settingsData
        let width = 0, height = 0

        // assume 1 char = 12 height unit
        // assume 1 char = 10 width unit
        const heightFactor = 12
        const char2WidthFactor = 10 

        let numLines = (str.length * char2WidthFactor) / minTextBoxWidth
        
        if(numLines < 1){
            width = minTextBoxWidth
            height = heightFactor
        } else {
            width = maxTextBoxWidth
            height = Math.ceil(numLines) * heightFactor
        }

        const widthPadding = 20, heightPadding = 25

        width += widthPadding
        height += heightPadding

        return {width, height}
    }
}