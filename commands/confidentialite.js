// ─── GETPRIVACY : Voir les paramètres de confidentialité ─
async function getprivacyCommand(sock, chatId, message) {
    try {
        const privacy = await sock.fetchPrivacySettings(true);

        const f = (v) => ({
            'all': '🌍 Tout le monde',
            'contacts': '👥 Contacts',
            'contact_blacklist': '❌ Sauf certains',
            'none': '🔒 Personne'
        }[v] || v);

        await sock.sendMessage(chatId, {
            image: { url: './assets/IMG-20240812-WA0097.jpg' },
            caption:
`🔒 *CONFIDENTIALITÉ DU BOT*

👁️ *Vu en dernier :* ${f(privacy.last)}
📸 *Photo de profil :* ${f(privacy.profile)}
ℹ️ *Info perso :* ${f(privacy.status)}
🟢 *En ligne :* ${f(privacy.online)}
👥 *Groupes :* ${f(privacy.groupadd)}
📞 *Appels :* ${f(privacy.calladd)}

> BRINDI-XMD`
        }, { quoted: message });

    } catch (e) {
        await sock.sendMessage(chatId, {
            text: `❌ *Erreur :* ${e.message}\n> BRINDI-XMD`
        }, { quoted: message });
    }
}

// ─── LASTSEEN ────────────────────────────────────────────
async function lastseenCommand(sock, chatId, args, message) {
    const val = args[0]?.toLowerCase();

    const opts = {
        'all': 'tout le monde',
        'contacts': 'contacts',
        'none': 'personne'
    };

    if (!val || !opts[val]) {
        return await sock.sendMessage(chatId, {
            text:
`👁️ *Vu en dernier*

💡 *Usage :* .lastseen <option>

⬡ .lastseen all
⬡ .lastseen contacts
⬡ .lastseen none

> BRINDI-XMD`
        }, { quoted: message });
    }

    try {
        await sock.updateLastSeenPrivacy(val);

        await sock.sendMessage(chatId, {
            text: `✅ *Vu en dernier :* ${opts[val]}\n> BRINDI-XMD`
        }, { quoted: message });

    } catch (e) {
        await sock.sendMessage(chatId, {
            text: `❌ *Erreur :* ${e.message}\n> BRINDI-XMD`
        }, { quoted: message });
    }
}

// ─── ONLINE ──────────────────────────────────────────────
async function onlineCommand(sock, chatId, args, message) {
    const val = args[0]?.toLowerCase();

    if (!val || !['all', 'match_last_seen'].includes(val)) {
        return await sock.sendMessage(chatId, {
            text:
`💡 *Usage :* .online <option>

⬡ .online all
⬡ .online match_last_seen

> BRINDI-XMD`
        }, { quoted: message });
    }

    try {
        await sock.updateOnlinePrivacy(val);

        await sock.sendMessage(chatId, {
            text: `✅ *Statut en ligne :* ${val}\n> BRINDI-XMD`
        }, { quoted: message });

    } catch (e) {
        await sock.sendMessage(chatId, {
            text: `❌ *Erreur :* ${e.message}\n> BRINDI-XMD`
        }, { quoted: message });
    }
}

// ─── PRESENCE ────────────────────────────────────────────
async function presenceCommand(sock, chatId, args, message) {
    const types = {
        'online': 'available',
        'typing': 'composing',
        'recording': 'recording',
        'offline': 'unavailable'
    };

    const type = args[0]?.toLowerCase() || 'online';
    const presence = types[type] || 'available';

    try {
        await sock.sendPresenceUpdate(presence, chatId);

        await sock.sendMessage(chatId, {
            text: `✅ *Présence :* ${type}\n> BRINDI-XMD`
        }, { quoted: message });

    } catch (e) {
        await sock.sendMessage(chatId, {
            text: `❌ *Erreur :* ${e.message}\n> BRINDI-XMD`
        }, { quoted: message });
    }
}

// ─── SETBIO ──────────────────────────────────────────────
async function setbioCommand(sock, chatId, args, message) {
    const bio = args.join(' ');

    if (!bio) {
        return await sock.sendMessage(chatId, {
            text:
`💡 *Usage :* .setbio <texte>

Exemple :
.setbio 🥷 BRINDI-XMD

> BRINDI-XMD`
        }, { quoted: message });
    }

    try {
        await sock.updateProfileStatus(bio);

        await sock.sendMessage(chatId, {
            text:
`✅ *Bio mise à jour !*

📝 ${bio}

> BRINDI-XMD`
        }, { quoted: message });

    } catch (e) {
        await sock.sendMessage(chatId, {
            text: `❌ *Erreur :* ${e.message}\n> BRINDI-XMD`
        }, { quoted: message });
    }
}

// ─── MYPP ────────────────────────────────────────────────
async function myppCommand(sock, chatId, message) {
    try {
        const pp = await sock.profilePictureUrl(sock.user.id, 'image');

        await sock.sendMessage(chatId, {
            image: { url: pp },
            caption:
`📸 *Photo de profil du bot*

> BRINDI-XMD`
        }, { quoted: message });

    } catch (e) {
        await sock.sendMessage(chatId, {
            text: `❌ *Impossible de récupérer la photo de profil.*\n> BRINDI-XMD`
        }, { quoted: message });
    }
}

// ─── MYSTATUS ────────────────────────────────────────────
async function mystatusCommand(sock, chatId, message) {
    try {
        const status = await sock.fetchStatus(sock.user.id);

        await sock.sendMessage(chatId, {
            text:
`ℹ️ *BIO DU BOT*

📝 *Bio :* ${status?.status || '_Aucune bio_'}
📅 *Définie le :* ${status?.setAt ? new Date(status.setAt).toLocaleDateString('fr-FR') : 'Inconnu'}

> BRINDI-XMD`
        }, { quoted: message });

    } catch (e) {
        await sock.sendMessage(chatId, {
            text: `❌ *Erreur :* ${e.message}\n> BRINDI-XMD`
        }, { quoted: message });
    }
}

// ─── GROUPADD ────────────────────────────────────────────
async function groupaddCommand(sock, chatId, args, message) {
    const val = args[0]?.toLowerCase();

    const opts = {
        'all': 'tout le monde',
        'contacts': 'contacts',
        'contact_blacklist': 'sauf certains',
        'none': 'personne'
    };

    if (!val || !opts[val]) {
        return await sock.sendMessage(chatId, {
            text:
`💡 *Usage :* .groupadd <option>

⬡ .groupadd all
⬡ .groupadd contacts
⬡ .groupadd none

> BRINDI-XMD`
        }, { quoted: message });
    }

    try {
        await sock.updateGroupsAddPrivacy(val);

        await sock.sendMessage(chatId, {
            text: `✅ *Qui peut m'ajouter :* ${opts[val]}\n> BRINDI-XMD`
        }, { quoted: message });

    } catch (e) {
        await sock.sendMessage(chatId, {
            text: `❌ *Erreur :* ${e.message}\n> BRINDI-XMD`
        }, { quoted: message });
    }
}

// ─── READ ────────────────────────────────────────────────
async function readCommand(sock, chatId, message) {
    try {
        await sock.sendReadReceipt(chatId, null, [message.key.id]);

        await sock.sendMessage(chatId, {
            react: { text: '✅', key: message.key }
        });

    } catch (e) {
        await sock.sendMessage(chatId, {
            text: `❌ *Erreur :* ${e.message}\n> BRINDI-XMD`
        }, { quoted: message });
    }
}

module.exports = {
    getprivacyCommand,
    lastseenCommand,
    onlineCommand,
    presenceCommand,
    setbioCommand,
    myppCommand,
    mystatusCommand,
    groupaddCommand,
    readCommand
};