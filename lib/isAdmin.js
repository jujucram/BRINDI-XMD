async function isAdmin(sock, chatId, senderId) {
    try {
        // Vérifie si c'est un groupe
        if (!chatId.endsWith('@g.us')) {
            return {
                isSenderAdmin: false,
                isBotAdmin: false
            };
        }

        // Métadonnées groupe
        let metadata = null;

        try {
            if (sock.fetchGroupMetadataFromWA) {
                metadata = await sock.fetchGroupMetadataFromWA(chatId);
            }
        } catch {}

        // Fallback
        if (!metadata) {
            try {
                metadata = await sock.groupMetadata(chatId);
            } catch {}
        }

        if (!metadata) {
            return {
                isSenderAdmin: false,
                isBotAdmin: false
            };
        }

        const participants = metadata.participants || [];

        // Fonction robuste
        const normalize = (id) => {
            if (!id) return null;

            // Objet Baileys
            if (typeof id === 'object') {
                id = id.id || id.user || String(id);
            }

            // Force string
            id = String(id);

            // Nettoyage MD
            return id.split(':')[0];
        };

        const cleanSender = normalize(senderId);
        const cleanBot = normalize(sock.user?.id);

        // Recherche participants
        const senderParticipant = participants.find(
            p => normalize(p.id || p.jid) === cleanSender
        );

        const botParticipant = participants.find(
            p => normalize(p.id || p.jid) === cleanBot
        );

        // Vérification admin
        const isSenderAdmin = !!senderParticipant?.admin;

        const isBotAdmin = !!botParticipant?.admin;

        return {
            isSenderAdmin,
            isBotAdmin
        };

    } catch (err) {
        console.error('❌ Error in isAdmin:', err);

        return {
            isSenderAdmin: false,
            isBotAdmin: false
        };
    }
}

module.exports = isAdmin;