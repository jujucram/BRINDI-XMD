const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const settings = require('../settings');
const webp = require('node-webpmux');
const crypto = require('crypto');

async function stickercropCommand(sock, chatId, message) {
// Le message qui sera cité dans la réponse.
const messageToQuote = message;

// L'objet message qui contient le média à télécharger.  
let targetMessage = message;  

// Si le message est une réponse, le média cible se trouve dans le message cité.  
if (message.message?.extendedTextMessage?.contextInfo?.quotedMessage) {  
    // Nous devons construire un nouvel objet message pour que downloadMediaMessage fonctionne correctement.  
    const quotedInfo = message.message.extendedTextMessage.contextInfo;  
    targetMessage = {  
        key: {  
            remoteJid: chatId,  
            id: quotedInfo.stanzaId,  
            participant: quotedInfo.participant  
        },  
        message: quotedInfo.quotedMessage  
    };  
}  

const mediaMessage = targetMessage.message?.imageMessage || targetMessage.message?.videoMessage || targetMessage.message?.documentMessage || targetMessage.message?.stickerMessage;  

if (!mediaMessage) {  
    await sock.sendMessage(chatId, {   
        text: 'Veuillez répondre à une image/vidéo/sticker avec .crop, ou envoyer une image/vidéo/sticker avec .crop en légende.',  
        contextInfo: {  
            forwardingScore: 999,  
            isForwarded: true,

}
},{ quoted: messageToQuote });
return;
}

try {  
    const mediaBuffer = await downloadMediaMessage(targetMessage, 'buffer', {}, {   
        logger: undefined,   
        reuploadRequest: sock.updateMediaMessage   
    });  

    if (!mediaBuffer) {  
        await sock.sendMessage(chatId, {   
            text: 'Impossible de télécharger le média. Veuillez réessayer.',  
            contextInfo: {  
                forwardingScore: 999,  
                isForwarded: true,  
                  
            }  
        });  
        return;  
    }  

    // Créer le dossier temporaire s'il n'existe pas  
    const tmpDir = path.join(process.cwd(), 'tmp');  
    if (!fs.existsSync(tmpDir)) {  
        fs.mkdirSync(tmpDir, { recursive: true });  
    }  

    // Générer les chemins des fichiers temporaires  
    const tempInput = path.join(tmpDir, `temp_${Date.now()}`);  
    const tempOutput = path.join(tmpDir, `crop_${Date.now()}.webp`);  

    // Écrire le média dans le fichier temporaire  
    fs.writeFileSync(tempInput, mediaBuffer);  

    // Vérifier si le média est animé (GIF ou vidéo)  
    const isAnimated = mediaMessage.mimetype?.includes('gif') ||   
                      mediaMessage.mimetype?.includes('video') ||   
                      mediaMessage.seconds > 0;  

    // Obtenir la taille du fichier pour déterminer le niveau de compression  
    const fileSizeKB = mediaBuffer.length / 1024;  
    const isLargeFile = fileSizeKB > 5000; // Limite de 5 Mo  

    // Convertir en WebP avec ffmpeg en recadrant au format carré  
    // Pour les vidéos : compression plus forte, qualité inférieure, durée plus courte  
    // Pour les images : compression standard  
    let ffmpegCommand;  
      
    if (isAnimated) {  
        if (isLargeFile) {  
            // Grosse vidéo : compression très forte, max 2 secondes, très basse qualité  
            ffmpegCommand = `ffmpeg -i "${tempInput}" -t 2 -vf "crop=min(iw\\,ih):min(iw\\,ih),scale=512:512,fps=8" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 30 -compression_level 6 -b:v 100k -max_muxing_queue_size 1024 "${tempOutput}"`;  
        } else {  
            // Vidéo normale : compression forte, max 3 secondes, qualité inférieure  
            ffmpegCommand = `ffmpeg -i "${tempInput}" -t 3 -vf "crop=min(iw\\,ih):min(iw\\,ih),scale=512:512,fps=12" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 50 -compression_level 6 -b:v 150k -max_muxing_queue_size 1024 "${tempOutput}"`;  
        }  
    } else {  
        // Image : compression standard  
        ffmpegCommand = `ffmpeg -i "${tempInput}" -vf "crop=min(iw\\,ih):min(iw\\,ih),scale=512:512,format=rgba" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 75 -compression_level 6 "${tempOutput}"`;  
    }  

    await new Promise((resolve, reject) => {  
        exec(ffmpegCommand, (error, stdout, stderr) => {  
            if (error) {  
                console.error('Erreur FFmpeg :', error);  
                console.error('FFmpeg stderr :', stderr);  
                reject(error);  
            } else {  
                console.log('FFmpeg stdout :', stdout);  
                resolve();  
            }  
        });  
    });  

    // Vérifier si le fichier de sortie existe et contient des données  
    if (!fs.existsSync(tempOutput)) {  
        throw new Error('FFmpeg n\'a pas réussi à créer le fichier de sortie');  
    }  

    const outputStats = fs.statSync(tempOutput);  
    if (outputStats.size === 0) {  
        throw new Error('FFmpeg a créé un fichier de sortie vide');  
    }  

    // Lire le fichier WebP  
    let webpBuffer = fs.readFileSync(tempOutput);  
      
    // Vérifier la taille finale du fichier  
    const finalSizeKB = webpBuffer.length / 1024;  
    console.log(`Taille finale du sticker : ${Math.round(finalSizeKB)} Ko`);  
      
    // Si le fichier est toujours trop lourd, on l'envoie quand même mais on affiche un avertissement  
    if (finalSizeKB > 1000) { // Limite de 1 Mo pour les stickers WhatsApp  
        console.log(`⚠️ Attention : La taille du sticker (${Math.round(finalSizeKB)} Ko) dépasse la limite recommandée mais il sera quand même envoyé`);  
    }  

    // Ajouter les métadonnées avec webpmux  
    const img = new webp.Image();  
    await img.load(webpBuffer);  

    // Créer les métadonnées  
    const json = {  
        'sticker-pack-id': crypto.randomBytes(32).toString('hex'),  
        'sticker-pack-name': settings.packname || 'BRINDI XMD',  
        'emojis': ['✂️']  
    };  

    // Créer le buffer exif  
    const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);  
    const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8');  
    const exif = Buffer.concat([exifAttr, jsonBuffer]);  
    exif.writeUIntLE(jsonBuffer.length, 14, 4);  

    // Définir les données exif  
    img.exif = exif;  

    // Obtenir le buffer final avec les métadonnées  
    const finalBuffer = await img.save(null);  

    // Envoyer le sticker  
    await sock.sendMessage(chatId, {   
        sticker: finalBuffer  
    },{ quoted: messageToQuote });  

    // Nettoyer les fichiers temporaires  
    try {  
        fs.unlinkSync(tempInput);  
        fs.unlinkSync(tempOutput);  
    } catch (err) {  
        console.error('Erreur lors du nettoyage des fichiers temporaires :', err);  
    }  

} catch (error) {  
    console.error('Erreur dans la commande stickercrop :', error);  
    await sock.sendMessage(chatId, {   
        text: 'Impossible de recadrer le sticker ! Réessayez avec une image.',  
        contextInfo: {  
            forwardingScore: 999,  
            isForwarded: true,  
              
        }  
    });  
}

}

module.exports = stickercropCommand;

// Fonction d'aide : convertit un buffer de média brut en sticker recadré en utilisant le même processus
async function stickercropFromBuffer(inputBuffer, isAnimated) {
const tmpDir = path.join(process.cwd(), 'tmp');
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

const tempInput = path.join(tmpDir, `cropbuf_${Date.now()}`);  
const tempOutput = path.join(tmpDir, `cropbuf_out_${Date.now()}.webp`);  

fs.writeFileSync(tempInput, inputBuffer);  

// Ajustement selon la taille comme pour stickercrop  
const fileSizeKB = inputBuffer.length / 1024;  
const isLargeFile = fileSizeKB > 5000;  

let ffmpegCommand;  
if (isAnimated) {  
    if (isLargeFile) {  
        ffmpegCommand = `ffmpeg -y -i "${tempInput}" -t 2 -vf "crop=min(iw\\,ih):min(iw\\,ih),scale=512:512,fps=8" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 30 -compression_level 6 -b:v 100k -max_muxing_queue_size 1024 "${tempOutput}"`;  
    } else {  
        ffmpegCommand = `ffmpeg -y -i "${tempInput}" -t 3 -vf "crop=min(iw\\,ih):min(iw\\,ih),scale=512:512,fps=12" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 50 -compression_level 6 -b:v 150k -max_muxing_queue_size 1024 "${tempOutput}"`;  
    }  
} else {  
    ffmpegCommand = `ffmpeg -y -i "${tempInput}" -vf "crop=min(iw\\,ih):min(iw\\,ih),scale=512:512,format=rgba" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 75 -compression_level 6 "${tempOutput}"`;  
}  

await new Promise((resolve, reject) => {  
    exec(ffmpegCommand, (error) => {  
        if (error) return reject(error);  
        resolve();  
    });  
});  

const webpBuffer = fs.readFileSync(tempOutput);  

const img = new webp.Image();  
await img.load(webpBuffer);  
const json = {  
    'sticker-pack-id': crypto.randomBytes(32).toString('hex'),  
    'sticker-pack-name': settings.packname || 'BRINDI XMD',  
    'emojis': ['✂️']  
};  
const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);  
const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8');  
const exif = Buffer.concat([exifAttr, jsonBuffer]);  
exif.writeUIntLE(jsonBuffer.length, 14, 4);  
img.exif = exif;  
const finalBuffer = await img.save(null);  

try {  
    fs.unlinkSync(tempInput);  
    fs.unlinkSync(tempOutput);  
} catch {}  

return finalBuffer;

}

module.exports.stickercropFromBuffer = stickercropFromBuffer;
