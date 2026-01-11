import type { AnyWidget } from "../gui/widget"
import { Easing, type EasingMethod } from "./easing"
import type { Tween } from "./tween"

export type TweenOptions = {
    duration: number
    easing?: Easing | EasingMethod
}

export abstract class Animation<W extends AnyWidget, DeferArgs extends Record<PropertyKey, unknown> | never = never> {
    private tween: Tween

    public readonly widget: W

    public readonly completed: Promise<boolean>

    private ticker: number | undefined
    // TODO: Extract into separate trackable class
    public isCompleted: boolean = false
    private markCompleted?: () => void

    static async waitCompletion(...animations: AnyAnimation[]) {
        return Promise.allSettled(animations.map((animation) => animation.completed))
    }

    protected interpolate<Shape extends Record<PropertyKey, number>>(from: Shape, to: Shape, delta: number) {
        if (this.isCompleted) {
            return to
        }

        if (!this.ticker) {
            this.ticker = delta
        }

        if (delta - this.ticker >= this.tween.duration) {
            this.widget.layoutOverride = undefined
            this.widget.optionsOverride = {}
            this.markCompleted?.()
            return to
        }

        const interpolated = this.tween.interpolate(from, to, delta - this.ticker!)

        return interpolated
    }

    constructor(widget: W, tween: Tween) {
        this.widget = widget
        this.tween = tween

        this.completed = new Promise((resolve) => {
            this.markCompleted = () => {
                this.isCompleted = true
                resolve(true)
            }
        })
    }

    abstract next(delta: number, ...deferArgs: ([DeferArgs] extends [never] ? [undefined?] : [DeferArgs])): void
}

export type AnyAnimation = Animation<AnyWidget, any>
