import process from "node:process";
import { MessagesService } from "./messages.service.js";
import readline from "readline";
import path from "path";
import os from "os";
import fs from "fs/promises";
import { createReadStream, createWriteStream } from "fs";
import { sortFiles } from "../utils/index.js";
import { createHash } from "crypto";
import zlib from "zlib";

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
  mv: (args) => {
    //@Todo check mv functionality fully
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
    writeStream.on("close", async () => {
      await fs.rm(pathToOldFile);
    });
  },
  rm: async (args) => {
    const [pathToFile] = args;
    if (!pathToFile) {
      console.log("Invalid input");
      return;
    }
    try {
      await fs.rm(pathToFile);
    } catch (e) {
      console.log("Operation failed");
    }
  },
  os: (args) => {
    const osArgs = {
      "--EOL": () => {
        const eol = JSON.stringify(os.EOL);
        const msg = `Current EOL: ${eol}`;

        console.log(msg);
      },
      "--cpus": () => {
        const cpus = os.cpus();
        const cpusCount = cpus.length;
        const msg = `Count of CPUs: ${cpusCount}`;

        console.log(msg);

        cpus.forEach((cpu, index) => {
          const cpuModel = cpu.model;
          const cpuSpeed = cpu.speed / 1000;
          const msg = `CPU:${++index}, CPU model: ${cpuModel}, CPU speed: ${cpuSpeed} GHz`;
          console.log(msg);
        });
      },
      "--homedir": () => {
        const homeDir = os.homedir();
        const msg = `Current home directory: ${homeDir}`;

        console.log(msg);
      },
      "--username": () => {
        const userName = os.userInfo().username;
        const msg = `Current user name: ${userName}`;

        console.log(msg);
      },
      "--architecture": () => {
        const arch = os.arch();
        const msg = `Current architecture: ${arch}`;

        console.log(msg);
      },
    };
    const [currentArg] = args;
    if (!currentArg) {
      console.log("Invalid input");
      return;
    }
    try {
      osArgs[currentArg]();
    } catch (e) {
      console.log("Operation failed");
    }
  },
  hash: async (args) => {
    const [pathToFile] = args;
    if (!pathToFile) {
      console.log("Invalid input");
      return;
    }
    try {
      const fileData = await fs.readFile(pathToFile);
      const hash = createHash("sha256").update(fileData).digest("hex");
      const msg = `Hash of file ${pathToFile} is ${hash}`;
      console.log(msg);
    } catch (e) {
      console.log("Operation failed");
    }
  },
  //@Todo check compress functionality
  compress: (args) => {
    const [pathToFile, pathToDestination] = args;
    console.log(pathToFile, pathToDestination, args);
    if (!pathToFile || !pathToDestination) {
      console.log("Invalid input");
      return;
    }
    const readStream = createReadStream(pathToFile);
    const compressStream = zlib.createBrotliCompress();
    const fileName = path.basename(pathToFile);
    console.log(path.join(pathToDestination, fileName, ".br"));
    const writeStream = createWriteStream(
      path.join(pathToDestination, `${fileName}.br`)
    );
    console.log(fileName);

    readStream.pipe(compressStream).pipe(writeStream);
    readStream.on("error", () => {
      console.log("read");
      console.log("Operation failed");
    });
    writeStream.on("error", () => {
      console.log("write");
      console.log("Operation failed");
    });
    compressStream.on("error", () => {
      console.log("compress");
      console.log("Operation failed");
    });
  },
  //@Todo check decompress functionality
  decompress: (args) => {
    const [pathToFile, pathToDestination] = args;
    if (!pathToFile || !pathToDestination) {
      console.log("Invalid input");
      return;
    }
    const readStream = createReadStream(pathToFile);
    const decompressStream = zlib.createBrotliDecompress();
    const writeStream = createWriteStream(pathToDestination);
    readStream.pipe(decompressStream).pipe(writeStream);
    readStream.on("error", () => {
      console.log("read");
      console.log("Operation failed");
    });
    writeStream.on("error", () => {
      console.log("write");
      console.log("Operation failed");
    });
    decompressStream.on("error", () => {
      console.log("compress");
      console.log("Operation failed");
    });
  },
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
