import { initSession } from "./auth/session"
import { GameType } from "./constants"

type SubmitScorePayload = {
    gameType: GameType
    name: string
    score: number
    moves: number
    taunt: string
}

const submitScore = async (payload: SubmitScorePayload) => {
    try {
        const session = await initSession()

        const response = await fetch(import.meta.env.VITE_LEADERBOARD_SUBMIT_API, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${session.access_token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload),
        })

        if (!response.ok) {
            throw Error(`Failed to publish high score: ${response.statusText}`)
        }

        const { runId } = await response.json() as { runId: number }

        return runId
    } catch (err) {
        throw Error(`Failed to publish high score: ${err}`)
    }
}

const updateScoreDetails = async (payload: Partial<Pick<SubmitScorePayload, "name" | "taunt">>) => {
    try {
        const session = await initSession()

        const response = await fetch(import.meta.env.VITE_LEADERBOARD_SUBMIT_API, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${session.access_token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload),
        })

        if (!response.ok) {
            throw Error(`Failed to publish high score: ${response.statusText}`)
        }

        const { runId } = await response.json() as { runId: number }

        return runId
    } catch (err) {
        throw Error(`Failed to publish high score: ${err}`)
    }
}

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
        updateScoreDetails({ name: e.detail })
    })
    leaderboardElement.addEventListener("update:taunt", (e) => {
        updateScoreDetails({ taunt: e.detail })
    })
}
