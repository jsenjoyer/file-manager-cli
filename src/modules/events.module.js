import process from "node:process";
import { MessagesService } from "./messages.service.js";
import readline from "readline";
import path from "path";
import os from "os";
import fs from "fs/promises";
import { sortFiles } from "../utils/index.js";

const COMMANDS = {
  cd: (args) => {
    const [newPath] = args;
    try {
      process.chdir(newPath);
    } catch (e) {
      console.log("Invalid path");
    }
  },
  //@Todo add handlers to prevent user from going outside of the root directory
  //@Todo change /n to os.EOL
  //@Todo чекнуть какую ошибку выдавать после невозможности использования  up()
  up: () => {
    try {
      const currentDirectory = process.cwd();
      const newDirectory = path.resolve(currentDirectory, "..");

      if (!newDirectory.startsWith(os.homedir())) {
        console.log("You can't go outside of the root directory");
      }

      process.chdir("..");
    } catch (error) {
      console.error(error.message);
    }
  },
  ls: async () => {
    try {
      const files = await fs.readdir(process.cwd(), { withFileTypes: true });
      const sortedFiles = sortFiles(files);
      console.table(sortedFiles, ["name", "type"]);
    } catch (e) {}
  },
  cat: () => {},
  add: () => {},
  rn: () => {},
  cp: () => {},
  mv: () => {},
  rm: () => {},
  os: () => {},
  hash: () => {},
  compress: () => {},
  decompress: () => {},
};

export class EventsModule {
  constructor(userName) {
    this.userName = userName;
    this.messageService = new MessagesService();
    this.rl = readline.createInterface({
      input: process.stdin,
    });
  }

  setUpListeners() {
    this._handleIncomingMessages();
    this._handleExit();
  }

  _handleIncomingMessages() {
    this.rl.on("line", (inputString) => {
      const [userCommand, ...args] = inputString.trim().split(" ");
      try {
        COMMANDS[userCommand](args);
        this.messageService.sendMessage(
          `You are currently in ${process.cwd()}`
        );
      } catch (e) {
        this.messageService.sendMessage("Invalid input");
      }
    });
  }

  _handleExit() {
    const byeMessage = `\nThank you for using File Manager, ${this.userName}, goodbye!`;
    process.on("SIGINT", () => {
      this.messageService.sendMessage(byeMessage);
      process.exit(0);
    });
  }
}
