const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');



// Anti-spam
const cooldowns = new Map();
const COOLDOWN_MS = 15000;

const tmpDir = path.join(__dirname, '../tmp');
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

// Convertir image → sticker statique webp
async function imageToSticker(imageUrl) {
    const uid = Date.now() + Math.random().toString(36).slice(2);
    const tempIn = path.join(tmpDir, `img_${uid}.jpg`);
    const tempOut = path.join(tmpDir, `stk_${uid}.webp`);
    try {
        const r = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 15000 });
        fs.writeFileSync(tempIn, Buffer.from(r.data));
        await new Promise((resolve, reject) => {
            exec(
                `ffmpeg -i "${tempIn}" -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:white" -c:v libwebp -q:v 80 -y "${tempOut}"`,
                { timeout: 20000 },
                (err) => { if (err) reject(err); else resolve(); }
            );
        });
        if (!fs.existsSync(tempOut)) throw new Error('Conversion failed');
        return fs.readFileSync(tempOut);
    } finally {
        try { if (fs.existsSync(tempIn)) fs.unlinkSync(tempIn); } catch {}
        try { if (fs.existsSync(tempOut)) fs.unlinkSync(tempOut); } catch {}
    }
}

// Convertir GIF → sticker animé webp
async function gifToAnimatedSticker(gifUrl) {
    const uid = Date.now() + Math.random().toString(36).slice(2);
    const tempIn = path.join(tmpDir, `gif_${uid}.gif`);
    const tempOut = path.join(tmpDir, `anim_${uid}.webp`);
    try {
        const r = await axios.get(gifUrl, { responseType: 'arraybuffer', timeout: 20000 });
        fs.writeFileSync(tempIn, Buffer.from(r.data));
        await new Promise((resolve, reject) => {
            exec(
                `ffmpeg -i "${tempIn}" -vf "scale=512:512:flags=lanczos:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:white,fps=15" -c:v libwebp -q:v 75 -loop 0 -an -vsync 0 -y "${tempOut}"`,
                { timeout: 30000 },
                (err) => { if (err) reject(err); else resolve(); }
            );
        });
        if (!fs.existsSync(tempOut)) throw new Error('Animated conversion failed');
        return fs.readFileSync(tempOut);
    } finally {
        try { if (fs.existsSync(tempIn)) fs.unlinkSync(tempIn); } catch {}
        try { if (fs.existsSync(tempOut)) fs.unlinkSync(tempOut); } catch {}
    }
}

// Rechercher des images statiques
async function searchImages(query) {
    const apis = [
        `https://christus-api.vercel.app/image/Pinterest?query=${encodeURIComponent(query + ' sticker')}&limit=10`,
        `https://api.giftedtech.my.id/api/search/pinterest?apikey=gifted&query=${encodeURIComponent(query + ' sticker')}`,
        `https://api.siputzx.my.id/api/search/pinterest?q=${encodeURIComponent(query)}`
    ];
    for (const url of apis) {
        try {
            const r = await axios.get(url, { timeout: 12000 });
            const results = r.data?.results || r.data?.result || r.data?.data || [];
            const images = results
                .map(item => item?.imageUrl || item?.url || item?.image || item)
                .filter(u => typeof u === 'string' && /\.(jpg|jpeg|png|webp)/i.test(u))
                .slice(0, 7);
            if (images.length > 0) return images;
        } catch {}
    }
    return [];
}

// Rechercher des GIFs animés
async function searchGifs(query) {
    const apis = [
        // Giphy public beta (sans clé)
        `https://api.giphy.com/v1/gifs/search?api_key=VOTRE_APIkey_GIPHY=${encodeURIComponent(query)}&limit=8&rating=g`,
        // Tenor (sans clé)
        `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(query)}&key=VOTRE_APIkey&limit=8`,
    ];

    for (const url of apis) {
        try {
            const r = await axios.get(url, { timeout: 12000 });
            // Giphy format
            if (r.data?.data && Array.isArray(r.data.data)) {
                const gifs = r.data.data
                    .map(g => g?.images?.fixed_height?.url || g?.images?.original?.url)
                    .filter(Boolean)
                    .slice(0, 7);
                if (gifs.length > 0) return gifs;
            }
            // Tenor format
            if (r.data?.results && Array.isArray(r.data.results)) {
                const gifs = r.data.results
                    .map(g => g?.media_formats?.gif?.url || g?.media?.[0]?.gif?.url)
                    .filter(Boolean)
                    .slice(0, 7);
                if (gifs.length > 0) return gifs;
            }
        } catch {}
    }
    return [];
}

async function stickersearchCommand(sock, chatId, senderId, message, args) {
    const query = args.join(' ').trim();

    if (!query) {
        return sock.sendMessage(chatId, {
            image: { url: './assets/IMG-20240812-WA0097.jpg' },
            caption: `🎭 *STICKER SEARCH — BRINDI-XMD*\n\n❌ Donne un mot-clé !\n\n💡 *Usage :* .stickersearch <texte>\n📌 *Exemple :* .stickersearch Naruto\n\n📸 5 stickers image\n🎬 5 stickers animés\n\n> 🥷 Brandon`,
            
        }, { quoted: message });
    }

    // Anti-spam
    const lastUse = cooldowns.get(senderId);
    if (lastUse && Date.now() - lastUse < COOLDOWN_MS) {
        const reste = Math.ceil((COOLDOWN_MS - (Date.now() - lastUse)) / 1000);
        return sock.sendMessage(chatId, {
            text: `⏳ Attends encore *${reste}s* avant de refaire cette commande !`
        }, { quoted: message });
    }
    cooldowns.set(senderId, Date.now());

    await sock.sendMessage(chatId, { react: { text: '🔍', key: message.key } });
    await sock.sendMessage(chatId, {
        text: `🔍 Recherche de stickers pour *"${query}"*...\n\n📸 5 stickers image\n🎬 5 stickers animés\n\n⏳ Patiente...`
    }, { quoted: message });

    try {
        // Recherche parallèle images + GIFs
        const [imageUrls, gifUrls] = await Promise.all([
            searchImages(query),
            searchGifs(query)
        ]);

        if (imageUrls.length === 0 && gifUrls.length === 0) {
            return sock.sendMessage(chatId, {
                text: `❌ Aucun résultat pour *"${query}"*.\n\nEssaie un autre mot-clé 🔄`
            }, { quoted: message });
        }

        let sentImages = 0;
        let sentGifs = 0;

        // ── 5 STICKERS STATIQUES ──
        if (imageUrls.length > 0) {
            await sock.sendMessage(chatId, {
                text: `📸 *Stickers image* (${Math.min(5, imageUrls.length)}) en cours...`
            });

            for (const url of imageUrls.slice(0, 5)) {
                if (sentImages >= 5) break;
                try {
                    const stickerBuffer = await imageToSticker(url);
                    await sock.sendMessage(chatId, {
                        sticker: stickerBuffer,
                        
                    });
                    sentImages++;
                    await new Promise(r => setTimeout(r, 700));
                } catch (e) {
                    console.error('Image sticker error:', e.message);
                }
            }
        }

        // ── 5 STICKERS ANIMÉS ──
        if (gifUrls.length > 0) {
            await sock.sendMessage(chatId, {
                text: `🎬 *Stickers animés* (${Math.min(5, gifUrls.length)}) en cours...`
            });

            for (const url of gifUrls.slice(0, 5)) {
                if (sentGifs >= 5) break;
                try {
                    const animBuffer = await gifToAnimatedSticker(url);
                    await sock.sendMessage(chatId, {
                        sticker: animBuffer,
                        
                    });
                    sentGifs++;
                    await new Promise(r => setTimeout(r, 1000));
                } catch (e) {
                    console.error('Animated sticker error:', e.message);
                }
            }
        }

        const total = sentImages + sentGifs;
        if (total === 0) throw new Error('Aucun sticker converti');

        await sock.sendMessage(chatId, {
            text: `✅ *${total}/10 stickers envoyés !*\n📸 Images : ${sentImages}/5\n🎬 Animés : ${sentGifs}/5\n\n> 🥷 Brandon`,
            react: { text: '✅', key: message.key }
        });

    } catch (e) {
        console.error('❌ stickersearch error:', e.message);
        await sock.sendMessage(chatId, {
            text: `❌ Erreur: ${e.message}`
        }, { quoted: message });
    }
}

module.exports = stickersearchCommand;
