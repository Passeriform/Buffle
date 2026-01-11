import type { AnyWidget } from "../gui/widget"
import type { Animation } from "./animation"

export class AnimationManager<W extends AnyWidget = AnyWidget, A extends Animation<W, any> = Animation<W, any>> {
    private animations: WeakMap<W, A[]>

    constructor() {
        this.animations = new WeakMap()
    }

    has(item: W) {
        return this.animations.has(item) && this.animations.get(item)!.some((animation) => !animation.isCompleted)
    }

    add(animation: A) {
        const animations = this.animations.get(animation.widget) ?? []
        animations.push(animation)
        this.animations.set(animation.widget, animations)
    }

    get(item: W) {
        return this.animations.get(item)?.filter((animation) => !animation.isCompleted)
    }
}
