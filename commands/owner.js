const settings = require('../settings');

const BOT_IMAGE = './assets/IMG-20240812-WA0097.jpg';

async function ownerCommand(sock, chatId, message) {
    const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${settings.botOwner}\nTEL;waid=${settings.ownerNumber}:${settings.ownerNumber}\nEND:VCARD`;

    const caption = `👑 *PROPRIÉTAIRE DU BOT*

│ 👤 *Nom     :* ${settings.botOwner}
│ 📞 *Contact :* +${settings.ownerNumber}
│ 🤖 *Bot     :* ${settings.botName}
│ 📦 *Version :* v${settings.version}

📲 *Contacte le propriétaire ci-dessous :*
> BRINDI-XMD`;

    try {
        await sock.sendMessage(chatId, {
            image: { url: BOT_IMAGE },
            caption,
            
        }, { quoted: message });

        await sock.sendMessage(chatId, {
            contacts: { displayName: settings.botOwner, contacts: [{ vcard }] }
        });
    } catch (e) {
        console.error('❌ [owner]', e.message);
        await sock.sendMessage(chatId, { text: caption }, { quoted: message });
    }
}

module.exports = ownerCommand;
