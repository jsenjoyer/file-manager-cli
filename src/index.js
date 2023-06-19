import process from 'node:process';
import {getUsernameFromArgs} from './utils/index.js'
import {EventsModule} from "./modules/events.module.js";

class App {
    constructor() {
        this.userName = getUsernameFromArgs()
        this.eventHandler = new EventsModule(this.userName)

        this.eventHandler.setUpListeners()
    }

    welcomeUser() {
        const welcomeMessage = `Welcome to the File Manager, ${this.userName}!`
        this._sendMessageToConsole(welcomeMessage)
    }

    _sendMessageToConsole(message) {
        process.stdout.write(message + '\n')
    }
}

const app = new App()
app.welcomeUser()