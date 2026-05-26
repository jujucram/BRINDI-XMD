const isAdmin = require('../lib/isAdmin');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

async function hideTagCommand(
    sock,
    chatId,
    senderId,
    messageText,
    replyMessage,
    message
) {

    if (!chatId.endsWith('@g.us')) {
        return await sock.sendMessage(chatId, {
            text:
`❌ *Commande disponible uniquement dans les groupes !*

> BRINDI-XMD`
        }, { quoted: message });
    }

    const meta =
        await sock.groupMetadata(chatId);

    const participants =
        meta.participants || [];

    // Mentionner tous les membres discrètement
    const mentions =
        participants.map(p => p.id);

    const text =
        messageText ||
`😈 *HIDE TAG*

👥 *Groupe :* ${meta.subject}
🔔 *${mentions.length} membres notifiés discrètement.*

> BRINDI-XMD`;

    try {

        if (replyMessage) {

            // Réponse avec image
            if (replyMessage.imageMessage) {

                const stream =
                    await downloadContentFromMessage(
                        replyMessage.imageMessage,
                        'image'
                    );

                let buf = Buffer.from([]);

                for await (const chunk of stream) {
                    buf = Buffer.concat([buf, chunk]);
                }

                await sock.sendMessage(chatId, {
                    image: buf,
                    caption: text,
                    mentions
                });

            }

            // Réponse avec vidéo
            else if (replyMessage.videoMessage) {

                const stream =
                    await downloadContentFromMessage(
                        replyMessage.videoMessage,
                        'video'
                    );

                let buf = Buffer.from([]);

                for await (const chunk of stream) {
                    buf = Buffer.concat([buf, chunk]);
                }

                await sock.sendMessage(chatId, {
                    video: buf,
                    caption: text,
                    mentions
                });

            }

            // Réponse texte
            else {

                const content =
                    replyMessage.conversation ||
                    replyMessage.extendedTextMessage?.text ||
                    text;

                await sock.sendMessage(chatId, {
                    text: `${content}\n> BRINDI-XMD`,
                    mentions
                });
            }

        } else {

            await sock.sendMessage(chatId, {
                text,
                mentions
            });
        }

    } catch (e) {

        console.error('❌ [hidetag]', e.message);

        await sock.sendMessage(chatId, {
            text,
            mentions
        });
    }
}

module.exports = hideTagCommand;