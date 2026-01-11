export enum Easing {
    LINEAR,
    EASE_IN,
    EASE_OUT,
    EASE_IN_OUT,
}

export type EasingMethod = (time: number) => number

// TODO: Check why bezier is overshooting the `to` value. Check with color animations.
export const cubicBezier = (p1x: number, p1y: number, p2x: number, p2y: number) => {
    const cx = 3 * p1x
    const bx = 3 * (p2x - p1x) - cx
    const ax = 1 - cx - bx

    const cy = 3 * p1y
    const by = 3 * (p2y - p1y) - cy
    const ay = 1 - cy - by

    const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t
    const sampleY = (t: number) => ((ay * t + by) * t + cy) * t
    const sampleDX = (t: number) => (3 * ax * t + 2 * bx) * t + cx

    return ((time: number) => {
        let x = time

        for (let i = 0; i < 4; i++) {
            const dx = sampleDX(x)

            if (dx === 0) {
                break
            }

            x -= (sampleX(x) - time) / dx
        }

        return sampleY(x)
    }) satisfies EasingMethod
}

export const EASING_PRESETS = {
    [Easing.LINEAR]: cubicBezier(0, 0, 1, 1),
    [Easing.EASE_IN]: cubicBezier(0.42, 0, 1, 1),
    [Easing.EASE_OUT]: cubicBezier(0, 0, 0.58, 1),
    [Easing.EASE_IN_OUT]: cubicBezier(0.42, 0, 0.58, 1),
} as const
