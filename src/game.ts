import { Animation, AnimationManager, Easing, Tween } from "./animation"
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
const blockValueText = new Text({
    margin: 20,
    color: "#6A4537",
})

// TODO: Implement web-worker event handler
// TODO: Add game over screen

// Movement
const move = async (direction: Direction) => {
    // FIXME: Sometimes unfilled 0th index is reported no moves. Possible bug in move computation
    const { moves } = computeMoves(blockMap, direction)

    if (!moves.length) {
        return moves.length
    }

    const animations = moves.map(([current, targetIndex]) => new BlockMoveAnimation(blockMap.get(current)!, moveTween, { targetIndex }))

    animations.forEach((animation) => animationManager.add(animation))

    await Animation.waitCompletion(...animations)

    moves.forEach(([before, after]) => {
        blockMap.updateKey(before, after)
    })

    return moves.length
}

// Merge
const merge = async (direction: Direction) => {
    const { primary, secondary } = computeMatches(blockMap, direction, Block.equals, 3)

    const matches = [...primary, ...secondary]

    if (!matches.length) {
        return matches.length
    }

    const animations = matches.flatMap(({ indices }) => [
        new BlockUpgradeAnimation(blockMap.get(indices[0])!, upgradeTween),
        ...indices.slice(1).map((index) => new BlockMergeAnimation(blockMap.get(index)!, mergeTween, { targetIndex: indices[0] })),
    ])

    animations.forEach((animation) => animationManager.add(animation))

    await Animation.waitCompletion(...animations)

    matches.forEach(({ indices }) => {
        const block = blockMap.get(indices[0])!
        totalScore += block.value * indices.length
        block.upgrade()
        indices.slice(1).forEach((index) => {
            blockMap.delete(index)
        })
    })

    return matches.reduce((blockCount, { indices }) => blockCount + indices.length, 0)
}

// Spawn
const spawn = async () => {
    const spawnIndex = blockMap.randomUnusedIndex()
    const spawnValue = computeNextBlockValue(blockMap)

    const spawnBlock = block.clone(spawnValue)
    blockMap.set(spawnIndex, spawnBlock)

    const animation = new BlockSpawnAnimation(spawnBlock, spawnTween)

    animationManager.add(animation)

    await Animation.waitCompletion(animation)
}

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
        const movedBlocks = await move(direction)
        const mergedBlocks = await merge(direction)

        loopPerformed = Boolean(movedBlocks) || Boolean(mergedBlocks)
        updatePerformed ||= loopPerformed
    } while (loopPerformed)

    if (!updatePerformed) {
        return
    }

    totalMoves++

    await spawn()
}

// Draw loop
export const draw = (delta: DOMHighResTimeStamp, ctx: CanvasRenderingContext2D) => {
    // Clear canvas
    ctx?.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    // Render
    const root = padLayout(rootLayout(ctx.canvas), 50)
    const [scoreSlot, boardSlot] = splitVertical(root, root.height / 8)
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

        const valueSlot = block.render(ctx, blockSlots[index])
        blockValueText.render(ctx, valueSlot, `${block.value}`)
    })

    // Recurse calls
    requestAnimationFrame((delta) => draw(delta, ctx))
}
