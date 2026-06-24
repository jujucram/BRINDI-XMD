const axios = require('axios');

async function spotifyCommand(sock, chatId, message) {
    try {
        const rawText =
            message.message?.conversation?.trim() ||
            message.message?.extendedTextMessage?.text?.trim() ||
            message.message?.imageMessage?.caption?.trim() ||
            message.message?.videoMessage?.caption?.trim() ||
            '';

        const used = (rawText || '').split(/\s+/)[0] || '.spotify';
        const query = rawText.slice(used.length).trim();

        if (!query) {
            return await sock.sendMessage(chatId, {
                text: `🎵 *Utilisation :* \`.spotify <titre ou artiste>\`\n\n📌 *Exemple :* \`.spotify con calma\`\n\n> BRINDI-XMD`
            }, { quoted: message });
        }

        // Réaction de chargement
        await sock.sendMessage(chatId, {
            react: { text: '🎵', key: message.key }
        });

        const encoded = encodeURIComponent(query);
        let result = null;

        // ─────────────────────────────────────
        // 📌 Liste des APIs stables en cascade
        // ─────────────────────────────────────
        const apis = [
            {
                name: 'Siputzx Spotify DL',
                fetch: async () => {
                    const { data } = await axios.get(
                        `https://api.siputzx.my.id/api/d/spotify?search=${encoded}`,
                        { timeout: 18000, headers: { 'user-agent': 'Mozilla/5.0' } }
                    );
                    const r = data?.data || data?.result;
                    if (!r || !r.download) throw new Error('Format de réponse invalide');
                    return {
                        title: r.title || r.name || 'Musique Spotify',
                        artist: r.artist || 'Artiste Inconnu',
                        duration: r.duration || 'N/A',
                        url: r.url || '',
                        audio: r.download,
                        thumbnail: r.image || r.thumbnail || null
                    };
                }
            },
            {
                name: 'Ryzendesu Spotify',
                fetch: async () => {
                    const { data } = await axios.get(
                        `https://api.ryzendesu.vip/api/downloader/spotify?text=${encoded}`,
                        { timeout: 18000, headers: { 'user-agent': 'Mozilla/5.0' } }
                    );
                    if (!data?.link || !data?.success) throw new Error('Téléchargement impossible');
                    return {
                        title: data.metadata?.title || 'Musique Spotify',
                        artist: data.metadata?.artists || 'Artiste Inconnu',
                        duration: data.metadata?.duration || 'N/A',
                        url: '',
                        audio: data.link,
                        thumbnail: data.metadata?.cover || null
                    };
                }
            },
            {
                name: 'Vreden Downloader',
                fetch: async () => {
                    const { data } = await axios.get(
                        `https://api.vreden.my.id/api/spotify?query=${encoded}`,
                        { timeout: 18000, headers: { 'user-agent': 'Mozilla/5.0' } }
                    );
                    const r = data?.result;
                    if (!r || !r.music) throw new Error('Aucun flux audio');
                    return {
                        title: r.title || 'Musique Spotify',
                        artist: r.artist || 'Artiste Inconnu',
                        duration: r.duration || 'N/A',
                        url: '',
                        audio: r.music,
                        thumbnail: r.thumbnail || null
                    };
                }
            },
            {
                name: 'Ancienne Passerelle Vercel',
                fetch: async () => {
                    const { data } = await axios.get(
                        `https://okatsu-rolezapiiz.vercel.app/search/spotify?q=${encoded}`,
                        { timeout: 15000, headers: { 'user-agent': 'Mozilla/5.0' } }
                    );
                    if (!data?.status || !data?.result?.audio) throw new Error('No audio');
                    const r = data.result;
                    return {
                        title: r.title || r.name || 'Musique Spotify',
                        artist: r.artist || 'Artiste Inconnu',
                        duration: r.duration || 'N/A',
                        url: r.url || '',
                        audio: r.audio,
                        thumbnail: r.thumbnails || null
                    };
                }
            }
        ];

        // ─────────────────────────────────────
        // 📌 Essayer chaque API dans l'ordre
        // ─────────────────────────────────────
        for (const api of apis) {
            try {
                // console.log(`[SPOTIFY] Tentative via ${api.name}...`);
                result = await api.fetch();
                if (result && result.audio) {
                    break;
                }
            } catch (e) {
                // console.warn(`[SPOTIFY] ${api.name} échoué:`, e.message);
                continue;
            }
        }

        // Si aucun serveur n'a pu renvoyer la musique
        if (!result || !result.audio) {
            await sock.sendMessage(chatId, { react: { text: '❌', key: message.key } });
            return await sock.sendMessage(chatId, {
                text: `❌ Impossible de trouver et télécharger *${query}*.\n_Les serveurs de streaming sont actuellement surchargés. Réessaie dans un instant._\n\n> BRINDI-XMD`
            }, { quoted: message });
        }

        // ─────────────────────────────────────
        // 📌 Envoi de la Jaquette (Thumbnail) + Infos
        // ─────────────────────────────────────
        const caption =
            `🎵 *Titre :* ${result.title}\n` +
            `👤 *Artiste :* ${result.artist}\n` +
            `⏱ *Durée :* ${result.duration}\n` +
            (result.url ? `🔗 *Lien :* ${result.url}\n` : '') +
            `\n> BRINDI-XMD`;

        if (result.thumbnail) {
            try {
                await sock.sendMessage(chatId, {
                    image: { url: result.thumbnail },
                    caption: caption
                }, { quoted: message });
            } catch {
                await sock.sendMessage(chatId, { text: caption }, { quoted: message });
            }
        } else {
            await sock.sendMessage(chatId, { text: caption }, { quoted: message });
        }

        // ─────────────────────────────────────
        // 📌 Envoi du fichier Audio .mp3
        // ─────────────────────────────────────
        // Nettoyage du titre pour éviter les caractères interdits dans les noms de fichiers
        const cleanTitle = result.title.replace(/[\\/:*?"<>|]/g, '');

        await sock.sendMessage(chatId, {
            audio: { url: result.audio },
            mimetype: 'audio/mpeg',
            fileName: `${cleanTitle}.mp3`,
            ptt: false // Change en true si tu préfères que ça s'envoie comme un mémo vocal direct
        }, { quoted: message });

        // Réaction de succès final
        await sock.sendMessage(chatId, {
            react: { text: '✅', key: message.key }
        });

    } catch (error) {
        console.error('[SPOTIFY ERROR FATAL]', error);
        await sock.sendMessage(chatId, {
            text: `❌ Une erreur critique est survenue lors de la récupération audio.\n\n> BRINDI-XMD`
        }, { quoted: message });
    }
}

module.exports = spotifyCommand;
