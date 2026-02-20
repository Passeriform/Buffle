const CANVAS_ID = "canvas_" + (Math.random() + 1).toString(36).substring(7)

const fitCanvas = () => {
    const canvas = document.getElementById(CANVAS_ID) as HTMLCanvasElement

    if (!canvas) {
        throw new Error("Canvas is not ready yet")
    }

    canvas.width = canvas.clientWidth
    canvas.height = canvas.clientHeight
}

export const createScreen = (elementTag: string, background: string = "#ffffff") => {
    const root = document.getElementById(elementTag)

    if (!root) {
        throw new Error("Root is not rendered")
    }

    const canvas = document.createElement("canvas")

    canvas.id = CANVAS_ID

    root.append(canvas)

    fitCanvas()

    window.addEventListener("resize", fitCanvas)

    const ctx = canvas.getContext("2d")

    if (!ctx) {
        throw new Error("Context not created")
    }

    ctx.fillStyle = background
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    return ctx
}
