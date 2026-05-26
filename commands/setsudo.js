const isOwnerOrSudo = require('../lib/isOwner');
const { addSudo } = require('../lib/index');



async function setsudoCommand(sock, chatId, senderId, args, replyMessage, message) {
    const isOwner = await isOwnerOrSudo(senderId, sock, chatId);
    if (!isOwner) {
        return await sock.sendMessage(chatId, {
            text: `❌ *Réservé au propriétaire !*\n> BRINDI-XMD`,
        }, { quoted: message });
    }

    let targetJid = null;
    if (replyMessage) {
        const participant = message?.message?.extendedTextMessage?.contextInfo?.participant;
        if (participant) targetJid = participant;
    } else if (args[0]) {
        const num = args[0].replace(/[^0-9]/g, '');
        if (num) targetJid = num + '@s.whatsapp.net';
    }

    if (!targetJid) {
        return await sock.sendMessage(chatId, {
            text: `👑 *Ajouter un Sudo*\n\n💡 *Usage :*\n│ ⬡ .setsudo @mention\n│ ⬡ .setsudo <numéro>\n│ ⬡ Réponds à un message avec .setsudo\n> BRINDI-XMD`,
            
        }, { quoted: message });
    }

    try {
        await addSudo(targetJid);
        const num = targetJid.split('@')[0];
        return await sock.sendMessage(chatId, {
            image: { url: './assets/IMG-20240812-WA0097.jpg' },
            caption: `👑 *SUDO AJOUTÉ*\n\n✅ *+${num}* est maintenant Sudo !\n👑 Il peut désormais utiliser les commandes privées.\n> BRINDI-XMD`,
        }, { quoted: message });
    } catch (e) {
        return await sock.sendMessage(chatId, { text: `❌ *Erreur :* ${e.message}\n> BRINDI-XMD`, }, { quoted: message });
    }
}

module.exports = setsudoCommand;
