import { bindControls } from "./controls"
import { draw, init, update } from "./game"
import { createCanvas } from "./utility/canvas"

document.addEventListener("DOMContentLoaded", () => {
    const ctx = createCanvas("root", "#2E1F1C")

    init()
    bindControls(document.body, update)
    draw(0, ctx)
})