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
async function gcreateCommand(sock, chatId, senderId, args, message) {
    const name = args.join(' ');
    if (!name) {
        return await sock.sendMessage(chatId, {
            text: `👥 *Créer un groupe*\n\n💡 *Usage :* *.gcreate <nom du groupe>*\n> BRINDI-XMD`,
        }, { quoted: message });
    }

    try {  
        const formattedSender = senderId.includes('@s.whatsapp.net') ? senderId : `${senderId}@s.whatsapp.net`;  
        const group = await sock.groupCreate(name, [formattedSender]);  
        const groupId = group.gid || group.id;  

        await sock.sendMessage(chatId, {  
            text: `✅ *Groupe créé :* ${name}\n🆔 *JID :* ${groupId}\n> BRINDI-XMD`,  
        }, { quoted: message });  
    } catch (e) {  
        await sock.sendMessage(chatId, { text: `❌ *Erreur :* ${e.message}\n> BRINDI-XMD` }, { quoted: message });  
    }
}

// ─── JOIN : Rejoindre un groupe via lien ─────────────────
async function joinCommand(sock, chatId, args, message) {
    const input = args[0];

    if (!input) {  
        return await sock.sendMessage(chatId, {  
            text: `💡 *Usage :* *.join <lien du groupe>*\n_Exemple : .join https://chat.whatsapp.com/LienDuGroupe_\n> BRINDI-XMD`,  
        }, { quoted: message });  
    }  

    try {  
        const regex = /(?:chat\.whatsapp\.com\/|invite\/)([a-zA-Z0-9]{22,24})/;  
        const match = input.match(regex);  
        const code = match ? match[1] : input.trim();  

        if (!code) {  
            throw new Error("Le lien ou le code fourni est invalide.");  
        }  

        await sock.groupAcceptInvite(code);  

        await sock.sendMessage(chatId, {  
            text: `✅ *Le bot a rejoint le groupe avec succès !*\n> BRINDI-XMD`,  
        }, { quoted: message });  
    } catch (e) {  
        let errorMessage = e.message;  
        if (e.message.includes('not-authorized')) errorMessage = "Le bot ne peut pas rejoindre ce groupe (invitation expirée ou bot banni).";  
        
        await sock.sendMessage(chatId, {   
            text: `❌ *Erreur :* ${errorMessage}\n> BRINDI-XMD`   
        }, { quoted: message });  
    }
}

// ─── LEAVE : Quitter le groupe ───────────────────────────
async function leaveCommand(sock, chatId, message) {
    if (!chatId.endsWith('@g.us')) return await sock.sendMessage(chatId, { text: '❌ Uniquement dans les groupes !\n> BRINDI-XMD', }, { quoted: message });
    try {
        await sock.sendMessage(chatId, { text: `👋 *Brindi quitte le groupe...*\n_Au revoir !_\n> BRINDI-XMD`, }, { quoted: message });
        await new Promise(r => setTimeout(r, 2000));
        await sock.groupLeave(chatId);
    } catch (e) {
        await sock.sendMessage(chatId, { text: `❌ *Erreur :* ${e.message}\n> BRINDI-XMD`, }, { quoted: message });
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
    let targetJid = null;
    const contextInfo = message.message?.extendedTextMessage?.contextInfo || message.message?.ephemeralMessage?.message?.extendedTextMessage?.contextInfo;  
    const mentioned = contextInfo?.mentionedJid?.[0];  

    if (replyMessage) {  
        targetJid = contextInfo?.participant || contextInfo?.remoteJid || senderId;  
    } else if (mentioned) {  
        targetJid = mentioned;  
    } else {  
        targetJid = senderId;  
    }  

    try {  
        const cleanJid = targetJid.split('@')[0].split(':')[0];  
        if (!cleanJid || isNaN(cleanJid)) {  
            throw new Error("Impossible de récupérer un numéro de téléphone valide.");  
        }  

        const displayName = `👤 Contact +${cleanJid}`;  
        const vcard = `BEGIN:VCARD\n` +  
                      `VERSION:3.0\n` +  
                      `FN:${displayName}\n` +  
                      `ORG:BRINDI-XMD;\n` +  
                      `TEL;type=CELL;type=VOICE;waid=${cleanJid}:+${cleanJid}\n` +  
                      `END:VCARD`;  

        await sock.sendMessage(chatId, {  
            contacts: {   
                displayName: displayName,   
                contacts: [{ vcard }]   
            }  
        }, { quoted: message });  
    } catch (e) {  
        await sock.sendMessage(chatId, {   
            text: `❌ *Erreur :* ${e.message}\n> BRINDI-XMD`   
        }, { quoted: message });  
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
