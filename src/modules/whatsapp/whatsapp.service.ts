import { Injectable } from '@nestjs/common';
import { Boom } from '@hapi/boom'

import { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import { WhatsappGateway } from './whatsapp.gateway';
@Injectable()
export class WhatsappService {
  private sock;

  constructor(private readonly whatsappGateway: WhatsappGateway) { }
  async connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('./auth_data');
    const { version, isLatest } = await fetchLatestBaileysVersion()
    this.sock = makeWASocket({
      auth: state,
      printQRInTerminal: true,
    });

    this.sock.ev.on('creds.update', saveCreds);

    this.sock.ev.on('messages.upsert', (message) => {
      console.log('New message received:', message);
      // Emitir el mensaje a los clientes conectados
      this.whatsappGateway.sendMessageToClients(message);
    });

  }

  async sendMessage(jid: string, message: string) {
    try {
      await this.sock.sendMessage(jid, { text: message });
      console.log(`Message sent to ${jid}`);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

}
