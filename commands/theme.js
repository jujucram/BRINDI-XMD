const fs = require('fs');
const path = require('path');



const themes = [
    { num: 1, url: 'https://i.ibb.co/xSScX4bP/file-0000000060a471fd918d46d4c7c69a21.png',   label: '🌑 Thème 1' },
    { num: 2, url: 'https://i.ibb.co/xSScX4bP/file-0000000060a471fd918d46d4c7c69a21.png',   label: '🔵 Thème 2' },
    { num: 3, url: 'https://i.ibb.co/xSScX4bP/file-0000000060a471fd918d46d4c7c69a21.png',   label: '🟣 Thème 3' },
    { num: 4, url: 'https://i.ibb.co/xSScX4bP/file-0000000060a471fd918d46d4c7c69a21.png',   label: '🔴 Thème 4' },
    { num: 5, url: 'https://i.ibb.co/xSScX4bP/file-0000000060a471fd918d46d4c7c69a21.png',   label: '🟠 Thème 5' },
    { num: 6, url: 'https://i.ibb.co/xSScX4bP/file-0000000060a471fd918d46d4c7c69a21.png',   label: '🟢 Thème 6' },
    { num: 7, url: 'https://i.ibb.co/xSScX4bP/file-0000000060a471fd918d46d4c7c69a21.png', label: '🌌 Thème 7' },
    { num: 8, url: 'https://i.ibb.co/xSScX4bP/file-0000000060a471fd918d46d4c7c69a21.png',   label: '⚡ Thème 8' },
];

const menuImagePath = path.join(__dirname, '../data/menuimage.json');

function setMenuImage(url) {
    try {
        fs.writeFileSync(menuImagePath, JSON.stringify({ url }, null, 2));
        return true;
    } catch { return false; }
}

async function themeCommand(sock, chatId, args, message) {
    const num = parseInt(args[0]);

    // Sans argument → afficher la liste
    if (!num || isNaN(num)) {
        let list = `╔═════════════════════╗\n║   🥷 *BRINDI-𝗫𝗠𝗗-𝐕1* 🥷   ║\n╠═════════════════════╣\n║     🎨 *GALERIE THÈMES*    ║\n╚═════════════════════╝\n\n`;

        themes.forEach(t => {
            list += `🥷────────────────🥷\n│ 🖼️ *Img ${t.num}* — ${t.label}\n╰────────────────🥷\n`;
        });

        list += `\n💡 *Usage :* \`.theme <1-8>\`\n_Exemple : .theme 3_\n\n⚠️ *Le thème choisi deviendra l'image du menu !*\n\n> _Propulsé par 🥷 *Brandon*_`;

        return await sock.sendMessage(chatId, {
            image: { url: themes[0].url },
            caption: list,
            
        }, { quoted: message });
    }

    if (num < 1 || num > 8) {
        return await sock.sendMessage(chatId, {
            text: `❌ *Numéro invalide !*\nChoisissez entre *1* et *8*.\n💡 Tape *.theme* pour voir la liste.`,
            
        }, { quoted: message });
    }

    const selected = themes[num - 1];

    // ✅ Mettre à jour l'image du menu avec ce thème
    setMenuImage(selected.url);

    // Envoyer les 8 images dans l'ordre
    await sock.sendMessage(chatId, {
        text: `🎨 *Chargement des 8 thèmes...*`,
        
    }, { quoted: message });

    for (const t of themes) {
        await new Promise(r => setTimeout(r, 600));
        await sock.sendMessage(chatId, {
            image: { url: t.url },
            caption: `╔═════════════════════╗\n║   🥷 *BRINDI-𝗫𝗠𝗗-𝐕1* 🥷   ║\n╠═════════════════════╣\n║      🎨 *GALERIE THÈMES*   ║\n╚═════════════════════╝\n\n🖼️ *Img ${t.num}* / 8 — ${t.label}${t.num === num ? '\n\n✅ *← Thème sélectionné !*' : ''}`,
        });
    }

    // Confirmation finale
    await sock.sendMessage(chatId, {
        text: `╔═════════════════════╗\n║   🥷 *BRINDI-𝗫𝗠𝗗-𝐕1* 🥷   ║\n╠═════════════════════╣\n║   ✅ *THÈME APPLIQUÉ*      ║\n╚═════════════════════╝\n\n🎨 *${selected.label}* activé !\n🖼️ *Img ${selected.num}* / 8\n\n✅ *Cette image est maintenant l'image du menu !*\n💡 Tape *.menu* pour vérifier.\n\n> _Propulsé par 🥷 *Brandon*_`,
        
    }, { quoted: message });
}

module.exports = themeCommand;
