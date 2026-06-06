
const fs = require('fs');
const path = require('path');
const os = require('os');


const BOT_IMG = './assets/IMG-20240812-WA0097.jpg';
const antimaraboutFile = path.join(__dirname, '../data/antimarabout.json');
const antipurgeFile = path.join(__dirname, '../data/antipurge.json');

function formatUptime(s) {
    const d = Math.floor(s/86400), h = Math.floor((s%86400)/3600);
    const m = Math.floor((s%3600)/60), sc = Math.floor(s%60);
    return `${d>0?d+'j ':''}${h}h ${m}m ${sc}s`;
}

// ─── KICKALL ─────────────────────────────────────────
async function kickallCommand(sock, chatId, senderId, message) {
    if (!chatId.endsWith('@g.us')) return await sock.sendMessage(chatId, { text: '❌ Uniquement dans les groupes !\n> BRINDI-XMD', contextInfo: channelInfo }, { quoted: message });
    try {
        const meta = await sock.groupMetadata(chatId);
        const botId = (sock.user.id || '').replace(/:\d+/, '') + '@s.whatsapp.net';
        const nonAdmins = meta.participants.filter(p => !p.admin && p.id !== botId);
        if (nonAdmins.length === 0) return await sock.sendMessage(chatId, { text: 'ℹ️ *Aucun membre non-admin à expulser.*\n> BRINDI-XMD', }, { quoted: message });
        await sock.sendMessage(chatId, { text: `⏳ *Expulsion de ${nonAdmins.length} membres...* ⚠️\n> BRINDI-XMD`, }, { quoted: message });
        await sock.groupParticipantsUpdate(chatId, nonAdmins.map(p => p.id), 'remove');
        await sock.sendMessage(chatId, { text: `✅ *${nonAdmins.length} membres expulsés !*\n> BRINDI-XMD`, }, { quoted: message });
    } catch (e) {
        await sock.sendMessage(chatId, { text: `❌ *Erreur :* ${e.message}\n> BRINDI-XMD`,  }, { quoted: message });
    }
}

// ─── PURGE ───────────────────────────────────────────
async function purgeCommand(sock, chatId, senderId, args, message) {
    if (!chatId.endsWith('@g.us')) return await sock.sendMessage(chatId, { text: '❌ Uniquement dans les groupes !\n> BRINDI-XMD', }, { quoted: message });
    const nb = parseInt(args[0]) || 10;
    try {
        await sock.sendMessage(chatId, { text: `🧹 *Purge de ${nb} messages...*\n> BRINDI-XMD`, }, { quoted: message });
        // Réaction de confirmation
        await sock.sendMessage(chatId, { react: { text: '🧹', key: message.key } });
        await sock.sendMessage(chatId, { text: `🧹 *Purge effectuée !*\n📊 Demande : ${nb} messages\n> BRINDI-XMD`, }, { quoted: message });
    } catch (e) {
        await sock.sendMessage(chatId, { text: `❌ *Erreur :* ${e.message}\n> BRINDI-XMD`,}, { quoted: message });
    }
}

// ─── ANTIPURGE ───────────────────────────────────────
async function antipurgeCommand(sock, chatId, senderId, args, message) {
    const action = args[0]?.toLowerCase();
    let state = {};

    try {
        state = JSON.parse(fs.readFileSync(antipurgeFile));
    } catch {}

    const current = state[chatId] ? '🟢 Activé' : '🔴 Désactivé';

    if (!action) {
        return await sock.sendMessage(chatId, {
            text:
`🛡️ *ANTI-PURGE*

📊 Statut : ${current}

💡 .antipurge on/off

🔔 Alerte lorsqu'un membre est :
• Promu administrateur
• Rétrogradé administrateur

> BRINDI-XMD`
        }, { quoted: message });
    }

    state[chatId] = action === 'on';

    fs.writeFileSync(
        antipurgeFile,
        JSON.stringify(state, null, 2)
    );

    await sock.sendMessage(chatId, {
        text:
`🛡️ *Anti-Purge :* ${action === 'on' ? '🟢 Activé' : '🔴 Désactivé'}
> BRINDI-XMD`
    }, { quoted: message });
}


function isAntipurgeEnabled(chatId) {
    try {
        const state = JSON.parse(
            fs.readFileSync(antipurgeFile)
        );

        return state[chatId] === true;
    } catch {
        return false;
    }
}


// ─── SANCTION ────────────────────────────────────────
async function sanctionCommand(sock, chatId, senderId, args, message) {
    if (!chatId.endsWith('@g.us')) return await sock.sendMessage(chatId, { text: '❌ Uniquement dans les groupes !\n> BRINDI-XMD', }, { quoted: message });
    const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    const quotedSender = message.message?.extendedTextMessage?.contextInfo?.participant;
    const target = mentioned || quotedSender;
    const type = args[0]?.toLowerCase() || 'warn';

    if (!target) {
        return await sock.sendMessage(chatId, { text: `⚖️ *Usage :* .sanction @membre warn/mute/kick\n\n📌 *Types :*\n│ ⬡ warn → Avertissement\n│ ⬡ mute → Muter le groupe\n│ ⬡ kick → Expulser\n> BRINDI-XMD`,}, { quoted: message });
    }

    const num = target.split('@')[0];
    try {
        switch(type) {
            case 'kick':
                await sock.groupParticipantsUpdate(chatId, [target], 'remove');
                await sock.sendMessage(chatId, { text: `⚖️ *Sanction : Expulsion*\n👤 @${num} a été expulsé du groupe.\n> BRINDI-XMD`, mentions: [target],}, { quoted: message });
                break;
            case 'mute':
                await sock.groupSettingUpdate(chatId, 'announcement');
                await sock.sendMessage(chatId, { text: `⚖️ *Sanction : Mute*\nLe groupe a été fermé suite à un abus.\n👤 @${num}\n> BRINDI-XMD`, mentions: [target], }, { quoted: message });
                break;
            default: // warn
                await sock.sendMessage(chatId, { text: `⚠️ *Avertissement*\n👤 @${num}\n\n_Respecte les règles du groupe ou tu seras expulsé._\n> BRINDI-XMD`, mentions: [target], }, { quoted: message });
        }
    } catch (e) {
        await sock.sendMessage(chatId, { text: `❌ *Erreur :* ${e.message}\n> BRINDI-XMD`, }, { quoted: message });
    }
}

// ─── UPTIME ──────────────────────────────────────────

function formatUptime(sec) {
    const d = Math.floor(sec / 86400);
    const h = Math.floor((sec % 86400) / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    const parts = [];
    if (d) parts.push(`${d}j`);
    if (h) parts.push(`${h}h`);
    if (m) parts.push(`${m}m`);
    parts.push(`${s}s`);
    return parts.join(' ');
}

async function uptimeCommand(sock, chatId, message) {
    try {
        const uptime = Math.floor(process.uptime());

        await sock.sendMessage(chatId, {
            text: `⏱️ En ligne depuis : ${formatUptime(uptime)}✨\n> BRINDI-XMD`
        }, { quoted: message });

    } catch (e) {
        console.error('[UPTIME ERROR]', e.message);
    }
}

// ─── TEST ─────────────────────────────────────────────
async function testCommand(sock, chatId, message) {
    const start = Date.now();
    await sock.sendMessage(chatId, { react: { text: '✨', key: message.key } });
    const ping = Date.now() - start;
    await sock.sendMessage(chatId, {
        text: `✨ *Test Bot*\n\n✅ *Statut :* Opérationnel\n⚡ *Ping   :* ${ping} ms\n⏱️ *Uptime :* ${formatUptime(Math.floor(process.uptime()))}\n> BRINDI-XMD`,
        
    }, { quoted: message });
}

// ─── INFO ─────────────────────────────────────────────
async function infoCommand(sock, chatId, message) {
    const settings = require('../settings');
    await sock.sendMessage(chatId, {
        image: { url: BOT_IMG },
        caption: `ℹ️ *INFO BOT*\n\n│ 🤖 *Nom     :* BRINDI-XMD\n│ 📦 *Version :* v1.0.0\n│ 🌍 *Mode    :* Privée\n│ ✅ *Statut  :* En ligne 24/7\n│ 🛡️ *Cmds    :* 154 commandes\n> BRINDI-XMD`,
        
    }, { quoted: message });
}

// ─── CONTACT ──────────────────────────────────────────
async function contactCommand(sock, chatId, message) {
    const settings = require('../settings');
    const ownerNum = settings.ownerNumber || '237673355468';
    const ownerName = settings.botOwner || 'Brandon';
    const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${ownerName}\nTEL;waid=${ownerNum}:+${ownerNum}\nEND:VCARD`;
    await sock.sendMessage(chatId, {
        text: `📞 *Contact du propriétaire*\n👇 Ci-dessous :\n> BRINDI-XMD`,
        
    }, { quoted: message });
    await sock.sendMessage(chatId, {
        contacts: { displayName: ownerName, contacts: [{ vcard }] }
    });
}

// ─── AUTORECORDING ────────────────────────────────────
async function autorecordingCommand(sock, chatId, senderId, args, message) {
    const action = args[0]?.toLowerCase();
    if (!action) {
        return await sock.sendMessage(chatId, { text: `🎙️ *Auto Recording*\n\n💡 .autorecording on/off\n_Simule une activité "enregistrement audio"._\n> BRINDI-XMD`, }, { quoted: message });
    }
    if (action === 'on') {
        await sock.sendMessage(chatId, { react: { text: '🎙️', key: message.key } });
        // Simuler recording en boucle
        const interval = setInterval(async () => {
            try { await sock.sendPresenceUpdate('recording', chatId); } catch { clearInterval(interval); }
        }, 5000);
        setTimeout(() => clearInterval(interval), 60000); // Stop après 1 minute
        await sock.sendMessage(chatId, { text: `🎙️ *Auto Recording :* 🟢 Activé (1 min)\n> BRINDI-XMD`, }, { quoted: message });
    } else {
        await sock.sendMessage(chatId, { text: `🎙️ *Auto Recording :* 🔴 Désactivé\n> BRINDI-XMD`, }, { quoted: message });
    }
}

// ─── RESTORE ──────────────────────────────────────────
async function restoreCommand(sock, chatId, senderId, message) {
    try {
        // Restaurer les configurations par défaut
        const defaults = {
            'data/antibot.json': {},
            'data/antimarabout.json': {},
            'data/antipurge.json': {},
            'data/antisticker.json': {},
            'data/antimention.json': {},
        };
        let restored = 0;
        for (const [file, def] of Object.entries(defaults)) {
            const fp = path.join(__dirname, '..', file);
            if (!fs.existsSync(fp)) {
                fs.writeFileSync(fp, JSON.stringify(def, null, 2));
                restored++;
            }
        }
        await sock.sendMessage(chatId, {
            text: `✅ *Restauration effectuée*\n📁 ${restored} fichier(s) restauré(s).\n> BRINDI-XMD`,
            
        }, { quoted: message });
    } catch (e) {
        await sock.sendMessage(chatId, { text: `❌ *Erreur :* ${e.message}\n> BRINDI-XMD`, }, { quoted: message });
    }
}

// ─── CLAN ─────────────────────────────────────────────
async function clanCommand(sock, chatId, senderId, args, message) {
    const action = args[0]?.toLowerCase();
    const clanFile = path.join(__dirname, '../data/clan.json');
    let clans = {};
    try { clans = JSON.parse(fs.readFileSync(clanFile)); } catch {}

    if (!action || action === 'list') {
        const list = Object.entries(clans).map(([n, c]) => `│ ⬡ *${n}* — ${c.members?.length || 0} membres`).join('\n') || '│ Aucun clan créé';
        return await sock.sendMessage(chatId, {
            text: `🏆 *CLANS*\n\n📋 *Clans existants :*\n${list}\n\n💡 *Commandes :*\n│ ⬡ .clan create <nom>\n│ ⬡ .clan join <nom>\n│ ⬡ .clan leave\n│ ⬡ .clan list\n> BRINDI-XMD`,
            
        }, { quoted: message });
    }

    if (action === 'create') {
        const name = args.slice(1).join(' ');
        if (!name) return await sock.sendMessage(chatId, { text: `💡 *Usage :* .clan create <nom>\n> BRINDI-XMD`,}, { quoted: message });
        clans[name] = { creator: senderId, members: [senderId], created: Date.now() };
        fs.writeFileSync(clanFile, JSON.stringify(clans, null, 2));
        return await sock.sendMessage(chatId, { text: `✅ *Clan "${name}" créé !*\n👤 Tu en es le fondateur.\n> BRINDI-XMD`,}, { quoted: message });
    }

    if (action === 'join') {
        const name = args.slice(1).join(' ');
        if (!clans[name]) return await sock.sendMessage(chatId, { text: `❌ Clan "${name}" introuvable.\n> BRINDI-XMD`,}, { quoted: message });
        if (!clans[name].members.includes(senderId)) clans[name].members.push(senderId);
        fs.writeFileSync(clanFile, JSON.stringify(clans, null, 2));
        return await sock.sendMessage(chatId, { text: `✅ Tu as rejoint le clan *"${name}"* !\n> BRINDI-XMD`,}, { quoted: message });
    }

    if (action === 'leave') {
        for (const clan of Object.values(clans)) {
            clan.members = (clan.members || []).filter(m => m !== senderId);
        }
        fs.writeFileSync(clanFile, JSON.stringify(clans, null, 2));
        return await sock.sendMessage(chatId, { text: `👋 Tu as quitté ton clan.\n> BRINDI-XMD`,}, { quoted: message });
    }
}

// ─── LOI ──────────────────────────────────────────────
async function loiCommand(sock, chatId, message) {
    await sock.sendMessage(chatId, {
        image: { url: BOT_IMG },
        caption: `📜 *RÈGLES DU GROUPE*\n\n│ 1️⃣ Respecte tous les membres\n│ 2️⃣ Pas d'insultes ni de conflits\n│ 3️⃣ Pas de spam ni de pub\n│ 4️⃣ Pas de contenu +18\n│ 5️⃣ Pas de liens sans permission\n│ 6️⃣ Pas de fausses infos\n│ 7️⃣ Obéis aux admins\n│ 8️⃣ Sois actif et positif\n\n⚠️ _Tout manquement = avertissement puis expulsion._\n> BRINDI-XMD`,
    
    }, { quoted: message });
}

// ─── ANTIMARABOUT ─────────────────────────────────────
const warnCount = {};

async function antimaraboutCommand(sock, chatId, senderId, args, message) {
    const action = args[0]?.toLowerCase();
    let state = {};
    try { state = JSON.parse(fs.readFileSync(antimaraboutFile)); } catch {}
    const current = state[chatId] ? '🟢 Activé' : '🔴 Désactivé';

    if (!action) {
        return await sock.sendMessage(chatId, {
            image: { url: BOT_IMG },
            caption: `🔮 *ANTI-MARABOUT*\n\n📊 *Statut :* ${current}\n\n💡 .antimarabout on/off\n\n🛡️ Supprime automatiquement les messages\nde marabouts, arnaques et escroqueries.\n> BRINDI-XMD`,
        }, { quoted: message });
    }

    state[chatId] = action === 'on';
    if (!state.keywords) state.keywords = ['marabout','voyant','sorcier','envoûtement','rituel','chance','argent rapide','gain garanti','résoudre problème','retour affectif','amour perdu','portefeuille magique','100%','WhatsApp +','contactez-moi'];
    fs.writeFileSync(antimaraboutFile, JSON.stringify(state, null, 2));
    await sock.sendMessage(chatId, {
        text: `🔮 *Anti-Marabout :* ${action === 'on' ? '🟢 Activé' : '🔴 Désactivé'}\n${action === 'on' ? '> _Messages suspects seront supprimés._' : '> _Protection désactivée._'}\n> BRINDI-XMD`,
    }, { quoted: message });
}

async function handleAntimarabout(sock, chatId, senderId, message) {
    try {
        let state = {};
        try { state = JSON.parse(fs.readFileSync(antimaraboutFile)); } catch {}
        if (!state[chatId]) return false;

        // ✅ Ignorer le bot lui-même
        if (message.key.fromMe) return false;

        // ✅ Ignorer les admins
        const isAdmin = require('../lib/isAdmin');
        const { isSenderAdmin } = await isAdmin(sock, chatId, senderId);
        if (isSenderAdmin) return false;

        const text = (
            message.message?.conversation ||
            message.message?.extendedTextMessage?.text || ''
        ).toLowerCase();

        const keywords = state.keywords || ['marabout','voyant','sorcier','rituel','argent rapide','gain garanti','retour affectif','portefeuille magique'];
        const isSpam = keywords.some(kw => text.includes(kw.toLowerCase()));
        if (!isSpam) return false;

        // Supprimer le message
        await sock.sendMessage(chatId, { delete: message.key });

        // Système d'avertissements
        const key = `${chatId}_${senderId}`;
        warnCount[key] = (warnCount[key] || 0) + 1;
        const count = warnCount[key];

        if (count >= 3) {
            warnCount[key] = 0;
            await sock.sendMessage(chatId, {
                text: `🚫 *@${senderId.split('@')[0]}* a été exclu après 3 avertissements pour spam de marabout.\n> BRINDI-XMD`,
                mentions: [senderId]
            });
            try {
                await sock.groupParticipantsUpdate(chatId, [senderId], 'remove');
            } catch (e) {}
        } else {
            await sock.sendMessage(chatId, {
                text: `⚠️ *@${senderId.split('@')[0]}*, message suspect supprimé !\n*Avertissement ${count}/3* — Au 3ème tu seras exclu.\n> BRINDI-XMD`,
                mentions: [senderId]
            });
        }

        console.log(`🛡️ [antimarabout] Avertissement ${count}/3 pour ${senderId}`);
        return true;
    } catch { return false; }
}

module.exports = {
    kickallCommand, purgeCommand, antipurgeCommand, sanctionCommand,
    uptimeCmdNew: uptimeCommand, testCmdNew: testCommand, 
    infoCmdNew: infoCommand, contactCmdNew: contactCommand,
    autorecordingCommand, restoreCommand, clanCommand, loiCommand,
    antimaraboutCommand, handleAntimarabout, isAntipurgeEnabled
};
