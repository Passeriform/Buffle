export class UnionSet {
    private parent = new Map<number, number>()
    private rank = new Map<number, number>()

    constructor(iterable: Iterable<number>) {
        for (const index of iterable) {
            if (!this.parent.has(index)) {
                this.parent.set(index, index)
                this.rank.set(index, 0)
            }
        }
    }

    find(index: number): number {
        const p = this.parent.get(index)!
        if (p !== index) {
            const root = this.find(p)
            this.parent.set(index, root)
            return root
        }
        return index
    }

    union(a: number, b: number) {
        const aSet = this.find(a)
        const bSet = this.find(b)
        if (aSet === bSet) return

        const rankA = this.rank.get(aSet)!
        const rankB = this.rank.get(bSet)!

        if (rankA < rankB) {
            this.parent.set(aSet, bSet)
        } else if (rankA > rankB) {
            this.parent.set(bSet, aSet)
        } else {
            this.parent.set(bSet, aSet)
            this.rank.set(aSet, rankA + 1)
        }
    }
}
