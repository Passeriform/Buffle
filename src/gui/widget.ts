import type { Layout } from "../utility/layout"

export type WidgetOptions = {
    margin: number
    opacity: number
    padding: number
    rounding: number
}

type RenderChain = `${"1" | "*"}${"1" | "*"}${"1" | "*"}`

type PickRenderType<
    RC extends RenderChain,
    Type extends "In" | "Render" | "Slot"
> =
    RC extends `${infer I}${infer R}${infer S}`
    ? Type extends "In" ? I
    : Type extends "Render" ? R
    : Type extends "Slot" ? S
    : never
    : never

type ResolveLayout<
    RC extends RenderChain,
    Type extends "In" | "Render" | "Slot"
> =
    PickRenderType<RC, Type> extends "1" ? Layout : PickRenderType<RC, Type> extends "*" ? Layout[] : never

type InLayout<T extends RenderChain> = ResolveLayout<T, "In">
type RenderLayout<T extends RenderChain> = ResolveLayout<T, "Render">
type SlotLayout<T extends RenderChain> = ResolveLayout<T, "Slot">

export abstract class Widget<
    Options extends WidgetOptions = WidgetOptions,
    State = never,
    Chaining extends RenderChain = "111",
> {
    protected baseOptions: Options
    public layoutOverride?: InLayout<Chaining>
    public optionsOverride: Partial<Options> = {}

    constructor(options: Partial<Options> = {}) {
        this.baseOptions = {
            margin: 0,
            opacity: 1,
            padding: 0,
            rounding: 0,
            ...options,
        } as Options
    }

    get options(): Readonly<Options> {
        return (Object.keys(this.baseOptions) as (keyof Options)[]).reduce((acc, key) => ({ ...acc, [key]: this.optionsOverride?.[key] ?? acc[key] }), this.baseOptions)
    }

    protected abstract getRenderLayouts(inLayout: InLayout<Chaining>): RenderLayout<Chaining>

    protected abstract draw(ctx: CanvasRenderingContext2D, selfLayouts: RenderLayout<Chaining>, state?: State): void

    protected abstract getSlots(selfLayouts: RenderLayout<Chaining>): SlotLayout<Chaining>

    abstract clone(): this

    render(ctx: CanvasRenderingContext2D, inLayout: InLayout<Chaining>, state?: State) {
        const renderLayouts = this.getRenderLayouts(this.layoutOverride ?? inLayout)
        this.draw(ctx, renderLayouts, state)
        const slots = this.getSlots(renderLayouts)!

        return slots
    }
}

export type AnyWidget = Widget<any, any, any>