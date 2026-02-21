import { type Layout, padLayout } from "../utility/layout"
import { Widget, type WidgetOptions } from "./widget"

export const BLOCK_PALLETTES = {
    COFFEE: [
        "#ffd6cc",
        "#ffb8a8",
        "#ff9b84",
        "#ff7e5e",
        "#f96342",
        "#e84c2a",
        "#cc3e22",
        "#a8321f",
        "#832719",
        "#5e1d13",
        "#3d120b",
        "#240a06",
    ],
} as const

export const BLOCK_DISPLAY_SET = {
    NUMBERS: ["2", "4", "8", "16", "32", "64", "128", "256", "512", "1024", "2048", "4096"],
    SHAPES: ["⏺", "▲", "■", "⬟", "⬢", "🟂", "🟆", "🟊", "🟌", "🟏", "🟓", "✾", "✿", "❁"],
} as const

type BlockConfig = {
    pallette: readonly string[]
    displayValues: readonly string[]
    scoreValues: readonly number[]
}

type BlockOptions = WidgetOptions & {
    rounding: `${number}%`
}

// TODO: Give bevel 3d look to block
export class Block extends Widget<BlockOptions & { background: string }> {
    private _value: number
    private readonly pallette: readonly string[]
    private readonly displayValues: readonly string[]
    private readonly scoreValues: readonly number[]

    static equals(first: Block, second: Block) {
        return first._value === second._value
    }

    constructor(value: number, options: Partial<BlockConfig> & Partial<BlockOptions> = {}) {
        super({
            rounding: "0%",
            ...options,
        })

        this._value = value
        this.pallette = options.pallette ?? BLOCK_PALLETTES.COFFEE
        this.displayValues = options.displayValues ?? BLOCK_DISPLAY_SET.NUMBERS
        this.scoreValues = options.scoreValues ?? [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096] as const

        this.makeDynamicOption("background", () => this.pallette[this._value])
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

    get value() {
        return this._value
    }

    get score() {
        return this.scoreValues[this._value]
    }

    get displayValue() {
        return this.displayValues[this._value]
    }

    get color() {
        return this.pallette[this._value]
    }

    colorFor(value?: number) {
        return this.pallette[value ?? this._value]
    }

    upgrade(targetValue: number = this._value + 1) {
        this._value = targetValue
    }
}
