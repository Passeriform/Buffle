const getElements = () => {
    const gameOverModal = document.getElementById("gameover")
    const scoreText = document.getElementById("score")
    const movesText = document.getElementById("moves")
    const retryText = document.getElementById("retry") as HTMLLinkElement

    if (!gameOverModal || !scoreText || !movesText || !retryText) {
        throw Error("Can't show game over screen. Modal, score, moves or retryText element not available")
    }

    return { gameOverModal, scoreText, movesText, retryText }
}

export const showGameOver = (score: number, moves: number, resetCb: () => void) => {
    const { gameOverModal, scoreText, movesText, retryText } = getElements()

    scoreText.innerHTML = `${score}`
    movesText.innerHTML = `${moves}`

    gameOverModal.classList.remove("hidden")

    const reset = () => {
        resetCb()
        gameOverModal.classList.add("hidden")
    }

    window.addEventListener("keydown", (e) => {
        if (["r", "R"].includes(e.key)) {
            reset()
        }
    })

    retryText.onclick = reset
}
