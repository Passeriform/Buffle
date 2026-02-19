import { type Layout, padLayout } from "../utility/layout"
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

/* eslint-disable-next-line ts/no-namespace -- Adding methods to enum needs namespace based import merging */
export namespace BlockValue {
    export const repr = (value: BlockValue): number => {
        return 2 ** (value + 1)
    }

    export const next = (value: BlockValue): BlockValue => {
        return value + 1 as BlockValue
    }
}

type BlockOptions = WidgetOptions & {
    rounding: `${number}%`
}

// TODO: Give bevel 3d look to block
export class Block extends Widget<BlockOptions & { background: string }> {
    private _value: BlockValue

    public static readonly COLOR_MAPPING = {
        [BlockValue.TWO]: "#ffd6cc",
        [BlockValue.FOUR]: "#ffb8a8",
        [BlockValue.EIGHT]: "#ff9b84",
        [BlockValue.SIXTEEN]: "#ff7e5e",
        [BlockValue.THIRTY_TWO]: "#f96342",
        [BlockValue.SIXTY_FOUR]: "#e84c2a",
        [BlockValue.ONE_TWENTY_EIGHT]: "#cc3e22",
        [BlockValue.TWO_FIFTY_SIX]: "#a8321f",
        [BlockValue.FIVE_TWELVE]: "#832719",
        [BlockValue.TEN_TWENTY_FOUR]: "#5e1d13",
        [BlockValue.TWENTY_FORTY_EIGHT]: "#3d120b",
        [BlockValue.FORTY_NINETY_SIX]: "#240a06",
    } satisfies Record<BlockValue, string>

    static equals(first: Block, second: Block) {
        return first._value === second._value
    }

    constructor(value: BlockValue, options: Partial<BlockOptions> = {}) {
        if (value < 0 || value > BlockValue.FORTY_NINETY_SIX) {
            throw new Error(`Invalid block value: ${value}`)
        }

        super({
            rounding: "0%",
            ...options,
        })

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
            Math.max(0, this.resolveDependent(this.options.rounding, layout)),
        )
        ctx.fill()
    }

    override getSlots(layout: Layout) {
        return padLayout(layout, this.options.padding)
    }

    get value(): Readonly<BlockValue> {
        return this._value
    }

    upgrade(targetValue: BlockValue = this._value + 1) {
        while (this._value < targetValue) {
            this._value = BlockValue.next(this._value)
        }
    }
}
