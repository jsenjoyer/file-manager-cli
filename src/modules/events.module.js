import process from "node:process";
import {MessagesService} from "./messages.service.js";

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
            console.log('data')
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