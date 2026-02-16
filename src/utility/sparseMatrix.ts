export enum SortOrder { ROW, COLUMN, ROW_REVERSE, COLUMN_REVERSE }

export class SparseMatrix<V> {
    private map = new Map<number, V>()
    private dirty = false
    private keys: number[] = []
    public readonly shape: [rows: number, columns: number]

    private comparator(order: SortOrder) {
        return (first: number, second: number) => {
            const firstRow = Math.floor(first / this.shape[1])
            const firstColumn = first % this.shape[1]
            const secondRow = Math.floor(second / this.shape[1])
            const secondColumn = second % this.shape[1]

            switch (order) {
                case SortOrder.ROW: return firstRow - secondRow || firstColumn - secondColumn
                case SortOrder.ROW_REVERSE: return firstRow - secondRow || secondColumn - firstColumn
                case SortOrder.COLUMN: return firstColumn - secondColumn || firstRow - secondRow
                case SortOrder.COLUMN_REVERSE: return firstColumn - secondColumn || secondRow - firstRow
            }
        }
    }

    [Symbol.iterator]() {
        if (this.dirty) {
            this.keys.sort()
            this.dirty = false
        }

        const entries: [index: number, element: V][] = []

        this.keys.forEach((key) => {
            const value = this.map.get(key)

            if (value !== undefined) {
                entries.push([key, value])
            }
        })

        return entries[Symbol.iterator]()
    }

    constructor(iterable: Iterable<readonly [number, V]>, shape: [rows: number, columns: number]) {
        this.map = new Map(iterable)
        this.keys = [...this.map.keys()]
        this.shape = shape
        this.dirty = true
    }

    get indices(): ReadonlyArray<[number, number]> {
        return [...this.keys].sort().map((fk) => [Math.floor(fk / this.shape[1]), fk % this.shape[1]] as const)
    }

    get maxSize(): Readonly<number> {
        return this.shape[0] * this.shape[1]
    }

    get size(): Readonly<number> {
        return this.map.size
    }

    get centroid(): Readonly<[number, number]> {
        const [rowSum, colSum] = this.indices.reduce(([rowSum, colSum], [rowIdx, colIdx]) => [rowSum + rowIdx, colSum + colIdx], [0, 0])
        const centroid = [rowSum / this.size, colSum / this.size] as const

        return centroid
    }

    has(key: number) {
        return this.map.has(key)
    }

    set(key: number, value: V) {
        if (key < 0 && key >= this.maxSize) {
            throw new Error("Attempted to insert a larger value than the matrix can hold")
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

        this.keys = this.keys.filter((current) => current !== key)

        return true
    }

    clear() {
        this.map.clear()

        this.keys = []

        return true
    }

    updateKey(key: number, newKey: number) {
        const value = this.get(key)

        if (!value) {
            throw new Error("Attempted to update a key that doesn't exist")
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

        const sortingKeys = [...this.keys].sort(this.comparator(sortOrder))

        sortingKeys.forEach((key) => {
            fn(this.map.get(key)!, key)
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

        const sortingKeys = [...this.keys].sort(this.comparator(sortOrder))

        sortingKeys.forEach((key) => {
            acc = fn(acc, this.map.get(key)!, key)
        })

        return acc
    }
}
