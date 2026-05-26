const fs = require('fs');
const path = require('path');
const isOwnerOrSudo = require('../lib/isOwner');

const stylePath =
    path.join(
        __dirname,
        '../data/menustyle.json'
    );

// Création fichier si inexistant
if (!fs.existsSync(stylePath)) {

    fs.writeFileSync(
        stylePath,
        JSON.stringify({ style: 1 })
    );
}

// Récupère style actuel
function getStyle() {

    try {

        return JSON.parse(
            fs.readFileSync(stylePath)
        ).style || 1;

    } catch {

        return 1;
    }
}

// Sauvegarde style
function saveStyle(style) {

    fs.writeFileSync(
        stylePath,
        JSON.stringify({ style })
    );
}

// Styles disponibles
const styles = {

    1: {
        name: '🥷 Style Ninja',
        preview:
`╔══╗
║  ║
╚══╝`
    },

    2: {
        name: '⚡ Style Électrique',
        preview:
`┌──┐
│  │
└──┘`
    },

    3: {
        name: '🌑 Style Sombre',
        preview:
`▛▀▀▜
▌  ▐
▙▄▄▟`
    },

    4: {
        name: '🎯 Style Minimal',
        preview:
`────
    
────`
    },

    5: {
        name: '👑 Style Royal',
        preview:
`◈════◈
║    ║
◈════◈`
    }
};

async function menustyleCommand(
    sock,
    chatId,
    senderId,
    args,
    message
) {

    const current =
        getStyle();

    const num =
        parseInt(args[0]);

    // Affiche liste styles
    if (!num || isNaN(num)) {

        let list =
`🎨 *STYLES DE MENU DISPONIBLES*

`;

        for (const [k, v]
            of Object.entries(styles)) {

            list +=
`┌────────────────────
│ *Style ${k}*
│ ${v.name}
${parseInt(k) === current
? '│ ✅ Actuel'
: ''}
└────────────────────

`;
        }

        list +=
`💡 *Utilisation :*
.menustyle <1-5>

📌 Exemple :
.menustyle 3

> BRINDI-XMD`;

        return await sock.sendMessage(chatId, {

            text: list

        }, { quoted: message });
    }

    // Vérifie style valide
    if (!styles[num]) {

        return await sock.sendMessage(chatId, {

            text:
`❌ *Style invalide !*

Choisissez un numéro entre *1* et *5*.

> BRINDI-XMD`

        }, { quoted: message });
    }

    // Sauvegarde nouveau style
    saveStyle(num);

    return await sock.sendMessage(chatId, {

        text:
`✅ *Style du menu modifié avec succès !*

🎨 *Nouveau style :*
${styles[num].name}

💡 Utilisez *.menu*
pour voir le changement.

> BRINDI-XMD`

    }, { quoted: message });
}

module.exports = menustyleCommand;