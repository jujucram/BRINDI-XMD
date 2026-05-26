const isAdmin = require('../lib/isAdmin');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');



async function downloadMedia(msg, type) {
    const stream = await downloadContentFromMessage(msg, type);
    let buf = Buffer.from([]);
    for await (const chunk of stream) buf = Buffer.concat([buf, chunk]);
    return buf;
}

async function tagCommand(sock, chatId, senderId, messageText, replyMessage, message) {
    if (!chatId.endsWith('@g.us')) {
        return await sock.sendMessage(chatId, {
            text: `❌ *Uniquement dans les groupes !*\n> BRINDI-XMD`,
        }, { quoted: message });
    }

    const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);


    if (!isSenderAdmin) {
        return await sock.sendMessage(chatId, {
            text: `🚫 *Cette commande est réservée aux admins !*\n> BRINDI-XMD`,
            
        }, { quoted: message });
    }

    const groupMeta = await sock.groupMetadata(chatId);
    const participants = groupMeta.participants;
    const mentions = participants.map(p => p.id);
    const count = participants.length;

    // Utilisation du texte personnalisé s'il y en a un, sinon texte par défaut épuré
    const tagText = messageText || `📢 *ANNONCE GROUPE*\n\n👥 *${groupMeta.subject}*\n🔔 *${count} membres tagués.*\n> BRINDI-XMD`;

    try {
        if (replyMessage) {
            if (replyMessage.imageMessage) {
                const buf = await downloadMedia(replyMessage.imageMessage, 'image');
                await sock.sendMessage(chatId, { image: buf, caption: tagText, mentions }, { quoted: message });
            } else if (replyMessage.videoMessage) {
                const buf = await downloadMedia(replyMessage.videoMessage, 'video');
                await sock.sendMessage(chatId, { video: buf, caption: tagText, mentions }, { quoted: message });
            } else {
                await sock.sendMessage(chatId, {
                    text: tagText, mentions
                }, { quoted: message });
            }
        } else {
            await sock.sendMessage(chatId, {
                text: tagText, mentions,
                
            }, { quoted: message });
        }
    } catch (e) {
        console.error('❌ [tag]', e.message);
        await sock.sendMessage(chatId, { text: tagText, mentions }, { quoted: message });
    }
}

module.exports = tagCommand;
