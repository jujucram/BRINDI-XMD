// Fonction utilitaire pour valider l'URL
function isUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}


// ─── POLL : Créer un sondage ─────────────────────────────
async function pollCommand(sock, chatId, args, message) {
    const input = args.join(' ');
    const parts = input.split('|').map(s => s.trim());
    if (parts.length < 3) {
        return await sock.sendMessage(chatId, {
            text: `📊 *Créer un sondage*\n\n💡 *Usage :* *.poll Question | Option1 | Option2 | Option3*\n\n📌 *Exemple :*\n_.poll Couleur préférée ? | Rouge | Bleu | Vert_\n> BRINDI-XMD`,
        }, { quoted: message });  
    }  
    const question = parts[0];  
    const options = parts.slice(1);  
    try {  
        await sock.sendMessage(chatId, {  
            poll: { name: question, values: options, selectableCount: 1 }  
        }, { quoted: message });  
    } catch (e) {  
        await sock.sendMessage(chatId, { text: `❌ *Erreur :* ${e.message}\n> BRINDI-XMD`, }, { quoted: message });  
    }
}

// ─── GCREATE : Créer un groupe ───────────────────────────
async function gcreateCommand(sock, chatId, args, message) {

    try {

        // ─────────────────────────────
        // ✅ Normalisation args (ANTI-CRASH)
        // ─────────────────────────────
        const argsArray = Array.isArray(args)
            ? args
            : (args ? args.split(" ") : []);

        // ─────────────────────────────
        // 📌 Vérification minimale
        // ─────────────────────────────
        if (argsArray.length < 2) {
            return await sock.sendMessage(chatId, {
                text:
`📌 Usage :

.gcreate <numero> <nom du groupe>

📌 Exemple :
.gcreate 237673355468 BRINDI TEAM

> BRINDI-XMD`
            }, { quoted: message });
        }

        // ─────────────────────────────
        // 📌 Numéro propre
        // ─────────────────────────────
        let number = (argsArray[0] || "").replace(/[^0-9]/g, '');

        // ─────────────────────────────
        // 📌 Nom groupe
        // ─────────────────────────────
        const groupName = argsArray.slice(1).join(' ').trim();

        // ─────────────────────────────
        // 📌 Vérifications
        // ─────────────────────────────
        if (!number || number.length < 8) {
            return await sock.sendMessage(chatId, {
                text:
`❌ Numéro invalide.

> BRINDI-XMD`
            }, { quoted: message });
        }

        if (!groupName || groupName.length < 3) {
            return await sock.sendMessage(chatId, {
                text:
`❌ Nom de groupe trop court.

> BRINDI-XMD`
            }, { quoted: message });
        }

        const userJid = number + '@s.whatsapp.net';

        // ─────────────────────────────
        // ⏳ Message attente
        // ─────────────────────────────
        await sock.sendMessage(chatId, {
            text:
`⏳ Création du groupe...

👤 Ajout : ${number}

> BRINDI-XMD`
        }, { quoted: message });

        // ─────────────────────────────
        // 📌 Création groupe (SAFE)
        // ─────────────────────────────
        let group;

        try {
            group = await sock.groupCreate(groupName, [userJid]);
        } catch (err) {
            throw new Error(err?.message || 'group_create_failed');
        }

        // ─────────────────────────────
        // 🔗 Lien groupe
        // ─────────────────────────────
        let inviteLink = 'Lien indisponible';

        try {
            const code = await sock.groupInviteCode(group.id);
            if (code) inviteLink = `https://chat.whatsapp.com/${code}`;
        } catch {}

        // ─────────────────────────────
        // ✅ SUCCESS
        // ─────────────────────────────
        await sock.sendMessage(chatId, {
            text:
`╭━━〔 ✅ BRINDI-XMD GROUP 〕━━⬣

👥 Groupe créé avec succès
📛 Nom : ${groupName}
👤 Membre : ${number}
🆔 ID : ${group.id}

🔗 Lien :
${inviteLink}

╰━━━━━━━━━━━━━━⬣

> BRINDI-XMD`
        }, { quoted: message });

    } catch (err) {

        console.error('GCREATE ERROR:', err);

        await sock.sendMessage(chatId, {
            text:
`❌ Impossible de créer le groupe.

> BRINDI-XMD`
        }, { quoted: message });
    }
}


// ─── JOIN : Rejoindre un groupe via lien ─────────────────
async function joinCommand(sock, chatId, args, message) {
    try {
        let input = args.join(' ').trim();

        // ─── Récupérer lien depuis message cité ───
        if (!input) {
            const quoted =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (quoted) {
                input =
                    quoted?.conversation ||
                    quoted?.extendedTextMessage?.text ||
                    quoted?.imageMessage?.caption ||
                    quoted?.videoMessage?.caption ||
                    '';
            }
        }

        // ─── Pas d'input → aide ───
        if (!input) {
            return await sock.sendMessage(chatId, {
                text: `📌 Exemple :\n\n.join https://chat.whatsapp.com/XXXX\n\n> BRINDI-XMD`
            }, { quoted: message });
        }

        // ─── Extraire le code (ignore ?mode=... et tout paramètre) ───
        const match = input.match(/chat\.whatsapp\.com\/([A-Za-z0-9]+)/i);

        if (!match) {
            return await sock.sendMessage(chatId, {
                text: `❌ Lien invalide.\n\n📌 Format attendu :\nhttps://chat.whatsapp.com/XXXX\n\n> BRINDI-XMD`
            }, { quoted: message });
        }

        const code = match[1];
        console.log('[JOIN] Code extrait:', code);

        // ─── Message d'attente ───
        await sock.sendMessage(chatId, {
            text: `⏳ Connexion au groupe en cours...\n\n> BRINDI-XMD`
        }, { quoted: message });

        // ─── Stratégie 1 : groupAcceptInvite classique ───
        let groupId = null;
        let method = '';

        try {
            groupId = await sock.groupAcceptInvite(code);
            method = 'v1';
        } catch (e1) {
            console.warn('[JOIN] Méthode V1 échouée:', e1.message);

            // ─── Stratégie 2 : groupAcceptInviteV4 ───
            try {
                const result = await sock.groupAcceptInviteV4(
                    message.key.remoteJid,
                    {
                        inviteCode: code,
                        inviteExpiration: undefined,
                        groupJid: undefined,
                        groupName: '',
                        fromMe: false,
                        participant: sock.user.id
                    }
                );
                groupId = result?.id || result || code;
                method = 'v4';
            } catch (e2) {
                console.warn('[JOIN] Méthode V4 échouée:', e2.message);

                // ─── Stratégie 3 : récupérer les infos du groupe d'abord ───
                try {
                    const inviteInfo = await sock.groupGetInviteInfo(code);
                    console.log('[JOIN] Infos groupe:', inviteInfo);

                    groupId = await sock.groupAcceptInvite(code);
                    method = 'v1-after-info';
                } catch (e3) {
                    console.error('[JOIN] Toutes les méthodes ont échoué:', e3.message);

                    // ─── Classifier l'erreur finale ───
                    const msg = (
                        e1.message + e2.message + e3.message
                    ).toLowerCase();

                    let errorMsg = '❌ Impossible de rejoindre le groupe.';

                    if (msg.includes('not-authorized') || msg.includes('forbidden')) {
                        errorMsg = '🚫 Le bot est banni ou exclu de ce groupe.';
                    } else if (msg.includes('revoked') || msg.includes('invalid') || msg.includes('bad-request')) {
                        errorMsg = '❌ Le lien est invalide ou expiré.\n\nDemande un nouveau lien au admin du groupe.';
                    } else if (msg.includes('already')) {
                        errorMsg = '✅ Le bot est déjà membre de ce groupe.';
                    } else if (msg.includes('timeout') || msg.includes('timed out')) {
                        errorMsg = '⏱️ Délai dépassé. Réessaie dans quelques instants.';
                    } else if (msg.includes('conflict')) {
                        errorMsg = '⚠️ Conflit détecté. Le bot est peut-être déjà dans le groupe.';
                    }

                    return await sock.sendMessage(chatId, {
                        text: `${errorMsg}\n\n> BRINDI-XMD`
                    }, { quoted: message });
                }
            }
        }

        // ─── Succès ───
        console.log(`[JOIN] Succès via méthode ${method}, groupId: ${groupId}`);

        await sock.sendMessage(chatId, {
            text: `✅ Groupe rejoint avec succès !\n\n🆔 ID : ${groupId}\n\n> BRINDI-XMD`
        }, { quoted: message });

    } catch (err) {
        // ─── Erreur globale inattendue ───
        console.error('[JOIN] Erreur globale:', err);

        await sock.sendMessage(chatId, {
            text: `⚠️ Une erreur inattendue s'est produite.\n\nRéessaie ou vérifie le lien.\n\n> BRINDI-XMD`
        }, { quoted: message });
    }
}


// ─── LEAVE : Quitter le groupe ───────────────────────────
async function leaveCommand(sock, chatId, message) {
    if (!chatId.endsWith('@g.us')) return;
    try {
        // Réaction 👋 sous le message
        await sock.sendMessage(chatId, {
            react: {
                text: '👋',
                key: message.key
            }
        });

        // Petit délai puis sortie discrète
        await new Promise(r => setTimeout(r, 1500));
        await sock.groupLeave(chatId);
    } catch (e) {
        console.error('[LEAVE ERROR]', e.message);
    }
}

// ─── LOCK : Fermer le groupe ─────────────────────────────
async function lockCommand(sock, chatId, message) {
    if (!chatId.endsWith('@g.us')) return await sock.sendMessage(chatId, { text: '❌ Uniquement dans les groupes !\n> BRINDI-XMD', }, { quoted: message });
    try {
        await sock.groupSettingUpdate(chatId, 'announcement');
        await sock.sendMessage(chatId, {
            text: `🔒 *Groupe verrouillé !*\n_Seuls les admins peuvent écrire._\n> BRINDI-XMD`,
        }, { quoted: message });  
    } catch (e) {  
        await sock.sendMessage(chatId, { text: `❌ *Erreur :* ${e.message}\n> BRINDI-XMD`, }, { quoted: message });  
    }
}

// ─── UNLOCK : Ouvrir le groupe ───────────────────────────
async function unlockCommand(sock, chatId, message) {
    if (!chatId.endsWith('@g.us')) return await sock.sendMessage(chatId, { text: '❌ Uniquement dans les groupes !\n> BRINDI-XMD' }, { quoted: message });
    try {
        await sock.groupSettingUpdate(chatId, 'not_announcement');
        await sock.sendMessage(chatId, {
            text: `🔓 *Groupe déverrouillé !*\n_Tout le monde peut écrire._\n> BRINDI-XMD`,
        }, { quoted: message });  
    } catch (e) {  
        await sock.sendMessage(chatId, { text: `❌ *Erreur :* ${e.message}\n> BRINDI-XMD`, }, { quoted: message });  
    }
}

// ─── KICKALL : Expulser tous les membres non-admins ──────
async function kickallCommand(sock, chatId, message) {
    if (!chatId.endsWith('@g.us')) return await sock.sendMessage(chatId, { text: '❌ Uniquement dans les groupes !\n> BRINDI-XMD',}, { quoted: message });
    try {
        const meta = await sock.groupMetadata(chatId);
        const nonAdmins = meta.participants.filter(p => !p.admin).map(p => p.id);
        if (nonAdmins.length === 0) {
            return await sock.sendMessage(chatId, { text: `ℹ️ *Aucun membre non-admin à expulser.*\n> BRINDI-XMD`, }, { quoted: message });
        }
        await sock.sendMessage(chatId, { text: `⏳ *Expulsion de ${nonAdmins.length} membres...*\n> BRINDI-XMD`, }, { quoted: message });
        await sock.groupParticipantsUpdate(chatId, nonAdmins, 'remove');
        await sock.sendMessage(chatId, {
            text: `✅ *${nonAdmins.length} membres expulsés !*\n> BRINDI-XMD`,
        }, { quoted: message });  
    } catch (e) {  
        await sock.sendMessage(chatId, { text: `❌ *Erreur :* ${e.message}\n> BRINDI-XMD`,}, { quoted: message });  
    }
}

// ─── VCF : Obtenir le contact d'un membre ───────────────
async function vcfCommand(sock, chatId, senderId, replyMessage, message) {

    let targetJid;

    const contextInfo =
        message.message?.extendedTextMessage?.contextInfo ||
        message.message?.ephemeralMessage?.message?.extendedTextMessage?.contextInfo;

    const mentioned = contextInfo?.mentionedJid?.[0];

    if (replyMessage) {
        targetJid =
            replyMessage.key?.participant ||
            replyMessage.key?.remoteJid;
    } else if (mentioned) {
        targetJid = mentioned;
    } else {
        targetJid = senderId;
    }

    try {

        // Exemple :
        // 237673123456:45@s.whatsapp.net
        // ↓
        // 237673123456
        const phoneNumber = targetJid
            .split('@')[0]
            .split(':')[0]
            .replace(/[^\d]/g, '');

        if (!phoneNumber || phoneNumber.length < 8) {
            throw new Error('Numéro invalide');
        }

        const displayName = `+${phoneNumber}`;

        const vcard =
`BEGIN:VCARD
VERSION:3.0
FN:${displayName}
TEL;type=CELL;type=VOICE;waid=${phoneNumber}:+${phoneNumber}
END:VCARD`;

        await sock.sendMessage(
            chatId,
            {
                contacts: {
                    displayName,
                    contacts: [{ vcard }]
                }
            },
            { quoted: message }
        );

    } catch (err) {

        console.error('[VCF ERROR]', err);

        await sock.sendMessage(
            chatId,
            {
                text: '❌ Impossible de récupérer le numéro.'
            },
            { quoted: message }
        );
    }
}

// ─── TAGADMIN : Mentionner tous les admins ───────────────
async function tagadminCommand(sock, chatId, args, message) {
    if (!chatId.endsWith('@g.us')) return await sock.sendMessage(chatId, { text: '❌ Uniquement dans les groupes !\n> BRINDI-XMD', }, { quoted: message });
    try {
        const meta = await sock.groupMetadata(chatId);
        const admins = meta.participants.filter(p => p.admin);
        if (admins.length === 0) return await sock.sendMessage(chatId, { text: `ℹ️ *Aucun admin trouvé.*\n> BRINDI-XMD`, }, { quoted: message });
        const mentions = admins.map(a => a.id);
        let list = admins.map((a, i) => `│ ${a.admin === 'superadmin' ? '👑' : '⭐'} @${a.id.split('@')[0]}`).join('\n');
        
        await sock.sendMessage(chatId, {
            image: { url: './assets/IMG-20240812-WA0097.jpg' },
            caption: `👑 *TAG ADMINS*\n\n${args.join(' ') || '📢 Attention admins !'}\n\n${list}\n\n> BRINDI-XMD`,
            mentions,
        }, { quoted: message });  
    } catch (e) {  
        await sock.sendMessage(chatId, { text: `❌ *Erreur :* ${e.message}\n> BRINDI-XMD`,}, { quoted: message });  
    }
}

// ─── ACCEPTALL : Accepter toutes les demandes ────────────
async function acceptallCommand(sock, chatId, message) {
    if (!chatId.endsWith('@g.us')) return await sock.sendMessage(chatId, { text: '❌ Uniquement dans les groupes !\n> BRINDI-XMD', }, { quoted: message });
    try {
        const requests = await sock.groupRequestParticipantsList(chatId);
        if (!requests || requests.length === 0) {
            return await sock.sendMessage(chatId, { text: `ℹ️ *Aucune demande en attente.*\n> BRINDI-XMD`,}, { quoted: message });
        }
        await sock.groupRequestParticipantsUpdate(chatId, requests.map(r => r.jid), 'approve');
        await sock.sendMessage(chatId, {
            text: `✅ *${requests.length} demandes acceptées !*\n> BRINDI-XMD`,
        }, { quoted: message });  
    } catch (e) {  
        await sock.sendMessage(chatId, { text: `❌ *Erreur :* ${e.message}\n> BRINDI-XMD`,  }, { quoted: message });  
    }
}

// ─── REJECTALL : Rejeter toutes les demandes ────────────
async function rejectallCommand(sock, chatId, message) {
    if (!chatId.endsWith('@g.us')) return await sock.sendMessage(chatId, { text: '❌ Uniquement dans les groupes !\n> BRINDI-XMD',  }, { quoted: message });
    try {
        const requests = await sock.groupRequestParticipantsList(chatId);
        if (!requests || requests.length === 0) {
            return await sock.sendMessage(chatId, { text: `ℹ️ *Aucune demande en attente.*\n> BRINDI-XMD`, }, { quoted: message });
        }
        await sock.groupRequestParticipantsUpdate(chatId, requests.map(r => r.jid), 'reject');
        await sock.sendMessage(chatId, {
            text: `🚫 *${requests.length} demandes rejetées !*\n> BRINDI-XMD`,
        }, { quoted: message });  
    } catch (e) {  
        await sock.sendMessage(chatId, { text: `❌ *Erreur :* ${e.message}\n> BRINDI-XMD`, }, { quoted: message });  
    }
}

module.exports = {
    pollCommand, gcreateCommand, joinCommand, leaveCommand,
    lockCommand, unlockCommand, kickallCommand, vcfCommand,
    tagadminCommand, acceptallCommand, rejectallCommand
};
