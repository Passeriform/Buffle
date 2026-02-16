import { type Layout, padLayout } from "../utility/layout"
import { Widget, type WidgetOptions } from "./widget"

type GridOptions = WidgetOptions & {
    background: string
    dimensions: [rows: number, columns: number]
    rounding: `${number}%`
    gap: `${number}%`
}

// TODO: Fix responsive screen issues

export class Grid extends Widget<GridOptions, never, "1**"> {
    constructor(options: Partial<GridOptions> = {}) {
        super({
            background: "#5a2f28",
            dimensions: [4, 4],
            gap: "0%",
            rounding: "0%",
            ...options,
        })
    }

    override clone() {
        return new Grid(this.baseOptions) as this
    }

    override getRenderLayouts(inLayout: Layout) {
        const layoutGrid = Array.from({ length: this.options.dimensions[0] }).flatMap(
            (_, rowIdx) => Array.from({ length: this.options.dimensions[1] }).map(
                (_, colIdx) => ({
                    left: inLayout.left + (colIdx * inLayout.width / this.options.dimensions[1]),
                    top: inLayout.top + (rowIdx * inLayout.height / this.options.dimensions[0]),
                    width: inLayout.width / this.options.dimensions[1],
                    height: inLayout.height / this.options.dimensions[0],
                }),
            ),
        ).map((layout) => padLayout(layout, this.resolveDependent(this.options.gap, layout)))

        return layoutGrid
    }

    override draw(ctx: CanvasRenderingContext2D, layouts: Layout[]) {
        ctx.globalAlpha = this.options.opacity
        ctx.fillStyle = this.options.background
        ctx.beginPath()
        layouts.forEach((layout) => {
            ctx.roundRect(
                layout.left,
                layout.top,
                layout.width,
                layout.height,
                this.resolveDependent(this.options.rounding, layout),
            )
        })
        ctx.fill()
    }

    override getSlots(layouts: Layout[]) {
        return layouts.map((layout) => padLayout(layout, this.resolveDependent(this.options.padding, layout)))
    }
}
