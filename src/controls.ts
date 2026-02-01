import { Direction } from "./game"
import { ProcessQueue } from "./utility/processQueue"

export const bindControls = (root: HTMLElement, handler: (action: Direction) => void) => {
    const processQueue = new ProcessQueue()

    processQueue.run()

    // Bind Keyboard
    root.addEventListener("keydown", (e) => {
        if (["ArrowUp", "w", "W"].includes(e.key)) processQueue.addTask(() => handler(Direction.UP))
        else if (["ArrowDown", "s", "S"].includes(e.key)) processQueue.addTask(() => handler(Direction.DOWN))
        else if (["ArrowLeft", "a", "A"].includes(e.key)) processQueue.addTask(() => handler(Direction.LEFT))
        else if (["ArrowRight", "d", "D"].includes(e.key)) processQueue.addTask(() => handler(Direction.RIGHT))
    })

    // Bind Pointer
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
            processQueue.addTask(() => handler(dx > 0 ? Direction.RIGHT : Direction.LEFT))
        else
            processQueue.addTask(() => handler(dy > 0 ? Direction.DOWN : Direction.UP))
    })

    root.addEventListener("pointercancel", (e) =>
        dragState.delete(e.pointerId)
    )

    document.body.style.touchAction = "none"

    // TODO: Add bindGamepad

}
