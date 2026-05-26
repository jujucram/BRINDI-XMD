async function signalCommand(sock, chatId, senderId, mentionedJids, message, args) {
    let target = null;
    let count = 5;

    // Si args est une chaîne, on la transforme en tableau, sinon on l'utilise
    const argsArray = Array.isArray(args) ? args : (args ? args.split(' ') : []);

    // 1. Détection du nombre de signalements (on cherche s'il y a un petit nombre isolé à la fin ou au début)
    const countIndex = argsArray.findIndex(arg => /^\d+$/.test(arg) && parseInt(arg) <= 100);
    if (countIndex !== -1) {
        count = parseInt(argsArray[countIndex]);
        // On retire le nombre des arguments pour ne pas confondre avec un numéro de téléphone
        argsArray.splice(countIndex, 1); 
    }

    // 2. Détermination de la cible (Target)
    if (mentionedJids && mentionedJids.length > 0) {
        // Cas 1: Mention prioritaire
        target = mentionedJids[0];
    } else if (argsArray.length > 0) {
        // Cas 2: Un numéro de téléphone a été fourni
        let cleaned = argsArray.join('').replace(/[^0-9]/g, "");
        if (cleaned.length < 7) {
            return sock.sendMessage(chatId, {
                text: "❌ Numéro invalide.\nExemple : `.signal 23767258xxxx` ou `.signal @mention 10`"
            }, { quoted: message });
        }
        target = cleaned + "@s.whatsapp.net";
    } else if (!chatId.endsWith("@g.us")) {
        // Cas 3: En privé et sans argument, on cible l'interlocuteur
        target = chatId;
    }

    if (!target) {
        return sock.sendMessage(chatId, {
            text: "❌ *Utilisation :*\n• `.signal @mention 10`\n• `.signal <numéro> <nombre>`\n• En privé : `.signal` tout court"
        }, { quoted: message });
    }

    if (count < 1) count = 1;
    const targetName = target.split("@")[0];

    await sock.sendMessage(chatId, {
        text: `🚨 *Signalement de* *${targetName}* *en cours...*\nNombre demandé : ${count}\n_(Simulation de signalement...)_`,
        mentions: [target]
    }, { quoted: message });

    let success = 0;
    for (let i = 1; i <= count; i++) {
        try {
            // Envoi de la vcard de signalement
            await sock.sendMessage(target, {
                contact: {
                    displayName: "Report Anti-Spam",
                    vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:Report Anti-Spam\nEND:VCARD`
                }
            });

            // Une pause pour laisser le temps à Baileys de traiter l'envoi
            await new Promise(r => setTimeout(r, 800));

            // Simulation block / unblock
            await sock.updateBlockStatus(target, "block");
            await new Promise(r => setTimeout(r, 1000)); // Légère augmentation du délai pour éviter le spam-block
            await sock.updateBlockStatus(target, "unblock");
            
            success++;
            console.log(`✅ Signalement ${i}/${count} réussi pour ${target}`);
        } catch (err) {
            // Si ça affiche une erreur ici dans ta console, c'est que l'action est rejetée par WhatsApp
            console.error(`❌ Échec signalement ${i} :`, err.message);
        }

        if (i < count) {
            await new Promise(r => setTimeout(r, 2500)); // 2.5 secondes entre chaque cycle
        }
    }

    await sock.sendMessage(chatId, {
        text: `✅ *${success}/${count}* action(s) de signalement exécutée(s) contre *${targetName}*.`,
        mentions: [target]
    }, { quoted: message });
}

module.exports = signalCommand;
