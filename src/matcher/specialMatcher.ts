import { UnionSet } from "../utility/unionSet"
import type { DirectionalMatch } from "./directionalMatcher"

type SpecialMatch = {
    type: "L" | "T" | "+" | "F" | "U" | "A" | "O" | "B",
    matchGroups: DirectionalMatch[][],
}

const getJunctions = (matches: DirectionalMatch[]) => {
    const degrees = new Map<number, number>()
    matches.forEach(({ indices }) => {
        indices.forEach((index) => {
            degrees.set(index, (degrees.get(index) ?? 0) + 1)
        })
    })
    return [...degrees.entries()].filter(([_, count]) => count > 1).map(([index]) => index)
}

const buildClusters = (matches: DirectionalMatch[]) => {
    const unionSet = new UnionSet(matches.flatMap(({ indices }) => indices))

    matches.forEach(({ indices }) => {
        indices.slice(1).forEach((index) => {
            unionSet.union(indices[0], index)
        })
    })

    const clusters = new Map<number, DirectionalMatch[]>()

    matches.forEach((match) => {
        const root = unionSet.find(match.indices[0])
        const matchList = clusters.get(root) ?? []
        matchList.push(match)
        clusters.set(root, matchList)
    })

    return Array.from(clusters.values())
}

export const extractSpecialMatches = (...matchGroups: DirectionalMatch[][]) => {
    const matchClusters = buildClusters(matchGroups.flat())

    const [specialMatchGroup, [leftoverMatches]] = matchClusters.partition((matches) => matches.length >= 2)

    const specialMatches = specialMatchGroup.map((matches) => {
        const junctions = new Set(getJunctions(matches))
        const nonRootIndices = new Set(matches.flatMap(({ indices }) => indices.slice(1)))

        const isBranch = (match: DirectionalMatch) => match.indices.slice(1).every((index) => !junctions.has(index))
        const isCollapsible = (match: DirectionalMatch) => match.indices.filter((index) => junctions.has(index)).every((index) => nonRootIndices.has(index))

        const [branches, nonBranches] = matches.partition(isBranch)
        const [collapsible, blocked] = nonBranches.partition(isCollapsible)

        // TODO: Infer the type of match
        return {
            type: "B",
            matchGroups: [
                branches,
                collapsible,
                blocked,
            ],
        }
    }) satisfies SpecialMatch[]

    const retainMatchSet = new Set(leftoverMatches)
    matchGroups.forEach((group) => {
        group.splice(0, group.length, ...group.filter((match) => retainMatchSet.has(match)))
    })

    return specialMatches
}
