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
    [BlockValue.TWO]: "#FFE2DB",
    [BlockValue.FOUR]: "#FFD1C3",
    [BlockValue.EIGHT]: "#FFB8A4",
    [BlockValue.SIXTEEN]: "#FF9E8A",
    [BlockValue.THIRTY_TWO]: "#FF846E",
    [BlockValue.SIXTY_FOUR]: "#FF6A52",
    [BlockValue.ONE_TWENTY_EIGHT]: "#F2553C",
    [BlockValue.TWO_FIFTY_SIX]: "#E1462F",
    [BlockValue.FIVE_TWELVE]: "#C93A25",
    [BlockValue.TEN_TWENTY_FOUR]: "#A8321F",
    [BlockValue.TWENTY_FORTY_EIGHT]: "#7F2418",
    [BlockValue.FORTY_NINETY_SIX]: "#56180F",
} satisfies Record<BlockValue, string>

export class Block {
    private layoutComputationMemo: Layout | undefined
    public value: BlockValue
    public options: BlockOptions

    static equals(a: Block, b: Block) {
        return a.value === b.value
    }

    static from(block: Block, value?: number) {
        const newBlock = structuredClone(block)

        if (value) {
            newBlock.value = value
        }

        return newBlock
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
