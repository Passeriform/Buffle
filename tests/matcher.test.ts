import { describe, expect, it } from "vitest"
import { Direction } from "../src/constants"
import { getDirectionalMatches } from "../src/matcher/directionalMatcher"
import { extractSpecialMatches } from "../src/matcher/specialMatcher"
import { SparseMatrix } from "../src/utility/sparseMatrix"
import {
    BOUNDARY_CHECK_SHAPES,
    SHAPE_DIRECTIONAL_MATCH_TEST_CASES,
    GRID_DIMENSION,
    SHAPES,
} from "./dataset"
import { makeSparseMatrixIterator, match3Filter } from "./utility"
import "../src/utility/array"

describe("directional matches", () => {
    it.each(SHAPE_DIRECTIONAL_MATCH_TEST_CASES)("computes directional matches for shape %s, direction %s", (shapeKey, directionKey, matchList) => {
        const matrix = new SparseMatrix(makeSparseMatrixIterator(SHAPES[shapeKey]), GRID_DIMENSION)

        const expected = matchList.map((indices) => ({ direction: Direction[directionKey], indices }))

        const matches = getDirectionalMatches(matrix, Direction[directionKey]).filter(match3Filter)

        expect(matches).toEqual(expected)
    })

    it("does not wrap matches across row boundaries", () => {
        const matrix = new SparseMatrix(makeSparseMatrixIterator(BOUNDARY_CHECK_SHAPES.ROW), GRID_DIMENSION)

        const leftMatches = getDirectionalMatches(matrix, Direction.LEFT).filter(match3Filter)
        const rightMatches = getDirectionalMatches(matrix, Direction.RIGHT).filter(match3Filter)

        expect(leftMatches).toEqual([{ direction: Direction.LEFT, indices: [5, 6, 7] }, { direction: Direction.LEFT, indices: [8, 9, 10] }])
        expect(rightMatches).toEqual([{ direction: Direction.RIGHT, indices: [7, 6, 5] }, { direction: Direction.RIGHT, indices: [10, 9, 8] }])
    })

    it("does not wrap matches across column boundaries", () => {
        const matrix = new SparseMatrix(makeSparseMatrixIterator(BOUNDARY_CHECK_SHAPES.COLUMN), GRID_DIMENSION)

        const upMatches = getDirectionalMatches(matrix, Direction.UP).filter(match3Filter)
        const downMatches = getDirectionalMatches(matrix, Direction.DOWN).filter(match3Filter)

        expect(upMatches).toEqual([{ direction: Direction.UP, indices: [5, 9, 13] }, { direction: Direction.UP, indices: [2, 6, 10] }])
        expect(downMatches).toEqual([{ direction: Direction.DOWN, indices: [13, 9, 5] }, { direction: Direction.DOWN, indices: [10, 6, 2] }])
    })
})

describe("extract special matches", () => {
    it("extracts special matches from independent branching directional matches (L Match)", () => {
        const horizontal = [{ direction: Direction.LEFT, indices: [0, 1, 2] }]
        const vertical = [{ direction: Direction.UP, indices: [0, 4, 8] }]

        const result = extractSpecialMatches(horizontal, vertical)

        expect(result).toEqual([{
            type: "B",
            matchGroups: [
                [
                    { direction: Direction.LEFT, indices: [0, 1, 2] },
                    { direction: Direction.UP, indices: [0, 4, 8] },
                ],
            ],
        }])
        expect(horizontal).toEqual([])
        expect(vertical).toEqual([])
    })

    it("extracts special matches from junction branching directional matches (T/F/U Match)", () => {
        const horizontal = [
            { direction: Direction.LEFT, indices: [0, 1, 2] },
            { direction: Direction.LEFT, indices: [4, 5, 6] },
        ]
        const vertical = [{ direction: Direction.UP, indices: [0, 4, 8] }]

        const result = extractSpecialMatches(horizontal, vertical)

        expect(result).toEqual([{
            type: "B",
            matchGroups: [
                [
                    { direction: Direction.LEFT, indices: [0, 1, 2] },
                    { direction: Direction.LEFT, indices: [4, 5, 6] },
                ],
                [{ direction: Direction.UP, indices: [0, 4, 8] }],
            ],
        }])
        expect(horizontal).toEqual([])
        expect(vertical).toEqual([])
    })

    it("extracts a special matches from dependent junction branching directional matches (+/A/O/Q/B Match)", () => {
        const horizontal = [
            { direction: Direction.LEFT, indices: [0, 1, 2] },
            { direction: Direction.LEFT, indices: [4, 5, 6] },
        ]
        const vertical = [
            { direction: Direction.UP, indices: [0, 4, 8] },
            { direction: Direction.UP, indices: [2, 6, 10] },
        ]

        const result = extractSpecialMatches(horizontal, vertical)

        expect(result).toEqual([{
            type: "B",
            matchGroups: [
                [
                    { direction: Direction.LEFT, indices: [4, 5, 6] },
                    { direction: Direction.UP, indices: [2, 6, 10] },
                ],
                [
                    { direction: Direction.LEFT, indices: [0, 1, 2] },
                    { direction: Direction.UP, indices: [0, 4, 8] },
                ],
            ],
        }])
        expect(horizontal).toEqual([])
        expect(vertical).toEqual([])
    })

    it("extracts a special matches from co-dependent blocked directional matches", () => {
        const horizontal = [
            { direction: Direction.LEFT, indices: [0, 1, 2] },
            { direction: Direction.LEFT, indices: [4, 5, 6] },
            { direction: Direction.LEFT, indices: [8, 9, 10] },
        ]
        const vertical = [
            { direction: Direction.UP, indices: [0, 4, 8] },
            { direction: Direction.UP, indices: [1, 5, 9] },
            { direction: Direction.UP, indices: [2, 6, 10] },
        ]

        const result = extractSpecialMatches(horizontal, vertical)

        expect(result).toEqual([{
            type: "B",
            matchGroups: [
                [
                    { direction: Direction.LEFT, indices: [4, 5, 6] },
                    { direction: Direction.LEFT, indices: [8, 9, 10] },
                    { direction: Direction.UP, indices: [1, 5, 9] },
                    { direction: Direction.UP, indices: [2, 6, 10] },
                ],
                [
                    { direction: Direction.LEFT, indices: [0, 1, 2] },
                    { direction: Direction.UP, indices: [0, 4, 8] },
                ],
            ],
        }])
        expect(horizontal).toEqual([])
        expect(vertical).toEqual([])
    })

    it("handles multiple direction matches (hypothetical)", () => {
        const left = [{ direction: Direction.LEFT, indices: [0, 1, 2] }]
        const up = [{ direction: Direction.UP, indices: [0, 4, 8] }]
        const right = [{ direction: Direction.RIGHT, indices: [6, 5, 4] }]

        const result = extractSpecialMatches(left, up, right)

        expect(result).toEqual([{
            type: "B",
            matchGroups: [
                [{ direction: Direction.LEFT, indices: [0, 1, 2] }],
                [{ direction: Direction.RIGHT, indices: [6, 5, 4] }],
                [{ direction: Direction.UP, indices: [0, 4, 8] }],
            ],
        }])
        expect(left).toEqual([])
        expect(up).toEqual([])
        expect(right).toEqual([])
    })

    it("handles multiple special matches (L & T Matches)", () => {
        const horizontal = [
            { direction: Direction.LEFT, indices: [0, 1, 2] },
            { direction: Direction.LEFT, indices: [4, 5, 6] },
        ]
        const vertical = [
            { direction: Direction.UP, indices: [1, 9, 17] },
            { direction: Direction.UP, indices: [4, 12, 20] },
        ]

        const result = extractSpecialMatches(horizontal, vertical)

        expect(result).toEqual([
            {
                type: "B",
                matchGroups: [
                    [{ direction: Direction.UP, indices: [1, 9, 17] }],
                    [{ direction: Direction.LEFT, indices: [0, 1, 2] }],
                ],
            },
            {
                type: "B",
                matchGroups: [[
                    { direction: Direction.LEFT, indices: [4, 5, 6] },
                    { direction: Direction.UP, indices: [4, 12, 20] },
                ]],
            },
        ])
        expect(horizontal).toEqual([])
        expect(vertical).toEqual([])
    })

    // FIXME: Flaky test
    it("returns no special matches for non-intersecting match groups", () => {
        const directionalMatches = [
            [{ direction: Direction.LEFT, indices: [0, 1, 2] }],
            [{ direction: Direction.UP, indices: [8, 9, 10] }],
        ]

        const result = extractSpecialMatches(directionalMatches[0], directionalMatches[1])

        expect(result).toEqual([])

        expect(directionalMatches).toEqual([
            [{ direction: Direction.LEFT, indices: [0, 1, 2] }],
            [{ direction: Direction.UP, indices: [8, 9, 10] }],
        ])
    })

    it("handles combination of special and directional matches", () => {
        const horizontal = [
            { direction: Direction.LEFT, indices: [0, 1, 2] },
            { direction: Direction.LEFT, indices: [4, 5, 6] },
        ]
        const vertical = [
            { direction: Direction.UP, indices: [1, 9, 17] },
        ]

        const result = extractSpecialMatches(horizontal, vertical)

        expect(result).toEqual([{
            type: "B",
            matchGroups: [
                [{ direction: Direction.UP, indices: [1, 9, 17] }],
                [{ direction: Direction.LEFT, indices: [0, 1, 2] }],
            ],
        }])

        expect(horizontal).toEqual([{ direction: Direction.LEFT, indices: [4, 5, 6] }])
        expect(vertical).toEqual([])
    })
})
