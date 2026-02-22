import type { Animation } from "./animation"
import type { DirectionalMatch } from "./matcher/directionalMatcher"
import type { State } from "./state"
import { BlockMergeAnimation, BlockMoveAnimation, BlockSpawnAnimation, BlockUpgradeAnimation } from "./animationList"
import { submitScore, updateScoreProfile } from "./api"
import { getUserProfile, updateUserProfile } from "./auth/profile"
import { type Direction, GameType } from "./constants"
import { Block, BLOCK_DISPLAY_SET, BLOCK_PALLETTES } from "./gui/block"
import { Container } from "./gui/container"
import { Text } from "./gui/text"
import { computeMatches } from "./matcher/matcher"
import { computeMoves } from "./movement"
import { computeNextBlockValue } from "./utility/difficulty"
import { fitLayout, layoutGrid, rootLayout } from "./utility/layout"

export const createGame = (state: State) => {
    // GUI components
    const board = new Container({
        background: "#6b3c33",
        padding: "2%",
        rounding: "4%",
    })
    const blockPlaceholder = new Container({
        background: "#5a2f28",
        rounding: "20%",
    })
    const block = new Block(0, {
        padding: "20%",
        rounding: "20%",
        pallette: BLOCK_PALLETTES.COFFEE,
        displayValues: BLOCK_DISPLAY_SET.NUMBERS,
        textWidget: new Text({
            color: "#6a4537",
        }),
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
            const mergingList = match.indices.slice(1).map((index) => [index, match.indices[0]] as const)
            const blocks = match.indices.map((index) => state.blockMap.get(index)!)
            const upgradingBlock = blocks[0]
            const maxBlockValue = blocks.map((block) => block.value).max()
            const blockScoreSum = blocks.map((block) => block.score).sum()

            const mergeAnimations = mergingList.map(([sourceIndex, targetIndex]) => {
                const animation = new BlockMergeAnimation(state.blockMap.get(sourceIndex)!, state.tweens.merge, { targetIndex })
                state.animationManager.onCompletion([animation], () => {
                    state.blockMap.delete(sourceIndex)
                })
                return animation
            })
            const upgradeAnimation = new BlockUpgradeAnimation(upgradingBlock, state.tweens.upgrade)
            state.animationManager.onCompletion([upgradeAnimation], () => {
                upgradingBlock.upgrade(maxBlockValue + 1)
            })

            state.animationManager.onCompletion(mergeAnimations, () => {
                state.score += blockScoreSum
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
        state.score = 0
        state.moves = 0

        // TODO: Add spawn animation for init
        ;[8, 12, 13]
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
        const root = rootLayout(ctx.canvas)

        const gridSlot = board.render(ctx, fitLayout(root))
        const blockSlots = layoutGrid(gridSlot, state.dimensions, "8%")
        blockSlots.forEach((slot) => {
            blockPlaceholder.render(ctx, slot)
        })

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

            block.render(ctx, blockSlots[index])
        })
    }

    const end = async () => {
        const { name, taunt } = getUserProfile()

        const runId = await submitScore({ gameType: GameType.CLASSIC, name, score: state.score, moves: state.moves, taunt })

        const gameOverElement = document.querySelector("buffle-game-over")!

        gameOverElement.addEventListener("restart", () => {
            gameOverElement.hide()
            state.reset()
        })

        gameOverElement.show()

        const leaderboardElement = document.querySelector("buffle-leaderboard")!

        leaderboardElement.refresh()
        leaderboardElement.runId = runId

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
