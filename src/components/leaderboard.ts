import type { GameType } from "../constants"
import { type LeaderboardData, loadScores } from "../api"
import { parseStyleSheet, parseTemplate } from "../utility/dom"
import rawElementsStyleSheet from "./elements.css?raw"
import rawStyleSheet from "./leaderboard.css?raw"
import rawHtml from "./leaderboard.html?raw"

/* eslint-disable-next-line ts/no-namespace -- Events declaration is dynamically picked for registration. */
export declare namespace LeaderboardElement {
    export type EVENTS = {
        "update:name": CustomEvent<string>
        "update:taunt": CustomEvent<string>
    }
}

export class LeaderboardElement extends HTMLElement {
    static TAG = "buffle-leaderboard" as const

    readonly #root: ShadowRoot
    readonly #bodySlot: HTMLTableSectionElement
    #editableId?: number

    #loaderTemplate: HTMLTemplateElement
    #rowTemplate: HTMLTemplateElement
    #editableRowTemplate: HTMLTemplateElement

    #data: LeaderboardData[] = []

    constructor() {
        super()
        this.#root = this.attachShadow({ mode: "open" })
        const template = parseTemplate(rawHtml)
        this.#root.adoptedStyleSheets = [
            parseStyleSheet(rawStyleSheet),
            parseStyleSheet(rawElementsStyleSheet),
        ]
        this.#root.append(template.content.cloneNode(true))
        this.#bodySlot = this.#root.querySelector("[data-slot]")!
        this.#loaderTemplate = this.#root.querySelector("[data-loader]")!
        this.#rowTemplate = this.#root.querySelector("[data-row]")!
        this.#editableRowTemplate = this.#root.querySelector("[data-row-editable]")!
    }

    static get observedAttributes() {
        return ["game-type"]
    }

    #addInputListeners = (input: HTMLInputElement, event: string) => {
        input.addEventListener("focus", () => {
            input.select()
        })
        input.addEventListener("keydown", (event) => {
            event.stopPropagation()

            if (event.key === "Enter") {
                input.blur()
            }
        })
        input.addEventListener("blur", () => {
            input.setSelectionRange(0, 0)
            this.dispatchEvent(new CustomEvent(event, {
                bubbles: true,
                composed: true,
                detail: input.value,
            }))
        })
    }

    #renderLoader() {
        this.#bodySlot.replaceChildren(this.#loaderTemplate.content.cloneNode(true))
    }

    #renderData() {
        const rows = this.#data.map(({ id, name, score, moves, taunt }, idx) => {
            const row = (id === this.#editableId ? this.#editableRowTemplate : this.#rowTemplate).content.cloneNode(true) as DocumentFragment

            row.querySelector("[data-rank]")!.textContent = `${idx + 1}`
            row.querySelector("[data-score]")!.textContent = `${score}`
            row.querySelector("[data-moves]")!.textContent = `${moves}`

            if (id === this.#editableId) {
                const nameInput = row.querySelector("[data-name]")! as HTMLInputElement
                nameInput.value = name
                this.#addInputListeners(nameInput, "update:name")

                const tauntInput = row.querySelector("[data-taunt]")! as HTMLInputElement
                tauntInput.value = taunt
                tauntInput.placeholder = "Burn the opposition with a taunt"
                this.#addInputListeners(tauntInput, "update:taunt")

                const popover = row.querySelector("buffle-popover")!

                nameInput.addEventListener("focus", () => popover.show())
                nameInput.addEventListener("blur", (event) => {
                    if (event.relatedTarget !== tauntInput) {
                        popover.hide()
                    }
                })
                tauntInput.addEventListener("blur", () => popover.hide())
            } else {
                row.querySelector("[data-name]")!.textContent = name
            }

            return row
        })

        this.#bodySlot.replaceChildren(...rows)
    }

    async #loadData() {
        this.#renderLoader()

        this.#data = await loadScores(this.getAttribute("game-type")! as GameType)

        this.#renderData()
    }

    /* eslint-disable-next-line accessor-pairs -- Property should only be set programmatically */
    set editableId(value: number | undefined) {
        this.#editableId = value
    }

    refresh() {
        this.#loadData()
    }

    connectedCallback() {
        this.#loadData()
    }

    attributeChangedCallback() {
        this.#loadData()
    }
}
