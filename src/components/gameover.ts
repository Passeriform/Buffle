import rawTemplate from "./gameover.html?raw"
import rawStyleSheet from "./gameover.css?raw"
import { parseTemplate, parseStyleSheet } from "../utility/dom"

export class GameOverElement extends HTMLElement {
    static TAG = "buffle-game-over" as const
    static EVENTS = {
        "restart": new CustomEvent<never>("restart", {
            bubbles: true,
            composed: true,
        })
    }
    static DEFAULT_RESTART_KEY = "r"

    #root: ShadowRoot
    #restartKeys = new Set<string>()

    constructor() {
        super()
        this.#root = this.attachShadow({ mode: "open" })
        const template = parseTemplate(rawTemplate)
        const styleSheet = parseStyleSheet(rawStyleSheet)
        this.#root.adoptedStyleSheets = [styleSheet]
        this.#root.append(template.content.cloneNode(true))
    }

    static get observedAttributes() {
        return ["restart-key"]
    }

    #loadRestartKeys() {
        this.#restartKeys = new Set((this.getAttribute("restart-key") ?? GameOverElement.DEFAULT_RESTART_KEY)
            .split(",")
            .map(k => k.trim().toLocaleLowerCase())
            .filter(Boolean))
    }

    #onKeyDown = (e: KeyboardEvent) => {
        if (this.#restartKeys.has(e.key.toLocaleLowerCase())) {
            this.#emitRestart()
        }
    }

    #emitRestart = () => {
        if (!this.hasAttribute("show")) {
            return
        }

        this.dispatchEvent(GameOverElement.EVENTS.restart)
    }

    connectedCallback() {
        const restartButton = this.#root.getElementById("restart") as HTMLButtonElement

        this.#loadRestartKeys()

        restartButton.addEventListener("click", this.#emitRestart)
        window.addEventListener("keydown", this.#onKeyDown)
    }

    disconnectedCallback() {
        window.removeEventListener("keydown", this.#onKeyDown)
    }

    attributeChangedCallback() {
        this.#loadRestartKeys()
    }

    set score(value: number) {
        this.#root.getElementById("score")!.textContent = String(value)
    }

    set moves(value: number) {
        this.#root.getElementById("moves")!.textContent = String(value)
    }

    show() {
        this.setAttribute("show", "")
    }

    hide() {
        this.removeAttribute("show")
    }
}
