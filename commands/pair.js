const fs = require('fs');
const path = require('path');
const pino = require('pino');

const {
    default: makeWASocket,
    useMultiFileAuthState,
    makeCacheableSignalKeyStore,
    DisconnectReason,
    delay
} = require('@whiskeysockets/baileys');

// ─── Sessions actives ─────────────────────────────────────────────────────────
const activePairSessions = {};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function makeid(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length }, () =>
        chars.charAt(Math.floor(Math.random() * chars.length))
    ).join('');
}

function removeDir(dirPath) {
    try {
        if (fs.existsSync(dirPath))
            fs.rmSync(dirPath, { recursive: true, force: true });
    } catch (e) {
        console.error('❌ removeDir:', e.message);
    }
}

function silentClose(sock) {
    try { sock?.ws?.close(); } catch {}
    try { sock?.end(undefined); } catch {}
}

// ─── Logger silencieux ────────────────────────────────────────────────────────
const silentLogger = pino({ level: 'silent' });

// ─── Message d'aide ───────────────────────────────────────────────────────────
const HELP_MSG =
`╔═══════════════════════╗
║  🥷 *BRINDI-𝗫𝗠𝗗 v1.0* 🥷  ║
╠═══════════════════════╣
║   📲 *CONNEXION BOT*      ║
╚═══════════════════════╝

🔑 *Pairing Code WhatsApp*

💡 *Usage :*
┌──────────────────────
│ .pair <ton numéro>
│ _Exemple : .pair 237673355468_
└──────────────────────

📌 *Étapes :*
┌──────────────────────
│ 1️⃣ Tape .pair <numéro>
│ 2️⃣ Reçois ton code
│ 3️⃣ WhatsApp → ⋮ → Appareils liés
│ 4️⃣ Connecter avec numéro
│ 5️⃣ Entre le code reçu
│ ✅ Bot connecté !
└──────────────────────

> _Propulsé par BRINDI-𝗫𝗠𝗗_`;

// ─── Commande principale ──────────────────────────────────────────────────────
async function pairCommand(sock, chatId, message, args) {

    const number = args[0]?.replace(/[^0-9]/g, '');

    // Validation numéro
    if (!number || number.length < 7) {
        return sock.sendMessage(chatId,
            { image: { url: './assets/IMG-20240812-WA0097.jpg' }, caption: HELP_MSG },
            { quoted: message }
        );
    }

    // Session déjà en cours
    if (activePairSessions[number]) {
        return sock.sendMessage(chatId, {
            text: `⚠️ *Session déjà en cours pour +${number}.*\n\n_Attends 30 secondes et réessaie._`
        }, { quoted: message });
    }

    // Marquer session active
    activePairSessions[number] = true;

    await sock.sendMessage(chatId, {
        text: `⏳ *Génération du code en cours...*\n\n📞 *Numéro :* +${number}\n\n_Patiente quelques secondes..._\n> BRINDI-XMD`
    }, { quoted: message });

    const sessionId = makeid();
    const tempDir   = path.join(process.cwd(), 'temp_pair', sessionId);
    const sessionDir = path.join(process.cwd(), 'sessions', number);

    // ── Nettoyage garanti ────────────────────────────────────────────────────
    function cleanup(tempSock) {
        delete activePairSessions[number];
        silentClose(tempSock);
        removeDir(tempDir);
    }

    try {
        const { state, saveCreds } = await useMultiFileAuthState(tempDir);

        // ── Choix du browser : WA Desktop (meilleure compatibilité pairing) ──
        const tempSock = makeWASocket({
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, silentLogger)
            },
            logger: silentLogger,
            printQRInTerminal: false,
            // Mobile = identifiant le plus stable pour pairing code
            mobile: false,
            browser: ['Ubuntu', 'Chrome', '22.04'],
            syncFullHistory: false,
            markOnlineOnConnect: false,
            connectTimeoutMs: 60_000,
            defaultQueryTimeoutMs: 60_000,
            keepAliveIntervalMs: 10_000,
            retryRequestDelayMs: 250,
            fireInitQueries: false,
            generateHighQualityLinkPreview: false,
        });

        tempSock.ev.on('creds.update', saveCreds);

        // ── Flags ──────────────────────────────────────────────────────────
        let codeSent       = false;
        let connectionOpen = false;
        let timedOut       = false;

        // ── Timeout global 3 min ───────────────────────────────────────────
        const globalTimer = setTimeout(async () => {
            if (!connectionOpen && activePairSessions[number]) {
                timedOut = true;
                cleanup(tempSock);
                await sock.sendMessage(chatId, {
                    text:
`⌛ *Temps expiré !*

Le code a expiré ou n'a pas été utilisé.

🔄 Réessaie avec :
_.pair ${number}_`
                }, { quoted: message });
            }
        }, 3 * 60_000);

        // ── Gestion connexion ──────────────────────────────────────────────
        tempSock.ev.on('connection.update', async (update) => {

            const { connection, lastDisconnect } = update;
            const statusCode = lastDisconnect?.error?.output?.statusCode
                            ?? lastDisconnect?.error?.output?.payload?.statusCode
                            ?? lastDisconnect?.error?.output?.statusCode;

            // ── Génération du pairing code ─────────────────────────────────
            if (!codeSent && !tempSock.authState.creds.registered && !timedOut) {

                // On ne tente pas si la connexion est déjà fermée
                if (connection === 'close') return;

                codeSent = true;

                try {
                    await delay(3000);

                    const code = await tempSock.requestPairingCode(number.trim());
                    const fmt  = code?.match(/.{1,4}/g)?.join('-') ?? code;

                    await sock.sendMessage(chatId, {
                        image: { url: './assets/IMG-20240812-WA0097.jpg' },
                        caption:
`╔═══════════════════════╗
║  🥷 *BRINDI-𝗫𝗠𝗗 v1.0* 🥷  ║
╠═══════════════════════╣
║   📲 *CODE DE LIAISON*    ║
╚═══════════════════════╝

📞 *Numéro :* +${number}

🔑 *Ton code :*
┌──────────────────────
│ \`\`\`${fmt}\`\`\`
└──────────────────────

📌 *Comment l'utiliser :*
┌──────────────────────
│ 1️⃣ Ouvre WhatsApp
│ 2️⃣ ⋮ → Appareils liés
│ 3️⃣ Lier un appareil
│ 4️⃣ Connecter avec numéro
│ 5️⃣ Entre : *${fmt}*
│ ✅ Bot connecté !
└──────────────────────

⏰ *Ce code expire dans 60 secondes !*

> _Propulsé par BRINDI-𝗫𝗠𝗗`
                    }, { quoted: message });

                } catch (codeErr) {
                    clearTimeout(globalTimer);
                    cleanup(tempSock);

                    const hint = getErrorHint(codeErr);
                    return sock.sendMessage(chatId, {
                        text:
`❌ *Impossible de générer le code.*

📌 *Erreur :* ${codeErr.message}
💡 *Conseil :* ${hint}

🔄 Réessaie dans 30 secondes.`
                    }, { quoted: message });
                }
            }

            // ── Connexion réussie ──────────────────────────────────────────
            if (connection === 'open' && !connectionOpen) {
                connectionOpen = true;
                clearTimeout(globalTimer);

                try {
                    await delay(3000);

                    // Sauvegarde session
                    fs.mkdirSync(sessionDir, { recursive: true });
                    fs.cpSync(tempDir, sessionDir, { recursive: true });

                    await sock.sendMessage(chatId, {
                        text:
`╔═══════════════════════╗
║  🥷 *BRINDI-𝗫𝗠𝗗 v1.0* 🥷  ║
╠═══════════════════════╣
║   ✅ *BOT CONNECTÉ !*      ║
╚═══════════════════════╝

🎉 *Connexion réussie !*
📞 *Numéro :* +${number}
🟢 *Session sauvegardée.*

Tape *.menu* pour voir les commandes !

> _Propulsé par BRINDI-𝗫𝗠𝗗`
                    }, { quoted: message });

                } catch (saveErr) {
                    console.error('❌ Sauvegarde session :', saveErr.message);
                }

                cleanup(tempSock);

                // Démarrage auto session
                try {
                    if (typeof global.startUserSession === 'function') {
                        await global.startUserSession(number);
                        console.log(`✅ Session démarrée : ${number}`);
                    }
                } catch (startErr) {
                    console.error('❌ startUserSession :', startErr.message);
                }
            }

            // ── Connexion fermée ───────────────────────────────────────────
            else if (connection === 'close') {

                // Si connexion déjà ouverte → fermeture normale, ignorer
                if (connectionOpen) return;

                clearTimeout(globalTimer);

                const msg = getDisconnectMessage(statusCode, number);

                // Nettoyer seulement si pas encore fait
                if (activePairSessions[number]) {
                    cleanup(tempSock);

                    await sock.sendMessage(chatId, {
                        text: msg
                    }, { quoted: message });
                }
            }
        });

    } catch (error) {
        delete activePairSessions[number];
        removeDir(tempDir);

        console.error('❌ [PAIR ERROR]', error.message);

        return sock.sendMessage(chatId, {
            text:
`❌ *Erreur critique lors du pairing.*

📌 *Erreur :* ${error.message}
💡 *Conseil :* Redémarre le bot et réessaie.`
        }, { quoted: message });
    }
}

// ─── Messages d'erreur selon le code de déconnexion ──────────────────────────
function getDisconnectMessage(code, number) {
    const retry = `\n\n🔄 Réessaie avec :\n_.pair ${number}_`;

    const messages = {
        // 401 = Non autorisé / session invalide
        401: `❌ *Erreur 401 — Session invalide.*\n\nLe numéro +${number} a refusé la connexion ou la session est expirée.${retry}`,

        // 403 = Compte banni ou restrictions
        403: `⛔ *Erreur 403 — Accès refusé.*\n\nWhatsApp a bloqué cette tentative. Le compte est peut-être restreint ou banni temporairement.${retry}`,

        // 405 = Mauvaise méthode / navigateur non reconnu
        405: `❌ *Erreur 405 — Navigateur non reconnu.*\n\nWhatsApp a rejeté l'identifiant de session.${retry}`,

        // 408 = Timeout
        408: `⌛ *Erreur 408 — Timeout.*\n\nLa connexion a pris trop de temps.${retry}`,

        // 411 = Déjà connecté ailleurs
        411: `⚠️ *Erreur 411 — Déjà connecté.*\n\nLe numéro +${number} est déjà lié à un autre appareil actif.\n\nDéconnecte l'ancien appareil depuis WhatsApp → Appareils liés.${retry}`,

        // 428 = Pairing pas complété à temps
        428: `⌛ *Erreur 428 — Code non utilisé.*\n\nLe code a expiré avant d'être saisi.${retry}`,

        // 440 = Remplacé par une autre connexion
        440: `⚠️ *Erreur 440 — Session remplacée.*\n\nUne autre connexion a pris la place.${retry}`,

        // 500 = Erreur serveur WhatsApp
        500: `🔴 *Erreur 500 — Serveur WhatsApp.*\n\nPanne côté WhatsApp. Attends quelques minutes et réessaie.${retry}`,

        // 515 = Reset / session rejetée
        515: `❌ *Erreur 515 — Session rejetée.*\n\nWhatsApp a forcé une réinitialisation.\n\n💡 *Causes possibles :*\n• Numéro déjà actif sur Baileys\n• Trop de tentatives rapides\n• IP blacklistée temporairement\n\nAttends 1 minute et réessaie.${retry}`,
    };

    return messages[code] ??
        `❌ *Connexion fermée (code: ${code ?? 'inconnu'}).*\n\nUne erreur inattendue s'est produite.${retry}`;
}

// ─── Conseils selon l'erreur de génération de code ───────────────────────────
function getErrorHint(err) {
    const msg = err.message?.toLowerCase() ?? '';

    if (msg.includes('not registered') || msg.includes('not a whatsapp'))
        return 'Ce numéro n\'est pas enregistré sur WhatsApp.';
    if (msg.includes('rate') || msg.includes('limit'))
        return 'Trop de tentatives. Attends 1 minute.';
    if (msg.includes('timeout'))
        return 'Connexion trop lente. Vérifie ta connexion internet.';
    if (msg.includes('bad session') || msg.includes('invalid'))
        return 'Session corrompue. Le dossier temp sera nettoyé automatiquement.';

    return 'Vérifie que le numéro est correct et possède WhatsApp.';
}

module.exports = pairCommand;
