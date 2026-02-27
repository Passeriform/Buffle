import { AnimationManager, Easing, Tween } from "./animation"
import { Block } from "./gui/block"
import { Container } from "./gui/container"
import { Text } from "./gui/text"
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
    widgets: {
        board: Container
        placeholder: Container
        block: Block
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
            widgets: {
                board: new Container({
                    background: "#6b3c33",
                    padding: "2%",
                    rounding: "4%",
                }),
                placeholder: new Container({
                    background: "#5a2f28",
                    rounding: "20%",
                }),
                block: new Block(0, {
                    padding: "20%",
                    rounding: "20%",
                    pallette: "COFFEE",
                    displaySet: "NUMBERS",
                    textWidget: new Text({
                        color: "#6a4537",
                    }),
                }),
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

    /* eslint-disable-next-line accessor-pairs -- Re-exposed convenience utility to update pallette */
    set blockPallette(pallette: keyof typeof Block.PALLETTES) {
        this.config.widgets.block.pallette = pallette
        this.blockMap.forEach((block) => {
            block.pallette = pallette
        })
    }

    /* eslint-disable-next-line accessor-pairs -- Re-exposed convenience utility to update pallette */
    set blockDisplaySet(displaySet: keyof typeof Block.DISPLAY_SETS) {
        this.config.widgets.block.displaySet = displaySet
        this.blockMap.forEach((block) => {
            block.displaySet = displaySet
        })
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

    getWidget<K extends keyof Config["widgets"]>(name: K) {
        return this.config.widgets[name]
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
