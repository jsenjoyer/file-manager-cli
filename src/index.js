import process from "node:process";
import { getUsernameFromArgs } from "./utils/index.js";
import { EventsModule } from "./modules/events.module.js";
import os from "os";

class App {
  constructor() {
    this.userName = getUsernameFromArgs();
    this.eventHandler = new EventsModule(this.userName);
  }

  appInit() {
    this._setInitialPath();
    this._welcomeUser();
    this.eventHandler.setUpListeners();
  }

  _welcomeUser() {
    const welcomeMessage = `Welcome to the File Manager, ${this.userName}!`;
    const currentPath = process.cwd();
    const pathMessage = `You are currently in ${currentPath}`;

    console.log(welcomeMessage);
    console.log(pathMessage);
  }

  _setInitialPath() {
    const initPath = os.homedir();
    try {
      process.chdir(initPath);
    } catch (e) {
      throw new Error("Whooops");
    }
  }
}

const app = new App();
app.appInit();
