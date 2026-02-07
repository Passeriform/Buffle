import { GameOverElement } from "./gameover"
import { LeaderboardElement } from "./leaderboard"

type CustomElementCtor = {
    new(): HTMLElement
    TAG: string
    EVENTS: Record<string, CustomEvent>
}

const additionalElements = [
    GameOverElement,
    LeaderboardElement,
] as const satisfies CustomElementCtor[]

type ElementUnion = typeof additionalElements[number]

additionalElements.forEach((element) => {
    if (!customElements.get(element.TAG)) {
        customElements.define(element.TAG, element)
    }
})

type CustomElementTagMap = {
    [K in ElementUnion["TAG"]]: InstanceType<Extract<ElementUnion, { TAG: K }>>
}

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I  : never

type CustomElementEventMap = UnionToIntersection<ElementUnion["EVENTS"]>

declare global {
    interface HTMLElementTagNameMap extends CustomElementTagMap { }
    interface HTMLElementEventMap extends CustomElementEventMap { }
}
