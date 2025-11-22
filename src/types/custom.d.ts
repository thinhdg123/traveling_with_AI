declare module '@svg-maps/vietnam' {
    export interface SvgMapLocation {
        id: string
        name: string
        path: string
    }

    export interface SvgMapDefinition {
        label: string
        viewBox: string
        locations: SvgMapLocation[]
    }

    const content: SvgMapDefinition
    export default content
}

declare module 'svg-path-bounds' {
    export default function svgPathBounds(path: string): [number, number, number, number]
}
