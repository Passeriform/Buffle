import rawHtml from "./popover.html?raw"
import rawStyleSheet from "./popover.css?raw"
import { parseTemplate, parseStyleSheet } from "../utility/dom"

export declare namespace PopoverElement {
    export type EVENTS = {}
}

export class PopoverElement extends HTMLElement {
    static TAG = "buffle-popover" as const

    readonly #root: ShadowRoot
    readonly #layoutObserver: ResizeObserver
    #anchor: HTMLElement | null = null

    constructor() {
        super()
        this.#root = this.attachShadow({ mode: "open" })
        const template = parseTemplate(rawHtml)
        const styleSheet = parseStyleSheet(rawStyleSheet)
        this.#root.adoptedStyleSheets = [styleSheet]
        this.#root.append(template.content.cloneNode(true))

        const slot = this.#root.querySelector("slot")
        slot?.addEventListener("mouseover", () => {
            this.setAttribute("child-hover", "")
        })
        slot?.addEventListener("mouseout", () => {
            this.removeAttribute("child-hover")
        })

        this.#layoutObserver = new ResizeObserver(this.#recompute.bind(this))
    }

    static get observedAttributes() {
        return ["anchor"]
    }

    #updateAnchor() {
        const anchorElementId = this.getAttribute("anchor")

        if (anchorElementId) {
            this.#anchor = document.getElementById(anchorElementId)

            if (!this.#anchor) {
                const root = this.getRootNode() as ShadowRoot
                this.#anchor = root.getElementById(anchorElementId)
            }
        }


        this.#recomputePosition()
    }

    #recomputePadding() {
        const styles = getComputedStyle(this)

        const tailSize = parseFloat(styles.getPropertyValue("--tail-size"))

        this.style.paddingBottom = `${tailSize}px`
    }

    #recomputeMask() {
        const styles = getComputedStyle(this)

        const width = this.offsetWidth
        const height = this.offsetHeight

        const radius = parseFloat(styles.borderRadius)
        const tailSize = parseFloat(styles.getPropertyValue("--tail-size"))
        const tailOffset = parseFloat(styles.getPropertyValue("--tail-offset"))

        const curveHandleLength = Math.min(radius, height / 2, width / 2)
        const bodyHeight = height - tailSize
        const tailWidth = tailSize * Math.sqrt(2)
        const tailCenter = Math.min(tailOffset - (tailWidth / 2), width - curveHandleLength)

        const path = `
M ${curveHandleLength} 0
L ${width - curveHandleLength} 0
Q ${width} 0 ${width} ${curveHandleLength}
L ${width} ${bodyHeight - curveHandleLength}
Q ${width} ${bodyHeight} ${width - curveHandleLength} ${bodyHeight}
L ${tailCenter + (tailWidth / 2)} ${bodyHeight}
L ${tailCenter} ${height}
L ${tailCenter - (tailWidth / 2)} ${bodyHeight}
L ${curveHandleLength} ${bodyHeight}
Q 0 ${bodyHeight} 0 ${bodyHeight - curveHandleLength}
L 0 ${curveHandleLength}
Q 0 0 ${curveHandleLength} 0
Z
        `

        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><path d="${path}" fill="white"/></svg>`
        const maskImage = `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}")`

        this.style.maskImage = maskImage
    }

    #recomputePosition() {
        if (!this.#anchor) {
            return
        }

        const anchorRect = this.#anchor.getBoundingClientRect()

        const styles = getComputedStyle(this)

        const inlineOffset = parseFloat(styles.getPropertyValue("--inline-offset"))
        const blockOffset = parseFloat(styles.getPropertyValue("--block-offset"))

        const left = anchorRect.left + inlineOffset + (anchorRect.width / 2)
        const top = anchorRect.top + blockOffset - this.offsetHeight

        this.style.left = `${left + window.scrollX}px`
        this.style.top = `${top + window.scrollY}px`
    }

    #recompute() {
        this.#recomputePadding()
        this.#recomputeMask()
        this.#recomputePosition()
    }

    connectedCallback() {
        queueMicrotask(this.#updateAnchor.bind(this))
        this.#layoutObserver.observe(this)
    }

    attributeChangedCallback() {
        this.#updateAnchor()
    }

    disconnectedCallback() {
        this.#layoutObserver.disconnect()
    }

    show() {
        this.setAttribute("show", "")
    }

    hide() {
        this.removeAttribute("show")
    }
}
