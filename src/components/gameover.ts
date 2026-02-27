import { parseStyleSheet, parseTemplate } from "../utility/dom"
import rawElementsStyleSheet from "./elements.css?raw"
import rawStyleSheet from "./gameover.css?raw"
import rawTemplate from "./gameover.html?raw"

/* eslint-disable-next-line ts/no-namespace -- Events declaration is dynamically picked for registration. */
export declare namespace GameOverElement {
    export type EVENTS = {
        restart: CustomEvent<never>
    }
}

export class GameOverElement extends HTMLElement {
    static TAG = "buffle-game-over" as const
    static DEFAULT_RESTART_KEY = "r"

    #root: ShadowRoot
    #restartKeys = new Set<string>()

    constructor() {
        super()
        this.#root = this.attachShadow({ mode: "open" })
        const template = parseTemplate(rawTemplate)
        this.#root.adoptedStyleSheets = [
            parseStyleSheet(rawStyleSheet),
            parseStyleSheet(rawElementsStyleSheet),
        ]
        this.#root.append(template.content.cloneNode(true))
    }

    static get observedAttributes() {
        return ["restart-key"] as const
    }

    #loadRestartKeys() {
        this.#restartKeys = new Set((this.getAttribute("restart-key") ?? GameOverElement.DEFAULT_RESTART_KEY)
            .split(",")
            .map((key) => key.trim().toLocaleLowerCase())
            .filter(Boolean))
    }

    #onKeyDown = (event: KeyboardEvent) => {
        if (this.#restartKeys.has(event.key.toLocaleLowerCase())) {
            this.#emitRestart()
        }
    }

    #emitRestart = () => {
        if (!this.hasAttribute("show")) {
            return
        }

        this.dispatchEvent(new CustomEvent("restart"))
    }

    connectedCallback() {
        const restartButton = this.#root.querySelector("[data-restart]") as HTMLButtonElement

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

    show() {
        this.setAttribute("show", "")
    }

    hide() {
        this.removeAttribute("show")
    }
}
