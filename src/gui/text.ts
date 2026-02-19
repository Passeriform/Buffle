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
    protected getTextBlockSize(ctx: CanvasRenderingContext2D, text: string, baseFontSize: number) {
        ctx.font = `bold ${baseFontSize}px ${this.options.font}`

        return text.split("\n").reduce((acc, line) => {
            const { width, actualBoundingBoxAscent, actualBoundingBoxDescent } = ctx.measureText(line)
            return {
                width: Math.max(acc.width, width),
                height: acc.height + actualBoundingBoxAscent + actualBoundingBoxDescent + (baseFontSize * this.options.lineHeight),
            }
        }, { width: 0, height: 0 })
    }

    protected getFitFontSize(ctx: CanvasRenderingContext2D, layout: Layout, text: string) {
        const testFontSize = 100
        const { width: testBlockWidth, height: testBlockHeight } = this.getTextBlockSize(ctx, text, testFontSize)
        const fontSize = Math.min(layout.width * testFontSize / testBlockWidth, layout.height * testFontSize / testBlockHeight)
        return fontSize
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
        const lines = state.split("\n")
        const sizes = lines.map((line) => this.getTextBlockSize(ctx, line, fontSize))
        const verticalCenteringOffset = (layout.height - sizes.map(({ height }) => height).sum()) / 2

        ctx.globalAlpha = this.options.opacity
        ctx.font = `bold ${fontSize}px ${this.options.font}`
        ctx.fillStyle = this.options.color
        ctx.textAlign = "left"
        ctx.textBaseline = "top"
        ctx.strokeStyle = "red"

        lines.forEach((line, idx) => {
            const [blockLeft, blockTop] = [
                layout.left + (layout.width - sizes[idx].width) / 2,
                layout.top + ((sizes[idx].height + this.options.lineHeight) * idx) + verticalCenteringOffset,
            ]

            ctx.fillText(line, blockLeft, blockTop)
        })

        // TODO: Add cleanup to restore canvas state post-render
    }

    override getSlots(layout: Layout) {
        return layout
    }
}
