import type { Block } from "../gui/block"
import type { SparseMatrix } from "./sparseMatrix"

// TODO: Make a difficulty engine that can scale the tiles based on board fullness, max tile, avg tile and median tile.

export const computeNextBlockValue = (state: SparseMatrix<Block>) => {
    if (state.reduce((max, current) => current.value > max ? current.value : max, 0) === 2) {
        return 2
    }

    return Math.random() > 0.5 ? 4 : 2
}
