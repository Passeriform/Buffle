import type { Animation } from "./animation"
import type { DirectionalMatch } from "./matcher/directionalMatcher"
import type { State } from "./state"
import { BlockMergeAnimation, BlockMoveAnimation, BlockSpawnAnimation, BlockUpgradeAnimation } from "./animationList"
import { submitScore, updateScoreProfile } from "./api"
import { getUserProfile, updateUserProfile } from "./auth/profile"
import { type Direction, GameType } from "./constants"
import { Block, BlockValue } from "./gui/block"
import { Grid } from "./gui/grid"
import { ResponsiveContainer } from "./gui/responsiveContainer"
import { Text } from "./gui/text"
import { computeMatches } from "./matcher/matcher"
import { computeMoves } from "./movement"
import { computeNextBlockValue } from "./utility/difficulty"
import { padLayout, rootLayout, splitVertical } from "./utility/layout"

export const createGame = (state: State) => {
    // GUI components
    const scoreText = new Text()
    const board = new ResponsiveContainer({
        background: "#6b3c33",
        padding: "2%",
        rounding: "4%",
        min: 50,
    })
    const grid = new Grid({
        gap: "8%",
        rounding: "20%",
        dimensions: state.dimensions,
    })
    const block = new Block(BlockValue.TWO, {
        padding: "20%",
        rounding: "20%",
    })
    // TODO: Move inside block widget
    const blockValueText = new Text({
        color: "#6a4537",
    })

    // Movement
    const move = async (direction: Direction) => {
        const { moves } = computeMoves(state.blockMap, direction)

        if (!moves.length) {
            return moves.length
        }

        const animations = moves.map(([current, targetIndex]) => new BlockMoveAnimation(state.blockMap.get(current)!, state.tweens.move, { targetIndex }))

        await state.animationManager.wait(...animations)

        moves.forEach(([before, after]) => {
            state.blockMap.updateKey(before, after)
        })

        return moves.length
    }

    // Merge
    const merge = async (direction: Direction) => {
        const { primary, secondary, special } = computeMatches(state.blockMap, direction, Block.equals, 3)

        if (!primary.length && !secondary.length && !special.length) {
            return primary.length + secondary.length + special.length
        }

        // TODO: Simplify animation queueing and automatically run them in draw loop
        const mergeMatch = async (match: DirectionalMatch) => {
            const matchBlockValues = match.indices.map((index) => state.blockMap.get(index)!.value)
            const mergingList = match.indices.slice(1).map((index) => [index, match.indices[0]] as const)
            const upgradingBlock = state.blockMap.get(match.indices[0])!
            const maxBlockValue = (matchBlockValues as number[]).max() as BlockValue
            const blockValueSum = matchBlockValues.map((value) => BlockValue.repr(value)).sum()

            const mergeAnimations = mergingList.map(([sourceIndex, targetIndex]) => {
                const animation = new BlockMergeAnimation(state.blockMap.get(sourceIndex)!, state.tweens.merge, { targetIndex })
                state.animationManager.onCompletion([animation], () => {
                    state.blockMap.delete(sourceIndex)
                })
                return animation
            })
            const upgradeAnimation = new BlockUpgradeAnimation(upgradingBlock, state.tweens.upgrade)
            state.animationManager.onCompletion([upgradeAnimation], () => {
                upgradingBlock.upgrade(BlockValue.next(maxBlockValue))
            })

            state.animationManager.onCompletion(mergeAnimations, () => {
                state.score += blockValueSum
            })

            await state.animationManager.wait(...mergeAnimations, upgradeAnimation)

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
        const spawnIndex = state.blockMap.randomUnusedIndex()
        const spawnValue = computeNextBlockValue(state.blockMap)

        const spawnBlock = block.clone(spawnValue)
        state.blockMap.set(spawnIndex, spawnBlock)

        await state.animationManager.wait(new BlockSpawnAnimation(spawnBlock, state.tweens.spawn))
    }

    const init = () => {
        // TODO: Add spawn animation for init
        [8, 12, 13]
            .forEach((index) => {
                state.blockMap.set(index, block.clone())
            })
    }

    // TODO: Cancel an update if previous takes too long
    // TODO: Add context based input handling
    // TODO: Implement web-worker event handler

    // Update handler
    const update = async (direction: Direction) => {
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

        state.moves++

        await spawn()

        // Eager check for creating matches on spawn
        await merge(direction)

        // Check for state end
        if (state.blockMap.size === state.blockMap.maxSize) {
            state.end()
        }
    }

    // Draw loop
    const draw = (delta: DOMHighResTimeStamp, ctx: CanvasRenderingContext2D) => {
        const root = padLayout(rootLayout(ctx.canvas), 50)
        const [scoreSlot, boardSlot] = splitVertical(root, root.height / 8)

        scoreText.render(ctx, scoreSlot, `Score: ${state.score}`)

        const gridSlot = board.render(ctx, padLayout(boardSlot, 50))
        const blockSlots = grid.render(ctx, gridSlot)

        state.blockMap.forEach((block, index) => {
            if (!block) {
                throw new Error(`Block undefined at index: ${index}`)
            }

            // Interpolate animations
            // TODO: Move state logic into animationManager
            // FIXME: Add animation ordering. Blocks are going over the upgraded one on merge
            if (state.animationManager.has(block)) {
                const animations = state.animationManager.get(block)!

                animations.forEach((animation) => {
                    if (animation instanceof BlockMoveAnimation) {
                        animation.next(delta, {
                            from: blockSlots[index],
                            to: blockSlots[animation.metadata.targetIndex],
                        })
                    } else {
                        (animation as Animation<Block>).next(delta)
                    }
                })
            }

            const valueSlot = block.render(ctx, blockSlots[index])
            blockValueText.render(ctx, valueSlot, `${BlockValue.repr(block.value)}`)
        })
    }

    const end = async () => {
        const { name, taunt } = getUserProfile()

        const runId = await submitScore({ gameType: GameType.CLASSIC, name, score: state.score, moves: state.moves, taunt })

        const gameOverElement = document.querySelector("buffle-game-over")!

        gameOverElement.score = state.score
        gameOverElement.moves = state.moves

        gameOverElement.addEventListener("restart", () => {
            gameOverElement.hide()
            state.reset()
        })

        gameOverElement.show()

        const leaderboardElement = document.querySelector("buffle-leaderboard")!

        leaderboardElement.refresh()
        leaderboardElement.editableId = runId

        leaderboardElement.addEventListener("update:name", (event) => {
            updateScoreProfile({ id: runId, name: event.detail })
            updateUserProfile({ name: event.detail })
        })
        leaderboardElement.addEventListener("update:taunt", (event) => {
            updateScoreProfile({ id: runId, taunt: event.detail })
            updateUserProfile({ taunt: event.detail })
        })
    }

    return { init, update, draw, end }
}
