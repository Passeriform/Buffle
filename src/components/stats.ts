import { parseStyleSheet, parseTemplate } from "../utility/dom"
import rawElementsStyleSheet from "./elements.css?raw"
import rawStyleSheet from "./stats.css?raw"
import rawTemplate from "./stats.html?raw"

/* eslint-disable-next-line ts/no-namespace -- Events declaration is dynamically picked for registration. */
export declare namespace StatsElement {
    export type EVENTS = Record<string, never>
}

export class StatsElement extends HTMLElement {
    static TAG = "buffle-stats" as const

    #root: ShadowRoot

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

    /* eslint-disable-next-line accessor-pairs -- Property should only be set programmatically */
    set score(value: number) {
        this.#root.querySelector("[data-score]")!.textContent = String(value)
    }

    /* eslint-disable-next-line accessor-pairs -- Property should only be set programmatically */
    set moves(value: number) {
        this.#root.querySelector("[data-moves]")!.textContent = String(value)
    }
}
