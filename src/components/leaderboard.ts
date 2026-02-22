import type { GameType } from "../constants"
import { type LeaderboardData, loadScores } from "../api"
import { parseStyleSheet, parseTemplate, spliceChildren } from "../utility/dom"
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
    readonly #contentParent: HTMLElement
    readonly #bodySlot: HTMLElement
    readonly #loaderElement: HTMLElement
    #loadedCount: number = 0
    #fetchLimit: number = 15
    #runId?: number

    #rowTemplate: HTMLTemplateElement
    #editableRowTemplate: HTMLTemplateElement

    #overscrollObserver: IntersectionObserver

    constructor() {
        super()
        this.#root = this.attachShadow({ mode: "open" })
        const template = parseTemplate(rawHtml)
        this.#root.adoptedStyleSheets = [
            parseStyleSheet(rawStyleSheet),
            parseStyleSheet(rawElementsStyleSheet),
        ]
        this.#root.append(template.content.cloneNode(true))
        this.#contentParent = this.#root.querySelector(".content")!
        this.#bodySlot = this.#root.querySelector("[data-slot]")!
        this.#loaderElement = this.#root.querySelector("#loader")!
        this.#rowTemplate = this.#root.querySelector("[data-row]")!
        this.#editableRowTemplate = this.#root.querySelector("[data-row-editable]")!

        this.#overscrollObserver = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                this.#fetchLimit += 15
                this.#loadData()
            }
        }, { root: this.#contentParent })
        this.#overscrollObserver.observe(this.#loaderElement)
    }

    static get observedAttributes() {
        return ["game-type", "autoscroll"] as const
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

    #getDataRows(data: LeaderboardData[], seedRank: number) {
        return data.map(({ id, name, score, moves, taunt }, idx) => {
            const row = (id === this.#runId ? this.#editableRowTemplate : this.#rowTemplate).content.cloneNode(true) as HTMLElement

            row.querySelector("[data-rank]")!.textContent = `${seedRank + idx + 1}`
            row.querySelector("[data-score]")!.textContent = `${score}`
            row.querySelector("[data-moves]")!.textContent = `${moves}`

            if (id === this.#runId) {
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
    }

    async #loadData(force: boolean = false) {
        const offset = force ? 0 : this.#loadedCount
        const loadedScores = await loadScores(this.getAttribute("game-type")! as GameType, offset, this.#fetchLimit - offset)

        if (!loadedScores.length) {
            this.#loaderElement.removeAttribute("show")
        }

        // TODO: Replace bodySlot instead of splicing contentParent
        const lastChildIndex = force ? 0 : this.#contentParent.childElementCount - 1
        spliceChildren(this.#contentParent, lastChildIndex, this.#contentParent.childElementCount - lastChildIndex - 1, ...this.#getDataRows(loadedScores, offset))
        this.#loadedCount = offset + loadedScores.length

        if (this.hasAttribute("autoscroll")) {
            this.#scrollToRun()
        }
    }

    #scrollToRun() {
        const runElement = this.#contentParent.querySelector("input#name-input")

        if (runElement) {
            runElement.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" })
            return
        }

        this.#contentParent.scroll({ behavior: "smooth", top: this.#contentParent.scrollHeight })
    }

    /* eslint-disable-next-line accessor-pairs -- Property should only be set programmatically */
    set runId(value: number | undefined) {
        this.#runId = value
    }

    refresh() {
        this.#loadData(true)
    }

    connectedCallback() {
        this.#loadData(true)
    }

    attributeChangedCallback(name: typeof LeaderboardElement.observedAttributes[number]) {
        if (name === "game-type") {
            this.#loadData(true)
        }
    }
}
