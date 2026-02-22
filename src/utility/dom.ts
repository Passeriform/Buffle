export const parseTemplate = (rawHtml: string) => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(rawHtml, "text/html")
    const template = doc.querySelector("template")

    if (!template || !(template instanceof HTMLTemplateElement)) {
        throw new Error("Invalid template found. The root of the component must have a single <template> element.")
    }

    return template as HTMLTemplateElement
}

export const parseStyleSheet = (rawCss: string) => {
    const sheet = new CSSStyleSheet()
    sheet.replaceSync(rawCss)
    return sheet
}

export const spliceChildren = (parent: HTMLElement, index: number, deleteCount: number, ...additional: HTMLElement[]) => {
    const children = Array.from(parent.children)
    const removed = children.splice(index, deleteCount, ...additional)
    removed.forEach((child) => {
        parent.removeChild(child)
    })

    const nextSibling = parent.children[index] || null
    additional.forEach((child) => {
        parent.insertBefore(child, nextSibling)
    })
}
