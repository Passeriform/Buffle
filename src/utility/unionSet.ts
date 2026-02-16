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
        const parent = this.parent.get(index)!
        if (parent !== index) {
            const root = this.find(parent)
            this.parent.set(index, root)
            return root
        }
        return index
    }

    union(thisElement: number, otherElement: number) {
        const thisSet = this.find(thisElement)
        const otherSet = this.find(otherElement)

        if (thisSet === otherSet) {
            return
        }

        const thisRank = this.rank.get(thisSet)!
        const otherRank = this.rank.get(otherSet)!

        if (thisRank < otherRank) {
            this.parent.set(thisSet, otherSet)
        } else if (thisRank > otherRank) {
            this.parent.set(otherSet, thisSet)
        } else {
            this.parent.set(otherSet, thisSet)
            this.rank.set(thisSet, thisRank + 1)
        }
    }
}
