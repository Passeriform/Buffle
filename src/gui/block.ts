import { padLayout, type Layout } from "../utility/layout"

export enum BlockValue {
    TWO = 2,
    FOUR = 4,
    EIGHT = 8,
    SIXTEEN = 16,
    THIRTY_TWO = 32,
    SIXTY_FOUR = 64,
    ONE_TWENTY_EIGHT = 128,
    TWO_FIFTY_SIX = 256,
    FIVE_TWELVE = 512,
    TEN_TWENTY_FOUR = 1024,
    TWENTY_FORTY_EIGHT = 2048,
    FORTY_NINETY_SIX = 4096,
}

type BlockOptions = {
    padding: number
    rounding: number
}

const COLOR_MAPPING = {
    [BlockValue.TWO]: "#FFD6CC",
    [BlockValue.FOUR]: "#FFB8A8",
    [BlockValue.EIGHT]: "#FF9B84",
    [BlockValue.SIXTEEN]: "#FF7E5E",
    [BlockValue.THIRTY_TWO]: "#F96342",
    [BlockValue.SIXTY_FOUR]: "#E84C2A",
    [BlockValue.ONE_TWENTY_EIGHT]: "#CC3E22",
    [BlockValue.TWO_FIFTY_SIX]: "#A8321F",
    [BlockValue.FIVE_TWELVE]: "#832719",
    [BlockValue.TEN_TWENTY_FOUR]: "#5E1D13",
    [BlockValue.TWENTY_FORTY_EIGHT]: "#3D120B",
    [BlockValue.FORTY_NINETY_SIX]: "#240A06",
} satisfies Record<BlockValue, string>

export class Block {
    private layoutComputationMemo: Layout | undefined
    public value: BlockValue
    public options: BlockOptions

    static equals(a: Block, b: Block) {
        return a.value === b.value
    }

    static from(block: Block, value?: number) {
        return new Block(value ?? block.value, block.options)
    }

    private computeLayout(inLayout: Layout) {
        this.layoutComputationMemo = inLayout
    }

    constructor(value: BlockValue, options: Partial<BlockOptions> = {}) {
        if (!Number.isInteger(Math.log2(value))) {
            throw new Error(`Invalid block value: ${value}`)
        }
        this.value = value
        this.options = {
            padding: 0,
            rounding: 0,
            ...options,
        }
    }

    getSlots() {
        return this.layoutComputationMemo ? padLayout(this.layoutComputationMemo, this.options.padding) : undefined
    }

    upgrade() {
        this.value = (this.value * 2) as BlockValue
    }

    render(ctx: CanvasRenderingContext2D, inLayout: Layout) {
        this.computeLayout(inLayout)

        ctx.fillStyle = COLOR_MAPPING[this.value]
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
