import type { Layout } from "../utility/layout"

type GridOptions = {
    background: string
    dimensions: [number, number]
    gap: number
    rounding: number
}

export class Grid {
    private layoutComputationMemo: Layout[] | undefined
    public options: GridOptions

    private computeLayout(inLayout: Layout) {
        const holeWidth = (inLayout.width - (this.options.dimensions[1] + 1) * this.options.gap) / this.options.dimensions[1]
        const holeHeight = (inLayout.height - (this.options.dimensions[0] + 1) * this.options.gap) / this.options.dimensions[0]

        this.layoutComputationMemo = []
        for (let row = 0; row < this.options.dimensions[0]; ++row) {
            for (let col = 0; col < this.options.dimensions[1]; ++col) {
                this.layoutComputationMemo.push({
                    left: inLayout.left + (col + 1) * this.options.gap + col * holeWidth,
                    top: inLayout.top + (row + 1) * this.options.gap + row * holeHeight,
                    width: holeWidth,
                    height: holeHeight,
                })
            }
        }
    }

    constructor(options: Partial<GridOptions> = {}) {
        this.options = {
            background: "#E3B2A9",
            dimensions: [4, 4],
            gap: 0,
            rounding: 0,
            ...options,
        }
    }

    getSlots() {
        return this.layoutComputationMemo?.map(layout => ({
            left: layout.left,
            top: layout.top,
            width: layout.width,
            height: layout.height,
        }))
    }

    render(ctx: CanvasRenderingContext2D, inLayout: Layout) {
        this.computeLayout(inLayout)

        ctx.fillStyle = this.options.background
        ctx.beginPath()
        this.layoutComputationMemo?.forEach(layout => {
            ctx.roundRect(
                layout.left,
                layout.top,
                layout.width,
                layout.height,
                this.options.rounding
            )
        })
        ctx.fill()

        return this.getSlots()!
    }
}