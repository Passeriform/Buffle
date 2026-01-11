import { padLayout, type Layout } from "../utility/layout"
import { Widget, type WidgetOptions } from "./widget"

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

type BlockOptions = WidgetOptions & {
    backgroundColor: string
}

// TODO: Give bevel 3d look to block
export class Block extends Widget<BlockOptions> {
    private _value: BlockValue

    public static readonly COLOR_MAPPING = {
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

    static equals(a: Block, b: Block) {
        return a.value === b.value
    }

    constructor(value: BlockValue, options: Partial<Omit<BlockOptions, "backgroundColor">> = {}) {
        if (!Number.isInteger(Math.log2(value))) {
            throw new Error(`Invalid block value: ${value}`)
        }

        super({
            ...options,
            backgroundColor: Block.COLOR_MAPPING[value],
        })

        this._value = value
    }

    override clone(value?: number) {
        return new Block(value ?? this._value, this.baseOptions) as this
    }

    override getRenderLayouts(inLayout: Layout) {
        return inLayout
    }

    override draw(ctx: CanvasRenderingContext2D, layout: Layout) {
        ctx.globalAlpha = this.options.opacity
        ctx.fillStyle = this.options.backgroundColor
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

    get value(): Readonly<BlockValue> {
        return this._value
    }

    upgrade() {
        this._value = (this.value * 2) as BlockValue
        this.baseOptions.backgroundColor = Block.COLOR_MAPPING[this._value]
    }
}
