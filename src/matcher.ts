import { Direction } from "./controls"
import { SortOrder, type SparseMatrix } from "./utility/sparseMatrix"

type Match = {
    direction: Direction,
    indices: number[],
}

const orderMapping = {
    [Direction.UP]: SortOrder.COLUMN,
    [Direction.DOWN]: SortOrder.COLUMN_REVERSE,
    [Direction.LEFT]: SortOrder.ROW,
    [Direction.RIGHT]: SortOrder.ROW_REVERSE,
} as const

// TODO: Convert to bitmap operations instead of looping
// TODO: Add equality check for cells

const getDirectionalMatches = <T>(
    state: SparseMatrix<T>,
    direction: Direction,
    equalFn: (a: T, b: T) => boolean,
) => {
    const strideMapping = {
        [Direction.UP]: state.shape[1],
        [Direction.DOWN]: -state.shape[1],
        [Direction.LEFT]: 1,
        [Direction.RIGHT]: -1,
    }

    const matches = state.reduce<Match[]>((acc, value, index) => {
        const last = acc.at(-1)

        if (!last) {
            return [...acc, { direction, indices: [index] }]
        }

        const lastIndex = last.indices.at(-1)

        if (lastIndex === undefined) {
            return [...acc, { direction, indices: [index] }]
        }

        const expectedNextIndex = lastIndex + strideMapping[direction]

        if (index !== expectedNextIndex) {
            return [...acc, { direction, indices: [index] }]
        }

        if (!equalFn(value, state.get(lastIndex)!)) {
            return [...acc, { direction, indices: [index] }]
        }

        acc[acc.length - 1].indices.push(index)

        return acc
    }, [], orderMapping[direction])

    return matches
}

// FIXME: Fix double matching on primary and secondary overlaps
// FIXME: Fix wrapped blocks matching in previous row and column
export const computeMatches = <T>(
    state: SparseMatrix<T>,
    direction: Direction,
    equalFn: (a: T, b: T) => boolean,
    threshold: number,
) => {
    const primary = getDirectionalMatches(state, direction, equalFn).filter(({ indices }) => indices.length >= threshold)

    const [rowCentroidIdx, colCentroidIdx] = state.centroid
    const [downBias, rightBias] = [
        rowCentroidIdx > (state.shape[0] - 1) / 2,
        colCentroidIdx > (state.shape[1] - 1) / 2,
    ]

    const secondaryDirection = {
        [Direction.UP]: rightBias ? Direction.RIGHT : Direction.LEFT,
        [Direction.DOWN]: rightBias ? Direction.RIGHT : Direction.LEFT,
        [Direction.LEFT]: downBias ? Direction.DOWN : Direction.UP,
        [Direction.RIGHT]: downBias ? Direction.DOWN : Direction.UP,
    }[direction]

    const secondary = getDirectionalMatches(state, secondaryDirection, equalFn).filter(({ indices }) => indices.length >= threshold)

    return { primary, secondary }
}
