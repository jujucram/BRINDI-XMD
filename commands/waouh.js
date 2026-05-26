
// Sauvegarde discrete image/video et envoie a l'owner
const fs = require('fs');
const path = require('path');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const settings = require('../settings');

async function waouhCommand(sock, chatId, senderId, replyMessage, message) {
    try {
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quoted) return;

        const OWNER_JID = (settings.ownerNumber || '237673355468') + '@s.whatsapp.net';

        let mediaType, mediaMsg, extension;

        if (quoted.imageMessage) {
            mediaType = 'image';
            mediaMsg = quoted.imageMessage;
            extension = 'jpg';
        } else if (quoted.videoMessage) {
            mediaType = 'video';
            mediaMsg = quoted.videoMessage;
            extension = 'mp4';
        } else {
            return;
        }

        // Créer dossier saved_media
        const saveDir = path.join(__dirname, '../saved_media', mediaType);
        if (!fs.existsSync(saveDir)) fs.mkdirSync(saveDir, { recursive: true });

        // Télécharger le média
        const stream = await downloadContentFromMessage(mediaMsg, mediaType);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        // Sauvegarder en local
        const fileName = `${mediaType}_${Date.now()}.${extension}`;
        const filePath = path.join(saveDir, fileName);
        fs.writeFileSync(filePath, buffer);

        // Envoyer en privé à l'owner
        await sock.sendMessage(OWNER_JID, {
            [mediaType]: buffer,
            caption: `🕵️ ${mediaType === 'image' ? 'Image' : 'Video'} capturee discretement\n\n| powered by Brandon`
        });

        // Réaction discrete dans le chat
        await sock.sendMessage(chatId, {
            react: { text: '', key: message.key }
        });

    } catch (err) {
        console.error('❌ Erreur waouh:', err.message);
    }
}

module.exports = waouhCommand;
