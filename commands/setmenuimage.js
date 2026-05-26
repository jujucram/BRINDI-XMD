const fs = require('fs');
const path = require('path');
const isOwnerOrSudo = require('../lib/isOwner');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const axios = require('axios');

const imgPath = path.join(__dirname, '../data/menuimage.json');


if (!fs.existsSync(imgPath)) fs.writeFileSync(imgPath, JSON.stringify({ url: './assets/IMG-20240812-WA0097.jpg' }));

async function setmenuimageCommand(sock, chatId, senderId, args, replyMessage, message) {
    // Via URL en argument
    if (args[0] && args[0].startsWith('http')) {
        fs.writeFileSync(imgPath, JSON.stringify({ url: args[0] }));
        return await sock.sendMessage(chatId, {
            image: { url: args[0] },
            caption: `🖼️ *IMAGE MENU MÀJ*\n\n✅ *Image du menu mise à jour !*\n> BRINDI-XMD`,
            
        }, { quoted: message });
    }

    // Via image en réponse
    if (replyMessage?.imageMessage) {
        try {
            const stream = await downloadContentFromMessage(replyMessage.imageMessage, 'image');
            let buf = Buffer.from([]);
            for await (const chunk of stream) buf = Buffer.concat([buf, chunk]);

            // Upload image sur uguu.se
            const FormData = require('form-data');
            const form = new FormData();
            form.append('files[]', buf, { filename: 'menu.jpg', contentType: 'image/jpeg' });
            const res = await axios.post('https://uguu.se/upload.php', form, { headers: form.getHeaders() });
            const uploadedUrl = res.data?.files?.[0]?.url;

            if (uploadedUrl) {
                fs.writeFileSync(imgPath, JSON.stringify({ url: uploadedUrl }));
                return await sock.sendMessage(chatId, {
                    image: { url: uploadedUrl },
                    caption: `🖼️ *IMAGE MENU MÀJ*\n\n✅ *Image du menu mise à jour !*\n🔗 ${uploadedUrl}\n> BRINDI-XMD`,
                    
                }, { quoted: message });
            }
        } catch (e) {
            console.error('❌ [setmenuimage]', e.message);
        }
    }

    // Usage
    return await sock.sendMessage(chatId, {
        text: `🖼️ *IMAGE DU MENU*\n\n💡 *Méthodes :*\n│ 1️⃣ Réponds à une image avec *.setmenuimage*\n│ 2️⃣ *.setmenuimage <url>*\n> BRINDI-XMD`,
        
    }, { quoted: message });
}

module.exports = setmenuimageCommand;
