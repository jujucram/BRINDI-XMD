// dl_status, lecture_status, likestatus, sendme
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');




// ─── DL_STATUS : Télécharger un statut ──────────────────
async function dlStatusCommand(sock, chatId, senderId, replyMessage, message) {
    if (!replyMessage) {
        return await sock.sendMessage(chatId, {
            text: `╔═════════════════════╗\n║   🥷 *BRINDI-𝗫𝗠𝗗-𝐕1* 🥷   ║\n╚═════════════════════╝\n\n📥 *Télécharger un statut*\n\n💡 Réponds à un statut avec *.dl_status*`,
            
        }, { quoted: message });
    }

    try {
        const userJid = senderId.replace(/:\d+@/, '@');

        if (replyMessage.imageMessage) {
            const stream = await downloadContentFromMessage(replyMessage.imageMessage, 'image');
            let buf = Buffer.from([]);
            for await (const chunk of stream) buf = Buffer.concat([buf, chunk]);
            await sock.sendMessage(userJid, { image: buf, caption: `📥 *Statut téléchargé*\n> _BRINDI-XMD v1.0_` });
            return await sock.sendMessage(chatId, { text: `✅ *Statut envoyé dans ton MP !*`, }, { quoted: message });
        }
        if (replyMessage.videoMessage) {
            const stream = await downloadContentFromMessage(replyMessage.videoMessage, 'video');
            let buf = Buffer.from([]);
            for await (const chunk of stream) buf = Buffer.concat([buf, chunk]);
            await sock.sendMessage(userJid, { video: buf, caption: `📥 *Statut téléchargé*\n> _BRINDI-XMD v1.0_` });
            return await sock.sendMessage(chatId, { text: `✅ *Statut vidéo envoyé dans ton MP !*`,}, { quoted: message });
        }
        await sock.sendMessage(chatId, { text: `❌ *Type non supporté.*`,}, { quoted: message });
    } catch (e) {
        await sock.sendMessage(chatId, { text: `❌ *Erreur :* ${e.message}` }, { quoted: message });
    }
}

// ─── LECTURE_STATUS : Marquer statuts comme lus ─────────
async function lectureStatusCommand(sock, chatId, message) {
    try {
        await sock.readMessages([{ remoteJid: 'status@broadcast', id: 'all', participant: undefined }]);
        await sock.sendMessage(chatId, {
            text: `╔═════════════════════╗\n║   🥷 *BRINDI-𝗫𝗠𝗗-𝐕1* 🥷   ║\n╚═════════════════════╝\n\n✅ *Tous les statuts marqués comme lus !*`,
            
        }, { quoted: message });
    } catch (e) {
        await sock.sendMessage(chatId, { text: `❌ *Erreur :* ${e.message}`, }, { quoted: message });
    }
}

// ─── LIKESTATUS : Réagir à un statut ────────────────────
async function likeStatusCommand(sock, chatId, senderId, args, replyMessage, message) {
    const emoji = args[0] || '❤️';
    const validEmojis = ['❤️','🔥','👏','😍','😂','😮','😢','🙏','💯','⚡'];

    if (!replyMessage) {
        return await sock.sendMessage(chatId, {
            text: `╔═════════════════════╗\n║   🥷 *BRINDI-𝗫𝗠𝗗-𝐕1* 🥷   ║\n╚═════════════════════╝\n\n💫 *Réagir à un statut*\n\n💡 *Usage :* *.likestatus <emoji>*\n_Réponds à un statut avec .likestatus ❤️_\n\n😀 *Emojis dispo :*\n${validEmojis.join('  ')}`,
            
        }, { quoted: message });
    }

    try {
        await sock.sendMessage('status@broadcast', {
            react: { text: emoji, key: message.message?.extendedTextMessage?.contextInfo ? { ...message.key, id: message.message.extendedTextMessage.contextInfo.stanzaId } : message.key }
        });
        await sock.sendMessage(chatId, { text: `✅ Réaction *${emoji}* envoyée !`,}, { quoted: message });
    } catch (e) {
        await sock.sendMessage(chatId, { text: `❌ *Erreur :* ${e.message}`,}, { quoted: message });
    }
}

// ─── SENDME : S'envoyer un message à soi-même ───────────
async function sendMeCommand(sock, chatId, senderId, args, replyMessage, message) {
    const userJid = senderId.replace(/:\d+@/, '@');

    if (!replyMessage && args.length === 0) {
        return await sock.sendMessage(chatId, {
            text: `╔═════════════════════╗\n║   🥷 *BRINDI-𝗫𝗠𝗗-𝐕1* 🥷   ║\n╚═════════════════════╝\n\n📨 *S'envoyer un média*\n\n💡 *Usage :*\n┌─────────────────────\n│ ⬡ *.sendme <texte>*\n│ ⬡ Réponds à un média avec *.sendme*\n└─────────────────────`,
            
        }, { quoted: message });
    }

    try {
        if (replyMessage?.imageMessage) {
            const stream = await downloadContentFromMessage(replyMessage.imageMessage, 'image');
            let buf = Buffer.from([]);
            for await (const chunk of stream) buf = Buffer.concat([buf, chunk]);
            await sock.sendMessage(userJid, { image: buf, caption: `📨 *Envoyé depuis BRINDI-XMD*` });
        } else if (replyMessage?.videoMessage) {
            const stream = await downloadContentFromMessage(replyMessage.videoMessage, 'video');
            let buf = Buffer.from([]);
            for await (const chunk of stream) buf = Buffer.concat([buf, chunk]);
            await sock.sendMessage(userJid, { video: buf, caption: `📨 *Envoyé depuis BRINDI-XMD*` });
        } else if (args.length > 0) {
            await sock.sendMessage(userJid, { text: `📨 *Note personnelle :*\n${args.join(' ')}`, });
        }
        await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } });
    } catch (e) {
        await sock.sendMessage(chatId, { text: `❌ *Erreur :* ${e.message}`,}, { quoted: message });
    }
}

module.exports = { dlStatusCommand, lectureStatusCommand, likeStatusCommand, sendMeCommand };
