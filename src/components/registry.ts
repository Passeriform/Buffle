import { GameOverElement } from "./gameover"
import { LeaderboardElement } from "./leaderboard"
import { MenuElement } from "./menu"
import { PopoverElement } from "./popover"
import { StatsElement } from "./stats"

type CustomElementCtor = {
    new(): HTMLElement
    TAG: string
}

const additionalElements = [
    GameOverElement,
    LeaderboardElement,
    PopoverElement,
    StatsElement,
    MenuElement,
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
    & LeaderboardElement.EVENTS
    & PopoverElement.EVENTS
    & StatsElement.EVENTS
    & MenuElement.EVENTS

/* eslint-disable ts/consistent-type-definitions -- Extending global HTML attributes requires interface for declaration merging */

declare global {
    interface HTMLElementTagNameMap extends CustomElementTagMap { }
    interface HTMLElementEventMap extends CustomElementEventMap { }
}

/* eslint-enable ts/consistent-type-definitions */
