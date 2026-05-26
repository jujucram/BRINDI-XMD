
const isAdmin = require('../lib/isAdmin');

async function demoteCommand(sock, chatId, senderId, mentionedJids, message) {

    // Vérifie si c'est un groupe
    if (!chatId.endsWith('@g.us')) {
        await sock.sendMessage(chatId, {
            text: 'Cette commande fonctionne uniquement dans les groupes.\n> BRINDI-XMD'
        }, { quoted: message });
        return;
    }

    const isOwner = message.key.fromMe;

    // Vérifie permissions
    if (!isOwner) {

        const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);

        if (!isSenderAdmin) {
            await sock.sendMessage(chatId, {
                text: 'Seuls les admins peuvent utiliser cette commande.\n> BRINDI-XMD'
            }, { quoted: message });
            return;
        }

        if (!isBotAdmin) {
            await sock.sendMessage(chatId, {
                text: 'Le bot doit être admin pour cette commande.\n> BRINDI-XMD'
            }, { quoted: message });
            return;
        }
    }

    // Utilisateur ciblé
    let usersToDemote = [];

    // Mention
    if (mentionedJids && mentionedJids.length > 0) {
        usersToDemote = mentionedJids;
    }

    // Reply message
    else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
        usersToDemote = [
            message.message.extendedTextMessage.contextInfo.participant
        ];
    }

    // Aucun utilisateur
    if (usersToDemote.length === 0) {
        await sock.sendMessage(chatId, {
            text: 'Mentionnez un admin ou répondez à son message.\n> BRINDI-XMD'
        }, { quoted: message });
        return;
    }

    try {

        const metadata = await sock.groupMetadata(chatId);
        const participants = metadata.participants || [];

        // Vérifie que les utilisateurs sont admins
        const nonAdmins = usersToDemote.filter(userId => {

            const participant = participants.find(
                p => p.id === userId
            );

            return !participant?.admin;
        });

        if (nonAdmins.length > 0) {

            await sock.sendMessage(chatId, {
                text: 'Certains utilisateurs ne sont pas admins.\n> BRINDI-XMD'
            }, { quoted: message });

            return;
        }

        // Demote
        await sock.groupParticipantsUpdate(
            chatId,
            usersToDemote,
            "demote"
        );

        // Mentions
        const usernames = usersToDemote.map(
            jid => `@${jid.split('@')[0]}`
        );

        await sock.sendMessage(chatId, {
            text: `${usernames.join(', ')} n'est plus admin.\n> BRINDI-XMD`,
            mentions: usersToDemote
        }, { quoted: message });

    } catch (error) {

        console.error('Erreur demote command:', error);

        await sock.sendMessage(chatId, {
            text: 'Impossible de retirer les droits admin.\n> BRINDI-XMD'
        }, { quoted: message });

    }
}

module.exports = { demoteCommand };