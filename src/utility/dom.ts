export const parseTemplate = (rawHtml: string) => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(rawHtml, "text/html")
    const template = doc.querySelector("template")

    if (!template || !(template instanceof HTMLTemplateElement)) {
        throw Error("Invalid template found. The root of the component must have a single <template> element.")
    }

    return template as HTMLTemplateElement
}


export const parseStyleSheet = (rawCss: string) => {
    const sheet = new CSSStyleSheet()
    sheet.replaceSync(rawCss)
    return sheet
}