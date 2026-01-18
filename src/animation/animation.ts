import type { AnyWidget } from "../gui/widget"
import { Easing, type EasingMethod } from "./easing"
import { Signal } from "./signal"
import type { Tween } from "./tween"

export type TweenOptions = {
    duration: number
    easing?: Easing | EasingMethod
}

export abstract class Animation<W extends AnyWidget, DeferArgs extends Record<PropertyKey, unknown> | never = never> {
    private tween: Tween

    public readonly widget: W

    public readonly completed: Signal = new Signal()

    private ticker: number | undefined

    static async waitCompletion(...animations: AnyAnimation[]) {
        return Promise.allSettled(animations.map((animation) => animation.completed.promise))
    }

    protected interpolate<Shape extends Record<PropertyKey, number>>(from: Shape, to: Shape, delta: number) {
        if (this.completed.value) {
            return to
        }

        if (!this.ticker) {
            this.ticker = delta
        }

        if (delta - this.ticker >= this.tween.duration) {
            this.completed.trigger()
            return to
        }

        const interpolated = this.tween.interpolate(from, to, delta - this.ticker!)

        return interpolated
    }

    constructor(widget: W, tween: Tween) {
        this.widget = widget
        this.tween = tween
        this.completed.promise.then(this.cleanup.bind(this))
    }

    abstract next(delta: number, ...deferArgs: ([DeferArgs] extends [never] ? [undefined?] : [DeferArgs])): void

    cleanup() {
        this.widget.layoutOverride = undefined
        this.widget.optionsOverride = {}
    }
}

export type AnyAnimation = Animation<AnyWidget, any>
