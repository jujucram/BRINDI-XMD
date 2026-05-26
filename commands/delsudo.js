const isOwnerOrSudo = require('../lib/isOwner');
const { removeSudo } = require('../lib/index');

async function delsudoCommand(sock, chatId, senderId, args, replyMessage, message) {

    const isOwner = await isOwnerOrSudo(senderId, sock, chatId);

    if (!isOwner) {
        return await sock.sendMessage(chatId, {
            text: `❌ *Réservé au propriétaire !*\n> BRINDI-XMD`,
        }, { quoted: message });
    }

    let targetJid = null;

    if (replyMessage) {
        const participant = message?.message?.extendedTextMessage?.contextInfo?.participant;

        if (participant) {
            targetJid = participant;
        }

    } else if (args[0]) {
        const num = args[0].replace(/[^0-9]/g, '');

        if (num) {
            targetJid = num + '@s.whatsapp.net';
        }
    }

    if (!targetJid) {
        return await sock.sendMessage(chatId, {
            text:
`🗑️ *Retirer un sudo*

💡 *Usage :*

⬡ .delsudo @mention
⬡ .delsudo <numéro>
⬡ Réponds à un message

> BRINDI-XMD`
        }, { quoted: message });
    }

    try {
        await removeSudo(targetJid);

        const num = targetJid.split('@')[0];

        return await sock.sendMessage(chatId, {
            text:
`🗑️ *+${num}* retiré des sudos.

> BRINDI-XMD`
        }, { quoted: message });

    } catch (e) {
        return await sock.sendMessage(chatId, {
            text: `❌ *Erreur :* ${e.message}\n> BRINDI-XMD`
        }, { quoted: message });
    }
}

module.exports = delsudoCommand;