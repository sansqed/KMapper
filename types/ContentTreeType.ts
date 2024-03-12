export type ContentTree = {
    type: string
    text: string,
    pos: string[],
    values: string[],
    contents: ContentTree[]
}

export interface HeadingItem extends ContentTree{
    type: "heading",
}

export interface TextItem extends ContentTree{
    type: "text"
}

export interface ContentFile extends ContentTree{
    type: "file",
    path: string
}