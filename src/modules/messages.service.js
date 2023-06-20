export class MessagesService {
  sendMessage(message) {
    process.stdout.write(message + "\n");
  }
}
