type StripClient<T> = {
    [K in keyof T as
    K extends `client${infer Rest}` ? Uncapitalize<Rest> : never
    ]: T[K]
}

export type Layout = StripClient<HTMLCanvasElement>

export const rootLayout = (element: HTMLElement) => ({
    top: element.clientTop,
    left: element.clientLeft,
    width: element.clientWidth,
    height: element.clientHeight,
} satisfies Layout | undefined)

export const padLayout = (layout: Layout, padding: number) => ({
    top: layout.top + padding,
    left: layout.left + padding,
    width: layout.width - (2 * padding),
    height: layout.height - (2 * padding),
})

// TODO: Create Cassowary constraint resolver instead of this.
export const splitTop = (layout: Layout, height: number) => [
    { ...layout, height },
    { ...layout, top: height, height: layout.height - height },
]
