import { padLayout, type Layout } from "../utility/layout"
import { Widget, type WidgetOptions } from "./widget"

export enum BlockValue {
    TWO,
    FOUR,
    EIGHT,
    SIXTEEN,
    THIRTY_TWO,
    SIXTY_FOUR,
    ONE_TWENTY_EIGHT,
    TWO_FIFTY_SIX,
    FIVE_TWELVE,
    TEN_TWENTY_FOUR,
    TWENTY_FORTY_EIGHT,
    FORTY_NINETY_SIX,
}

export namespace BlockValue {
    export const next = (value: BlockValue): BlockValue => {
        return value + 1 as BlockValue;
    }
}

type BlockOptions = WidgetOptions

// TODO: Give bevel 3d look to block
export class Block extends Widget<BlockOptions & { background: string }> {
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

    constructor(value: BlockValue, options: Partial<BlockOptions> = {}) {
        if (value < 0 || value > BlockValue.FORTY_NINETY_SIX) {
            throw new Error(`Invalid block value: ${value}`)
        }

        super(options)

        this._value = value
        this.makeDynamicOption("background", () => Block.COLOR_MAPPING[this._value])
    }

    override clone(value?: number) {
        return new Block(value ?? this._value, this.baseOptions) as this
    }

    override getRenderLayouts(inLayout: Layout) {
        return inLayout
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

    get value(): Readonly<BlockValue> {
        return this._value
    }

    upgrade() {
        this._value = BlockValue.next(this._value)
    }
}
