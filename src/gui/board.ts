import { padLayout, type Layout } from "../utility/layout"
import { Widget, type WidgetOptions } from "./widget"

type BoardOptions = WidgetOptions & {
    background: string
    max: number
    min: number
}

export class Board extends Widget<BoardOptions> {
    constructor(options: Partial<BoardOptions> = {}) {
        super({
            background: "#6B3C33",
            max: 1600,
            min: 400,
            ...options,
        })
    }

    override clone() {
        return new Board(this.baseOptions) as this
    }

    override getRenderLayouts(inLayout: Layout) {
        const base = Math.min(inLayout.width, inLayout.height) - this.options.margin
        const minClamped = this.options.min ? Math.max(this.options.min, base) : base
        const maxClamped = this.options.max ? Math.min(this.options.max, minClamped) : minClamped
        const [xCenter, yCenter] = [
            inLayout.left + (inLayout.width / 2),
            inLayout.top + (inLayout.height / 2),
        ]

        return {
            left: xCenter - (maxClamped / 2),
            top: yCenter - (maxClamped / 2),
            width: maxClamped,
            height: maxClamped,
        }
    }

    override draw(ctx: CanvasRenderingContext2D, layout: Layout) {
        ctx.globalAlpha = this.options.opacity
        ctx.fillStyle = this.options.background
        ctx.beginPath()
        ctx.roundRect(
            layout.left,
            layout.top,
            layout.width,
            layout.height,
            this.options.rounding,
        )
        ctx.fill()
    }

    override getSlots(layout: Layout) {
        return padLayout(layout, this.options.padding)
    }
}