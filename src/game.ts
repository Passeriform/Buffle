import { BlockMoveAnimation, BlocksMergeAnimation, BlockSpawnAnimation, BlockUpgradeAnimation, Easing } from "./animation"
import { Direction } from "./controls"
import { Block, BlockValue } from "./gui/block"
import { Board } from "./gui/board"
import { Grid } from "./gui/grid"
import { Text } from "./gui/text"
import { computeMatches } from "./matcher"
import { computeMoves } from "./movement"
import { computeNextBlockValue } from "./utility/difficulty"
import { padLayout, rootLayout, splitTop } from "./utility/layout"
import { SparseMatrix } from "./utility/sparseMatrix"

// Game state
let totalMoves = 0
let totalScore = 0

const gridDimensions = [4, 4] as [number, number]
const blockMap = new SparseMatrix<Block>([], gridDimensions)
// TODO: Create AnimationSet and manage completion there.
const animations = [] as (BlockMoveAnimation | BlocksMergeAnimation | BlockUpgradeAnimation | BlockSpawnAnimation)[]

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

// TODO: Cancel an update if previous takes too long

// Update handler
export const update = async (direction: Direction) => {
    let updatePerformed = false
    let loopPerformed = false

    do {
        loopPerformed = false

        const { commit: move } = computeMoves(blockMap, direction)

        // TODO: Remove any casting

        const movedBlocks = await move(animations as any)

        loopPerformed ||= Boolean(movedBlocks)

        const { matches, commit: match } = computeMatches(blockMap, direction, {
            equalFn: Block.equals,
            upgradeFn: (block) => block.upgrade(),
        })

        // TODO: Tie match with animation engine
        const mergedBlocks = await match(animations as any)

        matches.forEach((m) => {
            const block = blockMap.get(m.indices[0])!
            totalScore += block.value * m.indices.length
        })

        loopPerformed ||= Boolean(mergedBlocks)
        updatePerformed ||= loopPerformed
    } while (loopPerformed)

    if (!updatePerformed) {
        return
    }

    totalMoves++

    const spawnIndex = blockMap.randomUnusedIndex()
    blockMap.set(spawnIndex, Block.from(block, computeNextBlockValue(blockMap)))
    const spawnAnimation = new BlockSpawnAnimation(400, Easing.EASE_IN_OUT, { index: spawnIndex })
    animations.push(spawnAnimation)
    await spawnAnimation.completed
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

        // TODO: Move to individual animations, expose as method.
        const animation = animations.filter((animation) => !animation.isCompleted).find((animation) => {
            if (animation instanceof BlockMoveAnimation) {
                return animation.metadata.before === index || animation.metadata.after === index
            }

            if (animation instanceof BlocksMergeAnimation) {
                return animation.metadata.indices.includes(index)
            }

            if (animation instanceof BlockUpgradeAnimation) {
                return animation.metadata.index === index
            }

            if (animation instanceof BlockSpawnAnimation) {
                return animation.metadata.index === index
            }
        })

        // Static render
        if (!animation) {
            block.render(ctx, blockSlots[index])
        }
    })

    // Interpolate animations
    animations.filter((animation) => !animation.isCompleted).forEach((animation) => {
        // TODO: Move to individual animations, expose as method.
        if (animation instanceof BlockMoveAnimation) {
            blockMap.get(animation.metadata.before)!.render(ctx, animation.interpolate(blockSlots[animation.metadata.before], blockSlots[animation.metadata.after], delta))
        }

        if (animation instanceof BlocksMergeAnimation) {
            animation.metadata.indices.forEach((index) => {
                blockMap.get(index)!.options.opacity = animation.interpolate({ opacity: 1 }, { opacity: 0 }, delta).opacity
                blockMap.get(index)!.render(ctx, blockSlots[index])
            })
        }

        if (animation instanceof BlockUpgradeAnimation) {
            blockMap.get(animation.metadata.index)!.options.opacity = animation.interpolate({ opacity: 0 }, { opacity: 1 }, delta).opacity
            blockMap.get(animation.metadata.index)!.render(ctx, blockSlots[animation.metadata.index])
        }

        if (animation instanceof BlockSpawnAnimation) {
            blockMap.get(animation.metadata.index)!.options.opacity = animation.interpolate({ opacity: 0 }, { opacity: 1 }, delta).opacity
            blockMap.get(animation.metadata.index)!.render(ctx, blockSlots[animation.metadata.index])
        }
    })

    // Recurse calls
    requestAnimationFrame((delta) => draw(delta, ctx))
}
