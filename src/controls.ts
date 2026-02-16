import { Direction } from "./constants"
import { ProcessQueue } from "./utility/processQueue"

// TODO: Add bindGamepad

export const bindControls = (root: HTMLElement, handler: (action: Direction) => void) => {
    const processQueue = new ProcessQueue()

    processQueue.run()

    // Bind Keyboard
    root.addEventListener("keydown", (event) => {
        if (["ArrowUp", "w", "W"].includes(event.key)) {
            processQueue.addTask(() => handler(Direction.UP))
        } else if (["ArrowDown", "s", "S"].includes(event.key)) {
            processQueue.addTask(() => handler(Direction.DOWN))
        } else if (["ArrowLeft", "a", "A"].includes(event.key)) {
            processQueue.addTask(() => handler(Direction.LEFT))
        } else if (["ArrowRight", "d", "D"].includes(event.key)) {
            processQueue.addTask(() => handler(Direction.RIGHT))
        }
    })

    // Bind Pointer
    const dragState = new Map<number, { x: number, y: number }>()

    root.addEventListener("pointerdown", (event) => {
        dragState.set(event.pointerId, { x: event.clientX, y: event.clientY })
    })

    root.addEventListener("pointerup", (event) => {
        const start = dragState.get(event.pointerId)

        if (!start) {
            return
        }

        dragState.delete(event.pointerId)

        const dx = event.clientX - start.x
        const dy = event.clientY - start.y

        if (Math.abs(dx) > Math.abs(dy))
            processQueue.addTask(() => handler(dx > 0 ? Direction.RIGHT : Direction.LEFT))
        else
            processQueue.addTask(() => handler(dy > 0 ? Direction.DOWN : Direction.UP))
    })

    root.addEventListener("pointercancel", (event) => {
        dragState.delete(event.pointerId)
    })

    document.body.style.touchAction = "none"

    // TODO: Add bindGamepad
}
