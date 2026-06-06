const {
    getDevice
} = require('@whiskeysockets/baileys');

async function deviceCommand(
    sock,
    chatId,
    msg
) {

    // Vérifie réponse
    const quoted =
        msg.message?.extendedTextMessage
            ?.contextInfo;

    if (!quoted?.stanzaId) {

        return sock.sendMessage(chatId, {
            text:
'❌ Réponds à un message pour détecter l’appareil utilisé.\n\n> BRINDI-XMD'
        }, {
            quoted: msg
        });
    }

    try {

        // Détection appareil
        const device =
            getDevice(
                quoted.stanzaId
            );

        // Nom utilisateur
        const user =
            quoted.participant
                ?.split('@')[0] ||
            'Utilisateur';

        // Message
        await sock.sendMessage(chatId, {
            text:
`📱 APPAREIL DÉTECTÉ

👤 Utilisateur :
@${user}

📲 Appareil :
${device || 'Inconnu'}

> BRINDI-XMD`,
            mentions: [
                quoted.participant
            ]
        }, {
            quoted: msg
        });

    } catch (err) {

        console.error(
            '❌ Device Error:',
            err
        );

        await sock.sendMessage(chatId, {
            text:
'❌ Impossible de détecter l’appareil.\n\n> BRINDI-XMD'
        }, {
            quoted: msg
        });
    }
}

module.exports = {
    deviceCommand
};
