const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

async function ibCommand(sock, chatId, message) {
    try {
        const quoted =
            message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

        if (!quoted) {
            return await sock.sendMessage(chatId, {
                text: `⚠️ *Répondez à une photo, vidéo ou audio vue unique.*\n\n> BRINDI-XMD`
            }, { quoted: message });
        }

        // Extraction du contenu vue unique
        const innerMsg =
            quoted.viewOnceMessageV2?.message ||
            quoted.viewOnceMessageV2Extension?.message ||
            quoted;

        // 📸 Image
        if (innerMsg.imageMessage) {
            const stream = await downloadContentFromMessage(
                innerMsg.imageMessage,
                'image'
            );

            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            return await sock.sendMessage(chatId, {
                image: buffer,
                caption: `📸 *Vue unique récupérée avec succès !*\n\n> BRINDI-XMD`
            }, { quoted: message });
        }

        // 🎥 Vidéo
        if (innerMsg.videoMessage) {
            const stream = await downloadContentFromMessage(
                innerMsg.videoMessage,
                'video'
            );

            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            return await sock.sendMessage(chatId, {
                video: buffer,
                caption: `🎥 *Vue unique récupérée avec succès !*\n\n> BRINDI-XMD`
            }, { quoted: message });
        }

        // 🎵 Audio
        if (innerMsg.audioMessage) {
            const stream = await downloadContentFromMessage(
                innerMsg.audioMessage,
                'audio'
            );

            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            return await sock.sendMessage(chatId, {
                audio: buffer,
                mimetype: 'audio/mp4',
                ptt: innerMsg.audioMessage.ptt || false
            }, { quoted: message });
        }

        await sock.sendMessage(chatId, {
            text: `❌ *Ce message n'est pas un média vue unique.*\n\n> BRINDI-XMD`
        }, { quoted: message });

    } catch (e) {
        console.error('[VIEWONCE ERROR]', e);

        await sock.sendMessage(chatId, {
            text: `❌ *Erreur :* ${e.message}\n\n> BRINDI-XMD`
        }, { quoted: message });
    }
}

module.exports = ibCommand;
