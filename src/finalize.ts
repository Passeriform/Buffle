import { submitScore, updateScoreProfile } from "./api"
import { getUserProfile, updateUserProfile } from "./auth/profile"
import { GameType } from "./constants"

export const showGameOver = async (score: number, moves: number, resetCb: () => void) => {
    const { name, taunt } = getUserProfile()

    const runId = await submitScore({ gameType: GameType.CLASSIC, name, score, moves, taunt })

    const gameOverElement = document.querySelector("buffle-game-over")!

    gameOverElement.score = score
    gameOverElement.moves = moves

    gameOverElement.addEventListener("restart", () => {
        gameOverElement.hide()
        resetCb()
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
