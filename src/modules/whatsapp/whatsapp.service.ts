import { Injectable } from '@nestjs/common';
import { Boom } from '@hapi/boom'

import makeWASocket, { DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys'

@Injectable()
export class WhatsappService {

  async connectToWhatsApp() {

    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys')

    const sock = makeWASocket({
      printQRInTerminal: true,
      auth: state
    })

    sock.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect } = update
      if (connection === 'close') {
        const shouldReconnect = (lastDisconnect.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut
        console.log('connection closed due to ', lastDisconnect.error, ', reconnecting ', shouldReconnect)
        // reconnect if not logged out
        if (shouldReconnect) {
          this.connectToWhatsApp()
        }
      } else if (connection === 'open') {
        console.log('opened connection')
      }
    })
    sock.ev.on('messages.upsert', async m => {
      console.log(JSON.stringify(m, undefined, 2))

      console.log('replying to', m.messages[0].key.remoteJid)
      await sock.sendMessage(m.messages[0].key.remoteJid!, { text: 'Hello there!' })
    })
  }
}
