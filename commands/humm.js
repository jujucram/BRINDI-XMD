const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

async function hummCommand(sock, chatId, senderId, replyMessage, message) {
    try {
        if (!replyMessage) return;

        const target =
            replyMessage?.viewOnceMessage?.message ||
            replyMessage?.viewOnceMessageV2?.message ||
            replyMessage?.viewOnceMessageV2Extension?.message ||
            replyMessage;

        let mediaType;
        let mediaMsg;

        if (target.imageMessage) {
            mediaType = 'image';
            mediaMsg = target.imageMessage;
        } else if (target.videoMessage) {
            mediaType = 'video';
            mediaMsg = target.videoMessage;
        } else if (target.audioMessage) {
            mediaType = 'audio';
            mediaMsg = target.audioMessage;
        } else {
            return;
        }

        const stream = await downloadContentFromMessage(
            mediaMsg,
            mediaType
        );

        let buffer = Buffer.alloc(0);

        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        if (mediaType === 'image') {
            await sock.sendMessage(senderId, {
                image: buffer,
                caption: '🥷🏾 BRINDI-XMD'
            });
        }

        if (mediaType === 'video') {
            await sock.sendMessage(senderId, {
                video: buffer,
                caption: '🥷🏾 BRINDI-XMD'
            });
        }

        if (mediaType === 'audio') {
            await sock.sendMessage(senderId, {
                audio: buffer,
                mimetype: mediaMsg.mimetype || 'audio/mp4',
                ptt: mediaMsg.ptt || false
            });
        }

        // Supprime la commande .humm
        try {
            await sock.sendMessage(chatId, {
                delete: message.key
            });
        } catch {}

    } catch (err) {
        console.error('[HUMM ERROR]', err);
    }
}

module.exports = hummCommand;
