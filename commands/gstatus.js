const isAdmin = require('../lib/isAdmin');
const isOwnerOrSudo = require('../lib/isOwner');

async function gstatusCommand(sock, chatId, senderId, args, message) {

    if (!chatId.endsWith('@g.us')) {
        return await sock.sendMessage(chatId, {
            text:
`❌ *Commande disponible uniquement dans les groupes !*

> BRINDI-XMD`
        }, { quoted: message });
    }

    const { isSenderAdmin } =
        await isAdmin(sock, chatId, senderId);

    if (!isSenderAdmin) {
        return await sock.sendMessage(chatId, {
            text:
`❌ *Commande réservée aux administrateurs !*

> BRINDI-XMD`
        }, { quoted: message });
    }

    const action = args[0]?.toLowerCase();

    try {

        const meta =
            await sock.groupMetadata(chatId);

        const participants = meta.participants;

        const total = participants.length;

        const admins =
            participants.filter(p => p.admin).length;

        const members = total - admins;

        const createdAt = meta.creation
            ? new Date(meta.creation * 1000)
                .toLocaleDateString('fr-FR')
            : 'Inconnu';

        if (!action) {

            let adminList = '';

            participants
                .filter(p => p.admin)
                .forEach((p) => {

                    const role =
                        p.admin === 'superadmin'
                            ? '👑'
                            : '⭐';

                    adminList +=
`│ ${role} +${p.id.split('@')[0]}
`;
                });

            return await sock.sendMessage(chatId, {

                image: {
                    url: './assets/IMG-20240812-WA0097.jpg'
                },

                caption:
`📊 *STATUT DU GROUPE*

👥 *Groupe :* ${meta.subject}
📅 *Créé le :* ${createdAt}
🆔 *JID :* \`${chatId}\`

┌─────────────────────
│ 👤 Membres : *${members}*
│ 👑 Admins : *${admins}*
│ 📊 Total : *${total}*
│ 🔒 Fermé : *${meta.announce ? 'Oui' : 'Non'}*
│ 🔐 Restriction : *${meta.restrict ? 'Admins uniquement' : 'Tous'}*
└─────────────────────

👑 *Admins du groupe*
┌─────────────────────
${adminList}└─────────────────────

📌 *Options disponibles*
│ ⬡ .gstatus desc <texte>
│ ⬡ .gstatus nom <texte>

> BRINDI-XMD`

            }, { quoted: message });
        }

        const { isBotAdmin } =
            await isAdmin(sock, chatId, senderId);

        if (action === 'desc') {

            const desc = args.slice(1).join(' ');

            if (!desc) {
                return await sock.sendMessage(chatId, {
                    text:
`❌ Spécifie une description !

📌 Exemple :
.gstatus desc Mon super groupe

> BRINDI-XMD`
                }, { quoted: message });
            }

            await sock.groupUpdateDescription(chatId, desc);

            return await sock.sendMessage(chatId, {
                text:
`✅ *Description du groupe mise à jour !*

📝 *Nouvelle description :*
${desc}

> BRINDI-XMD`
            }, { quoted: message });
        }

        if (action === 'nom') {

            const nom = args.slice(1).join(' ');

            if (!nom) {
                return await sock.sendMessage(chatId, {
                    text:
`❌ Spécifie le nouveau nom du groupe !

📌 Exemple :
.gstatus nom Mon Groupe 2.0

> BRINDI-XMD`
                }, { quoted: message });
            }

            await sock.groupUpdateSubject(chatId, nom);

            return await sock.sendMessage(chatId, {
                text:
`✅ *Nom du groupe mis à jour !*

📛 *Nouveau nom :*
${nom}

> BRINDI-XMD`
            }, { quoted: message });
        }

    } catch (e) {

        console.error('❌ [gstatus]', e.message);

        await sock.sendMessage(chatId, {
            text:
`❌ Impossible de récupérer les informations du groupe.

> BRINDI-XMD`
        }, { quoted: message });
    }
}

module.exports = gstatusCommand;