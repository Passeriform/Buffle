import { Direction } from "./controls"
import { SortOrder, SparseMatrix } from "./utility/sparseMatrix"

const sortOrderMapping = {
    [Direction.UP]: SortOrder.COLUMN,
    [Direction.DOWN]: SortOrder.COLUMN_REVERSE,
    [Direction.LEFT]: SortOrder.ROW,
    [Direction.RIGHT]: SortOrder.ROW_REVERSE,
} as const

type Move = [number, number]

const moveSingle = <T>(state: SparseMatrix<T>, index: number, direction: Direction) => {
    // TODO: Simplify this switch
    switch (direction) {
        case Direction.UP: {
            let track = index
            while (track - state.shape[1] >= 0 && !state.has(track - state.shape[1])) {
                track -= state.shape[1]
            }
            if (track !== index) {
                state.updateKey(index, track)
            }
            return [index !== track, [index, track]] as [boolean, Move]
        }
        case Direction.DOWN: {
            let track = index
            while (track + state.shape[1] < state.shape[1] * state.shape[1] && !state.has(track + state.shape[1])) {
                track += state.shape[1]
            }
            if (track !== index) {
                state.updateKey(index, track)
            }
            return [index !== track, [index, track]] as [boolean, Move]
        }
        case Direction.LEFT: {
            let track = index
            while (track % state.shape[1] !== 0 && !state.has(track - 1)) {
                --track
            }
            if (track !== index) {
                state.updateKey(index, track)
            }
            return [index !== track, [index, track]] as [boolean, Move]
        }
        case Direction.RIGHT: {
            let track = index
            while ((track + 1) % state.shape[1] !== 0 && !state.has(track + 1)) {
                ++track
            }
            if (track !== index) {
                state.updateKey(index, track)
            }
            return [index !== track, [index, track]] as [boolean, Move]
        }
    }
}

export const computeMoves = <T extends object>(state: SparseMatrix<T>, direction: Direction) => {
    const copyState = new SparseMatrix<T>(state, state.shape)

    const moves: Move[] = []

    copyState.forEach((_, index) => {
        const [moved, move] = moveSingle(copyState, index, direction)
        if (moved) {
            moves.push(move)
        }
    }, sortOrderMapping[direction])

    return { moves }
}