const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { exec } = require('child_process');
const webp = require('node-webpmux');
const settings = require('../settings');

const delay = ms => new Promise(res => setTimeout(res, ms));

// ─── Config ───────────────────────────────────────────────────────────────────
// Bot tokens publics de fallback (rotation automatique si l'un échoue)
const BOT_TOKENS = [
    'VOTRE_BOT_TOKENS_telegram',
    // Ajoute d'autres tokens ici si tu en as
];

const TMP_DIR = path.join(process.cwd(), 'tmp');

// ─── Helpers ──────────────────────────────────────────────────────────────────
function ensureTmp() {
    if (!fs.existsSync(TMP_DIR))
        fs.mkdirSync(TMP_DIR, { recursive: true });
}

function cleanFile(...files) {
    for (const f of files) {
        try { if (fs.existsSync(f)) fs.unlinkSync(f); } catch {}
    }
}

function execAsync(cmd) {
    return new Promise((resolve, reject) => {
        exec(cmd, { timeout: 30000 }, (err) => err ? reject(err) : resolve());
    });
}

// ─── Tentative avec un token ──────────────────────────────────────────────────
async function fetchStickerSet(packName, token) {
    const url = `https://api.telegram.org/bot${token}/getStickerSet?name=${encodeURIComponent(packName)}`;
    const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' },
        timeout: 15000
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.ok) throw new Error(data.description || 'API error');
    return { data, token };
}

// ─── Récupère un token fonctionnel ───────────────────────────────────────────
async function getWorkingToken(packName) {
    for (const token of BOT_TOKENS) {
        try {
            const result = await fetchStickerSet(packName, token);
            return result;
        } catch (e) {
            console.log(`Token failed: ${token.slice(0, 10)}... → ${e.message}`);
        }
    }
    return null;
}

// ─── Téléchargement via getFile ───────────────────────────────────────────────
async function downloadSticker(fileId, token) {
    // 1. getFile
    const res1 = await fetch(
        `https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`,
        { timeout: 15000 }
    );
    if (!res1.ok) throw new Error(`getFile HTTP ${res1.status}`);
    const fileData = await res1.json();
    if (!fileData.ok) throw new Error(fileData.description || 'getFile failed');

    const filePath = fileData.result.file_path;
    if (!filePath) throw new Error('No file_path returned');

    // 2. Télécharge le fichier
    const fileUrl = `https://api.telegram.org/file/bot${token}/${filePath}`;
    const res2 = await fetch(fileUrl, { timeout: 30000 });
    if (!res2.ok) throw new Error(`Download HTTP ${res2.status}`);

    return { buffer: await res2.buffer(), filePath };
}

// ─── Conversion en WebP avec EXIF ────────────────────────────────────────────
async function convertToSticker(inputBuffer, isAnimated, emoji) {
    ensureTmp();
    const id = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const tempIn  = path.join(TMP_DIR, `tg_in_${id}`);
    const tempOut = path.join(TMP_DIR, `tg_out_${id}.webp`);

    try {
        fs.writeFileSync(tempIn, inputBuffer);

        const scale = 'scale=512:512:force_original_aspect_ratio=decrease';
        const pad   = 'pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000';
        const webpFlags = '-c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 80 -compression_level 6';

        const cmd = isAnimated
            ? `ffmpeg -y -i "${tempIn}" -vf "${scale},fps=15,${pad}" ${webpFlags} "${tempOut}"`
            : `ffmpeg -y -i "${tempIn}" -vf "${scale},format=rgba,${pad}" ${webpFlags} "${tempOut}"`;

        await execAsync(cmd);

        if (!fs.existsSync(tempOut))
            throw new Error('ffmpeg did not produce output');

        const webpBuf = fs.readFileSync(tempOut);

        // Ajout EXIF
        const img = new webp.Image();
        await img.load(webpBuf);

        const metadata = {
            'sticker-pack-id': crypto.randomBytes(32).toString('hex'),
            'sticker-pack-name': settings?.packname ?? 'BRINDI-XMD',
            'sticker-pack-publisher': settings?.author ?? 'Brandon',
            'emojis': emoji ? [emoji] : ['🤖']
        };

        const exifAttr = Buffer.from([
            0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00,
            0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x16, 0x00, 0x00, 0x00
        ]);
        const jsonBuf = Buffer.from(JSON.stringify(metadata), 'utf8');
        const exif    = Buffer.concat([exifAttr, jsonBuf]);
        exif.writeUIntLE(jsonBuf.length, 14, 4);

        img.exif = exif;
        return await img.save(null);

    } finally {
        cleanFile(tempIn, tempOut);
    }
}

// ─── Commande principale ──────────────────────────────────────────────────────
async function stickerTelegramCommand(sock, chatId, msg) {
    try {
        const text = (
            msg.message?.conversation ||
            msg.message?.extendedTextMessage?.text || ''
        ).trim();

        const args = text.split(/\s+/).slice(1);
        const input = args[0];

        // ── Aide ──────────────────────────────────────────────────────────────
        if (!input) {
            return sock.sendMessage(chatId, {
                text:
`🖼️ *Stickers Telegram → WhatsApp*

💡 *Usage :*
\`.tg https://t.me/addstickers/NomDuPack\`

📌 Le pack doit être *public*.`
            }, { quoted: msg });
        }

        // ── Validation URL ────────────────────────────────────────────────────
        const urlMatch = input.match(/https?:\/\/t\.me\/addstickers\/([a-zA-Z0-9_]+)/i);
        if (!urlMatch) {
            return sock.sendMessage(chatId, {
                text: `❌ *URL invalide !*\n\nFormat attendu :\n\`https://t.me/addstickers/NomDuPack\``
            }, { quoted: msg });
        }

        const packName = urlMatch[1];

        await sock.sendMessage(chatId, {
            text: `🔍 *Recherche du pack :* \`${packName}\`\n\n⏳ Patiente...`
        }, { quoted: msg });

        // ── Récupération du pack ──────────────────────────────────────────────
        const result = await getWorkingToken(packName);

        if (!result) {
            return sock.sendMessage(chatId, {
                text:
`❌ *Impossible de charger ce pack.*

📌 *Causes possibles :*
• Pack privé ou inexistant
• Token bot expiré
• Limite API Telegram atteinte

💡 *Solutions :*
• Vérifie que le pack est public
• Essaie dans 1 minute
• Ouvre le lien dans Telegram pour confirmer qu'il existe`
            }, { quoted: msg });
        }

        const { data: stickerSet, token } = result;
        const stickers = stickerSet.result.stickers;
        const total = stickers.length;

        await sock.sendMessage(chatId, {
            text: `📦 *Pack trouvé !*\n🏷️ *Nom :* ${stickerSet.result.title}\n🔢 *Stickers :* ${total}\n\n⬇️ Téléchargement en cours...`
        }, { quoted: msg });

        // ── Traitement sticker par sticker ────────────────────────────────────
        let success = 0;
        let failed  = 0;

        for (let i = 0; i < stickers.length; i++) {
            const sticker = stickers[i];

            try {
                const isAnimated = sticker.is_animated || sticker.is_video;

                // Téléchargement
                const { buffer } = await downloadSticker(sticker.file_id, token);

                // Conversion
                const finalBuffer = await convertToSticker(
                    buffer,
                    isAnimated,
                    sticker.emoji
                );

                // Envoi
                await sock.sendMessage(chatId, { sticker: finalBuffer });
                success++;

                // Délai anti-flood
                await delay(800);

            } catch (err) {
                failed++;
                console.error(`❌ Sticker ${i + 1}/${total} :`, err.message);

                // Signaler les échecs groupés sans spammer
                if (failed === 3) {
                    await sock.sendMessage(chatId, {
                        text: `⚠️ Plusieurs stickers échouent (${failed} jusqu'ici). Le bot continue...`
                    });
                }
            }

            // Progression toutes les 10 stickers
            if ((i + 1) % 10 === 0 && i + 1 < total) {
                await sock.sendMessage(chatId, {
                    text: `📊 Progression : ${i + 1}/${total} (✅ ${success} | ❌ ${failed})`
                });
            }
        }

        // ── Message final ──────────────────────────────────────────────────────
        await sock.sendMessage(chatId, {
            text:
`${success > 0 ? '✅' : '❌'} *Terminé !*

📦 *Pack :* ${stickerSet.result.title}
✅ *Réussis :* ${success}/${total}
❌ *Échoués :* ${failed}/${total}`
        }, { quoted: msg });

    } catch (error) {
        console.error('❌ [STICKERTG]', error.message);
        await sock.sendMessage(chatId, {
            text: `❌ *Erreur inattendue :*\n${error.message}`
        }, { quoted: msg });
    }
}

module.exports = stickerTelegramCommand;
