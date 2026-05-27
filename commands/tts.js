const gTTS = require('gtts');
const fs = require('fs');
const path = require('path');

async function ttsCommand(sock, chatId, text, message, language = 'fr') {
    try {

        if (!text || !text.trim()) {
            await sock.sendMessage(chatId, {
                text: '❌ Veuillez entrer un texte.\n\nExemple :\n.tts Bonjour tout le monde\n\n> BRINDI-XMD'
            }, { quoted: message });
            return;
        }

        // Création dossier assets
        const assetsDir = path.join(__dirname, '..', 'assets');

        if (!fs.existsSync(assetsDir)) {
            fs.mkdirSync(assetsDir, { recursive: true });
        }

        // Nom fichier
        const fileName = `tts_${Date.now()}.mp3`;
        const filePath = path.join(assetsDir, fileName);

        // Génération TTS
        const gtts = new gTTS(text, language);

        gtts.save(filePath, async (err) => {

            if (err) {
                console.error('Erreur TTS :', err);

                await sock.sendMessage(chatId, {
                    text: '❌ Impossible de générer le vocal.\n\n> BRINDI-XMD'
                }, { quoted: message });

                return;
            }

            try {

                // Vérifie que fichier existe
                if (!fs.existsSync(filePath)) {
                    throw new Error('Fichier audio introuvable');
                }

                // Envoi audio stable
                await sock.sendMessage(chatId, {
                    audio: { url: filePath },
                    mimetype: 'audio/mpeg',
                    ptt: true
                }, { quoted: message });

                // Suppression après envoi
                setTimeout(() => {
                    try {
                        if (fs.existsSync(filePath)) {
                            fs.unlinkSync(filePath);
                        }
                    } catch (e) {
                        console.error('Erreur suppression :', e);
                    }
                }, 10000);

            } catch (sendError) {

                console.error('Erreur envoi audio :', sendError);

                await sock.sendMessage(chatId, {
                    text: '❌ WhatsApp a refusé le fichier audio.\n\n> BRINDI-XMD'
                }, { quoted: message });

                try {
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                } catch {}
            }

        });

    } catch (error) {

        console.error('Erreur commande TTS :', error);

        await sock.sendMessage(chatId, {
            text: '❌ Une erreur est survenue.\n\n> BRINDI-XMD'
        }, { quoted: message });
    }
}

module.exports = ttsCommand;
