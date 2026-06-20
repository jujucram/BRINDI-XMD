const fs = require('fs');
const path = require('path');
const pino = require('pino');
const { Boom } = require('@hapi/boom');

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

const silentLogger = pino({ level: 'silent' });

// ─── Message d'aide ───────────────────────────────────────────────────────────
const HELP_MSG =
`╔═══════════════════════╗
║  🥷 *BRINDI-𝗫𝗠𝗗 v1.0* 🥷  ║
╠═══════════════════════╣
║   📲 *CONNEXION BOT* ║
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
            { text: HELP_MSG },
            { quoted: message }
        );
    }

    // Session déjà en cours
    if (activePairSessions[number]) {
        return sock.sendMessage(chatId, {
            text: `⚠️ *Session déjà en cours pour +${number}.*\n\n_Attends quelques secondes et réessaie._`
        }, { quoted: message });
    }

    // Marquer session active
    activePairSessions[number] = true;

    await sock.sendMessage(chatId, {
        text: `⏳ *Génération du code en cours...*\n\n📞 *Numéro :* +${number}\n\n_Patiente quelques secondes..._\n> BRINDI-XMD`
    }, { quoted: message });

    const sessionId  = makeid();
    const tempDir    = path.join(process.cwd(), 'temp_pair', sessionId);
    const sessionDir = path.join(process.cwd(), 'sessions', number);

    function cleanup(tempSock) {
        delete activePairSessions[number];
        silentClose(tempSock);
        removeDir(tempDir);
    }

    // Nombre de reconnexions autorisées après un 515 (le restart de stream WA après pairing)
    const MAX_RECONNECT_ATTEMPTS = 3;
    let reconnectAttempts = 0;
    let codeSent          = false;
    let connectionOpen    = false;
    let timedOut          = false;
    let globalTimer       = null;

    function startGlobalTimer() {
        clearTimeout(globalTimer);
        globalTimer = setTimeout(async () => {
            if (!connectionOpen && activePairSessions[number]) {
                timedOut = true;
                cleanup(currentSock);
                await sock.sendMessage(chatId, {
                    text: `⌛ *Temps expiré !*\n\nLe code n'a pas été saisi à temps.\n\n🔄 Réessaie avec :\n_.pair ${number}_`
                }, { quoted: message });
            }
        }, 2 * 60_000);
    }

    let currentSock = null;

    async function connectSocket(state, saveCreds) {
        const tempSock = makeWASocket({
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, silentLogger)
            },
            logger: silentLogger,
            printQRInTerminal: false,
            mobile: false,
            browser: ['Mac OS', 'Chrome', '124.0.0.0'],
            syncFullHistory: false,
            markOnlineOnConnect: false,
            connectTimeoutMs: 60_000,
            defaultQueryTimeoutMs: 60_000,
            keepAliveIntervalMs: 10_000,
        });

        currentSock = tempSock;
        tempSock.ev.on('creds.update', saveCreds);

        tempSock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;

            const statusCode = lastDisconnect?.error
                ? new Boom(lastDisconnect.error)?.output?.statusCode
                : null;

            // ── 1. Génération du code (une seule fois) ──
            if (!codeSent && !tempSock.authState.creds.registered && !timedOut) {
                if (connection === 'close') return;
                codeSent = true;

                try {
                    await delay(3500);
                    const code = await tempSock.requestPairingCode(number.trim());
                    const fmt  = code?.match(/.{1,4}/g)?.join('-') ?? code;

                    await sock.sendMessage(chatId, {
                        text: `╔═══════════════════════╗\n║  🥷 *BRINDI-𝗫𝗠𝗗 v1.0* 🥷  ║\n╠═══════════════════════╣\n║   📲 *CODE DE LIAISON* ║\n╚═══════════════════════╝\n\n📞 *Numéro :* +${number}\n\n🔑 *Ton code :*\n┌──────────────────────\n│ \`\`\`${fmt}\`\`\`\n└──────────────────────\n\n📌 *Comment l'utiliser :*\n┌──────────────────────\n│ 1️⃣ Ouvre WhatsApp\n│ 2️⃣ ⋮ → Appareils liés\n│ 3️⃣ Lier un appareil\n│ 4️⃣ Connecter avec numéro\n│ 5️⃣ Entre le code ci-dessus\n│ ✅ Bot connecté !\n└──────────────────────\n\n⏰ *Ce code expire vite ! Ne tarde pas.*`
                    }, { quoted: message });

                } catch (codeErr) {
                    clearTimeout(globalTimer);
                    cleanup(tempSock);
                    const hint = getErrorHint(codeErr);
                    return sock.sendMessage(chatId, {
                        text: `❌ *Impossible de générer le code.*\n\n📌 *Erreur :* ${codeErr.message}\n💡 *Conseil :* ${hint}`
                    }, { quoted: message });
                }
            }

            // ── 2. Connexion réussie (ouverture finale) ──
            if (connection === 'open') {
                connectionOpen = true;
                clearTimeout(globalTimer);

                await sock.sendMessage(chatId, {
                    text: `✅ *Code accepté par WhatsApp !*\n\nFinalisation et chiffrement de la session pour +${number}... ⏳`
                }, { quoted: message });

                await delay(4000);
                silentClose(tempSock);
            }

            // ── 3. Gestion de la fermeture ──
            if (connection === 'close') {

                // Cas A : Fermeture APRES réussite -> on sauvegarde la session propre
                if (connectionOpen) {
                    clearTimeout(globalTimer);
                    delete activePairSessions[number];
                    try {
                        fs.mkdirSync(sessionDir, { recursive: true });
                        fs.cpSync(tempDir, sessionDir, { recursive: true });
                        removeDir(tempDir);

                        await sock.sendMessage(chatId, {
                            text: `🟢 *BRINDI-XMD CONNECTÉ AVEC SUCCÈS !*\n\n📞 Numéro : +${number}\n📂 Session sauvegardée dans le stockage.\n\nTape *.menu* pour interagir avec le bot.`
                        }, { quoted: message });

                        if (typeof global.startUserSession === 'function') {
                            await global.startUserSession(number);
                        }
                    } catch (saveErr) {
                        console.error('❌ Erreur écriture session définitive :', saveErr.message);
                    }
                    return;
                }

                // Cas B : 515 (Stream Restart Required) -> RECONNEXION ATTENDUE, pas une erreur
                // WhatsApp envoie systématiquement ce code juste après l'acceptation du
                // pairing code pour finaliser le handshake de chiffrement. Il faut
                // reconnecter avec les MÊMES creds (déjà sauvegardés sur disque par saveCreds).
                if (statusCode === 515 && codeSent && !timedOut) {
                    reconnectAttempts++;
                    if (reconnectAttempts <= MAX_RECONNECT_ATTEMPTS) {
                        await delay(1500);
                        const { state: freshState, saveCreds: freshSaveCreds } =
                            await useMultiFileAuthState(tempDir);
                        return connectSocket(freshState, freshSaveCreds);
                    }
                }

                // Cas C : Échec définitif ou rejet de WhatsApp
                clearTimeout(globalTimer);
                delete activePairSessions[number];
                const errorMsg = getDisconnectMessage(statusCode, number);
                removeDir(tempDir);

                await sock.sendMessage(chatId, { text: errorMsg }, { quoted: message });
            }
        });

        return tempSock;
    }

    try {
        const { state, saveCreds } = await useMultiFileAuthState(tempDir);
        startGlobalTimer();
        await connectSocket(state, saveCreds);

    } catch (error) {
        delete activePairSessions[number];
        removeDir(tempDir);
        console.error('❌ [PAIR ERROR]', error.message);
        return sock.sendMessage(chatId, {
            text: `❌ *Erreur critique lors du pairing.*\n\n📌 *Détail :* ${error.message}`
        }, { quoted: message });
    }
}

function getDisconnectMessage(code, number) {
    const retry = `\n\n🔄 Réessaie avec :\n_.pair ${number}_`;
    const messages = {
        401: `❌ *Erreur 401 — Session rejetée.*\nLe numéro +${number} a refusé la liaison ou annulé l'opération depuis son téléphone.${retry}`,
        403: `⛔ *Erreur 403 — Sécurité WhatsApp.*\nWhatsApp a bloqué la liaison. Ce numéro est peut-être temporairement restreint.${retry}`,
        411: `⚠️ *Erreur 411 — Conflit actif.*\nLe numéro +${number} est déjà lié à une instance Baileys active ailleurs. Supprime-la d'abord.${retry}`,
        428: `⌛ *Erreur 428 — Saisie trop lente.*\nLe code a expiré sur les serveurs de WhatsApp avant d'être entré.${retry}`,
        515: `❌ *Erreur 515 — Liaison instable.*\nLa reconnexion automatique après pairing a échoué plusieurs fois. Réessaie dans une minute.${retry}`,
    };
    return messages[code] || `❌ *Liaison interrompue (Code: ${code ?? 'Inconnu'}).*${retry}`;
}

function getErrorHint(err) {
    const msg = err.message?.toLowerCase() ?? '';
    if (msg.includes('not registered')) return "Ce numéro n'a pas de compte WhatsApp valide.";
    if (msg.includes('rate') || msg.includes('limit')) return "Trop de demandes de codes. Attends 5 minutes.";
    return "Vérifie la connexion réseau de ton serveur et réessaie.";
}

module.exports = pairCommand;
