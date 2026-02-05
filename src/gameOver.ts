export const showGameOver = (score: number, moves: number, resetCb: () => void) => {
    const gameOverElement = document.querySelector("buffle-game-over")!

    gameOverElement.score = score
    gameOverElement.moves = moves

    gameOverElement.addEventListener("restart", () => {
        gameOverElement.hide()
        resetCb()
    })

    gameOverElement.show()
}
