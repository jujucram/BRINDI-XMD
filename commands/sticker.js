const { downloadMediaMessage, getContentType } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

async function stickerCommand(sock, chatId, message) {
    let tempInput, tempOutput;
    try {
        // 1. Extraction universelle du type de message et du contextInfo
        const type = getContentType(message.message);
        if (!type) return;

        const msgContent = message.message[type];
        const contextInfo = msgContent && typeof msgContent === 'object' ? msgContent.contextInfo : null;
        const quotedMessage = contextInfo?.quotedMessage;

        // Si l'utilisateur n'a pas tagué de message
        if (!quotedMessage) {
            return sock.sendMessage(chatId, {
                image: { url: './assets/IMG-20240812-WA0097.jpg' },
                caption: `🥷 *STICKER — BRINDI-XMD*\n\n❌ Réponds à une image ou vidéo avec *.sticker*\n\n> BRINDI-XMD`,
            }, { quoted: message });
        }

        // 2. Identification du type de média (Image ou Vidéo)
        const isVideo = !!quotedMessage.videoMessage || !!quotedMessage.gifPlayback;
        const isImage = !!quotedMessage.imageMessage;

        if (!isVideo && !isImage) {
            return sock.sendMessage(chatId, {
                text: '❌ Le message cité doit être une image ou une vidéo !'
            }, { quoted: message });
        }

        await sock.sendMessage(chatId, { text: '⚙️ Conversion en sticker en cours...' }, { quoted: message });

        // 3. Reconstruction STRICTE et SÉCURISÉE pour le téléchargement (Anti-crash stanzaId)
        const targetMessage = {
            key: {
                remoteJid: contextInfo.remoteJid || chatId,
                id: contextInfo.stanzaId || message.key.id || 'STK_FALLBACK', // Sécurité absolue si stanzaId est null
                participant: contextInfo.participant || message.key.participant || undefined
            },
            message: quotedMessage
        };

        // 4. Téléchargement du média
        const mediaBuffer = await downloadMediaMessage(targetMessage, 'buffer', {});
        if (!mediaBuffer) throw new Error('Téléchargement du média échoué (Le fichier est peut-être trop ancien)');

        // Création du dossier temporaire si inexistant
        const tmpDir = path.join(__dirname, '../tmp');
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

        const uniqueId = Date.now();
        tempInput = path.join(tmpDir, isVideo ? `video_${uniqueId}.mp4` : `image_${uniqueId}.jpg`);
        tempOutput = path.join(tmpDir, `sticker_${uniqueId}.webp`);
        
        fs.writeFileSync(tempInput, mediaBuffer);

        // 5. Conversion via FFmpeg
        if (isVideo) {
            // Conversion Vidéo -> WebP Animé
            await new Promise((resolve, reject) => {
                exec(
                    `ffmpeg -i "${tempInput}" -vf "scale=512:512:flags=lanczos,fps=15" -c:v libwebp -q:v 50 -preset default -loop 0 -an -vsync 0 -t 10 "${tempOutput}"`,
                    { timeout: 60000 },
                    (err) => (err ? reject(err) : resolve())
                );
            });
        } else {
            // Conversion Image -> WebP Fixe
            await new Promise((resolve, reject) => {
                exec(
                    `ffmpeg -i "${tempInput}" -vf "scale=512:512:flags=lanczos" -c:v libwebp -q:v 80 "${tempOutput}"`,
                    { timeout: 30000 },
                    (err) => {
                        if (err) {
                            // Solution de secours si ffmpeg échoue sur l'image (ImageMagick)
                            exec(`convert "${tempInput}" -resize 512x512 "${tempOutput}"`,
                                { timeout: 20000 },
                                (err2) => (err2 ? reject(err2) : resolve())
                            );
                        } else resolve();
                    }
                );
            });
        }

        if (!fs.existsSync(tempOutput)) throw new Error('La conversion du fichier a échoué.');

        const stickerBuffer = fs.readFileSync(tempOutput);

        // 6. Envoi du sticker terminé
        await sock.sendMessage(chatId, {
            sticker: stickerBuffer,
        }, { quoted: message });

    } catch (error) {
        console.error('❌ Erreur sticker:', error.message);
        await sock.sendMessage(chatId, {
            text: `⚠️ Erreur conversion sticker: ${error.message}`
        }, { quoted: message });
    } finally {
        // Nettoyage automatique des fichiers temporaires pour ne pas surcharger ton serveur/vps
        try { if (tempInput && fs.existsSync(tempInput)) fs.unlinkSync(tempInput); } catch {}
        try { if (tempOutput && fs.existsSync(tempOutput)) fs.unlinkSync(tempOutput); } catch {}
    }
}

module.exports = stickerCommand;
