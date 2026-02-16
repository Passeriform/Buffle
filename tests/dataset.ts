import type { Direction } from "../src/constants"
import type { SpecialMatchType } from "../src/matcher/specialMatcher"
import { parse } from "./utility"

export const GRID_DIMENSION = [4, 4] as [rows: number, columns: number]

/* eslint-disable id-length -- Disabling pedantic rule as data is only used for testing */

export const SHAPES = {
    L: parse(GRID_DIMENSION[0])`
#
#
###

`,
    L_ALT: parse(GRID_DIMENSION[0])`
###
#
#

`,
    T: parse(GRID_DIMENSION[0])`
###
 #
 #

`,
    "+": parse(GRID_DIMENSION[0])`
 #
###
 #

`,
    F: parse(GRID_DIMENSION[0])`
###
###
#

`,
    F_ALT: parse(GRID_DIMENSION[0])`
###
##
##

`,
    U: parse(GRID_DIMENSION[0])`
# #
# #
###

`,
    A: parse(GRID_DIMENSION[0])`
###
###
# #

`,
    O: parse(GRID_DIMENSION[0])`
###
# #
###

`,
    Q: parse(GRID_DIMENSION[0])`
###
###
##

`,
    B: parse(GRID_DIMENSION[0])`
###
###
###

`,
} as const satisfies Partial<Record<SpecialMatchType | `${SpecialMatchType}_ALT`, number[]>>

/* eslint-enable id-length */

export const BOUNDARY_CHECK_SHAPES = {
    ROW: parse(GRID_DIMENSION[0])`

 ###
###

`,
    COLUMN: parse(GRID_DIMENSION[0])`
  #
 ##
 ##
 #
`,
}

export const SHAPE_DIRECTIONAL_MATCH_TEST_CASES = [
    ["L", "UP", [[0, 4, 8]]],
    ["L", "RIGHT", [[10, 9, 8]]],
    ["L", "DOWN", [[8, 4, 0]]],
    ["L", "LEFT", [[8, 9, 10]]],

    ["L_ALT", "UP", [[0, 4, 8]]],
    ["L_ALT", "RIGHT", [[2, 1, 0]]],
    ["L_ALT", "DOWN", [[8, 4, 0]]],
    ["L_ALT", "LEFT", [[0, 1, 2]]],

    ["T", "UP", [[1, 5, 9]]],
    ["T", "RIGHT", [[2, 1, 0]]],
    ["T", "DOWN", [[9, 5, 1]]],
    ["T", "LEFT", [[0, 1, 2]]],

    ["+", "UP", [[1, 5, 9]]],
    ["+", "RIGHT", [[6, 5, 4]]],
    ["+", "DOWN", [[9, 5, 1]]],
    ["+", "LEFT", [[4, 5, 6]]],

    ["F", "UP", [[0, 4, 8]]],
    ["F", "RIGHT", [[2, 1, 0], [6, 5, 4]]],
    ["F", "DOWN", [[8, 4, 0]]],
    ["F", "LEFT", [[0, 1, 2], [4, 5, 6]]],

    ["F_ALT", "UP", [[0, 4, 8], [1, 5, 9]]],
    ["F_ALT", "RIGHT", [[2, 1, 0]]],
    ["F_ALT", "DOWN", [[8, 4, 0], [9, 5, 1]]],
    ["F_ALT", "LEFT", [[0, 1, 2]]],

    ["U", "UP", [[0, 4, 8], [2, 6, 10]]],
    ["U", "RIGHT", [[10, 9, 8]]],
    ["U", "DOWN", [[8, 4, 0], [10, 6, 2]]],
    ["U", "LEFT", [[8, 9, 10]]],

    ["A", "UP", [[0, 4, 8], [2, 6, 10]]],
    ["A", "RIGHT", [[2, 1, 0], [6, 5, 4]]],
    ["A", "DOWN", [[8, 4, 0], [10, 6, 2]]],
    ["A", "LEFT", [[0, 1, 2], [4, 5, 6]]],

    ["O", "UP", [[0, 4, 8], [2, 6, 10]]],
    ["O", "RIGHT", [[2, 1, 0], [10, 9, 8]]],
    ["O", "DOWN", [[8, 4, 0], [10, 6, 2]]],
    ["O", "LEFT", [[0, 1, 2], [8, 9, 10]]],

    ["Q", "UP", [[0, 4, 8], [1, 5, 9]]],
    ["Q", "RIGHT", [[2, 1, 0], [6, 5, 4]]],
    ["Q", "DOWN", [[8, 4, 0], [9, 5, 1]]],
    ["Q", "LEFT", [[0, 1, 2], [4, 5, 6]]],

    ["B", "UP", [[0, 4, 8], [1, 5, 9], [2, 6, 10]]],
    ["B", "RIGHT", [[2, 1, 0], [6, 5, 4], [10, 9, 8]]],
    ["B", "DOWN", [[8, 4, 0], [9, 5, 1], [10, 6, 2]]],
    ["B", "LEFT", [[0, 1, 2], [4, 5, 6], [8, 9, 10]]],
] as const satisfies readonly [keyof typeof SHAPES, keyof typeof Direction, number[][]][]
