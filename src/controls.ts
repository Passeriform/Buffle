import { Direction } from "./constants"
import { ProcessQueue } from "./utility/processQueue"

// TODO: Add bindGamepad

export class Controls {
    private dragState: Map<number, { x: number, y: number }>
    private processQueue?: ProcessQueue<void>
    private flushQueue?: () => void

    private root?: HTMLElement
    private handler?: (action: Direction) => void

    // Listeners
    private keyDownListener = (event: KeyboardEvent) => {
        if (["ArrowUp", "w", "W"].includes(event.key)) {
            this.processQueue?.addTask(() => this.handler!(Direction.UP))
        } else if (["ArrowDown", "s", "S"].includes(event.key)) {
            this.processQueue?.addTask(() => this.handler!(Direction.DOWN))
        } else if (["ArrowLeft", "a", "A"].includes(event.key)) {
            this.processQueue?.addTask(() => this.handler!(Direction.LEFT))
        } else if (["ArrowRight", "d", "D"].includes(event.key)) {
            this.processQueue?.addTask(() => this.handler!(Direction.RIGHT))
        }
    }

    private pointerDownListener = (event: PointerEvent) => {
        this.dragState.set(event.pointerId, { x: event.clientX, y: event.clientY })
    }

    private pointerUpListener = (event: PointerEvent) => {
        const start = this.dragState.get(event.pointerId)

        if (!start) {
            return
        }

        this.dragState.delete(event.pointerId)

        const dx = event.clientX - start.x
        const dy = event.clientY - start.y

        if (Math.abs(dx) > Math.abs(dy))
            this.processQueue?.addTask(() => this.handler!(dx > 0 ? Direction.RIGHT : Direction.LEFT))
        else
            this.processQueue?.addTask(() => this.handler!(dy > 0 ? Direction.DOWN : Direction.UP))
    }

    private pointerCancelListener = (event: PointerEvent) => {
        this.dragState.delete(event.pointerId)
    }

    // Binding Devices
    private bindKeyboard() {
        window.addEventListener("keydown", this.keyDownListener)
    }

    private bindPointer() {
        this.root!.addEventListener("pointerdown", this.pointerDownListener)
        this.root!.addEventListener("pointerup", this.pointerUpListener)
        this.root!.addEventListener("pointercancel", this.pointerCancelListener)

        document.body.style.touchAction = "none"
    }

    // Unbinding Devices
    private unbindKeyboard() {
        window.removeEventListener("keydown", this.keyDownListener)
    }

    private unbindPointer() {
        this.root!.removeEventListener("pointerdown", this.pointerDownListener)
        this.root!.removeEventListener("pointerup", this.pointerUpListener)
        this.root!.removeEventListener("pointercancel", this.pointerCancelListener)

        document.body.style.touchAction = "auto"
    }

    constructor() {
        this.dragState = new Map()
    }

    async bind(rootElementId: string, handler: (action: Direction) => Promise<void>) {
        const root = document.getElementById(rootElementId)

        if (!root) {
            throw new Error("Root element was not found. Controls could not be bound.")
        }

        this.root = root

        this.handler = handler

        this.processQueue = new ProcessQueue()
        this.flushQueue = await this.processQueue.run()

        this.bindKeyboard()
        this.bindPointer()
    }

    async unbind() {
        this.unbindKeyboard()
        this.unbindPointer()

        this.root = undefined
        this.handler = undefined

        this.dragState.clear()
        this.flushQueue?.()
    }
}
