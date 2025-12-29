const CANVAS_ID = "canvas_" + (Math.random() + 1).toString(36).substring(7)

const fitCanvas = () => {
    const canvas = document.getElementById(CANVAS_ID) as HTMLCanvasElement

    if (!canvas) {
        throw Error("Canvas is not ready yet")
    }

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}

export const createCanvas = (elementTag: string, backgroundColor: string = "#FFFFFF") => {
    const root = document.getElementById(elementTag)

    if (!root) {
        throw Error("Root is not rendered")
    }

    const canvas = document.createElement("canvas")

    canvas.id = CANVAS_ID

    root.appendChild(canvas)

    fitCanvas()

    window.addEventListener("resize", fitCanvas)

    const ctx = canvas.getContext("2d")

    if (!ctx) {
        throw Error("Context not created")
    }

    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    return ctx
}