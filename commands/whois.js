async function whoisCommand(sock, chatId, senderId, mentionedJids, message, args) {
    let target = null;

    // 1. Détermination de la cible (Target)
    if (mentionedJids && mentionedJids.length > 0) {
        // Cas 1: Mention @
        target = mentionedJids[0];
    } else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
        // Cas 2: Réponse (en citation / quoted) à un message
        target = message.message.extendedTextMessage.contextInfo.participant;
    } else {
        // Cas 3: Juste `.whois` sans rien, on cible celui qui a tapé la commande
        target = senderId;
    }

    const targetNumber = target.split("@")[0];

    try {
        // 2. Récupération du statut / l'actu de la cible
        let status = "Non défini";
        try {
            const statusFetch = await sock.fetchStatus(target);
            if (statusFetch && statusFetch.status) status = statusFetch.status;
        } catch {
            status = "Invisible / Privé";
        }

        // 3. Récupération de la photo de profil
        let profilePic = "https://pps.whatsapp.net/v/t61.24694-24/73345753_120757756312458_767512534575345_n.jpg"; // Image par défaut si pas de PFP
        try {
            const pfpFetch = await sock.profilePictureUrl(target, 'image');
            if (pfpFetch) profilePic = pfpFetch;
        } catch {
            // Reste sur l'image par défaut si cachée ou introuvable
        }

        // 4. Vérification du rôle si on est dans un groupe
        let role = "Membre";
        if (chatId.endsWith("@g.us")) {
            const groupMetadata = await sock.groupMetadata(chatId);
            const isTargetAdmin = groupMetadata.participants.find(p => p.id === target)?.admin;
            
            if (isTargetAdmin === "admin") role = "Administrateur 🛠️";
            if (isTargetAdmin === "superadmin") role = "Créateur / SuperAdmin 👑";
        } else {
            role = "Discussion Privée 👥";
        }

        // 5. Construction du message de profil (Adapté avec \n> BRINDI-XMD en direct)
        const responseText = `ℹ️ *INFORMATIONS UTILISATEUR* ℹ️\n` +
                             `----------------------------------\n` +
                             `👤 *Numéro :* +${targetNumber}\n` +
                             `📝 *Actu :* _${status}_\n` +
                             `🔰 *Rôle :* ${role}\n` +
                             `----------------------------------\n` +
                             `> BRINDI-XMD`;

        // 6. Envoi des informations avec sa photo de profil
        await sock.sendMessage(chatId, {
            image: { url: profilePic },
            caption: responseText,
            mentions: [target]
        }, { quoted: message });

    } catch (err) {
        console.error(`❌ Échec de la commande whois :`, err.message);
        await sock.sendMessage(chatId, {
            text: `❌ Impossible de récupérer les informations de *+${targetNumber}*.\n\n> BRINDI-XMD`
        }, { quoted: message });
    }
}

module.exports = whoisCommand;
