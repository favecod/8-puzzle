const COLUMNS = 3

class Board {
    constructor(cols) {
        this.cols = cols
        this.shuffleSalt = 6
        this.init()
    }

    init = () => {
        this.labels = ['DOWN', 'UP', 'LEFT', 'RIGHT']
        this.history = new Array(0)
        this.feedContainer()
        this.goal = this.getNumbers().sort()
        this.ai = new AI(this.goal)
        this.shuffle()
        this.listener()
        this.showBlocks()
        let timer = setInterval(() => {
            this.container = this.movement(this.ai.heuristic(this.makeStates()).label, true, this.container)
            this.showBlocks()
            if (this.isEqual(this.goal, this.getNumbers())) {
                clearInterval(timer)
            }
        }, 1000)
    }

    feedContainer = (start = 1, end = Math.pow(this.cols, 2)) => {
        this.container = new Array(0)
        for (let i = start; i <= end; i++) {
            this.container.push(new Block(i != end ? i : '_'))
        }
    }

    shuffle = (salt = this.shuffleSalt) => {
        const LABELS = ['DOWN', 'UP', 'LEFT', 'RIGHT']

        for (let i = 0; i < Math.pow(salt, 2); i++) {
            let index = Math.floor(Math.random() * LABELS.length)
            this.container = this.movement(LABELS[index], false, this.container)
        }
        this.showBlocks()
    }

    showBlocks = () => {
        let blocks = document.querySelector('.blocks')
        blocks.innerHTML = ''
        this.container.map(block => {
            let span = document.createElement('span')
            span.innerHTML = block.value
            span.style.width = `${100 / this.cols}%`
            blocks.appendChild(span)
        })
        blocks.style.backgroundColor = this.isEqual(this.goal, this.getNumbers()) ? 'lightgreen' : 'white'
    }

    isEqual = (a, b) => {
        let flag = true
        for (let i in a) {
            if (a[i] !== b[i]) {
                flag = false
                break
            }
        }
        return flag
    }

    getNumbers = (container = this.container) => {
        let array = new Array(0)
        container.map(block => {
            array.push(block.value)
        })
        return array
    }

    findBlankBlock = () => {
        let array = this.getNumbers()
        return array.indexOf('_')
    }

    listener = () => {
        addEventListener('keyup', key => {
            switch (key.code) {
                case 'ArrowDown':
                    this.container = this.movement('DOWN', true, this.container)
                    break
                case 'ArrowUp':
                    this.container = this.movement('UP', true, this.container)
                    break
                case 'ArrowLeft':
                    this.container = this.movement('LEFT', true, this.container)
                    break
                case 'ArrowRight':
                    this.container = this.movement('RIGHT', true, this.container)
                    break
                default:
                    return
            }
            this.showBlocks()
        })
    }

    movement = (label, flag = true, array) => {
        let container = new Array(...array)
        if (flag) this.history.push(label)
        let blackIndex = this.findBlankBlock()
        switch (label) {
            case 'DOWN':
                if (blackIndex > this.cols - 1) {
                    let temp = container[blackIndex]
                    container[blackIndex] = container[blackIndex - this.cols]
                    container[blackIndex - this.cols] = temp
                }
                return container
            case 'UP':
                if (blackIndex < Math.pow(this.cols, 2) - this.cols) {
                    let temp = container[blackIndex]
                    container[blackIndex] = container[blackIndex + this.cols]
                    container[blackIndex + this.cols] = temp
                }
                return container
            case 'LEFT':
                if ((blackIndex + 1) % this.cols !== 0) {
                    let temp = container[blackIndex]
                    container[blackIndex] = container[blackIndex + 1]
                    container[blackIndex + 1] = temp
                }
                return container
            case 'RIGHT':
                if (blackIndex % this.cols !== 0) {
                    let temp = container[blackIndex]
                    container[blackIndex] = container[blackIndex - 1]
                    container[blackIndex - 1] = temp
                }
                return container
        }
    }

    getHistory = () => {
        return this.history
    }

    getLastHistory = () => {
        return this.history[this.history.length - 1]
    }

    removeOppositeLable = label => {
        switch (label) {
            case 'DOWN': return 'UP'
            case 'UP': return 'DOWN'
            case 'RIGHT': return 'LEFT'
            case 'LEFT': return 'RIGHT'
        }
    }

    canMove = label => {
        let blankIndex = this.getNumbers().indexOf('_')
        switch (blankIndex) {
            case 0:
                return ['UP', 'LEFT'].includes(label)
            case 1:
                return ['UP', 'LEFT', 'RIGHT'].includes(label)
            case 2:
                return ['UP', 'RIGHT'].includes(label)
            case 3:
                return ['UP', 'LEFT', 'DOWN'].includes(label)
            case 4:
                return ['UP', 'LEFT', 'RIGHT', 'DOWN'].includes(label)
            case 5:
                return ['UP', 'RIGHT', 'DOWN'].includes(label)
            case 6:
                return ['DOWN', 'LEFT'].includes(label)
            case 7:
                return ['LEFT', 'RIGHT', 'DOWN'].includes(label)
            case 8:
                return ['DOWN', 'RIGHT'].includes(label)
        }
    }

    makeStates = () => {
        let states = new Array()
        this.labels.map(label => {
            if (this.removeOppositeLable(this.getLastHistory()) !== label && this.canMove(label)) {
                states.push({
                    label,
                    data: this.getNumbers(this.movement(label, false, this.container))
                })
            }
        })
        return states
    }

}

class Block {
    constructor(value) {
        this.value = value
    }
}

class AI {
    constructor(goal) {
        this.goal = goal
    }

    heuristic = states => {
        let minState = {
            label: null,
            data: null,
            score: Infinity
        }
        let minStates = new Array()
        states.map(state => {
            state.score = this.calcFit(state.data)
            if (state.score < minState.score) {
                minState = state
            }
        })

        states.map(state => {
            if (state.score === minState.score) {
                minStates.push(state)
            }
        })

        if (minStates.length > 1) {
            let index = Math.floor(Math.random() * minStates.length)
            minState = minStates[index]
        }

        return minState
    }

    calcFit = array => {
        let f = 0
        for (let i in array) {
            if (Number.isInteger(array[i]) && array[i] !== this.goal[i]) {
                f++
            }
        }
        return f
    }

}

new Board(COLUMNS)