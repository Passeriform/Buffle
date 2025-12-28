export enum Direction { UP, DOWN, LEFT, RIGHT }

export const bindControls = (root: HTMLElement, handler: (action: Direction) => void) => {
    const dragState = new Map<number, { x: number, y: number }>()

    root.addEventListener("keydown", (e) => {
        const direction = {
            "ArrowUp": Direction.UP,
            "w": Direction.UP,
            "W": Direction.UP,
            "ArrowDown": Direction.DOWN,
            "s": Direction.DOWN,
            "S": Direction.DOWN,
            "ArrowLeft": Direction.LEFT,
            "a": Direction.LEFT,
            "A": Direction.LEFT,
            "ArrowRight": Direction.RIGHT,
            "d": Direction.RIGHT,
            "D": Direction.RIGHT,
        }[e.key]

        if (direction !== undefined) {
            handler(direction)
        }
    })

    root.addEventListener("pointerdown", (e) =>
        dragState.set(e.pointerId, { x: e.clientX, y: e.clientY })
    )

    root.addEventListener("pointerup", (e) => {
        const start = dragState.get(e.pointerId)

        if (!start) {
            return
        }

        dragState.delete(e.pointerId)

        const dx = e.clientX - start.x
        const dy = e.clientY - start.y

        if (Math.abs(dx) > Math.abs(dy))
            handler(dx > 0 ? Direction.RIGHT : Direction.LEFT)
        else
            handler(dy > 0 ? Direction.DOWN : Direction.UP)
    })

    root.addEventListener("pointercancel", (e) =>
        dragState.delete(e.pointerId)
    )

    document.body.style.touchAction = "none"
}