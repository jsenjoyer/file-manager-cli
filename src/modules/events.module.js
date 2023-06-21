import process from "node:process";
import { MessagesService } from "./messages.service.js";
import readline from "readline";
import path from "path";
import os from "os";
import fs from "fs/promises";
import { createReadStream, createWriteStream } from "fs";
import { sortFiles } from "../utils/index.js";

const COMMANDS = {
  cd: (args) => {
    const [newPath] = args;
    try {
      process.chdir(newPath);
    } catch (e) {
      console.log("Invalid input");
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
  cat: async (args) => {
    let pathToFile;
    try {
      pathToFile = args[0];
    } catch (e) {
      console.log("Invalid input");
    }

    const readStream = createReadStream(pathToFile);

    readStream.on("data", (chunk) => {
      console.log(chunk.toString());
    });
    readStream.on("error", () => {
      console.log("Operation failed");
    });
  },
  add: async (args) => {
    const fileName = args[0];
    if (!fileName) {
      console.log("Invalid input");
      return;
    }

    try {
      await fs.writeFile(fileName, "", { flag: "wx" });
    } catch (e) {
      console.log("Operation failed");
    }
  },
  rn: async (args) => {
    const [pathToOldFile, newFileName] = args;

    if (!pathToOldFile || !newFileName) {
      console.log("Invalid input");
      return;
    }

    const pathToDir = path.dirname(pathToOldFile);
    const newFilePath = path.join(pathToDir, newFileName);

    try {
      await fs.rename(pathToOldFile, newFilePath);
    } catch (e) {
      console.log("Operation failed");
    }
  },
  //@Todo check cp functionality
  cp: (args) => {
    const [pathToOldFile, pathToNewDirectory] = args;
    if (!pathToOldFile || !pathToNewDirectory) {
      console.log("Invalid input");
      return;
    }

    const fileName = path.basename(pathToOldFile);
    const readStream = createReadStream(pathToOldFile);
    const writeStream = createWriteStream(
      path.join(pathToNewDirectory, fileName)
    );
    readStream.pipe(writeStream);
    readStream.on("error", () => {
      console.log("Operation failed");
    });
    writeStream.on("error", () => {
      console.log("Operation failed");
    });
  },
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
    this.rl.on("line", async (inputString) => {
      const [userCommand, ...args] = inputString.trim().split(" ");
      try {
        await COMMANDS[userCommand](args);
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
