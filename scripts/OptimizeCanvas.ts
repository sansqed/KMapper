import { TFile, Notice, App } from "obsidian";
import { JSONCanvas, TextNode, Edge, EdgeSide, GenericNode} from "@trbn/jsoncanvas";
import ELK, { ElkExtendedEdge, ElkNode } from 'elkjs/lib/elk.bundled.js'
import assert from "assert";
import { MainSettings } from "./MainSettings";

interface Point{
    x: number
    y: number
}

export default class OptimizeCanvas{
    app:App

    constructor(app:App){
        this.app = app
    } 

    async optimize(canvasTFile:TFile){
        const contents = await this.app.vault.read(canvasTFile)
        const JSONparsed:{nodes: GenericNode[], edges:Edge[]} = JSON.parse(contents)
        const canvas:JSONCanvas = new JSONCanvas(JSONparsed.nodes, JSONparsed.edges)

        let elkGraph = this.canvas2elk(canvas)

        let elk = new ELK({
            algorithms: [MainSettings.settingsData.eklConfig.layout],
            defaultLayoutOptions: {
                "org.eclipse.elk.layered.spacing.baseValue": String(MainSettings.settingsData.eklConfig.baseSpacing),
            }
        })

        let g = await elk.layout(elkGraph)

        const newCanvas = this.updateCanvasFromElk(canvas, g)

        new Notice("Canvas layout optimized.")
        return await this.app.vault.process(canvasTFile, ()=>newCanvas.toString())

    }

    canvas2elk(canvas:JSONCanvas){
        const elkGraph:ElkNode = {
            id: 'root',
            children: [],
            edges: [],
            layoutOptions: {
                'elk.algorithm': MainSettings.settingsData.eklConfig.layout,
            }
        }
    
        canvas.getNodes().forEach((cNode:TextNode) => {
            let enode:ElkNode = {
                id: cNode.id,
                width: cNode.width,
                height: cNode.height,
            }
    
            elkGraph.children?.push(enode)
        })
    
        canvas.getEdges().forEach(cEdge => {
            const edge:ElkExtendedEdge = {
                id: cEdge.id,
                sources: [cEdge.fromNode],
                targets: [cEdge.toNode],
            }
    
            elkGraph.edges?.push(edge)
        })
    
        return elkGraph
    }

    canOptimizeCanvas(canvas:JSONCanvas){
        let decision = true
    
        canvas.getNodes().forEach(n => {
            if("type" in n){
                if(n.type != "text") decision = false
            } else decision = false
        })
    
        return decision 
    }

    updateCanvasFromElk(canvas:JSONCanvas, elkGraph:ElkNode){
        const newNodes:GenericNode[] = canvas.getNodes().map((cNode:GenericNode) => {
            const ElkNode = this.getElkNodeFromId(cNode.id, elkGraph)
            
            assert(ElkNode?.x !== undefined)
            assert(ElkNode?.y !== undefined)

            return {
                ...cNode,
                x: ElkNode.x,
                y: ElkNode.y,
            }
        })

        const newEdges:Edge[] = canvas.getEdges().map((cEdge:Edge) => {

            
            const fromNode = this.getElkNodeFromId(cEdge.fromNode, elkGraph)
            const toNode = this.getElkNodeFromId(cEdge.toNode, elkGraph)
            const elkEdge = this.getElkEdgeFromId(cEdge.id, elkGraph)

            assert(fromNode !== undefined)
            assert(toNode !== undefined)
            assert(elkEdge !== undefined)
            assert(elkEdge.sections !== undefined)
            
            return {
                ...cEdge,
                fromSide: this.getConnectionSide(fromNode, elkEdge?.sections[0].startPoint),
                toSide: this.getConnectionSide(toNode, elkEdge?.sections[0].endPoint),
            }
        })
        return new JSONCanvas(newNodes, newEdges)
    }

    getElkNodeFromId(id:string, elkGraph:ElkNode){
        return elkGraph.children?.find(n => n.id===id)
    }

    getElkEdgeFromId(id:string, elkGraph:ElkNode){
        return elkGraph.edges?.find(n => n.id===id)
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


}