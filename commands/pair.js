const fs = require('fs');
const path = require('path');
const pino = require('pino');

const {
    default: makeWASocket,
    useMultiFileAuthState,
    makeCacheableSignalKeyStore,
    Browsers,
    delay
} = require('@whiskeysockets/baileys');

const activePairSessions = {};

function makeid(length = 6) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return result;
}

function removeDir(dirPath) {
    try {
        if (fs.existsSync(dirPath)) {
            fs.rmSync(dirPath, {
                recursive: true,
                force: true
            });
        }
    } catch (e) {
        console.log('❌ Erreur suppression dossier :', e.message);
    }
}

async function pairCommand(sock, chatId, message, args) {

    const number = args[0]?.replace(/[^0-9]/g, '');

    // Vérification numéro
    if (!number || number.length < 7) {
        return await sock.sendMessage(chatId, {
            image: { url: './assets/IMG-20240812-WA0097.jpg' },
            caption:
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

> _Propulsé par 🥷 Brandon_`
        }, { quoted: message });
    }

    // Vérifie si session déjà active
    if (activePairSessions[number]) {
        return await sock.sendMessage(chatId, {
            text:
`⚠️ *Une session est déjà en cours pour ce numéro.*

_Attends quelques secondes et réessaie._`
        }, { quoted: message });
    }

    await sock.sendMessage(chatId, {
        text:
`⏳ *Génération du code...*

📞 *Numéro :* +${number}

_Patiente quelques secondes..._`
    }, { quoted: message });

    const sessionId = makeid();

    const tempDir = path.join(
        process.cwd(),
        'temp_pair',
        sessionId
    );

    activePairSessions[number] = true;

    try {

        // Création auth state
        const { state, saveCreds } =
            await useMultiFileAuthState(tempDir);

        // Création socket temporaire
        const tempSock = makeWASocket({
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(
                    state.keys,
                    pino({ level: 'fatal' })
                )
            },

            logger: pino({ level: 'fatal' }),

            printQRInTerminal: false,

            browser: Browsers.ubuntu('Chrome'),

            syncFullHistory: false,

            markOnlineOnConnect: false
        });

        // Sauvegarde creds
        tempSock.ev.on('creds.update', saveCreds);

        let codeSent = false;
        let connectionOpened = false;

        // Gestion connexion
        tempSock.ev.on('connection.update', async (update) => {

            const {
                connection,
                lastDisconnect
            } = update;

            // Génération code pairing
            if (
                !codeSent &&
                !tempSock.authState.creds.registered
            ) {

                codeSent = true;

                try {

                    await delay(3000);

                    const code =
                        await tempSock.requestPairingCode(
                            number.trim()
                        );

                    const formattedCode =
                        code?.match(/.{1,4}/g)?.join('-') || code;

                    await sock.sendMessage(chatId, {
                        image: {
                            url: './assets/IMG-20240812-WA0097.jpg'
                        },

                        caption:
`╔═══════════════════════╗
║  🥷 *BRINDI-𝗫𝗠𝗗 v1.0* 🥷  ║
╠═══════════════════════╣
║   📲 *CODE DE LIAISON*    ║
╚═══════════════════════╝

📞 *Numéro :* +${number}

🔑 *Ton code :*
┌──────────────────────
│ \`\`\`${formattedCode}\`\`\`
└──────────────────────

📌 *Comment l'utiliser :*
┌──────────────────────
│ 1️⃣ Ouvre WhatsApp
│ 2️⃣ ⋮ → Appareils liés
│ 3️⃣ Lier un appareil
│ 4️⃣ Connecter avec numéro
│ 5️⃣ Entre : *${formattedCode}*
│ ✅ Bot connecté !
└──────────────────────

⏰ *Ce code expire dans 60 secondes !*

> _Propulsé par 🥷 Brandon_`
                    }, { quoted: message });

                } catch (codeErr) {

                    console.log(
                        '❌ Erreur pairing :',
                        codeErr.message
                    );

                    delete activePairSessions[number];

                    removeDir(tempDir);

                    return await sock.sendMessage(chatId, {
                        text:
`❌ *Erreur génération code.*

📌 *Erreur :*
${codeErr.message}

_Vérifie que le numéro est valide et possède WhatsApp._`
                    }, { quoted: message });
                }
            }

            // Connexion réussie
            if (connection === 'open') {

                if (connectionOpened) return;

                connectionOpened = true;

                try {

                    await delay(5000);

                    const sessionDir = path.join(
                        process.cwd(),
                        'sessions',
                        number
                    );

                    // Crée dossier session
                    if (!fs.existsSync(sessionDir)) {
                        fs.mkdirSync(sessionDir, {
                            recursive: true
                        });
                    }

                    // Copie complète session
                    fs.cpSync(
                        tempDir,
                        sessionDir,
                        {
                            recursive: true
                        }
                    );

                    await sock.sendMessage(chatId, {
                        text:
`╔═══════════════════════╗
║  🥷 *BRINDI-𝗫𝗠𝗗 v1.0* 🥷  ║
╠═══════════════════════╣
║   ✅ *BOT CONNECTÉ !*      ║
╚═══════════════════════╝

🎉 *Connexion réussie !*

📞 *Numéro :* +${number}

🟢 *La session a été sauvegardée.*

Tape *.menu* pour voir toutes les commandes !

> _Propulsé par 🥷 Brandon_`
                    }, { quoted: message });

                } catch (saveErr) {

                    console.log(
                        '❌ Erreur sauvegarde :',
                        saveErr.message
                    );
                }

                // Nettoyage
                delete activePairSessions[number];

                try {
                    await tempSock.ws.close();
                } catch {}

                removeDir(tempDir);

                // Démarrage auto session
                try {

                    if (global.startUserSession) {
                        await global.startUserSession(number);

                        console.log(
                            `✅ Session démarrée : ${number}`
                        );
                    }

                } catch (startErr) {

                    console.log(
                        '❌ Erreur startUserSession :',
                        startErr.message
                    );
                }
            }

            // Déconnexion
            else if (connection === 'close') {

                const reason =
                    lastDisconnect?.error?.output?.statusCode;

                console.log(
                    '❌ Connexion fermée :',
                    reason || 'unknown'
                );

                delete activePairSessions[number];

                try {
                    await tempSock.ws.close();
                } catch {}

                removeDir(tempDir);
            }
        });

        // Timeout sécurité
        setTimeout(async () => {

            if (activePairSessions[number]) {

                delete activePairSessions[number];

                try {
                    await tempSock.ws.close();
                } catch {}

                removeDir(tempDir);

                await sock.sendMessage(chatId, {
                    text:
`⌛ *Temps expiré !*

Le code de connexion a expiré.

🔄 Refais :
.pair ${number}`
                }, { quoted: message });
            }

        }, 3 * 60 * 1000);

    } catch (error) {

        console.log(
            '❌ [PAIR ERROR]',
            error.message
        );

        delete activePairSessions[number];

        removeDir(tempDir);

        return await sock.sendMessage(chatId, {
            text:
`❌ *Impossible de générer le code.*

📌 *Erreur :*
${error.message}`
        }, { quoted: message });
    }
}

module.exports = pairCommand;