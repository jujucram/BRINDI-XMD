async function gjidCommand(sock, chatId, message) {

    if (!chatId.endsWith('@g.us')) {
        return await sock.sendMessage(chatId, {
            text:
`❌ *Commande disponible uniquement dans les groupes !*

> BRINDI-XMD`
        }, { quoted: message });
    }

    try {

        const meta = await sock.groupMetadata(chatId);

        const created = meta.creation
            ? new Date(meta.creation * 1000).toLocaleDateString('fr-FR')
            : 'Inconnu';

        await sock.sendMessage(chatId, {
            image: { url: './assets/IMG-20240812-WA0097.jpg' },

            caption:
`🆔 *JID DU GROUPE*

👥 *Groupe :* ${meta.subject}
📅 *Créé le :* ${created}
👤 *Membres :* ${meta.participants.length}

🆔 *Identifiant du groupe :*
\`\`\`${chatId}\`\`\`

📌 Copie le JID ci-dessus.

> BRINDI-XMD`

        }, { quoted: message });

    } catch (e) {

        console.error('❌ [gjid]', e.message);

        await sock.sendMessage(chatId, {
            text:
`🆔 *JID du groupe :*

\`\`\`${chatId}\`\`\`

> BRINDI-XMD`
        }, { quoted: message });
    }
}

module.exports = gjidCommand;