const isAdmin = require('../lib/isAdmin');

// ─── KICKALL : Expulser tous les membres non-admins ──────
async function kickallCommand(
    sock,
    chatId,
    senderId,
    message
) {

    // Vérifie si c’est un groupe
    if (!chatId.endsWith('@g.us')) {

        return await sock.sendMessage(chatId, {

            text:
`❌ *Commande disponible uniquement dans les groupes !*

> BRINDI-XMD`

        }, { quoted: message });
    }

    // Vérifie permissions
    const isOwner = message?.key?.fromMe;

    if (!isOwner) {

        const {
            isSenderAdmin,
            isBotAdmin
        } = await isAdmin(
            sock,
            chatId,
            senderId
        );

        // Vérifie admin utilisateur
        if (!isSenderAdmin) {

            return await sock.sendMessage(chatId, {

                text:
`❌ *Seuls les administrateurs peuvent utiliser cette commande.*

> BRINDI-XMD`

            }, { quoted: message });
        }

        // Vérifie admin bot
        if (!isBotAdmin) {

            return await sock.sendMessage(chatId, {

                text:
`❌ *Le bot doit être administrateur pour utiliser cette commande.*

> BRINDI-XMD`

            }, { quoted: message });
        }
    }

    try {

        const meta =
            await sock.groupMetadata(chatId);

        // Empêche le bot de se kick lui-même
        const botId =
            (sock.user?.id || '')
                .replace(/:\d+/, '') +
            '@s.whatsapp.net';

        // Liste des membres non-admins
        const nonAdmins =
            meta.participants
                .filter(
                    p =>
                        !p.admin &&
                        p.id !== botId
                )
                .map(p => p.id);

        // Aucun membre à expulser
        if (nonAdmins.length === 0) {

            return await sock.sendMessage(chatId, {

                text:
`ℹ️ *Aucun membre non-admin à expulser.*

> BRINDI-XMD`

            }, { quoted: message });
        }

        // Message attente
        await sock.sendMessage(chatId, {

            text:
`⏳ *Expulsion de ${nonAdmins.length} membres en cours...*

> BRINDI-XMD`

        }, { quoted: message });

        // Expulsion
        await sock.groupParticipantsUpdate(
            chatId,
            nonAdmins,
            'remove'
        );

        // Succès
        await sock.sendMessage(chatId, {

            text:
`✅ *${nonAdmins.length} membres expulsés avec succès !*

> BRINDI-XMD`

        }, { quoted: message });

    } catch (e) {

        // Erreur
        await sock.sendMessage(chatId, {

            text:
`❌ *Erreur :* ${e.message}

> BRINDI-XMD`

        }, { quoted: message });
    }
}

module.exports = kickallCommand;