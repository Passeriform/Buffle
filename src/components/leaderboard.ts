import rawHtml from "./leaderboard.html?raw"
import rawStyleSheet from "./leaderboard.css?raw"
import { parseTemplate, parseStyleSheet } from "../utility/dom"

type LeaderboardData = {
    name: string
    score: number
    moves: number
}

export class LeaderboardElement extends HTMLElement {
    static TAG = "buffle-leaderboard" as const
    static EVENTS = {}

    readonly #root: ShadowRoot
    readonly #bodySlot: HTMLTableSectionElement

    #loaderTemplate: HTMLTemplateElement
    #rowTemplate: HTMLTemplateElement

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
    }

    static get observedAttributes() {
        return ["game-type"]
    }

    #renderLoader() {
        this.#bodySlot.replaceChildren(this.#loaderTemplate.content.cloneNode(true))
    }

    #renderData() {
        const rows = this.#data.map(({ name, score, moves }, idx) => {
            const row = this.#rowTemplate.content.cloneNode(true) as DocumentFragment

            row.querySelector("[data-rank]")!.textContent = `${idx + 1}`
            row.querySelector("[data-name]")!.textContent = name
            row.querySelector("[data-score]")!.textContent = `${score}`
            row.querySelector("[data-moves]")!.textContent = `${moves}`

            return row
        })

        this.#bodySlot.replaceChildren(...rows)
    }

    async #loadData() {
        this.#renderLoader()

        const dataApiUrl = new URL(import.meta.env.VITE_SUPABASE_REST_ENDPOINT)
        dataApiUrl.pathname = `/rest/v1/${import.meta.env.VITE_LEADERBOARD_TABLE}`
        dataApiUrl.searchParams.append("select", "name,moves,score")
        dataApiUrl.searchParams.append("game_type", `eq.${this.getAttribute("game-type")!}`)
        dataApiUrl.searchParams.append("order", "score.desc")
        dataApiUrl.searchParams.append("limit", "15")

        try {
            const res = await fetch(dataApiUrl, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "apiKey": import.meta.env.VITE_SUPABASE_API_KEY,
                },
            })

            if (!res.ok) {
                throw Error("Data couldn't be loaded")
            }

            this.#data = await res.json()
        } catch (err) {
            throw Error(`Data couldn't be loaded: ${err}`)
        }

        this.#renderData()
    }

    connectedCallback() {
        this.#loadData()
    }

    attributeChangedCallback() {
        this.#loadData()
    }
}
