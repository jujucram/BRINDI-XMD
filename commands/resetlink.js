async function resetlinkCommand(sock, chatId, message) {
    try {
        if (!chatId.endsWith('@g.us')) {
            return await sock.sendMessage(chatId, {
                text: `❌ Commande réservée aux groupes.\n> BRINDI-XMD`
            }, { quoted: message });
        }

        const groupMetadata = await sock.groupMetadata(chatId);
        const participants = groupMetadata.participants;

        // ✅ Normalisation robuste : garde seulement les chiffres du numéro
        const normalize = (jid) => (jid || '').split('@')[0].split(':')[0].replace(/\D/g, '');

        const botNum = normalize(sock.user?.id || sock.user?.jid || '');
        const senderNum = normalize(message.key.participant || message.key.remoteJid);

        // ✅ Recherche par inclusion (évite les faux négatifs dus au device ID)
        const botParticipant = participants.find(p => {
            const pNum = normalize(p.id);
            return pNum === botNum || pNum.endsWith(botNum) || botNum.endsWith(pNum);
        });

        const senderParticipant = participants.find(p => {
            const pNum = normalize(p.id);
            return pNum === senderNum || pNum.endsWith(senderNum) || senderNum.endsWith(pNum);
        });

        // ✅ Si bot pas trouvé dans les participants, on lui fait confiance quand même
        const botIsAdmin = botParticipant
            ? (botParticipant.admin === 'admin' || botParticipant.admin === 'superadmin')
            : message.key.fromMe; // si fromMe = bot lui-même a envoyé = forcément dans le groupe

        const senderIsAdmin =
            message.key.fromMe || // bot lui-même
            senderParticipant?.admin === 'admin' ||
            senderParticipant?.admin === 'superadmin';

        if (!botIsAdmin) {
            return await sock.sendMessage(chatId, {
                text: `❌ Le bot doit être *Administrateur* pour réinitialiser le lien.\n> BRINDI-XMD`
            }, { quoted: message });
        }

        if (!senderIsAdmin) {
            return await sock.sendMessage(chatId, {
                text: `❌ Seuls les *Administrateurs* peuvent réinitialiser le lien.\n> BRINDI-XMD`
            }, { quoted: message });
        }

        await sock.sendMessage(chatId, {
            react: { text: '🔄', key: message.key }
        });

        await sock.groupRevokeInvite(chatId);
        const newCode = await sock.groupInviteCode(chatId);
        const newLink = `https://chat.whatsapp.com/${newCode}`;

        await sock.sendMessage(chatId, {
            text: `✅ Lien réinitialisé !\n\n🔗 ${newLink}\n> BRINDI-XMD`
        }, { quoted: message });

    } catch (error) {
        console.error('[RESETLINK ERROR]', error);
        await sock.sendMessage(chatId, {
            text: `❌ Erreur : ${error.message}\n> BRINDI-XMD`
        }, { quoted: message });
    }
}

module.exports = resetlinkCommand;
