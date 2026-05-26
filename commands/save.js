const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');


async function saveCommand(sock, chatId, senderId, replyMessage, message) {
    if (!replyMessage) {
        return await sock.sendMessage(chatId, {
            text: `💾 *Sauvegarder un message*\n\n💡 *Usage :* Réponds à un message avec *.save*\n_Fonctionne avec : texte, image, vidéo, audio, sticker_\n> BRINDI-XMD`,
            
        }, { quoted: message });
    }

    try {
        // Texte
        if (replyMessage.conversation || replyMessage.extendedTextMessage) {
            const text = replyMessage.conversation || replyMessage.extendedTextMessage?.text;
            await sock.sendMessage(senderId, {
                text: `💾 *MESSAGE SAUVÉ*\n\n📝 *Contenu :*\n${text}\n> BRINDI-XMD`,
                
            });
            return await sock.sendMessage(chatId, {
                text: `✅ *Message texte sauvegardé !*\n_Envoyé dans votre MP._\n> BRINDI-XMD`,
                
            }, { quoted: message });
        }

        // Image
        if (replyMessage.imageMessage) {
            const stream = await downloadContentFromMessage(replyMessage.imageMessage, 'image');
            let buf = Buffer.from([]);
            for await (const chunk of stream) buf = Buffer.concat([buf, chunk]);
            await sock.sendMessage(senderId, {
                image: buf,
                caption: `💾 *IMAGE SAUVÉE*\n> BRINDI-XMD`,
                
            });
            return await sock.sendMessage(chatId, { text: `✅ *Image sauvegardée dans votre MP !*\n> BRINDI-XMD`, }, { quoted: message });
        }

        // Vidéo
        if (replyMessage.videoMessage) {
            const stream = await downloadContentFromMessage(replyMessage.videoMessage, 'video');
            let buf = Buffer.from([]);
            for await (const chunk of stream) buf = Buffer.concat([buf, chunk]);
            await sock.sendMessage(senderId, {
                video: buf,
                caption: `💾 *VIDÉO SAUVÉE*\n> BRINDI-XMD`,
                
            });
            return await sock.sendMessage(chatId, { text: `✅ *Vidéo sauvegardée dans votre MP !*\n> BRINDI-XMD`,}, { quoted: message });
        }

        // Audio
        if (replyMessage.audioMessage) {
            const stream = await downloadContentFromMessage(replyMessage.audioMessage, 'audio');
            let buf = Buffer.from([]);
            for await (const chunk of stream) buf = Buffer.concat([buf, chunk]);
            await sock.sendMessage(senderId, { audio: buf, mimetype: 'audio/mp4',});
            return await sock.sendMessage(chatId, { text: `✅ *Audio sauvegardé dans votre MP !*\n> BRINDI-XMD`, }, { quoted: message });
        }

        // Sticker
        if (replyMessage.stickerMessage) {
            const stream = await downloadContentFromMessage(replyMessage.stickerMessage, 'sticker');
            let buf = Buffer.from([]);
            for await (const chunk of stream) buf = Buffer.concat([buf, chunk]);
            await sock.sendMessage(senderId, { sticker: buf,});
            return await sock.sendMessage(chatId, { text: `✅ *Sticker sauvegardé dans votre MP !*\n> BRINDI-XMD`,}, { quoted: message });
        }

        await sock.sendMessage(chatId, { text: `❌ *Type de message non supporté.*\n> BRINDI-XMD`,}, { quoted: message });

    } catch (e) {
        console.error('❌ [save]', e.message);
        await sock.sendMessage(chatId, { text: `❌ *Erreur lors de la sauvegarde.*\n> BRINDI-XMD`, }, { quoted: message });
    }
}

module.exports = saveCommand;
