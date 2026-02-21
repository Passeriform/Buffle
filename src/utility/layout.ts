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

export const padLayout = (layout: Layout, padding: `${number}%`) => ({
    top: layout.top + (Number.parseFloat(padding) * layout.width / 100),
    left: layout.left + (Number.parseFloat(padding) * layout.width / 100),
    width: layout.width - (2 * (Number.parseFloat(padding) * layout.width / 100)),
    height: layout.height - (2 * (Number.parseFloat(padding) * layout.width / 100)),
})

// TODO: Create Cassowary constraint resolver instead of this.
export const splitVertical = (layout: Layout, ...heights: number[]) => {
    const layouts = [] as Layout[]

    let consumed = 0
    const remaining = layout.height

    for (const height of heights) {
        if (remaining < height) {
            throw new Error("Layout is not big enough for splitting.")
        }

        layouts.push({ ...layout, top: layout.top + consumed, height })

        consumed += height
    }

    if (consumed < layout.height) {
        layouts.push({ ...layout, top: layout.top + consumed, height: layout.height - consumed })
    }

    return layouts
}

export const splitHorizontal = (layout: Layout, ...widths: number[]) => {
    const layouts = [] as Layout[]

    let consumed = 0
    const remaining = layout.width

    for (const width of widths) {
        if (remaining < width) {
            throw new Error("Layout is not big enough for splitting.")
        }

        layouts.push({ ...layout, left: layout.left + consumed, width })

        consumed += width
    }

    if (consumed < layout.width) {
        layouts.push({ ...layout, left: layout.left + consumed, width: layout.width - consumed })
    }

    return layouts
}

export const fitLayout = (layout: Layout) => {
    const base = Math.min(layout.width, layout.height)
    const [xCenter, yCenter] = [
        layout.left + (layout.width / 2),
        layout.top + (layout.height / 2),
    ]

    return {
        left: xCenter - (base / 2),
        top: yCenter - (base / 2),
        width: base,
        height: base,
    }
}

export const layoutGrid = (layout: Layout, dimensions: [rows: number, column: number], gap: `${number}%`) => {
    const cellLayouts = []

    for (let row = 0; row < dimensions[0]; ++row) {
        for (let column = 0; column < dimensions[1]; ++column) {
            cellLayouts.push(padLayout({
                left: layout.left + (column * layout.width / dimensions[1]),
                top: layout.top + (row * layout.height / dimensions[0]),
                width: layout.width / dimensions[1],
                height: layout.height / dimensions[0],
            }, gap))
        }
    }

    return cellLayouts
}

export const wireframe = (ctx: CanvasRenderingContext2D, layout: Layout) => {
    const styleBackup = [ctx.fillStyle, ctx.strokeStyle] as const

    ctx.fillStyle = "#dd4dad20"
    ctx.strokeStyle = "#dd4dada0"

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
