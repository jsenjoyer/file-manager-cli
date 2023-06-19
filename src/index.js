import proccess from 'process'
import {getUsernameFromArgs} from './utils/index.js'

class App {
    constructor() {
        this.userName = getUsernameFromArgs()
        this.handleExit()
    }

    welcomeUser() {
        const welcomeMessage = `Welcome to the File Manager, ${this.userName}!`
        this._sendMessageToConsole(welcomeMessage)
    }

    _sendMessageToConsole(message) {
        proccess.stdout.write(message + '\n')
    }

    handleExit() {
        proccess.on('exit',()=>{
           console.log('exit')
       })
    }
}

const app = new App()
app.welcomeUser()