import { type Layout, padLayout } from "../utility/layout"
import { Text } from "./text"
import { Widget, type WidgetOptions } from "./widget"

type BlockConfig = {
    pallette: keyof typeof Block.PALLETTES
    displaySet: keyof typeof Block.DISPLAY_SETS
    scoreScaling: keyof typeof Block.SCORE_SCALING
    textWidget: Text
}

type BlockOptions = WidgetOptions & {
    rounding: `${number}%`
}

// TODO: Give bevel 3d look to block
export class Block extends Widget<BlockOptions & { background: string }> {
    static PALLETTES = {
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

    static DISPLAY_SETS = {
        NUMBERS: ["2", "4", "8", "16", "32", "64", "128", "256", "512", "1024", "2048", "4096"],
        SHAPES: ["⏺", "▲", "⏹", "⬟", "⬢", "🟂", "✦", "🟊", "🟌", "✸", "🟓", "✾", "✿", "❁"],
    } as const

    static SCORE_SCALING = {
        LINEAR: (value: number) => value + 1,
        TWO_EXPONENTIAL: (value: number) => 2 ** (value + 1),
    } as const

    private _value: number
    private scoreScaling: keyof typeof Block.SCORE_SCALING

    public pallette: keyof typeof Block.PALLETTES
    public displaySet: keyof typeof Block.DISPLAY_SETS
    public textWidget: Text

    static equals(first: Block, second: Block) {
        return first._value === second._value
    }

    constructor(value: number, options: Partial<BlockConfig> & Partial<BlockOptions> = {}) {
        super({
            rounding: "0%",
            ...options,
        })

        this._value = value
        this.pallette = options.pallette ?? "COFFEE"
        this.displaySet = options.displaySet ?? "NUMBERS"
        this.scoreScaling = options.scoreScaling ?? "TWO_EXPONENTIAL"
        this.textWidget = options.textWidget ?? new Text()

        this.makeDynamicOption("background", () => this.color)
    }

    override clone(value?: number) {
        return new Block(value ?? this._value, {
            ...this.baseOptions,
            pallette: this.pallette,
            displaySet: this.displaySet,
            scoreScaling: this.scoreScaling,
            textWidget: this.textWidget,
        }) as this
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

        this.textWidget.render(ctx, padLayout(layout, this.options.padding), Block.DISPLAY_SETS[this.displaySet][this._value])
    }

    override getSlots(layout: Layout) {
        return layout
    }

    get value() {
        return this._value
    }

    get score() {
        return Block.SCORE_SCALING[this.scoreScaling](this._value)
    }

    get color() {
        return Block.PALLETTES[this.pallette][this._value]
    }

    colorFor(value?: number) {
        return Block.PALLETTES[this.pallette][value ?? this._value]
    }

    upgrade(targetValue: number = this._value + 1) {
        this._value = targetValue
    }
}
