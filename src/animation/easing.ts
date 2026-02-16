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

    const sampleX = (time: number) => ((ax * time + bx) * time + cx) * time
    const sampleY = (time: number) => ((ay * time + by) * time + cy) * time
    const sampleDX = (time: number) => (3 * ax * time + 2 * bx) * time + cx

    return ((time: number) => {
        let tracker = time

        for (let iter = 0; iter < 4; iter++) {
            const dx = sampleDX(tracker)

            if (dx === 0) {
                break
            }

            tracker -= (sampleX(tracker) - time) / dx
        }

        return sampleY(tracker)
    }) satisfies EasingMethod
}

export const EASING_PRESETS = {
    [Easing.LINEAR]: cubicBezier(0, 0, 1, 1),
    [Easing.EASE_IN]: cubicBezier(0.42, 0, 1, 1),
    [Easing.EASE_OUT]: cubicBezier(0, 0, 0.58, 1),
    [Easing.EASE_IN_OUT]: cubicBezier(0.42, 0, 0.58, 1),
} as const
