import process from "node:process";
import {MessagesService} from "./messages.service.js";

const COMMANDS = {
    cd: () => {
    },
    up: () => {
    },
    ls: () => {
    },
    cat: () => {
    },
    add: () => {
    },
    rn: () => {
    },
    cp: () => {
    },
    mv: () => {
    },
    rm: () => {
    },
    os: () => {
    },
    hash: () => {
    },
    compress: () => {
    },
    decompress: () => {
    }
}

export class EventsModule {
    constructor(userName) {
        this.userName = userName
        this.messageService = new MessagesService()
    }

    setUpListeners() {
        this._handleIncomingMessages()
        this._handleExit()
    }

    _handleIncomingMessages() {
        process.stdin.on('data', (data) => {
            const command = data.toString().trim().split(' ')[0]
            try {
                COMMANDS[command](data)
            } catch (e) {
                this.messageService.sendMessage('Invalid input')
            }
        })
    }

    _handleExit() {
        const byeMessage = `\nThank you for using File Manager, ${this.userName}, goodbye!`
        process.on('SIGINT', () => {
            this.messageService.sendMessage(byeMessage)
            process.exit(0)
        })
    }
}