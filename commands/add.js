const isAdmin = require('../lib/isAdmin');

async function addCommand(sock, chatId, senderId, args, message) {
    const isOwner = message.key.fromMe;

    // Vérifie les permissions
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

    // Vérifie si un numéro a été donné
    if (!args || args.length === 0) {
        await sock.sendMessage(chatId, {
            text: 'Veuillez entrer un numéro.\n\nExemple: .add 2376XXXXXXXX \n> BRINDI-XMD'
        }, { quoted: message });
        return;
    }

    // Nettoie le numéro
    let number = args[0].replace(/[^0-9]/g, '');

    // Vérifie longueur minimale
    if (number.length < 8) {
        await sock.sendMessage(chatId, {
            text: 'Numéro invalide.\n> BRINDI-XMD'
        }, { quoted: message });
        return;
    }

    const userToAdd = number + '@s.whatsapp.net';

    try {

        // Vérifie si déjà dans le groupe
        const metadata = await sock.groupMetadata(chatId);
        const participants = metadata.participants || [];

        const alreadyInGroup = participants.some(
            p => p.id === userToAdd
        );

        if (alreadyInGroup) {
            await sock.sendMessage(chatId, {
                text: 'Cet utilisateur est déjà dans le groupe.'
            }, { quoted: message });
            return;
        }

        // Ajout utilisateur
        const response = await sock.groupParticipantsUpdate(
            chatId,
            [userToAdd],
            "add"
        );

        console.log(response);

        await sock.sendMessage(chatId, {
            text: `@${number} a été ajouté avec succès !\n> BRINDI-XMD`,
            mentions: [userToAdd]
        }, { quoted: message });

    } catch (error) {
        console.error('Erreur add command:', error);

        await sock.sendMessage(chatId, {
            text: 'Impossible d’ajouter cet utilisateur.'
        }, { quoted: message });
    }
}

module.exports = addCommand;