import { bindControls, bindReset } from "./controls"
import { draw, init, reset, update } from "./game"
import { createCanvas } from "./utility/canvas"
import "./utility/array"

document.addEventListener("DOMContentLoaded", () => {
    // TODO: Use double buffer and swap for image draw, reduce flicker
    const ctx = createCanvas("root", "#2E1F1C")

    init()
    bindControls(document.body, update)
    bindReset(document.body, reset)
    draw(0, ctx)
})