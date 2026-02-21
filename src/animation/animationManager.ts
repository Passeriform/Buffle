import type { Widget } from "../gui/widget"
import type { Animation } from "./animation"

export class AnimationManager {
    private animations: WeakMap<Widget, Set<Animation<Widget, any>>>

    constructor() {
        this.animations = new WeakMap()
    }

    has<W extends Widget>(item: W) {
        return this.animations.has(item) && [...this.animations.get(item)!].map((animation) => !animation.completed.value)
    }

    add<W extends Widget, A extends Animation<W, any>>(...animations: A[]) {
        animations.forEach((animation) => {
            const current = this.animations.get(animation.widget) ?? new Set()
            current.add(animation)
            this.animations.set(animation.widget, current)
        })
    }

    get<W extends Widget>(item: W) {
        return [...this.animations.get(item) ?? []].filter((animation) => !animation.completed.value) as Animation<W, any>[] | undefined
    }

    wait(...animations: Animation<Widget, any>[]) {
        this.add(...animations)
        return Promise.allSettled(animations.map((animation) => animation.completed.promise))
    }

    // TODO: Rename to sideEffect
    onCompletion(animations: Animation<Widget, any>[], callback: () => void) {
        this.wait(...animations).then(callback)
    }
}
