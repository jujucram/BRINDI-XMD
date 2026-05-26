const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const sharp = require('sharp');

async function toimageCommand(sock, chatId, replyMessage, message) {
    if (!replyMessage?.stickerMessage) {
        return await sock.sendMessage(chatId, {
            text: `🖼️ *Sticker → Image*\n\n💡 *Usage :* Réponds à un *sticker* avec *.toimage*\n> BRINDI-XMD`,
        }, { quoted: message });
    }

    try {
        await sock.sendMessage(chatId, { text: `⏳ _Conversion en cours..._\n> BRINDI-XMD` }, { quoted: message });

        const stream = await downloadContentFromMessage(replyMessage.stickerMessage, 'sticker');
        let buf = Buffer.from([]);
        for await (const chunk of stream) buf = Buffer.concat([buf, chunk]);

        // Convertir WebP → PNG
        const pngBuffer = await sharp(buf).png().toBuffer();

        await sock.sendMessage(chatId, {
            image: pngBuffer,
            caption: `🖼️ *STICKER → IMAGE*\n\n✅ *Conversion réussie !*\n> BRINDI-XMD`,
            
        }, { quoted: message });

    } catch (e) {
        console.error('❌ [toimage]', e.message);
        await sock.sendMessage(chatId, {
            text: `❌ *Erreur lors de la conversion.*\n_Assurez-vous de répondre à un sticker valide._\n> BRINDI-XMD`,
            
        }, { quoted: message });
    }
}

module.exports = toimageCommand;
