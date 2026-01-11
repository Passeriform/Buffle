export const parseColorHex = (hex: string) => {
    return parseInt(hex.replace("#", ""), 16)
}

export const toColorHex = (color: number) => {
    if (color > 0x00ffffff || color < 0) {
        throw Error("Invalid color hex value")
    }

    return "#" + color.toString(16).padStart(6, "0")
}

export const splitRGBChannels = (color: number) => {
    if (color > 0x00ffffff || color < 0) {
        throw Error("Invalid color hex value")
    }

    const red = (color >> 16) & 0x0000ff
    const green = (color >> 8) & 0x0000ff
    const blue = color & 0x0000ff

    return [red, green, blue]
}

export const mergeRGBChannels = (red: number, green: number, blue: number) => {
    if (red > 0x0000ff || green > 0x0000ff || blue > 0x0000ff) {
        throw Error("Invalid channel hex values")
    }

    const color = (red << 16) | (green << 8) | blue

    return color
}