const isAdmin = require('../lib/isAdmin');

async function linkCommand(sock, chatId, senderId, message) {

    // Vérifie si c'est un groupe
    if (!chatId.endsWith('@g.us')) {
        await sock.sendMessage(chatId, {
            text: 'Cette commande fonctionne uniquement dans les groupes.'
        }, { quoted: message });
        return;
    }

    const isOwner = message.key.fromMe;

    // Vérifie permissions
    if (!isOwner) {

        const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);

        if (!isSenderAdmin) {
            await sock.sendMessage(chatId, {
                text: 'Seuls les admins peuvent utiliser cette commande.'
            }, { quoted: message });
            return;
        }

        if (!isBotAdmin) {
            await sock.sendMessage(chatId, {
                text: 'Le bot doit être admin pour cette commande.'
            }, { quoted: message });
            return;
        }
    }

    try {

        // Récupère le code d'invitation
        const inviteCode = await sock.groupInviteCode(chatId);

        const inviteLink = `https://chat.whatsapp.com/${inviteCode}`;

        await sock.sendMessage(chatId, {
            text: `🔗 Lien du groupe :\n${inviteLink}\n\n> BRINDI-XMD`
        }, { quoted: message });

    } catch (error) {

        console.error('Erreur link command:', error);

        await sock.sendMessage(chatId, {
            text: 'Impossible de récupérer le lien du groupe.'
        }, { quoted: message });

    }
}

module.exports = linkCommand;