async function blockCommand(sock, chatId, senderId, mentionedJids, message, args) {
    let target = null;
    const argsArray = Array.isArray(args) ? args : (args ? args.split(' ') : []);

    // 1. Détermination de la cible
    if (mentionedJids && mentionedJids.length > 0) {
        target = mentionedJids[0]; // Via mention @
    } else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
        target = message.message.extendedTextMessage.contextInfo.participant; // Via réponse (quoted)
    } else if (argsArray.length > 0) {
        let cleaned = argsArray.join('').replace(/[^0-9]/g, "");
        if (cleaned.length >= 11) {
            target = cleaned + "@s.whatsapp.net"; // Via numéro brut
        }
    }

    if (!target) {
        return sock.sendMessage(chatId, {
            text: "❌ Utilisation incorrecte.\nSaisie requise : `.block @mention`, répondre à un message, ou spécifier un numéro valide.\n> BRINDI-XMD"
        }, { quoted: message });
    }

    const targetNumber = target.split("@")[0];

    try {
        // 2. Blocage natif WhatsApp (Action système)
        await sock.updateBlockStatus(target, "block");

        // 3. Confirmation
        await sock.sendMessage(chatId, {
            text: `🔒 *+${targetNumber}* a été bloqué.\n> BRINDI-XMD`,
            mentions: [target]
        }, { quoted: message });

    } catch (err) {
        console.error(`❌ Échec de la commande block :`, err.message);
        await sock.sendMessage(chatId, {
            text: `❌ Impossible de bloquer l'utilisateur *+${targetNumber}*.\n> BRINDI-XMD`
        }, { quoted: message });
    }
}

module.exports = blockCommand;
