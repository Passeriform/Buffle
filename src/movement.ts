import { Direction } from "./controls"
import { SortOrder, SparseMatrix } from "./utility/sparseMatrix"

const sortOrderMapping = {
    [Direction.UP]: SortOrder.ROW,
    [Direction.DOWN]: SortOrder.ROW_REVERSE,
    [Direction.LEFT]: SortOrder.COLUMN,
    [Direction.RIGHT]: SortOrder.COLUMN_REVERSE,
}

type Move = [number, number]

const moveSingle = <T>(state: SparseMatrix<T>, index: number, direction: Direction) => {
    switch (direction) {
        case Direction.UP: {
            let track = index
            while (track - state.dimensions[1] >= 0 && !state.has(track - state.dimensions[1])) {
                track -= state.dimensions[1]
            }
            if (track !== index) {
                state.updateKey(index, track)
            }
            return [index !== track, [index, track]] as [boolean, Move]
        }
        case Direction.DOWN: {
            let track = index
            while (track + state.dimensions[1] < state.dimensions[1] * state.dimensions[1] && !state.has(track + state.dimensions[1])) {
                track += state.dimensions[1]
            }
            if (track !== index) {
                state.updateKey(index, track)
            }
            return [index !== track, [index, track]] as [boolean, Move]
        }
        case Direction.LEFT: {
            let track = index
            while (track % state.dimensions[1] !== 0 && !state.has(track - 1)) {
                --track
            }
            if (track !== index) {
                state.updateKey(index, track)
            }
            return [index !== track, [index, track]] as [boolean, Move]
        }
        case Direction.RIGHT: {
            let track = index
            while ((track + 1) % state.dimensions[1] !== 0 && !state.has(track + 1)) {
                ++track
            }
            if (track !== index) {
                state.updateKey(index, track)
            }
            return [index !== track, [index, track]] as [boolean, Move]
        }
    }
}

export const computeMoves = <T>(state: SparseMatrix<T>, direction: Direction) => {
    const copyState = new SparseMatrix<T>(state, state.dimensions)

    const moves: Move[] = []

    copyState.forEach((_, index) => {
        const [moved, move] = moveSingle(copyState, index, direction)
        if (moved) {
            moves.push(move)
        }
    }, sortOrderMapping[direction])

    // FIXME: Sometimes unfilled 0th index is reported no moves. Possible bug in move computation
    const commit = () => {
        moves.forEach(([before, after]) => {
            state.updateKey(before, after)
        })

        return moves.length
    }

    return { moves, commit }
}