import { padLayout, type Layout } from "../utility/layout"
import { Widget, type WidgetOptions } from "./widget"

type GridOptions = WidgetOptions & {
    background: string
    dimensions: [number, number]
    gap: number
}

export class Grid extends Widget<GridOptions, never, "1**"> {
    constructor(options: Partial<GridOptions> = {}) {
        super({
            background: "#5A2F28",
            dimensions: [4, 4],
            gap: 0,
            ...options,
        })
    }

    override clone() {
        return new Grid(this.baseOptions) as this
    }

    override getRenderLayouts(inLayout: Layout) {
        const holeWidth = (inLayout.width - (this.options.dimensions[1] + 1) * this.options.gap) / this.options.dimensions[1]
        const holeHeight = (inLayout.height - (this.options.dimensions[0] + 1) * this.options.gap) / this.options.dimensions[0]

        const layouts = []
        for (let row = 0; row < this.options.dimensions[0]; ++row) {
            for (let col = 0; col < this.options.dimensions[1]; ++col) {
                layouts.push({
                    left: inLayout.left + (col + 1) * this.options.gap + col * holeWidth,
                    top: inLayout.top + (row + 1) * this.options.gap + row * holeHeight,
                    width: holeWidth,
                    height: holeHeight,
                })
            }
        }

        return layouts
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
                this.options.rounding
            )
        })
        ctx.fill()
    }

    override getSlots(layouts: Layout[]) {
        return layouts.map((layout) => padLayout(layout, this.options.padding))
    }
}