import { ProcessQueue } from "./utility/processQueue"

export enum Direction { UP, DOWN, LEFT, RIGHT }

// TODO: Add bindGamepad

const bindKeyboard = (root: HTMLElement, handler: (action: Direction) => void, queue: ProcessQueue) => {
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
            queue.addTask(() => handler(direction))
        }
    })
}

const bindPointer = (root: HTMLElement, handler: (action: Direction) => void, queue: ProcessQueue) => {
        const dragState = new Map<number, { x: number, y: number }>()

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
            queue.addTask(() => handler(dx > 0 ? Direction.RIGHT : Direction.LEFT))
        else
            queue.addTask(() => handler(dy > 0 ? Direction.DOWN : Direction.UP))
    })

    root.addEventListener("pointercancel", (e) =>
        dragState.delete(e.pointerId)
    )

    document.body.style.touchAction = "none"
}

export const bindControls = (root: HTMLElement, handler: (action: Direction) => void) => {
    const processQueue = new ProcessQueue()

    processQueue.run()

    bindKeyboard(root, handler, processQueue)
    bindPointer(root, handler, processQueue)
}