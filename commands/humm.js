// Humm → Envoie le média dans les notes/MP du BOT lui-même
// Totalement silencieux — rien n'apparaît dans la conversation courante
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

async function hummCommand(sock, chatId, senderId, replyMessage, message) {
    if (!replyMessage) return; // Silencieux si pas de réponse

    // ✅ TOUJOURS envoyer vers le compte du BOT lui-même (messages enregistrés)
    // Comme ça, rien n'apparaît dans le groupe OU dans le PV où on a tapé .humm
    const botJid = sock.user.id.replace(/:\d+@/, '@');

    // Clé originale pour suppression du message source
    const ctxInfo = message.message?.extendedTextMessage?.contextInfo;
    const originalKey = ctxInfo ? {
        remoteJid: chatId,
        id: ctxInfo.stanzaId,
        participant: ctxInfo.participant || undefined
    } : null;

    try {
        // ── Image ──────────────────────────────────
        if (replyMessage.imageMessage) {
            const stream = await downloadContentFromMessage(replyMessage.imageMessage, 'image');
            let buf = Buffer.from([]);
            for await (const chunk of stream) buf = Buffer.concat([buf, chunk]);

            // Envoyer vers le bot lui-même (invisible pour l'utilisateur)
            await sock.sendMessage(botJid, {
                image: buf,
                caption: `🥷 *BRINDI-XMD* — Média récupéré\n_Depuis :_ @${(senderId||'').split('@')[0]}`
            });

            // Supprimer l'original silencieusement
            if (originalKey) try { await sock.sendMessage(chatId, { delete: originalKey }); } catch {}
            return;
        }

        // ── Vidéo ──────────────────────────────────
        if (replyMessage.videoMessage) {
            const stream = await downloadContentFromMessage(replyMessage.videoMessage, 'video');
            let buf = Buffer.from([]);
            for await (const chunk of stream) buf = Buffer.concat([buf, chunk]);

            await sock.sendMessage(botJid, {
                video: buf,
                caption: `🥷 *BRINDI-XMD* — Vidéo récupérée`
            });

            if (originalKey) try { await sock.sendMessage(chatId, { delete: originalKey }); } catch {}
            return;
        }

        // ── Sticker ────────────────────────────────
        if (replyMessage.stickerMessage) {
            const stream = await downloadContentFromMessage(replyMessage.stickerMessage, 'sticker');
            let buf = Buffer.from([]);
            for await (const chunk of stream) buf = Buffer.concat([buf, chunk]);

            await sock.sendMessage(botJid, {
                image: buf,
                caption: `🥷 *BRINDI-XMD* — Sticker récupéré`
            });

            if (originalKey) try { await sock.sendMessage(chatId, { delete: originalKey }); } catch {}
            return;
        }

        // ── Audio ──────────────────────────────────
        if (replyMessage.audioMessage) {
            const stream = await downloadContentFromMessage(replyMessage.audioMessage, 'audio');
            let buf = Buffer.from([]);
            for await (const chunk of stream) buf = Buffer.concat([buf, chunk]);

            await sock.sendMessage(botJid, {
                audio: buf,
                mimetype: 'audio/mp4',
                ptt: replyMessage.audioMessage.ptt || false
            });

            if (originalKey) try { await sock.sendMessage(chatId, { delete: originalKey }); } catch {}
            return;
        }

    } catch (e) {
        console.error('❌ [humm]', e.message);
        // Silence total — aucun message visible
    }
}

module.exports = hummCommand;
