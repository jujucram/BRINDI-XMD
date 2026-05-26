const fs = require('fs');
const path = require('path');
const isOwnerOrSudo = require('../lib/isOwner');

const selfPath = path.join(__dirname, '../data/selfmode.json');


if (!fs.existsSync(selfPath)) fs.writeFileSync(selfPath, JSON.stringify({ enabled: false }));
function getConfig() { try { return JSON.parse(fs.readFileSync(selfPath)); } catch { return { enabled: false }; } }
function saveConfig(d) { fs.writeFileSync(selfPath, JSON.stringify(d, null, 2)); }

async function selfCommand(sock, chatId, senderId, args, message) {
    const isOwner = await isOwnerOrSudo(senderId, sock, chatId);
    if (!isOwner) {
        return await sock.sendMessage(chatId, {
            text: `❌ *Réservé au propriétaire !*\n> BRINDI-XMD`,
            
        }, { quoted: message });
    }

    const config = getConfig();
    const action = args[0]?.toLowerCase();
    const current = config.enabled ? '🟢 Activé' : '🔴 Désactivé';

    if (!action) {
        return await sock.sendMessage(chatId, {
            image: { url: './assets/IMG-20240812-WA0097.jpg' },
            caption: `🔐 *MODE SELF*

📊 *Statut :* ${current}

📌 *Commandes :*
│ ⬡ .self on  → Mode privé
│ ⬡ .self off → Mode public

🔐 *Fonctionnement :*
│ Mode *ON* : Seul le propriétaire et les sudos peuvent utiliser les commandes du bot.
│ Mode *OFF* : Tout le monde peut utiliser le bot.

> BRINDI-XMD`,
        
        }, { quoted: message });
    }

    config.enabled = action === 'on';
    saveConfig(config);

    if (action === 'on') {
        return await sock.sendMessage(chatId, {
            image: { url: './assets/IMG-20240812-WA0097.jpg' },
            caption: `🔐 *MODE SELF ACTIVÉ*

🔐 *Self Mode :* 🟢 Activé

│ ✅ Bot réservé au propriétaire
│ 🚫 Commandes publiques bloquées
│ 👑 Seul le proprio & sudos peuvent utiliser le bot

_Tape .self off pour désactiver._
> BRINDI-XMD`,
            
        }, { quoted: message });
    }

    return await sock.sendMessage(chatId, {
        image: { url: './assets/IMG-20240812-WA0097.jpg' },
        caption: `🔓 *MODE PUBLIC*

🔓 *Self Mode :* 🔴 Désactivé

│ ✅ Bot accessible à tous
│ 🌍 Mode public activé

> BRINDI-XMD`,
        
    }, { quoted: message });
}

module.exports = selfCommand;
module.exports.isSelfMode = () => getConfig().enabled;
