import { Direction } from './controls'
import { Block, BlockValue } from './gui/block'
import { Board } from './gui/board'
import { Grid } from './gui/grid'
import { Text } from './gui/text'
import { computeMatches } from './matcher'
import { computeMoves } from './movement'
import { computeNextBlockValue } from './utility/difficulty'
import { padLayout, rootLayout, splitTop } from "./utility/layout"
import { SparseMatrix } from './utility/sparseMatrix'

// Game state
let totalMoves = 0
let totalScore = 0

const gridDimensions = [4, 4] as [number, number]
const blockMap = new SparseMatrix<Block>([], gridDimensions)

// GUI components
const scoreText = new Text()
const board = new Board({
    margin: 100,
    padding: 10,
    rounding: 20,
})
const grid = new Grid({
    gap: 20,
    rounding: 20,
    dimensions: gridDimensions
})
const block = new Block(BlockValue.TWO, {
    padding: 20,
    rounding: 20,
})

// TODO: Implement web-worker event handler
// TODO: Add locks and queue for updating the game state
// TODO: Add animation engine
// TODO: Add game over screen

// Initializer
export const init = () => {
    blockMap.set(8, Block.from(block))
    blockMap.set(12, Block.from(block))
    blockMap.set(13, Block.from(block))
}

// Update handler
export const update = async (direction: Direction) => {
    let updatePerformed = false
    let loopPerformed = false

    do {
        loopPerformed = false

        // TODO: Tie move with animation engine
        const { commit: move } = computeMoves(blockMap, direction)

        const movedBlocks = move()

        loopPerformed ||= Boolean(movedBlocks)

        const { commit: match } = computeMatches(blockMap, direction, Block.equals)

        // TODO: Tie match with animation engine
        const { merges } = match()

        merges.forEach((m) => {
            const block = blockMap.get(m.index)!
            block.upgrade()
            blockMap.delete(m.index)
            blockMap.set(m.index, block)

            totalScore += m.count
        })

        loopPerformed ||= Boolean(merges.length)
        updatePerformed ||= loopPerformed
    } while (loopPerformed)

    if (!updatePerformed) {
        return
    }

    totalMoves++

    blockMap.set(
        blockMap.randomUnusedIndex(),
        Block.from(block, computeNextBlockValue(blockMap)),
    )
}

// Draw loop
export const draw = (delta: DOMHighResTimeStamp, ctx: CanvasRenderingContext2D) => {
    // Clear canvas
    ctx?.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    // Render
    const root = padLayout(rootLayout(ctx.canvas), 50)
    const [scoreSlot, boardSlot] = splitTop(root, 100)
    scoreText.withContent(`Score: ${totalScore}`).render(ctx, scoreSlot)
    const gridSlot = board.render(ctx, boardSlot)
    const blockSlots = grid.render(ctx, gridSlot)
    blockMap.forEach((block, index) => {
        if (!block) {
            throw Error(`Block undefined at index: ${index}`)
        }

        block.render(ctx, blockSlots[index])
    })

    // Recurse calls
    requestAnimationFrame((delta) => draw(delta, ctx))
}
