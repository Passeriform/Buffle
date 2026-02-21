import type { Layout } from "../utility/layout"
import { Widget, type WidgetOptions } from "./widget"

type TextOptions = WidgetOptions & {
    lineHeight: number
    color: string
    font: string
}

type TextWidgetState = string

// TODO: Convert to DOM based widget
export class Text extends Widget<TextOptions, TextWidgetState> {
    private measureLines(ctx: CanvasRenderingContext2D, text: string, fontSize: number) {
        ctx.font = `bold ${fontSize}px ${this.options.font}`

        return text.split("\n").map((line) => {
            const metrics = ctx.measureText(line)
            const ascent = metrics.actualBoundingBoxAscent ?? fontSize * 0.8
            const descent = metrics.actualBoundingBoxDescent ?? fontSize * 0.2
            return {
                text: line,
                width: metrics.width,
                height: ascent + descent + fontSize * this.options.lineHeight,
            }
        })
    }

    private getFitFontSize(ctx: CanvasRenderingContext2D, layout: Layout, text: string) {
        const probe = 100
        const lines = this.measureLines(ctx, text, probe)
        const blockWidth = lines.map(({ width }) => width).max()
        const blockHeight = lines.map(({ height }) => height).sum()
        return Math.min(layout.width * probe / blockWidth, layout.height * probe / blockHeight)
    }

    constructor(options: Partial<TextOptions> = {}) {
        super({
            color: "#f3edeb",
            font: "Quicksand, sans-serif",
            lineHeight: 0.2,
            ...options,
        })
    }

    override clone() {
        return new Text(this.baseOptions) as this
    }

    override getRenderLayouts(inLayout: Layout) {
        return inLayout
    }

    override draw(ctx: CanvasRenderingContext2D, layout: Layout, state: TextWidgetState) {
        const fontSize = this.getFitFontSize(ctx, layout, state)
        const lines = this.measureLines(ctx, state, fontSize)
        const lineHeight = lines[0].height
        const verticalOffset = (layout.height - (lineHeight * lines.length)) / 2

        ctx.globalAlpha = this.options.opacity
        ctx.font = `bold ${fontSize}px ${this.options.font}`
        ctx.fillStyle = this.options.color
        ctx.textAlign = "left"
        ctx.textBaseline = "top"

        lines.forEach((line, idx) => {
            const [x, y] = [
                layout.left + (layout.width - line.width) / 2,
                layout.top + verticalOffset + idx * lineHeight,
            ]
            ctx.fillText(line.text, x, y)
        })

        // TODO: Add cleanup to restore canvas state post-render
    }

    override getSlots(layout: Layout) {
        return layout
    }
}
