import type { DirectionalMatch } from "../src/matcher/directionalMatcher"

const parseColumns = (rowString: string, options: ParseOptions) => rowString
    .split(options.columnSplit)
    .reduce<number[]>(
        (acc, value, idx) => value === options.identifier ? [...acc, idx] : acc,
        [],
    )

const parseRows = (stateString: string, options: ParseOptions) => stateString
    .split(options.rowSplit)
    .slice(1, -1)

const toSparseIndices = (state: number[][], dimension: number) => state
    .flatMap((columns, rowIdx) => columns.map((colIdx) => colIdx + (dimension * rowIdx)))

type ParseOptions = {
    rowSplit: string
    columnSplit: string
    identifier: string
}

export const parse = (dimension: number, options?: Partial<ParseOptions>) => ([stateString]: TemplateStringsArray) => {
    const resolvedOptions = {
        rowSplit: "\n",
        columnSplit: "",
        identifier: "#",
        ...options,
    }

    const state = parseRows(stateString, resolvedOptions).map((rowString) => parseColumns(rowString, resolvedOptions))
    const indices = toSparseIndices(state, dimension)

    return indices
}

export const makeSparseMatrixIterator = (iterable: Iterable<number>) => {
    const collector = [] as [index: number, element: boolean][]

    for (const item of iterable) {
        collector.push([item, true])
    }

    return collector
}

export const match3Filter = ({ indices }: DirectionalMatch) => indices.length >= 3
