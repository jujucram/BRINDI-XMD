const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const webp = require('node-webpmux');
const crypto = require('crypto');
const settings = require('../settings');



async function takeCommand(sock, chatId, senderId, args, message) {
    const replyMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

    if (!replyMsg?.stickerMessage) {
        return await sock.sendMessage(chatId, {
            image: { url: './assets/IMG-20240812-WA0097.jpg' },
            caption: `🧩 *MODIFIER STICKER*

💡 *Usage :* Réponds à un *sticker* avec :
│ ⬡ .take → Nom par défaut
│ ⬡ .take <packname> → Nom personnalisé
│ ⬡ .take <pack} | <auteur>

📌 *Exemples :*
│ .take MonPack
│ .take MonPack | Brandon

> BRINDI-XMD`,
        }, { quoted: message });
    }

    // Parsing packname et auteur
    const input = args.join(' ');
    const parts = input.split('|');
    const packname = parts[0]?.trim() || settings.packname || 'BRINDI-XMD';
    const author = parts[1]?.trim() || settings.author || 'Brandon';

    try {
        await sock.sendMessage(chatId, { text: `⏳ _Modification du sticker en cours..._\n> BRINDI-XMD` }, { quoted: message });

        // Télécharger le sticker
        const stream = await downloadContentFromMessage(replyMsg.stickerMessage, 'sticker');
        let buf = Buffer.from([]);
        for await (const chunk of stream) buf = Buffer.concat([buf, chunk]);

        // Modifier les métadonnées EXIF
        const img = new webp.Image();
        await img.load(buf);

        const json = {
            'sticker-pack-id': crypto.randomBytes(32).toString('hex'),
            'sticker-pack-name': packname,
            'sticker-pack-publisher': author,
            'emojis': ['🥷']
        };

        const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00,
            0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
        const jsonBuf = Buffer.from(JSON.stringify(json), 'utf8');
        const exif = Buffer.concat([exifAttr, jsonBuf]);
        exif.writeUIntLE(jsonBuf.length, 14, 4);

        img.exif = exif;
        const finalBuf = await img.save(null);

        // Envoi direct du sticker sans message de confirmation après réussite
        return await sock.sendMessage(chatId, {
            sticker: finalBuf,
            
        }, { quoted: message });

    } catch (e) {
        console.error('❌ [take]', e.message);
        await sock.sendMessage(chatId, {
            text: `❌ *Erreur lors de la modification du sticker.*\n_Assurez-vous de répondre à un sticker valide._\n> BRINDI-XMD`,
            
        }, { quoted: message });
    }
}

module.exports = takeCommand;

