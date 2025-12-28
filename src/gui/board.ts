import { padLayout, type Layout } from "../utility/layout"

type BoardOptions = {
    background: string
    margin: number
    max: number
    min: number
    padding: number
    rounding: number
}

export class Board {
    private layoutComputationMemo: Layout | undefined
    public options: BoardOptions

    private computeLayout(inLayout: Layout) {
        const base = Math.min(inLayout.width, inLayout.height) - this.options.margin
        const minClamped = this.options.min ? Math.max(this.options.min, base) : base
        const maxClamped = this.options.max ? Math.min(this.options.max, minClamped) : minClamped
        const [xCenter, yCenter] = [
            inLayout.left + (inLayout.width / 2),
            inLayout.top + (inLayout.height / 2),
        ]

        this.layoutComputationMemo = {
            left: xCenter - (maxClamped / 2),
            top: yCenter - (maxClamped / 2),
            width: maxClamped,
            height: maxClamped,
        }
    }

    constructor(options: Partial<BoardOptions> = {}) {
        this.options = {
            background: "#D48F86",
            margin: 200,
            max: 1600,
            min: 400,
            padding: 10,
            rounding: 20,
            ...options,
        }
    }

    getSlots() {
        return this.layoutComputationMemo ? padLayout(this.layoutComputationMemo, this.options.padding) : undefined
    }

    render(ctx: CanvasRenderingContext2D, inLayout: Layout) {
        this.computeLayout(inLayout)

        ctx.fillStyle = this.options.background
        ctx.beginPath()
        ctx.roundRect(
            this.layoutComputationMemo!.left,
            this.layoutComputationMemo!.top,
            this.layoutComputationMemo!.width,
            this.layoutComputationMemo!.height,
            this.options.rounding,
        )
        ctx.fill()

        return this.getSlots()!
    }
}