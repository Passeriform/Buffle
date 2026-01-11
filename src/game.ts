import { AnimationManager, Easing, Tween } from "./animation"
import { BlockMergeAnimation, BlockMoveAnimation, BlockSpawnAnimation, BlockUpgradeAnimation } from "./animationList"
import { Direction } from "./controls"
import { Block, BlockValue } from "./gui/block"
import { ResponsiveContainer } from "./gui/responsiveContainer"
import { Grid } from "./gui/grid"
import { Text } from "./gui/text"
import type { AnyWidget } from "./gui/widget"
import { computeMatches } from "./matcher"
import { computeMoves } from "./movement"
import { computeNextBlockValue } from "./utility/difficulty"
import { padLayout, rootLayout, splitVertical } from "./utility/layout"
import { SparseMatrix } from "./utility/sparseMatrix"

// Config
const gameSpeed = 1
const gridDimensions = [4, 4] as [number, number]
const moveTween = new Tween(200 / gameSpeed, Easing.EASE_IN_OUT)
const mergeTween = new Tween(300 / gameSpeed, Easing.EASE_IN_OUT)
const upgradeTween = new Tween(200 / gameSpeed, Easing.LINEAR)
const spawnTween = new Tween(200 / gameSpeed, Easing.LINEAR)

// Game state
let totalMoves = 0
let totalScore = 0
const blockMap = new SparseMatrix<Block>([], gridDimensions)
const animationManager: AnimationManager<AnyWidget,
    | BlockMoveAnimation
    | BlockMergeAnimation
    | BlockUpgradeAnimation
    | BlockSpawnAnimation
> = new AnimationManager()

// GUI components
const scoreText = new Text({
    margin: 20,
})
const board = new ResponsiveContainer({
    background: "#6B3C33",
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
// TODO: Add game over screen

// Initializer
export const init = () => {
    // TODO: Add spawn animation for init
    [8, 12, 13]
    .forEach((index) => {
        blockMap.set(index, block.clone())
    })
}

// TODO: Cancel an update if previous takes too long

// Update handler
export const update = async (direction: Direction) => {
    let updatePerformed = false
    let loopPerformed = false

    do {
        loopPerformed = false

        // Move blocks
        const { commit: move } = computeMoves(blockMap, direction)

        const movedBlocks = await move({
            move: (from, to) => {
                const block = blockMap.get(from)!
                const animation = new BlockMoveAnimation(block, moveTween, { targetIndex: to })
                animationManager.add(animation)
                return animation
            }
        })

        loopPerformed ||= Boolean(movedBlocks)

        // Merge blocks
        const { matches, commit: match } = computeMatches(blockMap, direction, {
            equalFn: Block.equals,
            upgradeFn: (block) => block.upgrade(),
        })

        const mergedBlocks = await match({
            merge: (index, to) => {
                const block = blockMap.get(index)!
                const animation = new BlockMergeAnimation(block, mergeTween, { targetIndex: to })
                animationManager.add(animation)
                return animation
            },
            upgrade: (index) => {
                const block = blockMap.get(index)!
                const animation = new BlockUpgradeAnimation(block, upgradeTween)
                animationManager.add(animation)
                return animation
            }
        })

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

    // Spawn new block
    const spawnBlock = block.clone(computeNextBlockValue(blockMap))
    blockMap.set(blockMap.randomUnusedIndex(), spawnBlock)
    const animation = new BlockSpawnAnimation(spawnBlock, spawnTween)
    animationManager.add(animation)
    await animation.completed
}

// Draw loop
export const draw = (delta: DOMHighResTimeStamp, ctx: CanvasRenderingContext2D) => {
    // Clear canvas
    ctx?.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    // Render
    const root = padLayout(rootLayout(ctx.canvas), 50)
    const [scoreSlot, boardSlot] = splitVertical(root, 120)
    scoreText.render(ctx, scoreSlot, `Score: ${totalScore}`)
    const gridSlot = board.render(ctx, boardSlot)
    const blockSlots = grid.render(ctx, gridSlot)
    blockMap.forEach((block, index) => {
        if (!block) {
            throw Error(`Block undefined at index: ${index}`)
        }

        // Interpolate animations
        // TODO: Move run logic into animationManager
        // FIXME: Add animation ordering. Blocks are going over the upgraded one on merge
        if (animationManager.has(block)) {
            const animations = animationManager.get(block)!

            animations.forEach((animation) => {
                if (animation instanceof BlockMoveAnimation) {
                    animation.next(delta, {
                        from: blockSlots[index],
                        to: blockSlots[animation.metadata.targetIndex]
                    })
                } else {
                    animation.next(delta)
                }
            })
        }

        block.render(ctx, blockSlots[index])
    })

    // Recurse calls
    requestAnimationFrame((delta) => draw(delta, ctx))
}
