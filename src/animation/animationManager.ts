import type { AnyWidget } from "../gui/widget"
import type { Animation, AnyAnimation } from "./animation"

export class AnimationManager {
    private animations: WeakMap<AnyWidget, Set<AnyAnimation>>

    constructor() {
        this.animations = new WeakMap()
    }

    has<W extends AnyWidget>(item: W) {
        return this.animations.has(item) && [...this.animations.get(item)!].map((animation) => !animation.completed.value)
    }

    add<W extends AnyWidget, A extends Animation<W, any>>(...animations: A[]) {
        animations.forEach((animation) => {
            const current = this.animations.get(animation.widget) ?? new Set()
            current.add(animation)
            this.animations.set(animation.widget, current)
        })
    }

    get<W extends AnyWidget>(item: W) {
        return [...this.animations.get(item) ?? []].filter((animation) => !animation.completed.value) as Animation<W, any>[] | undefined
    }

    wait(...animations: AnyAnimation[]) {
        this.add(...animations)
        return Promise.allSettled(animations.map((animation) => animation.completed.promise))
    }

    onCompletion(animations: AnyAnimation[], callback: () => void) {
        this.wait(...animations).then(callback)
    }
}
