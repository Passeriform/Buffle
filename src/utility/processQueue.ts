type Task<T> = () => T | Promise<T>

export class ProcessQueue<T = unknown> {
    private queue: Task<T>[] = []
    private results: T[] = []
    private running = false
    private cancelled = false
    private wakeProcessing?: () => void

    addTask(...tasks: Task<T>[]) {
        if (this.cancelled) {
            throw Error("A task cannot be added on a cancelled queue.")
        }

        this.queue.push(...tasks)
        this.wakeProcessing?.()
    }

    peekResults() {
        return this.results
    }

    async run() {
        if (this.running) {
            throw new Error("Queue is already being processed.")
        }

        this.running = true

        const loop = async () => {
            while (!this.cancelled) {
                if (!this.queue.length) {
                    await new Promise<void>((resolve) => {
                        this.wakeProcessing = () => {
                            this.wakeProcessing = undefined
                            resolve()
                        }
                    })

                    continue
                }

                this.results.push(await this.queue.shift()!())
            }
        }

        loop()

        const cancel = async () => {
            this.cancelled = true
            this.wakeProcessing?.()
            return this.results
        }

        return cancel
    }
}