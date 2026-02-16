import { initDB } from "./indexedDb"

const DB_NAME = "authDB"
const SESSION_STORE_NAME = "sessions"
const SESSION_KEY = "session"

const createAnonUserUrl = new URL(import.meta.env.VITE_SUPABASE_ENDPOINT)
createAnonUserUrl.pathname = `/auth/v1/signup`

const refreshUrl = new URL(import.meta.env.VITE_SUPABASE_ENDPOINT)
refreshUrl.pathname = `/auth/v1/token`
refreshUrl.searchParams.append("grant_type", "refresh_token")

type ClientSession = {
    access_token: string
    refresh_token: string
    expires_in: number
    expires_at: number
    user: {
        id: string
    }
}

const createAnonUser = async () => {
    try {
        const response = await fetch(createAnonUserUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                apiKey: import.meta.env.VITE_SUPABASE_API_KEY,
            },
            body: JSON.stringify({}),
        })

        if (!response.ok) {
            throw new Error(`Anonymous authentication failed: ${response.statusText}`)
        }

        const session = await response.json() as ClientSession
        session.expires_at = Date.now() + session.expires_in * 1000

        return session
    } catch (err) {
        throw new Error(`Anonymous authentication failed: ${err}`)
    }
}

const refreshSession = async (session: ClientSession) => {
    try {
        const response = await fetch(refreshUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                apiKey: import.meta.env.VITE_SUPABASE_API_KEY,
            },
            body: JSON.stringify({
                refresh_token: session.refresh_token,
            }),
        })

        if (!response.ok) {
            throw new Error(`Token refresh failed: ${response.statusText}`)
        }

        const refreshed = await response.json() as ClientSession
        refreshed.expires_at = Date.now() + refreshed.expires_in * 1000

        return refreshed
    } catch (err) {
        throw new Error(`Token refresh failed: ${err}`)
    }
}

export const initSession = async () => {
    const db = await initDB(DB_NAME, SESSION_STORE_NAME)

    const existingSession = await db.get<ClientSession>(SESSION_KEY)

    if (existingSession) {
        if (existingSession.expires_at > Date.now()) {
            return existingSession
        }

        if (existingSession.refresh_token) {
            const refreshedSession = await refreshSession(existingSession)
            await db.set(SESSION_KEY, refreshedSession)

            return refreshedSession
        }
    }

    const newSession = await createAnonUser()
    await db.set(SESSION_KEY, newSession)

    return newSession
}
