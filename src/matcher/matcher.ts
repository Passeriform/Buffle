import { Direction } from "../controls"
import type { SparseMatrix } from "../utility/sparseMatrix"
import { getDirectionalMatches, getSecondaryDirection } from "./directionalMatcher"
import { extractSpecialMatches } from "./specialMatcher"

// TODO: Convert to bitmap operations instead of looping

export const computeMatches = <T>(
    state: SparseMatrix<T>,
    direction: Direction,
    equalFn: (a: T, b: T) => boolean,
    threshold: number,
) => {
    const primary = getDirectionalMatches(state, direction, equalFn).filter(({ indices }) => indices.length >= threshold)

    const secondaryDirection = getSecondaryDirection(state, direction)

    const secondary = getDirectionalMatches(state, secondaryDirection, equalFn).filter(({ indices }) => indices.length >= threshold)

    const special = extractSpecialMatches(primary, secondary)

    return { primary, secondary, special }
}
