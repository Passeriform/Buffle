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
export const splitVertical = (layout: Layout, ...heights: number[]) => {
    const layouts = [] as Layout[]

    let consumed = 0
    const remaining = layout.height

    for (const height of heights) {
        if (remaining < height) {
            throw Error("Layout is not big enough for splitting.")
        }

        layouts.push({ ...layout, top: layout.top + consumed, height })

        consumed += height
    }

    if (consumed < layout.height) {
        layouts.push({ ...layout, top: layout.top + consumed, height: layout.height - consumed })
    }

    return layouts
}

export const wireframe = (ctx: CanvasRenderingContext2D, layout: Layout) => {
    const styleBackup = [ctx.fillStyle, ctx.strokeStyle] as const
    ctx.fillStyle = "#DD4DAD20"
    ctx.strokeStyle = "#DD4DADA0"
    ctx.fillRect(layout.left, layout.top, layout.width, layout.height)
    ctx.strokeRect(layout.left, layout.top, layout.width, layout.height)
    const [topLeft, topRight, bottomLeft, bottomRight] = [
        [layout.left, layout.top],
        [layout.left + layout.width, layout.top],
        [layout.left, layout.top + layout.height],
        [layout.left + layout.width, layout.top + layout.height],
    ] as const
    ctx.moveTo(...topLeft)
    ctx.lineTo(...bottomRight)
    ctx.moveTo(...topRight)
    ctx.lineTo(...bottomLeft)
    ctx.stroke()
    ctx.fillStyle = styleBackup[0]
    ctx.strokeStyle = styleBackup[0]
}
