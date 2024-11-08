import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class WhatsappGateway {
  @WebSocketServer()
  public server: Server;
  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    return 'Hello world!';
  }

  onModuleInit() {
    this.server.on('connection', (socket: Socket) => {
      console.log('cliente conectado', socket.id);

      socket.on('disconnect', () => {
        console.log('cliente desconectado', socket.id);
      });
    });
  }

  sendMessageToClients(message: any) {
    this.server.emit('new_message', message);
  }
}
