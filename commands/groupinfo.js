async function groupInfoCommand(sock, chatId, message) {

    if (!chatId.endsWith('@g.us')) {
        return await sock.sendMessage(chatId, {
            text:
`❌ *Commande disponible uniquement dans les groupes !*

> BRINDI-XMD`
        }, { quoted: message });
    }

    try {

        const meta = await sock.groupMetadata(chatId);

        const participants = meta.participants;

        const total = participants.length;

        const admins =
            participants.filter(p => p.admin);

        const members = total - admins.length;

        const created = meta.creation
            ? new Date(meta.creation * 1000)
                .toLocaleDateString('fr-FR')
            : 'Inconnu';

        let adminList = '';

        admins.forEach((p) => {

            const role =
                p.admin === 'superadmin'
                    ? '👑'
                    : '⭐';

            adminList +=
`│ ${role} @${p.id.split('@')[0]}
`;
        });

        const caption =
`
📊 *INFORMATIONS DU GROUPE*

┌─────────────────────
│ 👥 *Nom :* ${meta.subject}
│ 📅 *Créé le :* ${created}
│ 🆔 *JID :* ${chatId.split('@')[0]}
└─────────────────────

📈 *Statistiques*
┌─────────────────────
│ 👤 *Membres :* ${members}
│ 👑 *Admins :* ${admins.length}
│ 📊 *Total :* ${total}
│ 🔒 *Groupe fermé :* ${meta.announce ? 'Oui' : 'Non'}
└─────────────────────

👑 *Admins du groupe*
┌─────────────────────
${adminList}└─────────────────────

📝 *Description*
┌─────────────────────
│ ${meta.desc || 'Aucune description'}
└─────────────────────

> BRINDI-XMD`
.trim();

        await sock.sendMessage(chatId, {

            image: {
                url: './assets/IMG-20240812-WA0097.jpg'
            },

            caption,

            mentions: admins.map(a => a.id)

        }, { quoted: message });

    } catch (e) {

        console.error('❌ [groupinfo]', e.message);

        await sock.sendMessage(chatId, {
            text:
`❌ Impossible de récupérer les informations du groupe.

> BRINDI-XMD`
        }, { quoted: message });
    }
}

module.exports = groupInfoCommand;