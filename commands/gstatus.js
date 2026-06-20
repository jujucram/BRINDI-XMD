const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const isAdmin = require('../lib/isAdmin');

async function gstatusCommand(sock, chatId, senderId, args, message) {

    if (!chatId.endsWith('@g.us')) {
        return await sock.sendMessage(chatId, {
            text: '❌ *Commande disponible uniquement dans les groupes !*\n\n> BRINDI-XMD'
        }, { quoted: message });
    }

    var adminCheck = await isAdmin(sock, chatId, senderId);
    var isSenderAdmin = adminCheck.isSenderAdmin;

    if (!isSenderAdmin) {
        return await sock.sendMessage(chatId, {
            text: '❌ *Commande réservée aux administrateurs !*\n\n> BRINDI-XMD'
        }, { quoted: message });
    }

    var action = args[0] ? args[0].toLowerCase() : null;

    try {
        var meta = await sock.groupMetadata(chatId);
        var participants = meta.participants;
        var total = participants.length;
        var admins = participants.filter(function(p) { return p.admin; }).length;
        var members = total - admins;

        var createdAt = meta.creation
            ? new Date(meta.creation * 1000).toLocaleDateString('fr-FR')
            : 'Inconnu';

        // ─── AFFICHAGE DU STATUS DU GROUPE ───────────────────────────────────
        if (!action) {
            var adminList = '';
            participants
                .filter(function(p) { return p.admin; })
                .forEach(function(p) {
                    var role = p.admin === 'superadmin' ? '👑' : '⭐';
                    adminList += '│ ' + role + ' +' + p.id.split('@')[0] + '\n';
                });

            return await sock.sendMessage(chatId, {
                image: { url: './assets/IMG-20240812-WA0097.jpg' },
                caption: '📊 *STATUT DU GROUPE*\n\n👥 *Groupe :* ' + meta.subject + '\n📅 *Créé le :* ' + createdAt + '\n🆔 *JID :* `' + chatId + '`\n\n┌─────────────────────\n│ 👤 Membres : *' + members + '*\n│ 👑 Admins : *' + admins + '*\n│ 📊 Total : *' + total + '*\n│ 🔒 Fermé : *' + (meta.announce ? 'Oui' : 'Non') + '*\n│ 🔐 Restriction : *' + (meta.restrict ? 'Admins uniquement' : 'Tous') + '*\n└─────────────────────\n\n👑 *Admins du groupe*\n┌─────────────────────\n' + adminList + '└─────────────────────\n\n📌 *Options disponibles*\n│ ⬡ .gstatus desc <texte>\n│ ⬡ .gstatus nom <texte>\n│ ⬡ .gstatus setpp (En répondant à une image)\n\n> BRINDI-XMD'
            }, { quoted: message });
        }

        // ─── ACTION : DESCRIPTION ─────────────────────────────────────────────
        if (action === 'desc') {
            var desc = args.slice(1).join(' ');
            if (!desc) {
                return await sock.sendMessage(chatId, {
                    text: '❌ Spécifie une description !\n\n📌 Exemple :\n.gstatus desc Mon super groupe\n\n> BRINDI-XMD'
                }, { quoted: message });
            }
            await sock.groupUpdateDescription(chatId, desc);
            return await sock.sendMessage(chatId, {
                text: '✅ *Description du groupe mise à jour !*\n\n📝 *Nouvelle description :*\n' + desc + '\n\n> BRINDI-XMD'
            }, { quoted: message });
        }

        // ─── ACTION : NOM ─────────────────────────────────────────────────────
        if (action === 'nom') {
            var nom = args.slice(1).join(' ');
            if (!nom) {
                return await sock.sendMessage(chatId, {
                    text: '❌ Spécifie le nouveau nom du groupe !\n\n📌 Exemple :\n.gstatus nom Mon Groupe 2.0\n\n> BRINDI-XMD'
                }, { quoted: message });
            }
            await sock.groupUpdateSubject(chatId, nom);
            return await sock.sendMessage(chatId, {
                text: '✅ *Nom du groupe mis à jour !*\n\n📛 *Nouveau nom :*\n' + nom + '\n\n> BRINDI-XMD'
            }, { quoted: message });
        }

        // ─── ACTION : PHOTO DE PROFIL ──────────────────────────────────────────
        if (action === 'setpp' || action === 'pp') {
            var contextInfo =
                (message.message && message.message.extendedTextMessage && message.message.extendedTextMessage.contextInfo) ||
                (message.message && message.message.ephemeralMessage && message.message.ephemeralMessage.message && message.message.ephemeralMessage.message.extendedTextMessage && message.message.ephemeralMessage.message.extendedTextMessage.contextInfo) ||
                null;

            var quotedMsg = contextInfo && contextInfo.quotedMessage;

            if (!quotedMsg || (!quotedMsg.imageMessage && !(quotedMsg.ephemeralMessage && quotedMsg.ephemeralMessage.message && quotedMsg.ephemeralMessage.message.imageMessage))) {
                return await sock.sendMessage(chatId, {
                    text: '❌ Réponds à une image avec .gstatus setpp pour changer la photo du groupe.\n\n> BRINDI-XMD'
                }, { quoted: message });
            }

            var targetImage = quotedMsg.imageMessage || (quotedMsg.ephemeralMessage && quotedMsg.ephemeralMessage.message && quotedMsg.ephemeralMessage.message.imageMessage);

            await sock.sendMessage(chatId, { react: { text: '🔄', key: message.key } });

            try {
                var stream = await downloadContentFromMessage(targetImage, 'image');
                var chunks = [];
                for await (var chunk of stream) {
                    chunks.push(chunk);
                }
                var buffer = Buffer.concat(chunks);

                await sock.updateProfilePicture(chatId, buffer);

                await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } });
                return await sock.sendMessage(chatId, {
                    text: '📸 *Photo de profil du groupe mise à jour avec succès !* 🔥\n\n> BRINDI-XMD'
                }, { quoted: message });
            } catch (downloadErr) {
                console.error('[gstatus setpp]', downloadErr.message);
                return await sock.sendMessage(chatId, {
                    text: '❌ Échec du téléversement de l\'image. Réessayez.\n\n> BRINDI-XMD'
                }, { quoted: message });
            }
        }

    } catch (e) {
        console.error('[gstatus]', e.message);
        await sock.sendMessage(chatId, {
            text: '❌ Impossible de modifier ou récupérer les infos du groupe.\n\n> BRINDI-XMD'
        }, { quoted: message });
    }
}

module.exports = gstatusCommand;
