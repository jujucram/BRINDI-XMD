const settings = require('../settings');
const fs = require('fs');
const path = require('path');
const os = require('os');

const MENU_IMAGE = './assets/IMG-20240812-WA0097.jpg';

function getMenuImage() {
    try {
        const p = path.join(__dirname, '../data/menuimage.json');
        const url = JSON.parse(fs.readFileSync(p)).url;
        return url && url.startsWith('http') ? url : MENU_IMAGE;
    } catch { return MENU_IMAGE; }
}

function getRamBar() {
    const used = process.memoryUsage().rss;
    const total = os.totalmem();
    const pct = Math.round((used / total) * 100);
    const totalBars = 10;
    const filledBars = Math.round((pct / 100) * totalBars);
    const emptyBars = totalBars - filledBars;
    return '█'.repeat(filledBars) + '░'.repeat(emptyBars) + ' ' + pct + '%';
}

function getUptime() {
    const s = Math.floor(process.uptime());
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return h + 'h ' + m + 'm';
}

async function helpCommand(sock, chatId, message) {
    const p = settings.prefix || '.';
    const imageUrl = getMenuImage();

    const helpMessage =
`┌──────────────────────────────┐
  ─── 🥷🏾 𝗕𝗥𝗜𝗡𝗗𝗜-𝗫𝗠𝗗-𝗩𝟭 🥷🏾 ───
└──────────────────────────────┘

┌─── ❖ 𝖲𝖳𝖠𝖳𝖴𝖲 𝖡𝖮𝖳 ❖ ─────────┐
│ ✦ 𝖯𝗋𝖾𝖿𝗂𝗑 : [ ${p} ]
│ ✦ 𝖮𝗐𝗇𝖾𝗋 : ${settings.botOwner || 'Brandon'}
│ ✦ 𝖬𝗈𝖽𝖾 : ${settings.commandMode || 'private'}
│ ✦ 𝖲𝗉𝖾𝖾𝖽 : 𝖱𝖺𝗉𝗂𝖽𝖾 ⚡
│ ✦ 𝖴𝗉𝗍𝗂𝗆𝖾 : ${getUptime()}
│ ✦ 𝖱𝖺𝗆 : ${getRamBar()}
│ ✦ 𝖵𝖾𝗋𝗌𝗂𝗈𝗇 : 𝗏${settings.version || '1.0.0'}
└──────────────────────────────┘

 🥷🏾 𝗟𝗜𝗦𝗧𝗘 𝗗𝗘𝗦 𝗠𝗘𝗡𝗨𝗦 🥷🏾

┌── ❍ 𝖦𝖤𝖭𝖤𝖱𝖠𝖫 ❍ ───────────┐
│ ⚝ ${p}help ➪ Aide du bot
│ ⚝ ${p}ping ➪ Vitesse du bot
│ ⚝ ${p}alive ➪ État du bot
│ ⚝ ${p}uptime ➪ Temps en ligne
│ ⚝ ${p}tts ➪ Texte en audio
│ ⚝ ${p}owner ➪ Propriétaire
│ ⚝ ${p}joke ➪ Blague
│ ⚝ ${p}quote ➪ Citation
│ ⚝ ${p}fact ➪ Fait intéressant
│ ⚝ ${p}weather ➪ Météo
│ ⚝ ${p}news ➪ Actualités
│ ⚝ ${p}journal ➪ Journal
│ ⚝ ${p}attp ➪ Texte en sticker
│ ⚝ ${p}8ball ➪ Boule magique
│ ⚝ ${p}groupinfo ➪ Infos groupe
│ ⚝ ${p}staff ➪ Staff du groupe
│ ⚝ ${p}humm ➪ Coup d'oeil
│ ⚝ ${p}trt ➪ Traduction
│ ⚝ ${p}ss ➪ Capture ecran
│ ⚝ ${p}gjid ➪ Identifiant groupe
│ ⚝ ${p}url ➪ Lien image
│ ⚝ ${p}theme ➪ Changer theme
│ ⚝ ${p}test ➪ Vérifier bot actif
│ ⚝ ${p}info ➪ Infos du bot
│ ⚝ ${p}contact ➪ Contact proprio
│ ⚝ ${p}dlstatus ➪ Sauvegarde status
│ ⚝ ${p}loi ➪ Règles du groupe
│ ⚝ ${p}insult ➪ injures amicales
│ ⚝ ${p}restore ➪ Restaurer config
│ ⚝ ${p}clan ➪ Gérer un clan
│ ⚝ ${p}block ➪ bloquer user
│ ⚝ ${p}unblock ➪ débloquer user
└──────────────────────────────┘

── ❍ BUG❍ ──────────────┐
│ ⚝ ${p}brindi-kill ➪ Bug Android
│ ⚝ ${p}brindi-ios ➪ Bug iphone
└──────────────────────────────┘

┌── ❍ 𝖠𝖣𝖬𝖨𝖭 ❍ ──────────────┐
│ ⚝ ${p}open ➪ Ouvrir le groupe
│ ⚝ ${p}close ➪ Fermer le groupe
│ ⚝ ${p}ban ➪ Bannir membre
│ ⚝ ${p}kick ➪ Expulser membre
│ ⚝ ${p}add ➪ Ajouter membre
│ ⚝ ${p}warn ➪ Avertir membre
│ ⚝ ${p}signal ➪ Signaler un user
│ ⚝ ${p}promote ➪ Rendre admin
│ ⚝ ${p}demote ➪ Retirer admin
│ ⚝ ${p}delete ➪ Supprimer message
│ ⚝ ${p}tagall ➪ Mentionner tous
│ ⚝ ${p}tag ➪ Tag avec message
│ ⚝ ${p}hidetag ➪ Tag caché
│ ⚝ ${p}welcome ➪ Msg bienvenue
│ ⚝ ${p}goodbye ➪ Msg au revoir
│ ⚝ ${p}gstatus nom ➪ Changer nom
│ ⚝ ${p}gstatus desc ➪ Changer desc
│ ⚝ ${p}link ➪ Obtenir lien du groupe
│ ⚝ ${p}kickall ➪ Expulser tous
│ ⚝ ${p}acceptall ➪ Approuver membre
│ ⚝ ${p}rejectall ➪ Refuser membre
│ ⚝ ${p}totalmembers ➪ Total membres
│ ⚝ ${p}topmembers ➪ Total messages
│ ⚝ ${p}sanction ➪ Sanctionner membre
│ ⚝ ${p}autorecording ➪ Simulation audio
└──────────────────────────────┘

┌── ❍ 𝖯𝖱𝖮𝖳𝖤𝖢𝖳𝖨𝖮𝖭 ❍ ──────────┐
│ ⚝ ${p}antilink ➪ Anti-lien
│ ⚝ ${p}antibadword ➪ Anti-insultes
│ ⚝ ${p}antibot ➪ Bloquer bots
│ ⚝ ${p}antileave ➪ Anti-depart
│ ⚝ ${p}antimention ➪ Anti-spam
│ ⚝ ${p}antisticker ➪ Anti-sticker
│ ⚝ ${p}antitag ➪ Anti-tag abusif
│ ⚝ ${p}antimentionstatus ➪ Antimention
│ ⚝ ${p}anticall ➪ Bloquer appels
│ ⚝ ${p}antidelete ➪ Anti-suppression
│ ⚝ ${p}antipurge ➪ Anti-purge abusive
│ ⚝ ${p}antimarabout ➪ Anti-arnaques
└──────────────────────────────┘

┌── ❍ 𝖮𝖶𝖭𝖤𝖱 ❍ ───────────────┐
│ ⚝ ${p}mode ➪ Public / Privé
│ ⚝ ${p}sudo ➪ Menu sudo
│ ⚝ ${p}pair ➪ Code connexion
│ ⚝ ${p}prompt ➪ Comportement IA
│ ⚝ ${p}autoviewstatus ➪ Vue statuts
│ ⚝ ${p}autoreactstatus ➪ Réagir statuts
│ ⚝ ${p}autostatus ➪ Statut auto
│ ⚝ ${p}autoread ➪ Lecture auto
│ ⚝ ${p}autotyping ➪ Frappe auto
│ ⚝ ${p}clearsession ➪ Vider session
│ ⚝ ${p}cleartmp ➪ Vider dossier tmp
│ ⚝ ${p}update ➪ Mettre à jour
│ ⚝ ${p}settings ➪ Paramètres
│ ⚝ ${p}pmblocker ➪ Bloquer mp
│ ⚝ ${p}setpp ➪ Photo profil bot
│ ⚝ ${p}setmenuimage ➪ Image menu
│ ⚝ ${p}menustyle ➪ Style menu
│ ⚝ ${p}autobio ➪ Bio automatique
└──────────────────────────────┘

┌── ❍ 𝖤𝖣𝖨𝖳𝖨𝖭𝖦 ❍ ─────────────┐
│ ⚝ ${p}sticker ➪ Créer sticker
│ ⚝ ${p}stickersearch ➪ Chercher stickers
│ ⚝ ${p}toimage ➪ Sticker en image
│ ⚝ ${p}take ➪ Modifier sticker
│ ⚝ ${p}waouh ➪ Média discret
│ ⚝ ${p}viewonce ➪ Média vue unique
│ ⚝ ${p}image ➪ Générer image
│ ⚝ ${p}remini ➪ Améliorer qualité
│ ⚝ ${p}removebg ➪ Enlever fond
│ ⚝ ${p}blur ➪ Flouter image
│ ⚝ ${p}meme ➪ Créer meme
│ ⚝ ${p}emojimix ➪ Mixer emojis
│ ⚝ ${p}kiss ➪ Kiss GIF
│ ⚝ ${p}cry ➪ Cry GIF
│ ⚝ ${p}comrade ➪ Fun edit
│ ⚝ ${p}igs ➪ Story Instagram
│ ⚝ ${p}igsc ➪ Commentaires IG
│ ⚝ ${p}ship ➪ Couple du groupe
└──────────────────────────────┘

┌── ❍ 𝖠𝖨 & 𝖦𝖠𝖬𝖤𝖲 ❍ ──────────┐
│ ⚝ ${p}ai ➪ Intelligence IA
│ ⚝ ${p}gpt ➪ ChatGPT
│ ⚝ ${p}gemini ➪ IA Gemini
│ ⚝ ${p}claude ➪ Claude AI
│ ⚝ ${p}deepseek ➪ DeepSeek AI
│ ⚝ ${p}lovable ➪ Assistant UI/UX
│ ⚝ ${p}copilot ➪ Assistant code
│ ⚝ ${p}codeai ➪ Générer code IA
│ ⚝ ${p}imagine ➪ Image IA
│ ⚝ ${p}flux ➪ Image Flux
│ ⚝ ${p}sora ➪ Vidéo IA
│ ⚝ ${p}tictactoe ➪ Jeu morpion
│ ⚝ ${p}hangman ➪ Jeu pendu
│ ⚝ ${p}trivia ➪ Quiz culture
│ ⚝ ${p}truth ➪ Vérité
│ ⚝ ${p}dare ➪ Action
│ ⚝ ${p}drague ➪ Phrases de drague
└──────────────────────────────┘

┌── ❍ 𝖣𝖮𝖶𝖭𝖫𝖮𝖠𝖣𝖤𝖱 ❍ ─────────┐
│ ⚝ ${p}play ➪ Jouer musique
│ ⚝ ${p}save ➪ Sauvegarde média
│ ⚝ ${p}song ➪ Télécharger musique
│ ⚝ ${p}video ➪ Télécharger vidéo
│ ⚝ ${p}spotify ➪ Musique Spotify
│ ⚝ ${p}instagram ➪ Télécharger IG
│ ⚝ ${p}facebook ➪ Télécharger FB
│ ⚝ ${p}tiktok ➪ Télécharger TikTok
│ ⚝ ${p}lyrics ➪ Paroles musique
│ ⚝ ${p}simpcard ➪ carte simp
└──────────────────────────────┘

┌── ❍ 𝖳𝖤𝖷𝖳𝖬𝖠𝖪𝖤𝖱 ❍ ──────────┐
│ ⚝ ${p}neon ➪ Texte néon
│ ⚝ ${p}glitch ➪ Texte glitch
│ ⚝ ${p}fire ➪ Texte feu
│ ⚝ ${p}ice ➪ Texte glace
│ ⚝ ${p}snow ➪ Texte neige
│ ⚝ ${p}matrix ➪ Texte matrix
│ ⚝ ${p}hacker ➪ Style hacker
│ ⚝ ${p}devil ➪ Style démon
│ ⚝ ${p}sand ➪ Texte sable
└──────────────────────────────┘

┌── ❍ 𝖲𝖸𝖲𝖳𝖤𝖬 ❍ ──────────────┐
│ ⚝ ${p}git ➪ Infos git
│ ⚝ ${p}github ➪ Lien GitHub
│ ⚝ ${p}sc ➪ Code source
│ ⚝ ${p}repo ➪ Dépôt du bot
│ ⚝ ${p}script ➪ Script bot
│ ⚝ ${p}meta ➪ Infos Meta/WhatsApp
│ ⚝ ${p}footballnews ➪ Actus Foot
└──────────────────────────────┘

┌──────────────────────────────┐
  💻 𝖣𝖤𝖵𝖤𝖫𝖮𝖯𝖤𝖱 : ${settings.botOwner || 'Brandon'}
  📞 𝖢𝖮𝖭𝖳𝖠𝖢𝖳 : 237673355468
└──────────────────────────────┘

> _Propulsé par *${settings.botOwner || 'Brandon'}*_`;

    try {
        await sock.sendMessage(chatId, {
            image: { url: imageUrl },
            caption: helpMessage,
        }, { quoted: message });
    } catch (e) {
        console.error('❌ [help]', e.message);
        await sock.sendMessage(chatId, { text: helpMessage }, { quoted: message });
    }
}

module.exports = helpCommand;
