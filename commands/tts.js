const gTTS = require('gtts');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

async function ttsCommand(sock, chatId, text, message, language = 'fr') {
    try {
        // Vérif texte
        if (!text) {
            return await sock.sendMessage(chatId, {
                text: `❌ Veuillez entrer un texte.\n\n📌 Exemple :\n.tts salut les gars\n\n> BRINDI-XMD`
            }, { quoted: message });
        }

        const timestamp = Date.now();
        const assetsDir = path.join(__dirname, '..', 'assets');

        // Créer le dossier assets si inexistant
        if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

        const mp3Path = path.join(assetsDir, `tts-${timestamp}.mp3`);
        const oggPath = path.join(assetsDir, `tts-${timestamp}.ogg`);

        // Générer le MP3 avec gTTS
        const gtts = new gTTS(text, language);

        await new Promise((resolve, reject) => {
            gtts.save(mp3Path, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        // Convertir MP3 → OGG Opus (compatible WhatsApp)
        await new Promise((resolve, reject) => {
            exec(
                `ffmpeg -i "${mp3Path}" -c:a libopus -b:a 64k -vbr on -y "${oggPath}"`,
                (err, stdout, stderr) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });

        // Lire le fichier OGG
        const audioBuffer = fs.readFileSync(oggPath);

        // Envoyer en note vocale
        await sock.sendMessage(chatId, {
            audio: audioBuffer,
            mimetype: 'audio/ogg; codecs=opus',
            ptt: true
        }, { quoted: message });

        // Nettoyer les fichiers temporaires
        if (fs.existsSync(mp3Path)) fs.unlinkSync(mp3Path);
        if (fs.existsSync(oggPath)) fs.unlinkSync(oggPath);

    } catch (error) {
        console.error('[TTS ERROR]', error);
        await sock.sendMessage(chatId, {
            text: `❌ Erreur lors de la génération audio.\n\nRéessaie plus tard.\n\n> BRINDI-XMD`
        }, { quoted: message });
    }
}

module.exports = ttsCommand;
