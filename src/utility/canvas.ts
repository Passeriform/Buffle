const CANVAS_ID = "canvas_" + (Math.random() + 1).toString(36).substring(7)

const fitCanvas = (ctx: CanvasRenderingContext2D) => {
    const dpr = window.devicePixelRatio || 1

    ctx.canvas.width = ctx.canvas.clientWidth * dpr
    ctx.canvas.height = ctx.canvas.clientHeight * dpr

    ctx.scale(dpr, dpr)
}

export const createScreen = (elementTag: string, background: string = "#ffffff") => {
    const root = document.getElementById(elementTag)

    if (!root) {
        throw new Error("Root is not rendered")
    }

    const canvas = document.createElement("canvas")

    canvas.id = CANVAS_ID

    root.append(canvas)

    const ctx = canvas.getContext("2d")

    if (!ctx) {
        throw new Error("Context not created")
    }

    fitCanvas(ctx)

    window.addEventListener("resize", () => fitCanvas(ctx))

    ctx.fillStyle = background
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    return ctx
}
