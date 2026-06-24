const { 
    addWelcome, 
    delWelcome, 
    isWelcomeOn, 
    addGoodbye, 
    delGoodBye, 
    isGoodByeOn 
} = require('../lib/index');

const { delay } = require('@whiskeysockets/baileys');

async function handleWelcome(sock, chatId, message, match) {

    if (!match) {
        return sock.sendMessage(chatId, {
            text:
`*☆ BRINDI-XMD BIENVENUE ☆*

✅ *.welcome on* — Activer les messages de bienvenue
🛠️ *.welcome set votre message* — Définir un message personnalisé
🚫 *.welcome off* — Désactiver les messages de bienvenue

*Variables disponibles :*
• {user} → Mentionner le nouveau membre
• {group} → Nom du groupe
• {description} → Description du groupe

> BRINDI-XMD`,
            quoted: message
        });
    }

    const [command, ...args] = match.split(' ');
    const lowerCommand = command.toLowerCase();
    const customMessage = args.join(' ');

    if (lowerCommand === 'on') {

        if (await isWelcomeOn(chatId)) {
            return sock.sendMessage(chatId, {
                text:
`⚠️ Les messages de bienvenue sont déjà activés.

> BRINDI-XMD`,
                quoted: message
            });
        }

        await addWelcome(
            chatId,
            true,
            'Bienvenue {user} dans le groupe {group} ! 🎉\n> BRINDI-XMD'
        );

        return sock.sendMessage(chatId, {
            text:
`✅ Messages de bienvenue activés avec succès.

Utilisez *.welcome set [message]* pour personnaliser.

> BRINDI-XMD`,
            quoted: message
        });
    }

    if (lowerCommand === 'off') {

        if (!(await isWelcomeOn(chatId))) {
            return sock.sendMessage(chatId, {
                text:
`⚠️ Les messages de bienvenue sont déjà désactivés.

> BRINDI-XMD`,
                quoted: message
            });
        }

        await delWelcome(chatId);

        return sock.sendMessage(chatId, {
            text:
`✅ Messages de bienvenue désactivés pour ce groupe.

> BRINDI-XMD`,
            quoted: message
        });
    }

    if (lowerCommand === 'set') {

        if (!customMessage) {
            return sock.sendMessage(chatId, {
                text:
`⚠️ Veuillez fournir un message de bienvenue.

Exemple :
*.welcome set Bienvenue dans le groupe !*

> BRINDI-XMD`,
                quoted: message
            });
        }

        await addWelcome(chatId, true, customMessage);

        return sock.sendMessage(chatId, {
            text:
`✅ Message de bienvenue personnalisé configuré avec succès.

> BRINDI-XMD`,
            quoted: message
        });
    }

    return sock.sendMessage(chatId, {
        text:
`❌ Commande invalide.

Utilisez :
*.welcome on*
*.welcome set [message]*
*.welcome off*

> BRINDI-XMD`,
        quoted: message
    });
}

async function handleGoodbye(sock, chatId, message, match) {

    const lower = match?.toLowerCase();

    if (!match) {
        return sock.sendMessage(chatId, {
            text:
`*☆ BRINDI-XMD AU REVOIR ☆*

✅ *.goodbye on* — Activer les messages d'au revoir
🛠️ *.goodbye set votre message* — Définir un message personnalisé
🚫 *.goodbye off* — Désactiver les messages d'au revoir

*Variables disponibles :*
• {user} → Mentionner le membre qui part
• {group} → Nom du groupe

> BRINDI-XMD`,
            quoted: message
        });
    }

    if (lower === 'on') {

        if (await isGoodByeOn(chatId)) {
            return sock.sendMessage(chatId, {
                text:
`⚠️ Les messages d'au revoir sont déjà activés.

> BRINDI-XMD`,
                quoted: message
            });
        }

        await addGoodbye(
            chatId,
            true,
            'Au revoir {user} 👋\n> BRINDI-XMD'
        );

        return sock.sendMessage(chatId, {
            text:
`✅ Messages d'au revoir activés avec succès.

Utilisez *.goodbye set [message]* pour personnaliser.

> BRINDI-XMD`,
            quoted: message
        });
    }

    if (lower === 'off') {

        if (!(await isGoodByeOn(chatId))) {
            return sock.sendMessage(chatId, {
                text:
`⚠️ Les messages d'au revoir sont déjà désactivés.

> BRINDI-XMD`,
                quoted: message
            });
        }

        await delGoodBye(chatId);

        return sock.sendMessage(chatId, {
            text:
`✅ Messages d'au revoir désactivés pour ce groupe.

> BRINDI-XMD`,
            quoted: message
        });
    }

    if (lower.startsWith('set ')) {

        const customMessage = match.substring(4);

        if (!customMessage) {
            return sock.sendMessage(chatId, {
                text:
`⚠️ Veuillez fournir un message d'au revoir.

Exemple :
*.goodbye set Au revoir tout le monde !*

> BRINDI-XMD`,
                quoted: message
            });
        }

        await addGoodbye(chatId, true, customMessage);

        return sock.sendMessage(chatId, {
            text:
`✅ Message d'au revoir personnalisé configuré avec succès.

> BRINDI-XMD`,
                quoted: message
        });
    }

    return sock.sendMessage(chatId, {
        text:
`❌ Commande invalide.

Utilisez :
*.goodbye on*
*.goodbye set [message]*
*.goodbye off*

> BRINDI-XMD`,
        quoted: message
    });
}

module.exports = { handleWelcome, handleGoodbye };
