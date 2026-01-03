import type { Layout } from "../utility/layout"

type TextOptions = {
    margin: number
    color: string
    font: string
    align: CanvasTextAlign
    baseline: CanvasTextBaseline
    opacity: number
}

export class Text {
    private content: string
    private layoutComputationMemo: Layout | undefined
    public options: TextOptions

    private computeLayout(inLayout: Layout) {
        const base = Math.min(inLayout.width, inLayout.height) - this.options.margin
        const [xCenter, yCenter] = [
            inLayout.left + (inLayout.width / 2),
            inLayout.top + (inLayout.height / 2),
        ]

        this.layoutComputationMemo = {
            left: xCenter - (base / 2),
            top: yCenter - (base / 2),
            width: base,
            height: base,
        }
    }

    constructor(options: Partial<TextOptions> = {}) {
        this.content = "Set content via withContent in render"
        this.options = {
            color: "#F3EDEB",
            font: "Quicksand",
            align: "center",
            baseline: "middle",
            margin: 0,
            opacity: 1,
            ...options,
        }
    }

    withContent(content: string) {
        this.content = content

        return this
    }

    render(ctx: CanvasRenderingContext2D, inLayout: Layout) {
        this.computeLayout(inLayout)

        ctx.globalAlpha = this.options.opacity
        ctx.font = `bold ${this.layoutComputationMemo!.height}px ${this.options.font}`
        ctx.textAlign = this.options.align
        ctx.textBaseline = this.options.baseline
        ctx.fillStyle = this.options.color
        ctx.fillText(
            this.content,
            this.layoutComputationMemo!.left + (this.layoutComputationMemo!.width / 2),
            this.layoutComputationMemo!.top + (this.layoutComputationMemo!.height / 2),
        )
    }
}