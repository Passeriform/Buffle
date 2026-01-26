
declare global {
    interface Array<T> {
        partition(this: T[], predicate: (item: T) => boolean): [Array<T>, Array<T>]
        sum(this: T extends number ? T[] : never): number
        max(this: T extends number ? T[] : never): number
        reduceSequence<U>(this: T[], callbackfn: (previousValue: U, currentValue: T, currentIndex: number, array: T[]) => Promise<U>, initialValue: U): Promise<U>;
    }
}

Array.prototype.partition = function<T>(this: T[], predicate: (item: T) => boolean) {
    const satisfied: T[] = []
    const unsatisfied: T[] = []

    for (const item of this) {
        if (predicate(item)) {
            satisfied.push(item)
        } else {
            unsatisfied.push(item)
        }
    }

    return [satisfied, unsatisfied]
}

Array.prototype.max = function<T extends number>(this: T[]) {
    return this.reduce((max, current) => Math.max(max, current), 0)
}

Array.prototype.sum = function<T extends number>(this: T[]) {
    return this.reduce((sum, current) => sum + current, 0)
}

Array.prototype.reduceSequence = function<T, U>(this: T[], callbackfn: (previousValue: U, currentValue: T, currentIndex: number, array: T[]) => Promise<U>, initialValue: U) {
    return this.reduce(async (promiseWrapper: Promise<U>, ...others) => {
        const previousValue = await promiseWrapper
        return callbackfn(previousValue, ...others)
    }, Promise.resolve(initialValue))
}