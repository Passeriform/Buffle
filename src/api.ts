import type { GameType } from "./constants"
import { initSession } from "./auth/session"

export type LeaderboardData = {
    id: number
    name: string
    score: number
    moves: number
    taunt: string
}

export const loadScores = async (gameType: GameType) => {
    const dataApiUrl = new URL(import.meta.env.VITE_SUPABASE_ENDPOINT)
    dataApiUrl.pathname = `/rest/v1/${import.meta.env.VITE_LEADERBOARD_TABLE}`
    dataApiUrl.searchParams.append("select", "id,name,moves,score,taunt")
    dataApiUrl.searchParams.append("game_type", `eq.${gameType}`)
    dataApiUrl.searchParams.append("order", "score.desc")
    dataApiUrl.searchParams.append("limit", "15")

    try {
        const response = await fetch(dataApiUrl, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                apikey: import.meta.env.VITE_SUPABASE_API_KEY,
            },
        })

        if (!response.ok) {
            throw new Error(`Data couldn't be loaded: ${response.statusText}`)
        }

        const result = await response.json() as LeaderboardData[]

        return result
    } catch (err) {
        throw new Error(`Data couldn't be loaded: ${err}`)
    }
}

type SubmitScorePayload = {
    gameType: GameType
    name: string
    score: number
    moves: number
    taunt: string
}

export const submitScore = async (payload: SubmitScorePayload) => {
    try {
        const session = await initSession()

        const response = await fetch(import.meta.env.VITE_LEADERBOARD_SUBMIT_API, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${session.access_token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        })

        if (!response.ok) {
            throw new Error(`Failed to publish high score: ${response.statusText}`)
        }

        const { runId } = await response.json() as { runId: number }

        return runId
    } catch (err) {
        throw new Error(`Failed to publish high score: ${err}`)
    }
}

type UpdateScoreProfilePayload = {
    id: number
    name?: string
    taunt?: string
}

export const updateScoreProfile = async (payload: UpdateScoreProfilePayload) => {
    try {
        const session = await initSession()

        const response = await fetch(import.meta.env.VITE_LEADERBOARD_SUBMIT_API, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${session.access_token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        })

        if (!response.ok) {
            throw new Error(`Failed to publish high score: ${response.statusText}`)
        }

        const { runId } = await response.json() as { runId: number }

        return runId
    } catch (err) {
        throw new Error(`Failed to publish high score: ${err}`)
    }
}
