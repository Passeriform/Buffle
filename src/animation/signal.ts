export class Signal {
    private _value: boolean = false
    private _trigger?: () => void
    public readonly promise: Promise<void>

    constructor() {
        this.promise = new Promise<void>((resolve) => {
            this._trigger = () => {
                this._value = true
                resolve()
            }
        })
    }

    trigger() {
        this._trigger?.()
    }

    get value(): Readonly<boolean> {
        return this._value
    }
}
