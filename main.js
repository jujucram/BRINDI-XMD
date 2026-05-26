require('dotenv').config();
// 🧹 Fix for ENOSPC / temp overflow in hosted panels
const fs = require('fs');
const path = require('path');

// Redirect temp storage away from system /tmp
const customTemp = path.join(process.cwd(), 'temp');
if (!fs.existsSync(customTemp)) fs.mkdirSync(customTemp, { recursive: true });
process.env.TMPDIR = customTemp;
process.env.TEMP = customTemp;
process.env.TMP = customTemp;

// Auto-cleaner every 3 hours
setInterval(() => {
    fs.readdir(customTemp, (err, files) => {
        if (err) return;
        for (const file of files) {
            const filePath = path.join(customTemp, file);
            fs.stat(filePath, (err, stats) => {
                if (!err && Date.now() - stats.mtimeMs > 3 * 60 * 60 * 1000) {
                    fs.unlink(filePath, () => { });
                }
            });
        }
    });
    console.log('🧹 Temp folder auto-cleaned');
}, 3 * 60 * 60 * 1000);

const settings = require('./settings');
const { setprefixCommand, getCurrentPrefix, VALID_PREFIXES } = require('./commands/setprefix');
require('./config.js');
const { isBanned } = require('./lib/isBanned');
const yts = require('yt-search');
const { fetchBuffer } = require('./lib/myfunc');
const fetch = require('node-fetch');
const ytdl = require('ytdl-core');
const axios = require('axios');
const ffmpeg = require('fluent-ffmpeg');
const { isSudo } = require('./lib/index');
const isOwnerOrSudo = require('./lib/isOwner');
const { autotypingCommand, isAutotypingEnabled, handleAutotypingForMessage, handleAutotypingForCommand, showTypingAfterCommand } = require('./commands/autotyping');
const { autoreadCommand, isAutoreadEnabled, handleAutoread } = require('./commands/autoread');

// Command imports
const tagAllCommand = require('./commands/tagall');
const helpCommand = require('./commands/help');
const banCommand = require('./commands/ban');
const { promoteCommand } = require('./commands/promote');
const { demoteCommand } = require('./commands/demote');
const muteCommand = require('./commands/mute');
const unmuteCommand = require('./commands/unmute');
const stickerCommand = require('./commands/sticker');
const stickersearchCommand = require('./commands/stickersearch');
const isAdmin = require('./lib/isAdmin');
const warnCommand = require('./commands/warn');
const warningsCommand = require('./commands/warnings');
const ttsCommand = require('./commands/tts');
const { tictactoeCommand, handleTicTacToeMove } = require('./commands/tictactoe'); 
const { incrementMessageCount, topMembers } = require('./commands/topmembers');
const whoisCommand = require('./commands/whois');

const ownerCommand = require('./commands/owner');
const deleteCommand = require('./commands/delete');
const { handleAntilinkCommand, handleLinkDetection } = require('./commands/antilink');
const { handleAntitagCommand, handleTagDetection } = require('./commands/antitag');
const { Antilink } = require('./lib/antilink');
const { handleMentionDetection, mentionToggleCommand, setMentionCommand } = require('./commands/mention');
const memeCommand = require('./commands/meme');
const tagCommand = require('./commands/tag');
const tagNotAdminCommand = require('./commands/tagnotadmin');
const hideTagCommand = require('./commands/hidetag');
const jokeCommand = require('./commands/joke');
const quoteCommand = require('./commands/quote');
const factCommand = require('./commands/fact');
const weatherCommand = require('./commands/weather');
const newsCommand = require('./commands/news');
const journalCommand = require('./commands/journal');
const kickCommand = require('./commands/kick');
const signalCommand = require('./commands/signal');
const { approveCommand, isApproved } = require('./commands/approve');
const autobioCommand = require('./commands/autobio');
const footballnewsCommand = require('./commands/footballnews');
const { maintenanceCommand, isInMaintenance } = require('./commands/maintenance');
const claudeCommand = require('./commands/claude');
const lovableCommand = require('./commands/lovable');
const copilotCommand = require('./commands/copilot');
const deepseekCommand = require('./commands/deepseek');
const totalmembersCommand = require('./commands/totalmembers');
const metaCommand = require('./commands/meta');
const blockCommand = require('./commands/block');
const unblockCommand = require('./commands/unblock');

const dragueCommand = require('./commands/drague');
const itachiinfoCommand = require('./commands/itachiinfo');
const simageCommand = require('./commands/simage');
const attpCommand = require('./commands/attp');
const brindiKillCommand = require('./commands/brindi-kill'); 
const { startHangman, guessLetter } = require('./commands/hangman');
const { complimentCommand } = require('./commands/compliment');
const { insultCommand } = require('./commands/insult');
const { eightBallCommand } = require('./commands/eightball');
const { lyricsCommand } = require('./commands/lyrics');
const { dareCommand } = require('./commands/dare');
const { truthCommand } = require('./commands/truth');
const { clearCommand } = require('./commands/clear');
const pingCommand = require('./commands/ping');
const aliveCommand = require('./commands/alive');
const blurCommand = require('./commands/img-blur');
const { welcomeCommand, handleJoinEvent } = require('./commands/welcome');
const { goodbyeCommand, handleLeaveEvent } = require('./commands/goodbye');
const githubCommand = require('./commands/github');
const { handleAntiBadwordCommand, handleBadwordDetection } = require('./lib/antibadword');
const brindiIosCommand = require('./commands/brindi-ios');

const antibadwordCommand = require('./commands/antibadword');
const { handleChatbotCommand, handleChatbotResponse } = require('./commands/chatbot');
const takeCommand = require('./commands/take');
const { flirtCommand } = require('./commands/flirt');
const characterCommand = require('./commands/character');
const wastedCommand = require('./commands/wasted');
const shipCommand = require('./commands/ship');
const groupInfoCommand = require('./commands/groupinfo');
const resetlinkCommand = require('./commands/resetlink');
const staffCommand = require('./commands/staff');
const unbanCommand = require('./commands/unban');
const emojimixCommand = require('./commands/emojimix');
const { handlePromotionEvent } = require('./commands/promote');
const { handleDemotionEvent } = require('./commands/demote');
const viewOnceCommand = require('./commands/viewonce');
const clearSessionCommand = require('./commands/clearsession');
const { autoStatusCommand, handleStatusUpdate } = require('./commands/autostatus');
const { simpCommand } = require('./commands/simp');
const { stupidCommand } = require('./commands/stupid');
const stickerTelegramCommand = require('./commands/stickertelegram');
const textmakerCommand = require('./commands/textmaker');
const { handleAntideleteCommand, handleMessageRevocation, storeMessage } = require('./commands/antidelete');
const clearTmpCommand = require('./commands/cleartmp');
const setProfilePicture = require('./commands/setpp');
const { setGroupDescription, setGroupName, setGroupPhoto } = require('./commands/groupmanage');
const instagramCommand = require('./commands/instagram');
const facebookCommand = require('./commands/facebook');
const spotifyCommand = require('./commands/spotify');
const playCommand = require('./commands/play');
const tiktokCommand = require('./commands/tiktok');
const songCommand = require('./commands/song');
const aiCommand = require('./commands/ai');
const urlCommand = require('./commands/url');
const { handleTranslateCommand } = require('./commands/translate');
const { handleSsCommand } = require('./commands/ss');
const { addCommandReaction, handleAreactCommand } = require('./lib/reactions');
const { goodnightCommand } = require('./commands/goodnight');
const { shayariCommand } = require('./commands/shayari');
const { rosedayCommand } = require('./commands/roseday');
const imagineCommand = require('./commands/imagine');
const videoCommand = require('./commands/video');
const sudoCommand = require('./commands/sudo');
const addCommand = require('./commands/add');
const { miscCommand, handleHeart } = require('./commands/misc');
const { animeCommand } = require('./commands/anime');
const { piesCommand, piesAlias } = require('./commands/pies');
const stickercropCommand = require('./commands/stickercrop');
const updateCommand = require('./commands/update');
const removebgCommand = require('./commands/removebg');
const { reminiCommand } = require('./commands/remini');
const { igsCommand } = require('./commands/igs');
const { anticallCommand, readState: readAnticallState } = require('./commands/anticall');
const { pmblockerCommand, readState: readPmBlockerState } = require('./commands/pmblocker');
const settingsCommand = require('./commands/settings');
const soraCommand = require('./commands/sora');
const { antibotCommand, isAntibotEnabled } = require('./commands/antibot');

const closeCommand = require('./commands/close');
const openCommand = require('./commands/open');
const autoviewstatusCommand = require('./commands/autoviewstatus');
const allmenuCommand = require('./commands/allmenu');
const imageCommand = require('./commands/image');
const antileaveCommand = require('./commands/antileave');
const { handleAntileave } = require('./commands/antileave');
const antimentionstatusCmd = require('./commands/antimentionstatus');
const { isStatusMention, isEnabled: isAntiStatusMentionEnabled, handleAntimentionStatus } = require('./commands/antimentionstatus');
const antimentionCommand = require('./commands/antimention');
const { handleAntimention } = require('./commands/antimention');
const linkCommand = require('./commands/link');
const menustyleCommand = require('./commands/menustyle');
const themeCommand = require('./commands/theme');
const setmenuimageCommand = require('./commands/setmenuimage');
const pairCommand = require('./commands/pair');
const promptCommand = require('./commands/prompt');
const { getPrompt } = require('./commands/prompt');
const autoreactstatusCommand = require('./commands/autoreactstatus');
const { handleAutoReact } = require('./commands/autoreactstatus');
const uptimeCommand = require('./commands/uptime');
const waouhCommand = require('./commands/waouh');
const toimageCommand = require('./commands/toimage');
const antistickerCommand = require('./commands/antisticker');
const { handleAntisticker } = require('./commands/antisticker');
const setsudoCommand = require('./commands/setsudo');
const listsudoCommand = require('./commands/listsudo');
const delsudoCommand = require('./commands/delsudo');
const codeaiCommand = require('./commands/codeai');
const gjidCommand = require('./commands/gjid');
const gstatusCommand = require('./commands/gstatus');
const hummCommand = require('./commands/humm');
const selfCommand = require('./commands/self');
const { isSelfMode } = require('./commands/self');
const saveCommand = require('./commands/save');
const {
    startTrivia,
    answerTrivia
} = require('./commands/trivia');
// ─────────────────────────────────────────────────────────

const { dlStatusCommand, lectureStatusCommand, likeStatusCommand, sendMeCommand } = require('./commands/statuts');
const { pollCommand, gcreateCommand, joinCommand, leaveCommand, lockCommand, unlockCommand, kickallCommand: kickallGroupCmd, vcfCommand, tagadminCommand, acceptallCommand, rejectallCommand } = require('./commands/groupeplus');
const { getprivacyCommand, lastseenCommand, onlineCommand, presenceCommand, setbioCommand, myppCommand, mystatusCommand, groupaddCommand, readCommand } = require('./commands/confidentialite');
const kickallCommand = require('./commands/kickall');
const { purgeCommand, antipurgeCommand, sanctionCommand, uptimeCmdNew, testCmdNew, infoCmdNew, contactCmdNew, autorecordingCommand, restoreCommand, clanCommand, loiCommand, antimaraboutCommand, handleAntimarabout } = require('./commands/nouvelles');
// ──────────────────────────────────────────────────────────────
// Global settings
global.packname = settings.packname;
global.author = settings.author;
global.ytch = "";

async function handleMessages(sock, messageUpdate, printLog) {
    let chatId; // Déclaré à l'extérieur pour le bloc catch
    try {
        const { messages, type } = messageUpdate;
        if (type !== 'notify') return;

        const message = messages[0];
        if (!message?.message) return;

        // Handle autoread functionality
        await handleAutoread(sock, message);

        // Store message for antidelete feature
        if (message.message) {
            storeMessage(sock, message);
        }

        // Handle message revocation
        if (message.message?.protocolMessage?.type === 0) {
            await handleMessageRevocation(sock, message);
            return;
        }

        chatId = message.key.remoteJid;
        const senderId = message.key.participant || message.key.remoteJid;
        const isGroup = chatId.endsWith('@g.us');
        const isChannel = chatId.endsWith('@newsletter');

        // Support des chaînes WhatsApp
        const senderIsSudo = await isSudo(senderId);
        const senderIsOwnerOrSudo = await isOwnerOrSudo(senderId, sock, chatId);

        // Handle button responses
        if (message.message?.buttonsResponseMessage) {
            const buttonId = message.message.buttonsResponseMessage.selectedButtonId;
            if (buttonId === 'owner') {
                const ownerCommand = require('./commands/owner');
                await ownerCommand(sock, chatId);
                return;
            }
        }

        const msgContent = message.message?.messageContextInfo
            ? Object.values(message.message).find(v => v?.conversation || v?.text || v?.caption)
            : message.message;

        const rawText = (
            message.message?.conversation?.trim() ||
            message.message?.extendedTextMessage?.text?.trim() ||
            message.message?.imageMessage?.caption?.trim() ||
            message.message?.videoMessage?.caption?.trim() ||
            msgContent?.conversation?.trim() ||
            msgContent?.extendedTextMessage?.text?.trim() ||
            ''
        );

        // Détection du préfixe dynamique
        const allPrefixes = VALID_PREFIXES;
        const rawUserMessage = rawText.toLowerCase().replace(/\.\s+/g, '.').trim();
        
        let usedPrefix = null;
        for (const p of allPrefixes) {
            if (rawUserMessage.startsWith(p.toLowerCase())) {
                usedPrefix = p.toLowerCase();
                break;
            }
        }
        
        let userMessage;
        if (usedPrefix && usedPrefix !== '.') {
            userMessage = '.' + rawUserMessage.slice(usedPrefix.length);
        } else {
            userMessage = rawUserMessage;
        }
        
        const hasPrefix = usedPrefix !== null;

        if (hasPrefix) {
            console.log(`📝 Command used in ${isGroup ? 'group' : 'private'}: ${userMessage}`);
        }

        let isPublic = true;
        try {
            const data = JSON.parse(fs.readFileSync('./data/messageCount.json'));
            if (typeof data.isPublic === 'boolean') isPublic = data.isPublic;
        } catch (error) {
            console.error('Error checking access mode:', error);
        }
        const isOwnerOrSudoCheck = message.key.fromMe || senderIsOwnerOrSudo;

        if (isChannel) {
            if (!hasPrefix) return;
            isPublic = true;
        }

        // Self mode
        try {
            if (isSelfMode() && !isOwnerOrSudoCheck && hasPrefix) return;
        } catch (e) {}

        // Check if user is banned
        if (isBanned(senderId) && !userMessage.startsWith('.unban')) {
            if (Math.random() < 0.1) {
                await sock.sendMessage(chatId, {
                    text: '❌ You are banned from using the bot. Contact an admin to get unbanned.',
                });
            }
            return;
        }

        const cleanMessage = userMessage.trim();
        const isTttMove = /^[1-9]$/.test(cleanMessage) || /^(surrender|give up)$/i.test(cleanMessage);

        if (isTttMove) {
            await handleTicTacToeMove(sock, chatId, senderId, cleanMessage);
            return; 
        }

        const cleanTriviaAnswer = userMessage.trim().toUpperCase();
        if (['A', 'B', 'C', 'D'].includes(cleanTriviaAnswer)) {
            await answerTrivia(sock, chatId, cleanTriviaAnswer, senderId);
            return; 
        }

        // --- MONITORING ET SÉCURITÉ DU GROUPE ---
        let isSenderAdmin = false;
        let isBotAdmin = false;

        if (isGroup) {
            if (!message.key.fromMe) incrementMessageCount(chatId, senderId);

            // 1. PROTECTION ANTI-BOT
            const { isAntibotEnabled } = require('./commands/antibot'); 
            if (isAntibotEnabled(chatId) && !message.key.fromMe) {
                const isBot = senderId.includes(':') && senderId.includes('@s.whatsapp.net') && !senderIsOwnerOrSudo;
                const isOtherBot = message.key.id.startsWith('BAE5') || message.key.id.length === 16;
                
                if (isBot || isOtherBot) {
                    const key = { remoteJid: chatId, fromMe: false, id: message.key.id, participant: senderId };
                    try { 
                        await sock.sendMessage(chatId, { delete: key });
                        return;
                    } catch (e) {}
                }
            }

            // 2. PROTECTION ANTI-MENTION STATUT
            const { handleAntimentionStatus, isAntiStatusMentionEnabled, isStatusMention } = require('./commands/antimentionstatus'); 
            if (isAntiStatusMentionEnabled?.() && isStatusMention?.(message) && !isOwnerOrSudoCheck) return;
            
            const wasStatusMention = await handleAntimentionStatus(sock, chatId, senderId, message);
            if (wasStatusMention) return;

            // 3. PROTECTION ANTI-BADWORD
            const { handleBadwordDetection } = require('./lib/antibadword');
            if (userMessage) {
                await handleBadwordDetection(sock, chatId, message, userMessage, senderId);
            }

            // 4. PROTECTION ANTI-LIEN
            const { getAntilink } = require('./lib/index'); 
            const antilinkConfig = await getAntilink(chatId, 'on');
            let linkDetected = false;

            if (antilinkConfig?.enabled && !isSenderAdmin) {
                const containsLink = /(https?:\/\/[^\s]+|www\.[^\s]+|wa\.me\/[^\s]+|chat\.whatsapp\.com\/[^\s]+)/gi.test(userMessage);

                if (containsLink) {
                    linkDetected = true;
                    const key = { remoteJid: chatId, fromMe: false, id: message.key.id, participant: senderId };
                    try { await sock.sendMessage(chatId, { delete: key }); } catch (e) {}

                    if (antilinkConfig.action === 'warn') {
                        await sock.sendMessage(chatId, { text: `⚠️ *@${senderId.split('@')[0]}*, les liens sont interdits ici !\n> BRINDI-XMD`, mentions: [senderId] });
                    } else if (antilinkConfig.action === 'kick') {
                        await sock.sendMessage(chatId, { text: `🚫 *@${senderId.split('@')[0]}* a été exclu pour envoi de lien.\n> BRINDI-XMD`, mentions: [senderId] });
                        try { await sock.groupParticipantsUpdate(chatId, [senderId], "remove"); } catch (e) {}
                    }
                }
            }
            if (linkDetected) return;

            // 5. AUTRES MODÉRATIONS (Stickers, Mentions)
            try {
                if (message.message?.stickerMessage) {
                    const blocked = await handleAntisticker(sock, chatId, senderId, message);
                    if (blocked) return;
                }
            } catch (e) {}

            try {
                const mentionedJids = (message.message?.extendedTextMessage?.contextInfo?.mentionedJid) || [];
                if (Array.isArray(mentionedJids) && mentionedJids.length > 0) {
                    const blocked = await handleAntimention(sock, chatId, senderId, mentionedJids, message);
                    if (blocked) return;
                }
            } catch (e) {}
        }

        // PM blocker (Hors Groupes)
        if (!isGroup && !isChannel && !message.key.fromMe && !senderIsSudo) {
            try {
                const pmState = readPmBlockerState();
                if (pmState.activé) {
                    await sock.sendMessage(chatId, { text: pmState.message || 'Private messages are blocked. Please contact the owner in groups only.' });
                    await new Promise(r => setTimeout(r, 1500));
                    try { await sock.updateBlockStatus(chatId, 'block'); } catch (e) { }
                    return;
                }
            } catch (e) {}
        }

        // Si aucun préfixe n'est détecté
        if (!hasPrefix) {
            await handleAutotypingForMessage(sock, chatId, userMessage);

            if (isGroup) {
                await handleTagDetection(sock, chatId, message, senderId);
                await handleMentionDetection(sock, chatId, message);

                if (isPublic || isOwnerOrSudoCheck) {
                    try {
                        const ugd = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/userGroupData.json')));
                        if (ugd.chatbot && ugd.chatbot[chatId]) {
                            await handleChatbotResponse(sock, chatId, message, userMessage, senderId);
                        }
                    } catch (e) {}
                }
            }
            return;
        }

        if (!isPublic && !isOwnerOrSudoCheck && !isChannel) {
            return;
        }

        // --- GESTION DES COMMANDES (Avec préfixe) ---
        const adminCommands = ['.mute', '.unmute', '.ban', '.unban', '.promote', '.demote']; 
        const isAdminCommand = adminCommands.some(cmd => userMessage.startsWith(cmd));
        const ownerCommands = []; 
        const isOwnerCommand = ownerCommands.some(cmd => userMessage.startsWith(cmd));

        if (isGroup && isAdminCommand) {
            if (message.key.fromMe || senderIsOwnerOrSudo) {
                isSenderAdmin = true;
                isBotAdmin = true;
            } else {
                const adminStatus = await isAdmin(sock, chatId, senderId);
                isSenderAdmin = adminStatus.isSenderAdmin;
                isBotAdmin = adminStatus.isBotAdmin;

                if (!isBotAdmin) {
                    await sock.sendMessage(chatId, { text: `Le bot doit être admin pour cette commande.`, }, { quoted: message });
                    return;
                }

                if (!isSenderAdmin) {
                    await sock.sendMessage(chatId, { text: 'Seuls les admins peuvent utiliser cette commande.', }, { quoted: message });
                    return;
                }
            }
        }

        if (isOwnerCommand) {
            if (!message.key.fromMe && !senderIsOwnerOrSudo) {
                await sock.sendMessage(chatId, { text: '❌ Cette commande est réservée au propriétaire !' }, { quoted: message });
                return;
            }
        }

        let commandExecuted = false;
        const args = userMessage.split(' ').slice(1);

        switch (true) {
            case userMessage === '.simage': {
                const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                if (quotedMessage?.stickerMessage) {
                    await simageCommand(sock, quotedMessage, chatId);
                } else {
                    await sock.sendMessage(chatId, { text: 'Please reply to a sticker with the .simage command to convert it.', }, { quoted: message });
                }
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.kick') && !userMessage.startsWith('.kickall'): {
                const mentionedJidListKick = message.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
                await kickCommand(sock, chatId, senderId, mentionedJidListKick, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.signal'): {
                const signalArgs = userMessage.split(' ').slice(1);
                const mentionedJidsSignal = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
                await signalCommand(sock, chatId, senderId, mentionedJidsSignal, message, signalArgs);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.approve'): {
                const mentionedApprove = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
                await approveCommand(sock, chatId, senderId, mentionedApprove, message, isOwnerOrSudoCheck, isSenderAdmin);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.autobio'): {
                const autoArgs = userMessage.split(' ').slice(1);
                await autobioCommand(sock, chatId, message, autoArgs);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.footballnews'): {
                await footballnewsCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.maintenance'): {
                const mainArgs = userMessage.split(' ').slice(1);
                await maintenanceCommand(sock, chatId, message, mainArgs, isOwnerOrSudoCheck);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.claude'): {
                const claudeArgs = userMessage.split(' ').slice(1);
                await claudeCommand(sock, chatId, message, claudeArgs);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.lovable'): {
                const lovableArgs = userMessage.split(' ').slice(1);
                await lovableCommand(sock, chatId, message, lovableArgs);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.copilot'): {
                const copilotArgs = userMessage.split(' ').slice(1);
                await copilotCommand(sock, chatId, message, copilotArgs);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.deepseek'): {
                const deepArgs = userMessage.split(' ').slice(1);
                await deepseekCommand(sock, chatId, message, deepArgs);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.whois'): {
    const args = userMessage.trim().split(/ +/).slice(1);
    const mentionedJids = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    
    await whoisCommand(sock, chatId, senderId, mentionedJids, message, args);
    commandExecuted = true;
    break;
}

            case userMessage.startsWith('.totalmembers'): {
                await totalmembersCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            }
case userMessage.startsWith('.brindi-kill'): {
    // Sépare le message par les espaces et ignore le premier élément (.brindi-kill) pour extraire le numéro
    const args = userMessage.trim().split(/ +/).slice(1);
    const mentionedJids = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    
    await brindiKillCommand(sock, chatId, senderId, mentionedJids, message, args);
    commandExecuted = true;
    break;
}

            case userMessage.startsWith('.meta'): {
                await metaCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.drague'): {
                const mentionedDrague = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
                await dragueCommand(sock, chatId, senderId, mentionedDrague, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.add'): {
                await addCommand(sock, chatId, senderId, args, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.itachi-info'): {
                await itachiinfoCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.mute'): {
                const parts = userMessage.trim().split(/\s+/);
                const muteArg = parts[1];
                const muteDuration = muteArg !== undefined ? parseInt(muteArg, 10) : undefined;
                if (muteArg !== undefined && (isNaN(muteDuration) || muteDuration <= 0)) {
                    await sock.sendMessage(chatId, { text: 'Please provide a valid number of minutes or use .mute with no number to mute immediately.', }, { quoted: message });
                } else {
                    await muteCommand(sock, chatId, senderId, message, muteDuration);
                }
                commandExecuted = true;
                break;
            }
            case userMessage === '.unmute': {
                await unmuteCommand(sock, chatId, senderId, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.ban'): {
                if (!isGroup && !message.key.fromMe && !senderIsSudo) {
                    await sock.sendMessage(chatId, { text: 'Only owner/sudo can use .ban in private chat.' }, { quoted: message });
                    break;
                }
                await banCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.unban'): {
                if (!isGroup && !message.key.fromMe && !senderIsSudo) {
                    await sock.sendMessage(chatId, { text: 'Only owner/sudo can use .unban in private chat.' }, { quoted: message });
                    break;
                }
                await unbanCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            }
            case userMessage === '.help' || userMessage === '.menu' || userMessage === '.bot' || userMessage === '.list': {
                await helpCommand(sock, chatId, message, global.channelLink);
                commandExecuted = true;
                break;
            }
            case userMessage === '.sticker' || userMessage === '.s': {
                await stickerCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.stickersearch'): {
                const ssArgs = userMessage.split(' ').slice(1);
                await stickersearchCommand(sock, chatId, senderId, message, ssArgs);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.warnings'): {
                const mentionedJidListWarnings = message.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
                await warningsCommand(sock, chatId, mentionedJidListWarnings);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.warn'): {
                const mentionedJidListWarn = message.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
                await warnCommand(sock, chatId, senderId, mentionedJidListWarn, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.tts'): {
                const text = userMessage.slice(4).trim();
                await ttsCommand(sock, chatId, text, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.delete') || userMessage.startsWith('.del'): {
                await deleteCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.attp'): {
                await attpCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            }
            case userMessage === '.setprefix' || userMessage.startsWith('.setprefix ') || userMessage.includes('setprefix'): {
                const pfArgs = rawText.trim().split(' ').slice(1);
                await setprefixCommand(sock, chatId, pfArgs, message);
                commandExecuted = true;
                break;
            }
            case userMessage === '.settings': {
                await settingsCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.mode'): {
                if (!message.key.fromMe && !senderIsOwnerOrSudo) {
                    await sock.sendMessage(chatId, { text: 'Only bot owner can use this command!',}, { quoted: message });
                    break;
                }
                let data;
                try {
                    data = JSON.parse(fs.readFileSync('./data/messageCount.json'));
                } catch (error) {
                    console.error('Error reading access mode:', error);
                    await sock.sendMessage(chatId, { text: 'Failed to read bot mode status', });
                    break;
                }

                const action = userMessage.split(' ')[1]?.toLowerCase();
                if (!action) {
                    const currentMode = data.isPublic ? 'public' : 'private';
                    await sock.sendMessage(chatId, { text: `Current bot mode: *${currentMode}*\n\nUsage: .mode public/private` }, { quoted: message });
                    break;
                }

                if (action !== 'public' && action !== 'private') {
                    await sock.sendMessage(chatId, { text: 'Usage: .mode public/private' }, { quoted: message });
                    break;
                }

                try {
                    data.isPublic = action === 'public';
                    fs.writeFileSync('./data/messageCount.json', JSON.stringify(data, null, 2));
                    await sock.sendMessage(chatId, { text: `Bot is now in *${action}* mode`, });
                } catch (error) {
                    await sock.sendMessage(chatId, { text: 'Failed to update bot access mode',});
                }
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.anticall'): {
                if (!message.key.fromMe && !senderIsOwnerOrSudo) {
                    await sock.sendMessage(chatId, { text: 'Only owner/sudo can use anticall.' }, { quoted: message });
                    break;
                }
                const acArgs = userMessage.split(' ').slice(1).join(' ');
                await anticallCommand(sock, chatId, message, acArgs);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.pmblocker'): {
                const pmbArgs = userMessage.split(' ').slice(1).join(' ');
                await pmblockerCommand(sock, chatId, message, pmbArgs);
                commandExecuted = true;
                break;
            }
            case userMessage === '.owner': {
                await ownerCommand(sock, chatId);
                commandExecuted = true;
                break;
            }
            case userMessage === '.tagall': {
                await tagAllCommand(sock, chatId, senderId, message);
                commandExecuted = true;
                break;
            }
            case userMessage === '.tagnotadmin': {
                await tagNotAdminCommand(sock, chatId, senderId, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.hidetag'): {
                const messageText = rawText.slice(8).trim();
                const replyMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage || null;
                await hideTagCommand(sock, chatId, senderId, messageText, replyMessage, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.tag'): {
                const messageText = rawText.slice(4).trim();
                const replyMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage || null;
                await tagCommand(sock, chatId, senderId, messageText, replyMessage, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.antilink'): {
                if (!isGroup) {
                    await sock.sendMessage(chatId, { text: 'This command can only be used in groups.', }, { quoted: message });
                    break;
                }
                await handleAntilinkCommand(sock, chatId, userMessage, senderId, isSenderAdmin, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.antitag'): {
                if (!isGroup) {
                    await sock.sendMessage(chatId, { text: 'This command can only be used in groups.', }, { quoted: message });
                    break;
                }
                await handleAntitagCommand(sock, chatId, userMessage, senderId, isSenderAdmin, message);
                commandExecuted = true;
                break;
            }
            case userMessage === '.meme': {
                await memeCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            }
            case userMessage === '.joke': {
                await jokeCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            }
            case userMessage === '.quote': {
                await quoteCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            }
            case userMessage === '.fact': {
                await factCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.weather'): {
                const city = userMessage.slice(9).trim();
                if (city) {
                    await weatherCommand(sock, chatId, message, city);
                } else {
                    await sock.sendMessage(chatId, { text: 'Please specify a city, e.g., .weather London', }, { quoted: message });
                }
                commandExecuted = true;
                break;
            }
            case userMessage === '.news': {
                await newsCommand(sock, chatId);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.journal'): {
                const journalArgs = userMessage.split(' ').slice(1);
                await journalCommand(sock, chatId, message, journalArgs);
                commandExecuted = true;
                break;
            }
           // Remplace ton ancien case .ttt par ces deux cases bien distincts :

case userMessage.startsWith('.ttt') || userMessage.startsWith('.tictactoe'): {
    const tttText = userMessage.split(' ').slice(1).join(' ');
    await tictactoeCommand(sock, chatId, senderId, tttText);
    commandExecuted = true;
    break;
}

case /^[1-9]$/.test(userMessage.trim()) || /^(surrender|give up)$/i.test(userMessage.trim()): {
    await handleTicTacToeMove(sock, chatId, senderId, userMessage);
    // On ne met pas forcément commandExecuted = true ici pour éviter de trigger 
    // d'autres logs de commandes si l'utilisateur tapait juste un chiffre au hasard hors du jeu.
    break;
}

            case userMessage.startsWith('.move'): {
                const position = parseInt(userMessage.split(' ')[1]);
                if (isNaN(position)) {
                    await sock.sendMessage(chatId, { text: 'Please provide a valid position number.' }, { quoted: message });
                } else {
                    await handleTicTacToeMove(sock, chatId, senderId, userMessage.split(' ')[1]);
                }
                commandExecuted = true;
                break;
            }
            case userMessage === '.topmembers': {
                topMembers(sock, chatId, isGroup);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.hangman'): {
                startHangman(sock, chatId);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.guess'): {
                const guessedLetter = userMessage.split(' ')[1];
                if (guessedLetter) {
                    guessLetter(sock, chatId, guessedLetter);
                } else {
                    sock.sendMessage(chatId, { text: 'Please guess a letter using .guess <letter>'}, { quoted: message });
                }
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.trivia'): {
await startTrivia(
        sock,
        chatId
    );

    commandExecuted = true;

    break;
            }
       
            case userMessage.startsWith('.compliment'): {
                await complimentCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.insult'): {
                await insultCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.8ball'): {
                const question = userMessage.split(' ').slice(1).join(' ');
                await eightBallCommand(sock, chatId, question);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.lyrics'): {
                const songTitle = userMessage.split(' ').slice(1).join(' ');
                await lyricsCommand(sock, chatId, songTitle, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.simp') && !userMessage.startsWith('.simpcard'): {
                const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                const mentionedJid = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
                await simpCommand(sock, chatId, quotedMsg, mentionedJid, senderId);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.stupid') || userMessage.startsWith('.itssostupid') || userMessage.startsWith('.iss'): {
                const stupidQuotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                const stupidMentionedJid = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
                const stupidArgs = userMessage.split(' ').slice(1);
                await stupidCommand(sock, chatId, stupidQuotedMsg, stupidMentionedJid, senderId, stupidArgs);
                commandExecuted = true;
                break;
            }
            case userMessage === '.dare': {
                await dareCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            }
            case userMessage === '.truth': {
                await truthCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            }
            case userMessage === '.clear': {

                if (isGroup) {

                await clearCommand(
                sock,
                chatId,
                message
            );
            }

    commandExecuted = true;

    break;
}
            case userMessage.startsWith('.promote'): {
                const mentionedJidListPromote = message.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
                await promoteCommand(sock, chatId, mentionedJidListPromote, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.demote'): {

    const mentionedJidListDemote =
        message.message?.extendedTextMessage
            ?.contextInfo
            ?.mentionedJid || [];

    await demoteCommand(
        sock,
        chatId,
        senderId,
        mentionedJidListDemote,
        message
    );

    commandExecuted = true;

    break;
}

            case userMessage === '.ping': {
                await pingCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            }
            case userMessage === '.alive': {
                await aliveCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.mention '): {
                const mArgs = userMessage.split(' ').slice(1).join(' ');
                await mentionToggleCommand(sock, chatId, message, mArgs, isOwnerOrSudoCheck);
                commandExecuted = true;
                break;
            }
            case userMessage === '.setmention': {
                await setMentionCommand(sock, chatId, message, isOwnerOrSudoCheck);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.blur'): {
                const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                await blurCommand(sock, chatId, message, quotedMessage);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.welcome'): {
                if (isGroup) {
                    if (isSenderAdmin || message.key.fromMe || senderIsOwnerOrSudo) {
                        await welcomeCommand(sock, chatId, message);
                    } else {
                        await sock.sendMessage(chatId, { text: 'Seuls les admins peuvent utiliser cette commande.' });
                    }
                }
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.goodbye'): {
                if (isGroup) {
                    if (isSenderAdmin || message.key.fromMe || senderIsOwnerOrSudo) {
                        await goodbyeCommand(sock, chatId, message);
                    } else {
                        await sock.sendMessage(chatId, { text: 'Seuls les admins peuvent utiliser cette commande.' });
                    }
                }
                commandExecuted = true;
                break;
            }
            case userMessage === '.git' || userMessage === '.github' || userMessage === '.sc' || userMessage === '.script' || userMessage === '.repo': {
                await githubCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.antibot'): {
                const antibotArgs = userMessage.split(' ').slice(1);
                await antibotCommand(sock, chatId, message, antibotArgs, isSenderAdmin || message.key.fromMe || senderIsOwnerOrSudo);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.antibadword'): {
                if (!isGroup) return;
                await antibadwordCommand(sock, chatId, message, senderId, true);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.chatbot'): {
                if (!isGroup) return;
                const match = userMessage.slice(8).trim();
                await handleChatbotCommand(sock, chatId, message, match);
                commandExecuted = true;
                break;
            }
           case userMessage.startsWith('.take') || userMessage.startsWith('.steal'): {
    // 1. On extrait les arguments proprement
    const textArgs = userMessage.trim().split(/\s+/);
    textArgs.shift(); // Supprime le '.take' ou '.steal' pour garder uniquement le nom/pack

    // 2. On passe les 5 arguments EXACTEMENT dans l'ordre attendu par ta fonction
    await takeCommand(sock, chatId, senderId, textArgs, message);
    
    commandExecuted = true;
    break;
}

            case userMessage === '.flirt': {
                await flirtCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.character'): {
                await characterCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.waste'): {
                await wastedCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            }
            case userMessage === '.ship': {
                if (!isGroup) return;
                await shipCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            }
            case userMessage === '.groupinfo' || userMessage === '.infogp' || userMessage === '.infogrupo': {
                if (!isGroup) return;
                await groupInfoCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            }
            case userMessage === '.resetlink' || userMessage === '.revoke' || userMessage === '.anularlink': {
                if (!isGroup) return;
                await resetlinkCommand(sock, chatId, senderId);
                commandExecuted = true;
                break;
            }
            case userMessage === '.staff' || userMessage === '.admins' || userMessage === '.listadmin': {
                if (!isGroup) return;
                await staffCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.tourl') || userMessage.startsWith('.url'): {
                await urlCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.emojimix') || userMessage.startsWith('.emix'): {
                await emojimixCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.tg') || userMessage.startsWith('.stickertelegram') || userMessage.startsWith('.tgsticker') || userMessage.startsWith('.telesticker'): {
                await stickerTelegramCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            }
            case userMessage === '.🥷' || userMessage === '.humm': {
                const replyMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                await hummCommand(sock, chatId, senderId, replyMsg, message);
                commandExecuted = true;
                break;
            }
            case userMessage === '.viewonce': {
                await viewOnceCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            }
            case userMessage === '.clearsession' || userMessage === '.clearsesi': {
                await clearSessionCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.autostatus'): {
                const autoStatusArgs = userMessage.split(' ').slice(1);
                await autoStatusCommand(sock, chatId, message, autoStatusArgs);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.metallic'):
            case userMessage.startsWith('.ice'):
            case userMessage.startsWith('.snow'):
            case userMessage.startsWith('.impressive'):
            case userMessage.startsWith('.matrix'):
            case userMessage.startsWith('.light'):
            case userMessage.startsWith('.neon'):
            case userMessage.startsWith('.devil'):
            case userMessage.startsWith('.purple'):
            case userMessage.startsWith('.thunder'):
            case userMessage.startsWith('.leaves'):
            case userMessage.startsWith('.1917'):
            case userMessage.startsWith('.arena'):
            case userMessage.startsWith('.hacker'):
            case userMessage.startsWith('.sand'):
            case userMessage.startsWith('.blackpink'):
            case userMessage.startsWith('.glitch'):
            case userMessage.startsWith('.fire'): {
                const themeName = userMessage.slice(1).split(' ')[0];
                await textmakerCommand(sock, chatId, message, userMessage, themeName);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.antidelete'): {
                const antideleteMatch = userMessage.slice(11).trim();
                await handleAntideleteCommand(sock, chatId, message, antideleteMatch);
                commandExecuted = true;
                break;
            }
            case userMessage === '.surrender': {
                await handleTicTacToeMove(sock, chatId, senderId, 'surrender');
                commandExecuted = true;
                break;
            }
            case userMessage === '.cleartmp': {
                await clearTmpCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            }
            // Cas pour la commande .block
case userMessage.startsWith('.block'): {
    const args = userMessage.trim().split(/ +/).slice(1);
    const mentionedJids = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    
    await blockCommand(sock, chatId, senderId, mentionedJids, message, args);
    commandExecuted = true;
    break;
}

// Cas pour la commande .unblock
case userMessage.startsWith('.unblock'): {
    const args = userMessage.trim().split(/ +/).slice(1);
    const mentionedJids = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    
    await unblockCommand(sock, chatId, senderId, mentionedJids, message, args);
    commandExecuted = true;
    break;
}

            case userMessage === '.setpp': {
                await setProfilePicture(sock, chatId, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.setgdesc'): {
                const text = rawText.slice(9).trim();
                await setGroupDescription(sock, chatId, senderId, text, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.setgname'): {
                const text = rawText.slice(9).trim();
                await setGroupName(sock, chatId, senderId, text, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.setgpp'): {
                await setGroupPhoto(sock, chatId, senderId, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.instagram') || userMessage.startsWith('.insta') || userMessage.startsWith('.ig'): {
                await instagramCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.igsc'): {
                await igsCommand(sock, chatId, message, true);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.brindi-ios'): {
    // Sépare le message par les espaces et ignore le premier élément (.brindi-ios) pour extraire le numéro
    const args = userMessage.trim().split(/ +/).slice(1);
    const mentionedJids = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    
    await brindiIosCommand(sock, chatId, senderId, mentionedJids, message, args);
    commandExecuted = true;
    break;
}

            case userMessage.startsWith('.igs'): {
                await igsCommand(sock, chatId, message, false);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.fb') || userMessage.startsWith('.facebook'): {
                await facebookCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.music'): {
                await playCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.spotify'): {
                await spotifyCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.play') || userMessage.startsWith('.mp3') || userMessage.startsWith('.ytmp3') || userMessage.startsWith('.song'): {
                await songCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.video') || userMessage.startsWith('.ytmp4'): {
                await videoCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.tiktok') || userMessage.startsWith('.tt'): {
                await tiktokCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.gpt') || userMessage.startsWith('.gemini'): {
                await aiCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.translate') || userMessage.startsWith('.trt'): {
                const commandLength = userMessage.startsWith('.translate') ? 10 : 4;
                await handleTranslateCommand(sock, chatId, message, userMessage.slice(commandLength));
                return;
            }
            case userMessage.startsWith('.ss') || userMessage.startsWith('.ssweb') || userMessage.startsWith('.screenshot'): {
                const ssCommandLength = userMessage.startsWith('.screenshot') ? 11 : (userMessage.startsWith('.ssweb') ? 6 : 3);
                await handleSsCommand(sock, chatId, message, userMessage.slice(ssCommandLength).trim());
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.areact') || userMessage.startsWith('.autoreact') || userMessage.startsWith('.autoreaction'): {
                await handleAreactCommand(sock, chatId, message, isOwnerOrSudoCheck);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.sudo'): {
                await sudoCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            }
            case userMessage === '.goodnight' || userMessage === '.lovenight' || userMessage === '.gn': {
                await goodnightCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            }
            case userMessage === '.shayari' || userMessage === '.shayri': {
                await shayariCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            }
            case userMessage === '.roseday': {
                await rosedayCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.imagine') || userMessage.startsWith('.flux') || userMessage.startsWith('.dalle'): {
                await imagineCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            }
            case userMessage === '.jid': {
                await groupJidCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.autotyping'): {
                await autotypingCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.autoread'): {
                await autoreadCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.heart'): {
                await handleHeart(sock, chatId, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.horny'):
            case userMessage.startsWith('.circle'):
            case userMessage.startsWith('.lgbt'):
            case userMessage.startsWith('.lolice'):
            case userMessage.startsWith('.simpcard'):
            case userMessage.startsWith('.tonikawa'):
            case userMessage.startsWith('.its-so-stupid'):
            case userMessage.startsWith('.namecard'): {
                const sub = userMessage.slice(1).split(' ')[0];
                const parts = userMessage.trim().split(/\s+/);
                await miscCommand(sock, chatId, message, [sub, ...parts.slice(1)]);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.oogway2'):
            case userMessage.startsWith('.oogway'): {
                const parts = userMessage.trim().split(/\s+/);
                const sub = userMessage.startsWith('.oogway2') ? 'oogway2' : 'oogway';
                await miscCommand(sock, chatId, message, [sub, ...parts.slice(1)]);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.tweet'): {
                const parts = userMessage.trim().split(/\s+/);
                await miscCommand(sock, chatId, message, ['tweet', ...parts.slice(1)]);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.ytcomment'): {
                const parts = userMessage.trim().split(/\s+/);
                await miscCommand(sock, chatId, message, ['youtube-comment', ...parts.slice(1)]);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.comrade'):
            case userMessage.startsWith('.gay'):
            case userMessage.startsWith('.glass'):
            case userMessage.startsWith('.jail'):
            case userMessage.startsWith('.passed'):
            case userMessage.startsWith('.triggered'): {
                const parts = userMessage.trim().split(/\s+/);
                const sub = userMessage.slice(1).split(/\s+/)[0];
                await miscCommand(sock, chatId, message, [sub, ...parts.slice(1)]);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.animu'): {
                const parts = userMessage.trim().split(/\s+/);
                await animeCommand(sock, chatId, message, parts.slice(1));
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.nom'):
            case userMessage.startsWith('.poke'):
            case userMessage.startsWith('.cry'):
            case userMessage.startsWith('.kiss'):
            case userMessage.startsWith('.pat'):
            case userMessage.startsWith('.hug'):
            case userMessage.startsWith('.wink'):
            case userMessage.startsWith('.facepalm'):
            case userMessage.startsWith('.face-palm'):
            case userMessage.startsWith('.animuquote'):
            case userMessage.startsWith('.loli'): {
                const parts = userMessage.trim().split(/\s+/);
                let sub = parts[0].slice(1);
                if (sub === 'facepalm') sub = 'face-palm';
                if (sub === 'animuquote') sub = 'quote';
                await animeCommand(sock, chatId, message, [sub]);
                commandExecuted = true;
                break;
            }
            case userMessage === '.crop': {
                await stickercropCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.pies'): {
                const parts = rawText.trim().split(/\s+/);
                await piesCommand(sock, chatId, message, parts.slice(1));
                commandExecuted = true;
                break;
            }
            case userMessage === '.china':
            case userMessage === '.indonesia':
            case userMessage === '.japan':
            case userMessage === '.korea':
            case userMessage === '.india':
            case userMessage === '.malaysia':
            case userMessage === '.thailand': {
                const country = userMessage.slice(1);
                await piesAlias(sock, chatId, message, country);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.update'): {
                const parts = rawText.trim().split(/\s+/);
                const zipArg = parts[1] && parts[1].startsWith('http') ? parts[1] : '';
                await updateCommand(sock, chatId, message, zipArg);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.removebg') || userMessage.startsWith('.rmbg') || userMessage.startsWith('.nobg'): {
                await removebgCommand.exec(sock, message, userMessage.split(' ').slice(1));
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.remini') || userMessage.startsWith('.enhance') || userMessage.startsWith('.upscale'): {
                await reminiCommand(sock, chatId, message, userMessage.split(' ').slice(1));
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.sora'): {
                await soraCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            }
            case userMessage === '.close': {
                await closeCommand(sock, chatId, senderId, message);
                commandExecuted = true;
                break;
            }
            case userMessage === '.open': {
                await openCommand(sock, chatId, senderId, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.autoviewstatus'): {
                const avsArgs = userMessage.split(' ').slice(1);
                await autoviewstatusCommand(sock, chatId, senderId, avsArgs, message);
                commandExecuted = true;
                break;
            }
            case userMessage === '.allmenu':
            case userMessage === '.allcmd': {
                await allmenuCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.image'): {
                const imgArgs = rawText.split(' ').slice(1);
                await imageCommand(sock, chatId, message, imgArgs);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.antileave'): {
                const alArgs = userMessage.split(' ').slice(1);
                await antileaveCommand(sock, chatId, senderId, alArgs, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.antimentionstatus'):
            case userMessage.startsWith('.antistatusmention'): {
                const asmArgs = userMessage.split(' ').slice(1);
                await antimentionstatusCmd(sock, chatId, senderId, asmArgs, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.antimention'): {
                const amArgs = userMessage.split(' ').slice(1);
                await antimentionCommand(sock, chatId, senderId, amArgs, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.link'): {
    await linkCommand(sock, chatId, senderId, message);
    commandExecuted = true;
    break;
}

            case userMessage.startsWith('.menustyle'): {
                const msArgs = userMessage.split(' ').slice(1);
                await menustyleCommand(sock, chatId, senderId, msArgs, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.theme'): {
                const thArgs = userMessage.split(' ').slice(1);
                await themeCommand(sock, chatId, thArgs, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.setmenuimage'): {
                const smiArgs = userMessage.split(' ').slice(1);
                const smiReply = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                await setmenuimageCommand(sock, chatId, senderId, smiArgs, smiReply, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.pair'): {
                const pairArgs = userMessage.split(' ').slice(1);
                await pairCommand(sock, chatId, message, pairArgs);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.prompt'): {
                const prArgs = rawText.split(' ').slice(1);
                await promptCommand(sock, chatId, senderId, prArgs, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.autoreactstatus'): {
                const arsArgs = userMessage.split(' ').slice(1);
                await autoreactstatusCommand(sock, chatId, senderId, arsArgs, message);
                commandExecuted = true;
                break;
            }
            case userMessage === '.uptime': {
                await uptimeCmdNew(sock, chatId, message);
                commandExecuted = true;
                break;
            }
            case userMessage === '.waouh': {
                await waouhCommand(sock, chatId, senderId, null, message);
                commandExecuted = true;
                break;
            }
            case userMessage === '.toimage': {
                const toImgReply = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                await toimageCommand(sock, chatId, toImgReply, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.antisticker'): {
                const asArgs = userMessage.split(' ').slice(1);
                await antistickerCommand(sock, chatId, senderId, asArgs, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.setsudo'): {
                const ssReply = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                const ssArgs = userMessage.split(' ').slice(1);
                await setsudoCommand(sock, chatId, senderId, ssArgs, ssReply, message);
                commandExecuted = true;
                break;
            }
            case userMessage === '.listsudo': {
                await listsudoCommand(sock, chatId, senderId, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.delsudo'): {
                const dsReply = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                const dsArgs = userMessage.split(' ').slice(1);
                await delsudoCommand(sock, chatId, senderId, dsArgs, dsReply, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.codeai'): {
                const caiArgs = rawText.split(' ').slice(1);
                await codeaiCommand(sock, chatId, senderId, caiArgs, message);
                commandExecuted = true;
                break;
            }
            case userMessage === '.gjid': {
                await gjidCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.gstatus'): {
                const gsArgs = rawText.split(' ').slice(1);
                await gstatusCommand(sock, chatId, senderId, gsArgs, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.self'): {
                const selfArgs = userMessage.split(' ').slice(1);
                await selfCommand(sock, chatId, senderId, selfArgs, message);
                commandExecuted = true;
                break;
            }
            case userMessage === '.kickall': {
                await kickallCommand(sock, chatId, senderId, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.purge'): {
                const purgeArgs = userMessage.split(' ').slice(1);
                await purgeCommand(sock, chatId, senderId, purgeArgs, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.antipurge'): {
                const apArgs2 = userMessage.split(' ').slice(1);
                await antipurgeCommand(sock, chatId, senderId, apArgs2, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.sanction'): {
                const sanctArgs = rawText.split(' ').slice(1);
                await sanctionCommand(sock, chatId, senderId, sanctArgs, message);
                commandExecuted = true;
                break;
            }
            case userMessage === '.test': {
                await testCmdNew(sock, chatId, message);
                commandExecuted = true;
                break;
            }
            case userMessage === '.info': {
                await infoCmdNew(sock, chatId, message);
                commandExecuted = true;
                break;
            }
            case userMessage === '.contact': {
                await contactCmdNew(sock, chatId, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.autorecording'): {
                const arArgs = userMessage.split(' ').slice(1);
                await autorecordingCommand(sock, chatId, senderId, arArgs, message);
                commandExecuted = true;
                break;
            }
            case userMessage === '.restore': {
                await restoreCommand(sock, chatId, senderId, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.clan'): {
                const clanArgs = rawText.split(' ').slice(1);
                await clanCommand(sock, chatId, senderId, clanArgs, message);
                commandExecuted = true;
                break;
            }
            case userMessage === '.loi': {
                await loiCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.antimarabout'): {
                const amArgs = userMessage.split(' ').slice(1);
                await antimaraboutCommand(sock, chatId, senderId, amArgs, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.dl_status') || userMessage.startsWith('.dlstatus'): {
                const dlReply = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                await dlStatusCommand(sock, chatId, senderId, dlReply, message);
                commandExecuted = true;
                break;
            }
            case userMessage === '.lecture_status' || userMessage === '.lecturestatus': {
                await lectureStatusCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.likestatus'): {
                const lsArgs = rawText.split(' ').slice(1);
                const lsReply = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                await likeStatusCommand(sock, chatId, senderId, lsArgs, lsReply, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.sendme'): {
                const smArgs = rawText.split(' ').slice(1);
                const smReply = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                await sendMeCommand(sock, chatId, senderId, smArgs, smReply, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.poll'): {
                const pArgs = rawText.split(' ').slice(1);
                await pollCommand(sock, chatId, pArgs, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.gcreate'): {
                const gcArgs = rawText.split(' ').slice(1);
                await gcreateCommand(sock, chatId, senderId, gcArgs, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.join'): {
                const jArgs = userMessage.split(' ').slice(1);
                await joinCommand(sock, chatId, jArgs, message);
                commandExecuted = true;
                break;
            }
            case userMessage === '.leave': {
                await leaveCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            }
            case userMessage === '.lock': {
                await lockCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            }
            case userMessage === '.unlock': {
                await unlockCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            }
            case userMessage === '.vcf': {
                const vcfReply = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                await vcfCommand(sock, chatId, senderId, vcfReply, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.tagadmin'): {
                const taArgs = rawText.split(' ').slice(1);
                await tagadminCommand(sock, chatId, taArgs, message);
                commandExecuted = true;
                break;
            }
            case userMessage === '.acceptall': {
                await acceptallCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.save'): {

    const replyMessage =
        message.message?.extendedTextMessage
            ?.contextInfo
            ?.quotedMessage;

    await saveCommand(
        sock,
        chatId,
        senderId,
        replyMessage,
        message
    );

    commandExecuted = true;

    break;
}
            case userMessage === '.rejectall': {
                await rejectallCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            }
            case userMessage === '.getprivacy': {
                await getprivacyCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.lastseen'): {
                const lsvArgs = userMessage.split(' ').slice(1);
                await lastseenCommand(sock, chatId, lsvArgs, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.online'): {
                const olArgs = userMessage.split(' ').slice(1);
                await onlineCommand(sock, chatId, olArgs, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.presence'): {
                const prArgs = userMessage.split(' ').slice(1);
                await presenceCommand(sock, chatId, prArgs, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.setbio'): {
                const sbArgs = rawText.split(' ').slice(1);
                await setbioCommand(sock, chatId, sbArgs, message);
                commandExecuted = true;
                break;
            }
            case userMessage === '.mypp': {
                await myppCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            }
            case userMessage === '.mystatus': {
                await mystatusCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            }
            case userMessage.startsWith('.groupadd'): {
                const gaArgs = userMessage.split(' ').slice(1);
                await groupaddCommand(sock, chatId, gaArgs, message);
                commandExecuted = true;
                break;
            }
            case userMessage === '.read': {
                await readCommand(sock, chatId, message);
                commandExecuted = true;
                break;
            }
            default: {
                if (isGroup) {
                    if (userMessage) {
                        try {
                            const ugd = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/userGroupData.json')));
                            if (ugd.chatbot && ugd.chatbot[chatId]) {
                                await handleChatbotResponse(sock, chatId, message, userMessage, senderId);
                            }
                        } catch (e) {}
                    }
                    await handleTagDetection(sock, chatId, message, senderId);
                    await handleMentionDetection(sock, chatId, message);
                }
                commandExecuted = false;
                break;
            }
        }

        if (commandExecuted) {
            await showTypingAfterCommand(sock, chatId);
        }

        if (userMessage.startsWith('.')) {
            await addCommandReaction(sock, message);
        }
        if (
    userMessage &&
    ['A', 'B', 'C', 'D']
        .includes(userMessage.trim().toUpperCase())
) {

    await answerTrivia(
        sock,
        chatId,
        userMessage.trim(),
        senderId
    );

    commandExecuted = true;
}

    } catch (error) {
        console.error('❌ Error in message handler:', error.message);
        if (chatId) {
            await sock.sendMessage(chatId, { text: '❌ Failed to process command!' });
        }
    }
}

async function groupJidCommand(sock, chatId, message) {
    const groupJid = message.key.remoteJid;
    if (!groupJid.endsWith('@g.us')) {
        return await sock.sendMessage(chatId, { text: "❌ This command can only be used in a group." });
    }
    await sock.sendMessage(chatId, { text: `✅ Group JID: ${groupJid}` }, { quoted: message });
}

async function handleGroupParticipantUpdate(sock, update) {
    try {
        const { id, participants, action, author } = update;
        if (!id.endsWith('@g.us')) return;

        let isPublic = true;
        try {
            const modeData = JSON.parse(fs.readFileSync('./data/messageCount.json'));
            if (typeof modeData.isPublic === 'boolean') isPublic = modeData.isPublic;
        } catch (e) {}

        if (action === 'promote') {
            if (!isPublic) return;
            await handlePromotionEvent(sock, id, participants, author);
            return;
        }

        if (action === 'demote') {
            if (!isPublic) return;
            await handleDemotionEvent(sock, id, participants, author);
            return;
        }

        if (action === 'add') {
            await handleJoinEvent(sock, id, participants);
        }

        if (action === 'remove') {
            await handleLeaveEvent(sock, id, participants);
            for (const participant of participants) {
                await handleAntileave(sock, id, participant);
            }
        }
    } catch (error) {
        console.error('Error in handleGroupParticipantUpdate:', error);
    }
}

module.exports = {
    handleMessages,
    handleGroupParticipantUpdate,
    handleStatus: async (sock, status) => {
        await handleStatusUpdate(sock, status);
        await handleAutoReact(sock, status);
    }
};
