export enum Easing {
    LINEAR,
    EASE_IN,
    EASE_OUT,
    EASE_IN_OUT,
}

const cubicBezier = (p1x: number, p1y: number, p2x: number, p2y: number) => {
    const cx = 3 * p1x
    const bx = 3 * (p2x - p1x) - cx
    const ax = 1 - cx - bx

    const cy = 3 * p1y
    const by = 3 * (p2y - p1y) - cy
    const ay = 1 - cy - by

    const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t
    const sampleY = (t: number) => ((ay * t + by) * t + cy) * t
    const sampleDX = (t: number) => (3 * ax * t + 2 * bx) * t + cx

    return (time: number) => {
        let x = time

        for (let i = 0; i < 4; i++) {
            const dx = sampleDX(x)

            if (dx === 0) {
                break
            }

            x -= (sampleX(x) - time) / dx
        }

        return sampleY(x)
    }
}

const EASING_FUNCTIONS = {
    [Easing.LINEAR]: cubicBezier(0, 0, 1, 1),
    [Easing.EASE_IN]: cubicBezier(0.42, 0, 1, 1),
    [Easing.EASE_OUT]: cubicBezier(0, 0, 0.58, 1),
    [Easing.EASE_IN_OUT]: cubicBezier(0.42, 0, 0.58, 1),
} as const

export class Animation<Meta extends Record<PropertyKey, unknown> = Record<PropertyKey, unknown>> {
    private duration: number
    private easing: Easing

    public completed: Promise<boolean>
    public metadata: Meta

    private ticker: number | undefined
    public isCompleted: boolean = false
    private markCompleted?: () => void

    constructor(duration: number, easing: Easing = Easing.LINEAR, metadata: Meta) {
        this.duration = duration
        this.easing = easing
        this.metadata = metadata
        this.completed = new Promise((resolve) => {
            this.markCompleted = () => {
                this.isCompleted = true
                resolve(true)
            }
        })
    }

    interpolate<T extends Record<PropertyKey, number>>(from: T, to: T, delta: number) {
        if (this.isCompleted) {
            return to
        }

        if (!this.ticker) {
            this.ticker = delta
        }

        if (delta - this.ticker >= this.duration) {
            this.markCompleted?.()
            return to
        }

        const interpolated = Object.fromEntries(Object.keys(from).map((key) => {
            const interpolated = from[key] + (to[key] - from[key]) * EASING_FUNCTIONS[this.easing](
                (delta - this.ticker!) / this.duration
            )
            return [key, interpolated]
        })) as T

        return interpolated
    }
}

// TODO: Move processing logic into animation classes from main class

export class BlockMoveAnimation extends Animation<{ before: number, after: number }> {}
export class BlocksMergeAnimation extends Animation<{ indices: number[] }> {}
export class BlockUpgradeAnimation extends Animation<{ index: number }> {}
export class BlockSpawnAnimation extends Animation<{ index: number }> {}
