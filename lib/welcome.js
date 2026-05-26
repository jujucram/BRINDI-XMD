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
`*☆ BRINDI-XMD WELCOME ☆*

✅ *.welcome on* — Enable welcome messages
🛠️ *.welcome set your message* — Set custom welcome message
🚫 *.welcome off* — Disable welcome messages

*Available Variables :*
• {user} → Mention new member
• {group} → Group name
• {description} → Group description

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
`⚠️ Welcome messages are already enabled.

> BRINDI-XMD`,
                quoted: message
            });
        }

        await addWelcome(
            chatId,
            true,
            'Welcome {user} to {group}! 🎉\n> BRINDI-XMD'
        );

        return sock.sendMessage(chatId, {
            text:
`✅ Welcome messages enabled successfully.

Use *.welcome set [message]* to customize.

> BRINDI-XMD`,
            quoted: message
        });
    }

    if (lowerCommand === 'off') {

        if (!(await isWelcomeOn(chatId))) {
            return sock.sendMessage(chatId, {
                text:
`⚠️ Welcome messages are already disabled.

> BRINDI-XMD`,
                quoted: message
            });
        }

        await delWelcome(chatId);

        return sock.sendMessage(chatId, {
            text:
`✅ Welcome messages disabled for this group.

> BRINDI-XMD`,
            quoted: message
        });
    }

    if (lowerCommand === 'set') {

        if (!customMessage) {
            return sock.sendMessage(chatId, {
                text:
`⚠️ Please provide a welcome message.

Example :
*.welcome set Welcome to the group!*

> BRINDI-XMD`,
                quoted: message
            });
        }

        await addWelcome(chatId, true, customMessage);

        return sock.sendMessage(chatId, {
            text:
`✅ Custom welcome message set successfully.

> BRINDI-XMD`,
            quoted: message
        });
    }

    return sock.sendMessage(chatId, {
        text:
`❌ Invalid command.

Use :
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
`*☆ BRINDI-XMD GOODBYE ☆*

✅ *.goodbye on* — Enable goodbye messages
🛠️ *.goodbye set your message* — Set custom goodbye message
🚫 *.goodbye off* — Disable goodbye messages

*Available Variables :*
• {user} → Mention leaving member
• {group} → Group name

> BRINDI-XMD`,
            quoted: message
        });
    }

    if (lower === 'on') {

        if (await isGoodByeOn(chatId)) {
            return sock.sendMessage(chatId, {
                text:
`⚠️ Goodbye messages are already enabled.

> BRINDI-XMD`,
                quoted: message
            });
        }

        await addGoodbye(
            chatId,
            true,
            'Goodbye {user} 👋\n> BRINDI-XMD'
        );

        return sock.sendMessage(chatId, {
            text:
`✅ Goodbye messages enabled successfully.

Use *.goodbye set [message]* to customize.

> BRINDI-XMD`,
            quoted: message
        });
    }

    if (lower === 'off') {

        if (!(await isGoodByeOn(chatId))) {
            return sock.sendMessage(chatId, {
                text:
`⚠️ Goodbye messages are already disabled.

> BRINDI-XMD`,
                quoted: message
            });
        }

        await delGoodBye(chatId);

        return sock.sendMessage(chatId, {
            text:
`✅ Goodbye messages disabled for this group.

> BRINDI-XMD`,
            quoted: message
        });
    }

    if (lower.startsWith('set ')) {

        const customMessage = match.substring(4);

        if (!customMessage) {
            return sock.sendMessage(chatId, {
                text:
`⚠️ Please provide a goodbye message.

Example :
*.goodbye set Goodbye everyone!*

> BRINDI-XMD`,
                quoted: message
            });
        }

        await addGoodbye(chatId, true, customMessage);

        return sock.sendMessage(chatId, {
            text:
`✅ Custom goodbye message set successfully.

> BRINDI-XMD`,
                quoted: message
        });
    }

    return sock.sendMessage(chatId, {
        text:
`❌ Invalid command.

Use :
*.goodbye on*
*.goodbye set [message]*
*.goodbye off*

> BRINDI-XMD`,
        quoted: message
    });
}

module.exports = { handleWelcome, handleGoodbye };