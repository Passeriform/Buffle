import type { Layout } from "../utility/layout"
import { Widget, type WidgetOptions } from "./widget"

type TextOptions = WidgetOptions & {
    color: string
    font: string
    align: CanvasTextAlign
    baseline: CanvasTextBaseline
}

type TextWidgetState = string

export class Text extends Widget<TextOptions, TextWidgetState> {
    constructor(options: Partial<TextOptions> = {}) {
        super({
            color: "#F3EDEB",
            font: "Quicksand, sans-serif",
            align: "center",
            baseline: "middle",
            ...options,
        })
    }

    override clone() {
        return new Text(this.baseOptions) as this
    }

    override getRenderLayouts(inLayout: Layout) {
        const base = Math.min(inLayout.width, inLayout.height) - this.options.margin
        const [xCenter, yCenter] = [
            inLayout.left + (inLayout.width / 2),
            inLayout.top + (inLayout.height / 2),
        ]

        return {
            left: xCenter - (base / 2),
            top: yCenter - (base / 2),
            width: base,
            height: base,
        }
    }

    override draw(ctx: CanvasRenderingContext2D, layout: Layout, state: TextWidgetState) {
        ctx.globalAlpha = this.options.opacity
        ctx.font = `bold ${layout.height}px ${this.options.font}`
        ctx.textAlign = this.options.align
        ctx.textBaseline = this.options.baseline
        ctx.fillStyle = this.options.color
        ctx.fillText(
            state,
            layout.left + (layout.width / 2),
            layout.top + (layout.height / 2),
        )

        // TODO: Add cleanup to restore canvas state post-render
    }

    override getSlots(layout: Layout) {
        return layout
    }
}