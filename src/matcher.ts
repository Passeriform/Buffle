import { Direction } from "./controls";
import { SortOrder, type SparseMatrix } from "./utility/sparseMatrix";

type Match = {
    direction: Direction,
    indices: number[],
}

const orderMapping = {
    [Direction.UP]: SortOrder.COLUMN,
    [Direction.DOWN]: SortOrder.COLUMN_REVERSE,
    [Direction.LEFT]: SortOrder.ROW,
    [Direction.RIGHT]: SortOrder.ROW_REVERSE,
}

// TODO: Convert to bitmap operations instead of looping
// TODO: Add equality check for cells

const getDirectionalMatches = <T>(
    state: SparseMatrix<T>,
    direction: Direction,
    equalFn: (a: T, b: T) => boolean,
) => {
    const strideMapping = {
        [SortOrder.ROW]: 1,
        [SortOrder.ROW_REVERSE]: 1,
        [SortOrder.COLUMN]: state.dimensions[1],
        [SortOrder.COLUMN_REVERSE]: state.dimensions[1],
    }

    const matches = state.reduce<Match[]>((acc, _, index) => {
        const last = acc.at(-1)

        if (!last) {
            return [...acc, { direction, indices: [index] }]
        }

        const lastIndex = last.indices.at(-1)

        if (lastIndex === undefined) {
            return [...acc, { direction, indices: [index] }]
        }

        const expectedNextIndex = lastIndex + strideMapping[orderMapping[direction]]

        if (index !== expectedNextIndex) {
            return [...acc, { direction, indices: [index] }]
        }

        if (!equalFn(state.get(index)!, state.get(lastIndex)!)) {
            return [...acc, { direction, indices: [index] }]
        }

        acc[acc.length - 1].indices.push(index)
        return acc
    }, [], orderMapping[direction])

    return matches
}

// FIXME: Fix double matching on primary and secondary overlaps
// FIXME: Fix wrapped blocks matching in previous row and column
const detectMatches = <T>(
    state: SparseMatrix<T>,
    direction: Direction,
    equalFn: (a: T, b: T) => boolean,
    threshold: number,
) => {
    const primary = getDirectionalMatches(state, direction, equalFn).filter(({ indices }) => indices.length >= threshold)

    const secondaryDirection = {
        [Direction.UP]: Direction.LEFT,
        [Direction.DOWN]: Direction.RIGHT,
        [Direction.LEFT]: Direction.UP,
        [Direction.RIGHT]: Direction.DOWN,
    }[direction]

    const secondary = getDirectionalMatches(state, secondaryDirection, equalFn).filter(({ indices }) => indices.length >= threshold)

    return { primary, secondary }
}

type Merge = {
    index: number,
    count: number,
}

export const computeMatches = <T>(
    state: SparseMatrix<T>,
    direction: Direction,
    options: {
        equalFn: (a: T, b: T) => boolean,
        upgradeFn: (a: T) => void,
    },
) => {
    const { primary, secondary } = detectMatches(state, direction, options.equalFn, 3)

    const commit = () => {
        const merges: Merge[] = []

        ;[...primary, ...secondary].forEach((match) => {
            merges.push({ index: match.indices[0], count: match.indices.length })

            match.indices.slice(1).forEach((index) => {
                state.delete(index)
            })

            options.upgradeFn(state.get(match.indices[0])!)
        })

        return { merges, matches: [...primary, ...secondary] }
    }

    return { matches: [...primary, ...secondary], commit }
}