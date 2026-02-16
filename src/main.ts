import { initSession } from "./auth/session"
import { bindControls } from "./controls"
import { draw, init, update } from "./game"
import { createCanvas } from "./utility/canvas"
import "./utility/array"

document.addEventListener("DOMContentLoaded", async () => {
    await initSession()

    // TODO: Use double buffer and swap for image draw, reduce flicker
    const ctx = createCanvas("root", "#2e1f1c")

    init()
    bindControls(document.body, update)
    draw(0, ctx)
})
