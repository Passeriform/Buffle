import { type Layout, padLayout } from "../utility/layout"
import { Widget, type WidgetOptions } from "./widget"

type ContainerOptions = WidgetOptions & {
    background: string
    rounding: `${number}%`
}

export class Container extends Widget<ContainerOptions> {
    constructor(options: Partial<ContainerOptions> = {}) {
        super({
            background: "#6b3c3300",
            rounding: "0%",
            ...options,
        })
    }

    override clone() {
        return new Container(this.baseOptions) as this
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
}
