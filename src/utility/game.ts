export const loopDraw = (ctx: CanvasRenderingContext2D, draw: (delta: DOMHighResTimeStamp, ctx: CanvasRenderingContext2D) => void) => {
    const loop = (delta: DOMHighResTimeStamp) => {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
        // TODO: Use double buffer and swap for image draw, reduce flicker
        draw(delta, ctx)
        requestAnimationFrame(loop)
    }

    requestAnimationFrame(loop)
}
