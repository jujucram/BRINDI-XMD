const isAdmin = require('../lib/isAdmin');

async function deleteCommand(sock, chatId, message) {
    try {
        const senderId =
            message.key.participant || message.key.remoteJid;

        const isGroup = chatId.endsWith('@g.us');

        // Valeurs par défaut pour les DM
        let isSenderAdmin = true;
        let isBotAdmin = true;

        // Vérification admin seulement en groupe
        if (isGroup) {
            const adminData = await isAdmin(
                sock,
                chatId,
                senderId
            );

            isSenderAdmin = adminData.isSenderAdmin;
            isBotAdmin = adminData.isBotAdmin;
        }

        // Vérifie permissions utilisateur
        if (isGroup && !isSenderAdmin && !message.key.fromMe) {
            return await sock.sendMessage(chatId, {
                text: '❌ Seuls les administrateurs peuvent utiliser cette commande.\n> BRINDI-XMD'
            }, { quoted: message });
        }

        // Infos du message reply
        const ctxInfo =
            message.message?.extendedTextMessage?.contextInfo || {};

        const repliedMsgId = ctxInfo.stanzaId;
        const repliedParticipant = ctxInfo.participant;

        // Vérifie reply
        if (!repliedMsgId) {
            return await sock.sendMessage(chatId, {
                text: '❌ Répondez au message à supprimer.\n> BRINDI-XMD'
            }, { quoted: message });
        }

        // Fonction normalize
        const normalize = (id) => {
            if (!id) return '';

            return String(id)
                .split(':')[0]
                .split('@')[0];
        };

        // ID bot nettoyé
        const botId = normalize(sock.user?.id);

        // Participant nettoyé
        const repliedUser = normalize(repliedParticipant);

        // Vérifie si message du bot
        const isBotMessage = repliedUser === botId;

        // Si message membre -> bot doit être admin
        if (isGroup && !isBotMessage && !isBotAdmin) {
            return await sock.sendMessage(chatId, {
                text: '❌ Le bot doit être administrateur pour supprimer les messages des membres.\n> BRINDI-XMD'
            }, { quoted: message });
        }

        // Construction deleteKey
        const deleteKey = {
            remoteJid: chatId,
            fromMe: isBotMessage,
            id: repliedMsgId
        };

        // Participant obligatoire en groupe
        if (isGroup && repliedParticipant) {
            deleteKey.participant = repliedParticipant;
        }

        // Suppression
        await sock.sendMessage(chatId, {
            delete: deleteKey
        });

    } catch (err) {
        console.error('Erreur commande delete:', err);

        await sock.sendMessage(chatId, {
            text: '❌ Impossible de supprimer le message.\n> BRINDI-XMD'
        }, { quoted: message });
    }
}

module.exports = deleteCommand;