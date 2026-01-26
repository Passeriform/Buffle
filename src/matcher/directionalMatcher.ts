import { Direction } from "../controls"
import { SortOrder, type SparseMatrix } from "../utility/sparseMatrix"

export type DirectionalMatch = {
    direction: Direction,
    indices: number[],
}

const getOrderMapping = (direction: Direction) => {
    switch (direction) {
        case Direction.UP: return SortOrder.COLUMN
        case Direction.DOWN: return SortOrder.COLUMN_REVERSE
        case Direction.LEFT: return SortOrder.ROW
        case Direction.RIGHT: return SortOrder.ROW_REVERSE
    }
}

const getStrideMapping = (direction: Direction, width: number) => {
    switch (direction) {
        case Direction.UP: return width
        case Direction.DOWN: return -width
        case Direction.LEFT: return 1
        case Direction.RIGHT: return -1
    }
}

const isWrapped = (direction: Direction, last: number, current: number, width: number) => {
    switch (direction) {
        case Direction.LEFT:
        case Direction.RIGHT:
            return Math.floor(last / width) !== Math.floor(current / width)
        case Direction.UP:
        case Direction.DOWN:
            return (last % width) !== (current % width)
    }
}

export const getSecondaryDirection = (state: SparseMatrix<unknown>, direction: Direction) => {
    const [rowCentroidIdx, colCentroidIdx] = state.centroid
    const [xBias, yBias] = [
        colCentroidIdx > (state.shape[1] - 1) / 2,
        rowCentroidIdx > (state.shape[0] - 1) / 2,
    ]

    switch (direction) {
        case Direction.UP: return xBias ? Direction.RIGHT : Direction.LEFT
        case Direction.DOWN: return xBias ? Direction.RIGHT : Direction.LEFT
        case Direction.LEFT: return yBias ? Direction.DOWN : Direction.UP
        case Direction.RIGHT: return yBias ? Direction.DOWN : Direction.UP
    }
}

export const getDirectionalMatches = <T>(
    state: SparseMatrix<T>,
    direction: Direction,
    equalFn: (a: T, b: T) => boolean,
) => {
    const isContiguous = (collection: DirectionalMatch[], value: T, index: number) => {
        const last = collection.at(-1)

        if (!last) {
            return false
        }

        const lastIndex = last.indices.at(-1)

        if (lastIndex === undefined) {
            return false
        }

        if (isWrapped(direction, index, lastIndex, state.shape[1])) {
            return false
        }

        const expectedNextIndex = lastIndex + getStrideMapping(direction, state.shape[1])

        if (index !== expectedNextIndex) {
            return false
        }

        if (!equalFn(value, state.get(lastIndex)!)) {
            return false
        }

        return true
    }

    const matches = state.reduce<DirectionalMatch[]>((acc, value, index) => {
        if (isContiguous(acc, value, index)) {
            acc[acc.length - 1].indices.push(index)
        } else {
            acc.push({ direction, indices: [index] })
        }

        return acc
    }, [], getOrderMapping(direction))

    return matches
}
