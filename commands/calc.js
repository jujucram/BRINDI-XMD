
const NEW_IMG = './assets/IMG-20240812-WA0097.jpg';

async function calcCommand(sock, chatId, message, args) {
    try {
        // 1. Vérifier si un calcul est fourni
        if (!args || args.length === 0) {
            await sock.sendMessage(chatId, {
                text: `⚠️ *Veuillez fournir un calcul.*\n\n📝 *Exemple :*\n.calc 2 + 5 * 3`
            }, { quoted: message });
            return;
        }

        const expression = args.join(" ");

        // Réaction de calcul en cours
        await sock.sendMessage(chatId, {
            react: { text: '🧮', key: message.key }
        });

        // Sécurisation de l'expression (autorise uniquement les chiffres et + - * / . ( ) )
        const sanitizedExpression = expression.replace(/[^0-89+\-*/().\s]/g, '');

        if (!sanitizedExpression || sanitizedExpression !== expression) {
            await sock.sendMessage(chatId, {
                text: `❌ *Caractères non autorisés détectés.*\nUtilise uniquement des chiffres et les signes +, -, *, /.`
            }, { quoted: message });
            return;
        }

        // Calcul du résultat de manière sécurisée via une fonction anonyme
        let result;
        try {
            result = Function(`"use strict"; return (${sanitizedExpression})`)();
        } catch (calcError) {
            result = null;
        }

        let caption = `🧮 *CALCULATRICE — BRINDI-XMD*\n\n`;

        if (result !== null && isFinite(result)) {
            caption += `📝 *Calcul :* ${expression}\n`;
            caption += `🔢 *Résultat :* ${result}\n`;
        } else {
            caption += `❌ *Expression invalide.*\nVérifie la syntaxe de ton calcul (ex: .calc 10 / 2).`;
        }

        // Signature
        caption += `\n> BRINDI-XMD`;

        // Envoi avec l'image du bot
        await sock.sendMessage(chatId, {
            image: { url: NEW_IMG },
            caption: caption
        }, { quoted: message });

    } catch (error) {
        console.error("Erreur commande calc:", error.message);
        await sock.sendMessage(chatId, {
            text: `❌ *Une erreur est survenue lors du calcul.*\n\n> BRINDI-XMD`
        }, { quoted: message });
    }
}

module.exports = calcCommand;
