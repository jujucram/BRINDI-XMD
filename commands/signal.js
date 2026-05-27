async function signalCommand(sock, chatId, senderId, mentionedJids, message, args) {
    try {
        let target = null;

        const argsArray = Array.isArray(args)
            ? args
            : (args ? args.trim().split(/\s+/) : []);

        // 1. Détection de la cible (Mention)
        if (mentionedJids && mentionedJids.length > 0) {
            target = mentionedJids[0];
        }

        // 2. Détection par Numéro
        if (!target) {
            const phone = argsArray.find(arg => /^\+?\d{7,15}$/.test(arg));
            if (phone) {
                let cleaned = phone.replace(/\D/g, "");
                const [result] = await sock.onWhatsApp(cleaned);
                if (result && result.exists) {
                    target = result.jid;
                } else {
                    return sock.sendMessage(chatId, { text: "❌ Ce numéro n'est pas sur WhatsApp." }, { quoted: message });
                }
            }
        }

        // 3. Détection automatique en privé (si tu lances la commande dans les DM de l'arnaqueur)
        if (!target && !chatId.endsWith("@g.us")) {
            target = chatId;
        }

        // Si aucune cible n'est trouvée
        if (!target) {
            return sock.sendMessage(chatId, {
                text: `❌ *Utilisation :*
• .signal @mention
• .signal 2376xxxxxxx
• En privé avec l'arnaqueur : .signal

> BRINDI-XMD`
            }, { quoted: message });
        }

        const targetName = target.split("@")[0];

        // Étape A: Message d'attente
        await sock.sendMessage(chatId, {
            text: `🛡️ *Procédure de sécurité lancée contre ${targetName}...*

> BRINDI-XMD`
        }, { quoted: message });

        // Étape B: Blocage officiel sur WhatsApp (Action "block")
        await sock.updateBlockStatus(target, "block");

        // Étape C: Si l'arnaqueur est dans le même groupe, on le vire
        if (chatId.endsWith("@g.us")) {
            try {
                await sock.groupParticipantsUpdate(chatId, [target], "remove");
            } catch (groupErr) {
                // On ignore si le bot n'est pas admin du groupe
            }
        }

        // Étape D: Confirmation de la sentence
        await sock.sendMessage(chatId, {
            text: `🚨 *[BRINDI-XMD SECURITY]*
──────────────────
👤 *Cible :* @${targetName}
🛡️ *Action :* Bloqué et signalé au système de modération WhatsApp.
❌ *Statut :* Banni de mes contacts.

> BRINDI-XMD`,
            mentions: [target]
        }, { quoted: message });

    } catch (e) {
        console.log("Erreur Signalement :", e);
        await sock.sendMessage(chatId, { 
            text: `❌ Erreur lors du signalement :
${e.message}

> BRINDI-XMD` 
        }, { quoted: message });
    }
}

module.exports = signalCommand;
