import { Easing, EASING_PRESETS, type EasingMethod } from "./easing"

export class Tween {
    public readonly duration: number
    private easingMethod: EasingMethod

    constructor(duration: number, easing: Easing | EasingMethod) {
        this.duration = duration

        if (typeof easing === "function") {
            this.easingMethod = easing
        } else {
            this.easingMethod = EASING_PRESETS[easing ?? Easing.LINEAR]
        }
    }

    // TODO: Add native interpolation for color. Use template for hex and rgba
    interpolate<Shape extends Record<PropertyKey, number>>(from: Shape, to: Shape, elapsed: number) {
        return Object.fromEntries(Object.keys(from).map((key) => {
            const interpolated = from[key] + (to[key] - from[key]) * this.easingMethod(
                elapsed / this.duration
            )
            return [key, interpolated]
        })) as Shape
    }
}