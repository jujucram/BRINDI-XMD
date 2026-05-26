async function clearCommand(sock, chatId, message) {
    try {
        // Effacer discussion côté bot
        await sock.chatModify(
            {
                delete: true,
                lastMessages: [
                    {
                        key: message.key,
                        messageTimestamp: message.messageTimestamp
                    }
                ]
            },
            chatId
        );

        // Message de confirmation
        await sock.sendMessage(chatId, {
            text: `🧹 *Discussion supprimée avec succès.*\n> BRINDI-XMD`,
        }, { quoted: message });

    } catch (e) {
        console.error('❌ [clear]', e.message);

        await sock.sendMessage(chatId, {
            text: `❌ *Erreur lors du clear du chat.*\n> BRINDI-XMD`,
        }, { quoted: message });
    }
}

module.exports = { clearCommand };
