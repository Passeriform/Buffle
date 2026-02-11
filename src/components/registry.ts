import { GameOverElement } from "./gameover"

type CustomElementCtor = {
    new(): HTMLElement
    TAG: string
}

const additionalElements = [
    GameOverElement,
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

type CustomElementEventMap =
    & GameOverElement.EVENTS

declare global {
    interface HTMLElementTagNameMap extends CustomElementTagMap { }
    interface HTMLElementEventMap extends CustomElementEventMap { }
}
