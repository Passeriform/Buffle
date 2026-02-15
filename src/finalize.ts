import { submitScore, updateScoreProfile } from "./api"
import { GameType } from "./constants"

export const showGameOver = async (score: number, moves: number, resetCb: () => void) => {
    const runId = await submitScore({
        gameType: GameType.CLASSIC,
        name: "BUFFLE",
        score,
        moves,
        taunt: ""
    })

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

    leaderboardElement.addEventListener("update:name", (e) => {
        updateScoreProfile({ id: runId, name: e.detail })
    })
    leaderboardElement.addEventListener("update:taunt", (e) => {
        updateScoreProfile({ id: runId, taunt: e.detail })
    })
}
