import type { Block } from "./gui/block"
import { AnimationManager, Easing, Tween } from "./animation"
import { SparseMatrix } from "./utility/sparseMatrix"

type Config = {
    gameSpeed: number
    dimensions: [rows: number, columns: number]
    tweens: {
        move: Tween
        merge: Tween
        upgrade: Tween
        spawn: Tween
    }
}

type RunningState = {
    moves: number
    score: number
    isGameOver: boolean
    readonly blockMap: SparseMatrix<Block>
    // TODO: Make this static
    readonly animationManager: AnimationManager
}

export class State extends EventTarget {
    private readonly config: Config
    private state: RunningState

    constructor(config: Pick<Config, "gameSpeed" | "dimensions">) {
        super()
        this.config = {
            tweens: {
                move: new Tween(200 / config.gameSpeed, Easing.EASE_IN_OUT),
                merge: new Tween(300 / config.gameSpeed, Easing.EASE_IN_OUT),
                upgrade: new Tween(300 / config.gameSpeed, Easing.LINEAR),
                spawn: new Tween(200 / config.gameSpeed, Easing.EASE_IN_OUT),
            },
            ...config,
        }
        this.state = {
            moves: 0,
            score: 0,
            isGameOver: false,
            blockMap: new SparseMatrix<Block>([], config.dimensions),
            animationManager: new AnimationManager(),
        }
    }

    get tweens() {
        return this.config.tweens
    }

    get dimensions() {
        return this.config.dimensions
    }

    get blockMap() {
        return this.state.blockMap
    }

    get animationManager() {
        return this.state.animationManager
    }

    get score() {
        return this.state.score
    }

    set score(score: number) {
        this.state.score = score
        this.dispatchEvent(new CustomEvent("stats:update"))
    }

    get moves() {
        return this.state.moves
    }

    set moves(moves: number) {
        this.state.moves = moves
        this.dispatchEvent(new CustomEvent("stats:update"))
    }

    get isGameOver() {
        return this.state.isGameOver
    }

    start() {
        this.dispatchEvent(new CustomEvent("game:start"))
    }

    end() {
        this.state.isGameOver = true
        this.dispatchEvent(new CustomEvent("game:end"))
    }

    reset() {
        this.state.moves = 0
        this.state.score = 0
        this.state.isGameOver = false
        this.state.blockMap.clear()
        this.dispatchEvent(new CustomEvent("game:reset"))
    }
}
