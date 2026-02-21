import type { Layout } from "../utility/layout"

export type WidgetOptions = {
    // TODO: Add inherit to take up parent's opacity
    opacity: number
    padding: `${number}%`
}

// TODO: Make every widget pre-render in separate canvas context
export abstract class Widget<
    Options extends WidgetOptions = WidgetOptions,
    State = never,
> {
    protected baseOptions: Options
    public layoutOverride?: Layout
    // TODO: Use proxy object on options for fine-grained mutation
    public optionsOverride: Partial<Options> = {}

    protected makeDynamicOption(key: keyof Options, valueGetter: () => unknown) {
        Object.defineProperty(this.baseOptions, key, {
            enumerable: true,
            get: valueGetter,
        })
    }

    protected resolveDependent(value: `${number}%`, layout: Layout) {
        return Number.parseFloat(value) * layout.width / 100
    }

    constructor(options: Partial<Options> = {}) {
        this.baseOptions = {
            opacity: 1,
            padding: "0%",
            ...options,
        } as unknown as Options
    }

    get options(): Readonly<Options> {
        return (Object.keys(this.baseOptions) as (keyof Options)[]).reduce((acc, key) => ({ ...acc, [key]: this.optionsOverride?.[key] ?? acc[key] }), this.baseOptions)
    }

    protected abstract getRenderLayouts(inLayout: Layout): Layout

    protected abstract draw(ctx: CanvasRenderingContext2D, selfLayouts: Layout, ...state: ([State] extends [never] ? [undefined?] : [State])): void

    protected abstract getSlots(selfLayouts: Layout): Layout

    abstract clone(): this

    render(ctx: CanvasRenderingContext2D, inLayout: Layout, ...state: ([State] extends [never] ? [undefined?] : [State])) {
        const renderLayouts = this.getRenderLayouts(this.layoutOverride ?? inLayout)
        ctx.save()
        this.draw(ctx, renderLayouts, ...state)
        ctx.restore()
        const slots = this.getSlots(renderLayouts)!

        return slots
    }
}
