import { Animation, AnimationManager, Easing, Tween } from "./animation"
import { BlockMergeAnimation, BlockMoveAnimation, BlockSpawnAnimation, BlockUpgradeAnimation } from "./animationList"
import { Direction } from "./controls"
import { Block, BlockValue } from "./gui/block"
import { ResponsiveContainer } from "./gui/responsiveContainer"
import { Grid } from "./gui/grid"
import { Text } from "./gui/text"
import { computeMatches } from "./matcher/matcher"
import { computeMoves } from "./movement"
import { computeNextBlockValue } from "./utility/difficulty"
import { padLayout, rootLayout, splitVertical } from "./utility/layout"
import { SparseMatrix } from "./utility/sparseMatrix"
import type { DirectionalMatch } from "./matcher/directionalMatcher"
import { parse } from "../tests/utility"

// Config
const gameSpeed = 1
const gridDimensions = [4, 4] as [number, number]
const moveTween = new Tween(200 / gameSpeed, Easing.EASE_IN_OUT)
const mergeTween = new Tween(300 / gameSpeed, Easing.EASE_IN_OUT)
const upgradeTween = new Tween(300 / gameSpeed, Easing.LINEAR)
const spawnTween = new Tween(200 / gameSpeed, Easing.EASE_IN_OUT)

// Game state
let totalMoves = 0
let totalScore = 0
const blockMap = new SparseMatrix<Block>([], gridDimensions)
const animationManager: AnimationManager = new AnimationManager()

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
    const { moves } = computeMoves(blockMap, direction)

    if (!moves.length) {
        return moves.length
    }

    const animations = moves.map(([current, targetIndex]) => new BlockMoveAnimation(blockMap.get(current)!, moveTween, { targetIndex }))

    await animationManager.wait(...animations)

    moves.forEach(([before, after]) => {
        blockMap.updateKey(before, after)
    })

    return moves.length
}

// Merge
const merge = async (direction: Direction) => {
    const { primary, secondary, special } = computeMatches(blockMap, direction, Block.equals, 3)

    if (!primary.length && !secondary.length && !special.length) {
        return primary.length + secondary.length + special.length
    }

    // TODO: Simplify animation queueing and automatically run them in draw loop
    const mergeMatch = async (match: DirectionalMatch) => {
        const matchBlockValues = match.indices.map((index) => blockMap.get(index)!.value)
        const mergingList = match.indices.slice(1).map((index) => [index, match.indices[0]] as const)
        const upgradingBlock = blockMap.get(match.indices[0])!
        const maxBlockValue = (matchBlockValues as number[]).max() as BlockValue
        const blockValueSum = matchBlockValues.map((value) => BlockValue.repr(value)).sum()

        const mergeAnimations = mergingList.map(([sourceIndex, targetIndex]) => {
            const animation = new BlockMergeAnimation(blockMap.get(sourceIndex)!, mergeTween, { targetIndex })
            animationManager.onCompletion([animation], () => {
                blockMap.delete(sourceIndex)
            })
            return animation
        })
        const upgradeAnimation = new BlockUpgradeAnimation(upgradingBlock, upgradeTween)
        animationManager.onCompletion([upgradeAnimation], () => {
            upgradingBlock.upgrade(BlockValue.next(maxBlockValue))
        })

        animationManager.onCompletion(mergeAnimations, () => {
            totalScore += blockValueSum
        })

        await animationManager.wait(...mergeAnimations, upgradeAnimation)

        return match.indices.length
    }

    const mergedBlocks = (await Promise.all([
        ...primary.map(mergeMatch),
        ...secondary.map(mergeMatch),
        // FIXME: Async updates to game state cause missed updates in upgrade.
        ...special.flatMap(({ matchGroups }) => matchGroups.reduceSequence(async (blockCount, matches) => {
            const mergeCounts = await Promise.all(matches.map(mergeMatch))
            return blockCount + mergeCounts.sum()
        }, 0)),
    ])).flat().sum()

    return mergedBlocks
}

// Spawn
const spawn = async () => {
    const spawnIndex = blockMap.randomUnusedIndex()
    const spawnValue = computeNextBlockValue(blockMap)

    const spawnBlock = block.clone(spawnValue)
    blockMap.set(spawnIndex, spawnBlock)

    await animationManager.wait(new BlockSpawnAnimation(spawnBlock, spawnTween))
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
                    (animation as Animation<Block>).next(delta)
                }
            })
        }

        const valueSlot = block.render(ctx, blockSlots[index])
        blockValueText.render(ctx, valueSlot, `${BlockValue.repr(block.value)}`)
    })

    // Recurse calls
    requestAnimationFrame((delta) => draw(delta, ctx))
}
