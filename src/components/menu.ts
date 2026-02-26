import { GameType } from "../constants"
import { Block } from "../gui/block"
import { parseStyleSheet, parseTemplate } from "../utility/dom"
import rawElementsStyleSheet from "./elements.css?raw"
import rawStyleSheet from "./menu.css?raw"
import rawHtml from "./menu.html?raw"

/* eslint-disable-next-line ts/no-namespace -- Events declaration is dynamically picked for registration. */
export declare namespace MenuElement {
    export type EVENTS = {
        "select:game-type": CustomEvent<keyof typeof GameType>
        "select:block-set": CustomEvent<keyof typeof Block.DISPLAY_SETS>
    }
}

export class MenuElement extends HTMLElement {
    static TAG = "buffle-menu" as const

    static DISABLED_GAME_MODES = [GameType.ARCADE, GameType.CAMPAIGN, GameType.BLITZ]

    readonly #root: ShadowRoot
    #gameModeOptionTemplate: HTMLTemplateElement
    #blockSetOptionTemplate: HTMLTemplateElement

    constructor() {
        super()
        this.#root = this.attachShadow({ mode: "open" })
        const template = parseTemplate(rawHtml)
        this.#root.adoptedStyleSheets = [
            parseStyleSheet(rawStyleSheet),
            parseStyleSheet(rawElementsStyleSheet),
        ]
        this.#root.append(template.content.cloneNode(true))
        this.#gameModeOptionTemplate = this.#root.querySelector("[data-game-mode-option]")!
        this.#blockSetOptionTemplate = this.#root.querySelector("[data-block-set-option]")!

        this.removeAttribute("show")
        this.#root.querySelector("#trigger")!.addEventListener("click", () => {
            this.toggleAttribute("show")
        })
        window.addEventListener("click", (event) => {
            if (!this.contains(event.target as Node) && event.target !== this.#root.querySelector("#trigger")) {
                this.removeAttribute("show")
            }
        })
    }

    static get observedAttributes() {
        return [] as const
    }

    #createGameModeOptions() {
        const optionElements = (Object.keys(GameType) as (keyof typeof GameType)[]).map((mode) => {
            const optionElement = this.#gameModeOptionTemplate.content.cloneNode(true) as HTMLElement
            const button = optionElement.querySelector("button")!
            const gameModeTextElement = optionElement.querySelector("[data-game-mode-text]")!
            const ellipsesElement = optionElement.querySelector("[data-ellipses]")!
            const endLabelElement = optionElement.querySelector("[data-end-label]")!

            const disabled = MenuElement.DISABLED_GAME_MODES.includes(GameType[mode])

            gameModeTextElement.textContent = mode.toUpperCase()
            ellipsesElement.textContent = ".".repeat(100)
            endLabelElement.textContent = disabled ? "(Coming Soon)" : ""

            button.value = mode
            button.disabled = disabled

            button.addEventListener("click", () => {
                this.dispatchEvent(new CustomEvent("select:game-type", { detail: mode }))
                this.removeAttribute("show")
            })

            return optionElement
        })

        this.#root.querySelector("[data-game-mode-container]")!.replaceChildren(...optionElements)
    }

    #createBlockSetOptions() {
        const optionElements = (Object.keys(Block.DISPLAY_SETS) as (keyof typeof Block.DISPLAY_SETS)[]).map((blockDisplaySet) => {
            const optionElement = this.#blockSetOptionTemplate.content.cloneNode(true) as HTMLElement
            const button = optionElement.querySelector("button")!

            button.textContent = Block.DISPLAY_SETS[blockDisplaySet][0]

            button.addEventListener("click", () => {
                this.dispatchEvent(new CustomEvent("select:block-set", { detail: blockDisplaySet }))
            })

            return optionElement
        })

        this.#root.querySelector("[data-block-set-container]")!.replaceChildren(...optionElements)
    }

    connectedCallback() {
        this.#createGameModeOptions()
        this.#createBlockSetOptions()
    }

    attributeChangedCallback() {
        this.#createGameModeOptions()
        this.#createBlockSetOptions()
    }
}
