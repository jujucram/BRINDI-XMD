const fetch = require('node-fetch');
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

async function emojimixCommand(sock, chatId, msg) {

    try {

        // Récupérer le texte après la commande
        const text =
            msg.message?.conversation?.trim() ||
            msg.message?.extendedTextMessage?.text?.trim() ||
            '';

        const args = text.split(' ').slice(1);

        if (!args[0]) {
            await sock.sendMessage(chatId, {
                text:
`🎴 *Exemple :* .emojimix 😎+🥰

> BRINDI-XMD`
            });
            return;
        }

        if (!text.includes('+')) {
            await sock.sendMessage(chatId, {
                text:
`✳️ Sépare les emojis avec le signe *+*

📌 *Exemple :*
.emojimix 😎+🥰

> BRINDI-XMD`
            });
            return;
        }

        let [emoji1, emoji2] = args[0]
            .split('+')
            .map(e => e.trim());

        // API Tenor Emoji Kitchen
        const url =
`https://tenor.googleapis.com/v2/featured?key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ&contentfilter=high&media_filter=png_transparent&component=proactive&collection=emoji_kitchen_v5&q=${encodeURIComponent(emoji1)}_${encodeURIComponent(emoji2)}`;

        const response = await fetch(url);
        const data = await response.json();

        if (!data.results || data.results.length === 0) {
            await sock.sendMessage(chatId, {
                text:
`❌ Impossible de fusionner ces emojis !

Essaie avec d'autres emojis.

> BRINDI-XMD`
            });
            return;
        }

        // URL de l'image fusionnée
        const imageUrl = data.results[0].url;

        // Créer le dossier tmp si nécessaire
        const tmpDir = path.join(process.cwd(), 'tmp');

        if (!fs.existsSync(tmpDir)) {
            fs.mkdirSync(tmpDir, { recursive: true });
        }

        // Générer des noms temporaires
        const tempFile =
            path.join(tmpDir, `temp_${Date.now()}.png`)
            .replace(/\\/g, '/');

        const outputFile =
            path.join(tmpDir, `sticker_${Date.now()}.webp`)
            .replace(/\\/g, '/');

        // Télécharger l'image
        const imageResponse = await fetch(imageUrl);
        const buffer = await imageResponse.buffer();

        fs.writeFileSync(tempFile, buffer);

        // Conversion en WebP
        const ffmpegCommand =
`ffmpeg -i "${tempFile}" -vf "scale=512:512:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" "${outputFile}"`;

        await new Promise((resolve, reject) => {

            exec(ffmpegCommand, (error) => {

                if (error) {
                    console.error('FFmpeg error:', error);
                    reject(error);

                } else {
                    resolve();
                }
            });
        });

        // Vérifier si le sticker existe
        if (!fs.existsSync(outputFile)) {
            throw new Error('Impossible de créer le sticker');
        }

        // Lire le fichier WebP
        const stickerBuffer = fs.readFileSync(outputFile);

        // Envoyer le sticker
        await sock.sendMessage(chatId, {
            sticker: stickerBuffer
        }, { quoted: msg });

        // Supprimer les fichiers temporaires
        try {
            fs.unlinkSync(tempFile);
            fs.unlinkSync(outputFile);

        } catch (err) {
            console.error('Erreur suppression fichiers:', err);
        }

    } catch (error) {

        console.error('Error in emojimix command:', error);

        await sock.sendMessage(chatId, {
            text:
`❌ Échec du mélange des emojis !

Vérifie que tu utilises des emojis valides.

📌 Exemple :
.emojimix 😎+🥰

> BRINDI-XMD`
        });
    }
}

module.exports = emojimixCommand;