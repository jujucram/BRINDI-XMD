const isOwnerOrSudo = require('../lib/isOwner');
const { getSudoList } = require('../lib/index');

async function listsudoCommand(
    sock,
    chatId,
    senderId,
    message
) {

    // Vérifie si utilisateur est owner
    const isOwner =
        await isOwnerOrSudo(
            senderId,
            sock,
            chatId
        );

    if (!isOwner) {

        return await sock.sendMessage(chatId, {

            text:
`❌ *Commande réservée au propriétaire.*

> BRINDI-XMD`

        }, { quoted: message });
    }

    try {

        // Récupère la liste sudo
        const list =
            await getSudoList();

        // Aucun sudo
        if (!list || list.length === 0) {

            return await sock.sendMessage(chatId, {

                text:
`👑 *LISTE DES SUDO*

📋 Aucun utilisateur sudo enregistré.

💡 Utilisation :
.setsudo numéro

> BRINDI-XMD`

            }, { quoted: message });
        }

        // Construction liste
        let sudoList = '';

        list.forEach((jid, i) => {

            sudoList +=
`│ ${i + 1}. +${jid.split('@')[0]}
`;

        });

        // Envoi résultat
        return await sock.sendMessage(chatId, {

            image: {
                url:
'./assets/IMG-20240812-WA0097.jpg'
            },

            caption:
`👑 *LISTE DES SUDO*

👥 ${list.length} sudo(s) enregistré(s)

┌────────────────────
${sudoList}└────────────────────

> BRINDI-XMD`

        }, { quoted: message });

    } catch (e) {

        // Gestion erreur
        return await sock.sendMessage(chatId, {

            text:
`❌ *Erreur :* ${e.message}

> BRINDI-XMD`

        }, { quoted: message });
    }
}

module.exports = listsudoCommand;