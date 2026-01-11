export enum SortOrder { ROW, COLUMN, ROW_REVERSE, COLUMN_REVERSE }

export class SparseMatrix<V> {
    private map = new Map<number, V>()
    private dirty = false
    private keys: number[] = []
    public readonly dimensions: [number, number]

    private comparator(order: SortOrder) {
        return (a: number, b: number) => {
            const ar = Math.floor(a / this.dimensions[1])
            const ac = a % this.dimensions[1]
            const br = Math.floor(b / this.dimensions[1])
            const bc = b % this.dimensions[1]

            switch (order) {
                case SortOrder.ROW: return ar - br || ac - bc
                case SortOrder.ROW_REVERSE: return br - ar || ac - bc
                case SortOrder.COLUMN: return ac - bc || ar - br
                case SortOrder.COLUMN_REVERSE: return bc - ac || ar - br
            }
        }
    }

    [Symbol.iterator]() {
        if (this.dirty) {
            this.keys.sort()
            this.dirty = false
        }

        const entries: [number, V][] = []

        this.keys.forEach((k) => {
            const value = this.map.get(k)

            if (value !== undefined) {
                entries.push([k, value])
            }
        })

        return entries[Symbol.iterator]()
    }

    constructor(iterable: Iterable<readonly [number, V]>, dimensions: [number, number]) {
        this.map = new Map(iterable)
        this.keys = [...this.map.keys()]
        this.dimensions = dimensions
        this.dirty = true
    }

    get indices(): ReadonlyArray<[number, number]> {
        return [...this.keys].sort().map((fk) => [Math.floor(fk / this.dimensions[1]), fk % this.dimensions[1]] as const)
    }

    get maxSize(): Readonly<number> {
        return this.dimensions[0] * this.dimensions[1]
    }

    get size(): Readonly<number> {
        return this.map.size
    }

    has(key: number) {
        return this.map.has(key)
    }

    set(key: number, value: V) {
        if (key < 0 && key >= this.maxSize) {
            throw Error("Attempted to insert a larger value than the matrix can hold")
        }

        if (!this.map.has(key)) {
            this.keys.push(key)
            this.dirty = true
        }

        this.map.set(key, value)
    }

    get(key: number) {
        return this.map.get(key)
    }

    delete(key: number) {
        if (!this.map.delete(key)) {
            return false
        }

        this.keys = this.keys.filter((k) => k !== key)

        return true
    }

    updateKey(key: number, newKey: number) {
        const value = this.get(key)

        if (!value) {
            throw Error("Attempted to update a key that doesn't exist")
        }

        this.delete(key)
        this.set(newKey, value)
    }

    randomUnusedIndex() {
        if (this.size === this.maxSize) {
            return -1
        }

        while (true) {
            const index = Math.floor(Math.random() * this.maxSize)

            if (this.has(index)) {
                continue
            }

            return index
        }
    }

    forEach(
        fn: (value: V, key: number) => void,
        sortOrder: SortOrder = SortOrder.ROW,
    ): void {
        if (this.dirty) {
            this.keys.sort()
            this.dirty = false
        }

        const sortingKeys = [...this.keys].sort(
            this.comparator(sortOrder)
        )

        sortingKeys.forEach((k) => {
            fn(this.map.get(k)!, k)
        })
    }

    reduce<R>(
        fn: (acc: R, value: V, key: number) => R,
        initial: R,
        sortOrder: SortOrder = SortOrder.ROW,
    ): R {
        let acc = initial

        if (this.dirty) {
            this.keys.sort()
            this.dirty = false
        }

        const sortingKeys = [...this.keys].sort(
            this.comparator(sortOrder)
        )

        sortingKeys.forEach((k) => {
            acc = fn(acc, this.map.get(k)!, k)
        })

        return acc
    }
}
