const { handleAntiBadwordCommand } = require('../lib/antibadword');
const isAdmin = require('../lib/isAdmin');
const isOwnerOrSudoLib = require('../lib/isOwner');

async function antibadwordCommand(sock, chatId, message, senderId) {
    try {
        // ✅ Vérifier owner/sudo ET admin
        const senderIsOwnerOrSudo = await isOwnerOrSudoLib(senderId, sock, chatId);
        const adminStatus = await isAdmin(sock, chatId, senderId);
        const isSenderAdmin = adminStatus.isSenderAdmin;

        if (!isSenderAdmin && !senderIsOwnerOrSudo && !message.key.fromMe) {
            return await sock.sendMessage(chatId, {
                text: '❌ *Commande réservée aux admins*\n> BRINDI-XMD'
            }, { quoted: message });
        }

        // 📌 GET TEXT
        const text =
            message.message?.conversation ||
            message.message?.extendedTextMessage?.text ||
            '';

        const match = rawText.trim().split(/\s+/).           slice(1).join(' ').toLowerCase();

        await handleAntiBadwordCommand(sock, chatId, message, match);

    } catch (error) {
        console.error('Error in antibadword command:', error);

        await sock.sendMessage(chatId, {
            text: '❌ *Error processing antibadword command*\n> BRINDI-XMD'
        }, { quoted: message });
    }
}

module.exports = antibadwordCommand;
