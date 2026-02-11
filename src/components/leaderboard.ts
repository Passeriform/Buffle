import rawHtml from "./leaderboard.html?raw"
import rawStyleSheet from "./leaderboard.css?raw"
import { parseTemplate, parseStyleSheet } from "../utility/dom"

export declare namespace LeaderboardElement {
    export type EVENTS = {
        "update:name": CustomEvent<string>
        "update:taunt": CustomEvent<string>
    }
}

type LeaderboardData = {
    id: number
    name: string
    score: number
    moves: number
    taunt: string
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
        const styleSheet = parseStyleSheet(rawStyleSheet)
        this.#root.adoptedStyleSheets = [styleSheet]
        this.#root.append(template.content.cloneNode(true))
        this.#bodySlot = this.#root.querySelector("[data-slot]")!
        this.#loaderTemplate = this.#root.querySelector("[data-loader]")!
        this.#rowTemplate = this.#root.querySelector("[data-row]")!
        this.#editableRowTemplate = this.#root.querySelector("[data-row-editable]")!
    }

    static get observedAttributes() {
        return ["game-type"]
    }

    #commitChange = (e: FocusEvent | KeyboardEvent) => {
        e.stopPropagation()

        if (e.type === "blur" || (e as KeyboardEvent).key === "Enter") {
            (e.target! as HTMLInputElement).blur()

            this.dispatchEvent(new CustomEvent("update:name", {
                bubbles: true,
                composed: true,
                detail: (e.target! as HTMLInputElement).value,
            }))
        }
    }

    #renderLoader() {
        this.#bodySlot.replaceChildren(this.#loaderTemplate.content.cloneNode(true))
    }

    #renderData() {
        const rows = this.#data.map(({ id, name, score, moves }, idx) => {
            const row = (id === this.#editableId ? this.#editableRowTemplate : this.#rowTemplate).content.cloneNode(true) as DocumentFragment

            row.querySelector("[data-rank]")!.textContent = `${idx + 1}`
            row.querySelector("[data-score]")!.textContent = `${score}`
            row.querySelector("[data-moves]")!.textContent = `${moves}`

            if (id === this.#editableId) {
                const input = row.querySelector("[data-name]")! as HTMLInputElement
                input.value = name
                input.addEventListener("blur", this.#commitChange)
                input.addEventListener("keydown", this.#commitChange)
            } else {
                row.querySelector("[data-name]")!.textContent = name
            }

            return row
        })

        this.#bodySlot.replaceChildren(...rows)
    }

    async #loadData() {
        this.#renderLoader()

        const dataApiUrl = new URL(import.meta.env.VITE_SUPABASE_ENDPOINT)
        dataApiUrl.pathname = `/rest/v1/${import.meta.env.VITE_LEADERBOARD_TABLE}`
        dataApiUrl.searchParams.append("select", "id,name,moves,score")
        dataApiUrl.searchParams.append("game_type", `eq.${this.getAttribute("game-type")!}`)
        dataApiUrl.searchParams.append("order", "score.desc")
        dataApiUrl.searchParams.append("limit", "15")

        try {
            const response = await fetch(dataApiUrl, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    apikey: import.meta.env.VITE_SUPABASE_API_KEY,
                },
            })

            if (!response.ok) {
                throw Error(`Data couldn't be loaded: ${response.statusText}`)
            }

            this.#data = await response.json()
        } catch (err) {
            throw Error(`Data couldn't be loaded: ${err}`)
        }

        this.#renderData()
    }

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
