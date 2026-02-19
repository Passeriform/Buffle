import { initSession } from "./auth/session"
import { Controls } from "./controls"
import { createGame } from "./game"
import { State } from "./state"
import { createCanvas } from "./utility/canvas"
import { loopDraw } from "./utility/game"
import "./utility/array"

document.addEventListener("DOMContentLoaded", async () => {
    await initSession()

    const state = new State({ gameSpeed: 1, dimensions: [4, 4] })
    const controls = new Controls()
    const { init, draw, update, end } = createGame(state)

    state.addEventListener("game:start", () => {
        init()
        controls.bind("root", update)
    })
    state.addEventListener("game:end", () => {
        controls.unbind()
        end()
    })
    state.addEventListener("game:reset", () => {
        state.start()
    })

    state.start()

    const ctx = createCanvas("root", "#2e1f1c")
    loopDraw(ctx, draw)
})
