import type { SparseMatrix } from "./sparseMatrix"
import { type Block, BlockValue } from "../gui/block"

// TODO: Make a difficulty engine that can scale the tiles based on board fullness, max tile, avg tile and median tile.

export const computeNextBlockValue = (state: SparseMatrix<Block>) => {
    if (state.reduce((max, current) => Math.max(current.value, max), BlockValue.TWO) === BlockValue.TWO) {
        return BlockValue.TWO
    }

    return Math.random() > 0.5 ? BlockValue.TWO : BlockValue.FOUR
}
