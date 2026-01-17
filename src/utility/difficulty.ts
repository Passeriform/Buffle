import { BlockValue, type Block } from "../gui/block"
import type { SparseMatrix } from "./sparseMatrix"

// TODO: Make a difficulty engine that can scale the tiles based on board fullness, max tile, avg tile and median tile.

export const computeNextBlockValue = (state: SparseMatrix<Block>) => {
    if (state.reduce((max, current) => current.index > max ? current.index : max, 0) === 0) {
        return BlockValue.TWO
    }

    return Math.random() > 0.5 ? BlockValue.TWO : BlockValue.FOUR
}
