// Allmenu → Affiche toutes les commandes disponibles v1.0
const settings = require('../settings');
const fs = require('fs');
const path = require('path');
const os = require('os');


const menuImagePath = path.join(__dirname, '../data/menuimage.json');
function getMenuImage() {
    try { return JSON.parse(fs.readFileSync(menuImagePath)).url; }
    catch { return './assets/IMG-20240812-WA0097.jpg'; }
}

function getRamBar() {
    const used = process.memoryUsage().rss;
    const total = os.totalmem();
    const pct = Math.round((used / total) * 100);
    const bars = Math.round(pct / 20);
    return '█'.repeat(bars) + '□'.repeat(5 - bars) + ' ' + pct + '%';
}

async function allmenuCommand(sock, chatId, message) {
    const p = settings.prefix || '.';
    const imageUrl = getMenuImage();
    const uptime = (() => {
        const s = Math.floor(process.uptime());
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        return `${h}h ${m}m`;
    })();

    const menu =
`╔═〔 🥷𝗕𝗥𝗜N𝗗𝗜-𝗫𝗠𝗗-𝗩1 〕═❒
║╭─────────────◆
║│ ❍*𝗠𝗘𝗡𝗨* ❍
║╰─────────────◆
╚══════════════════❒
 👤 Brindi Cram
╔══════════════════🥷
║ ⿻ *ᴘʀᴇғɪx:* [ ${p} ]
║ ⿻ *ᴏᴡɴᴇʀ:* ${settings.botOwner || 'Brandon'}
║ ⿻ *ᴍᴏᴅᴇ:* ${settings.commandMode || 'private'}
║ ⿻ *sᴘᴇᴇᴅ:* rapide ⚡
║ ⿻ *ᴜᴘᴛɪᴍᴇ:* ${uptime}
║ ⿻ *ʀᴀᴍ:* ${getRamBar()}
║ ⿻ *ᴜsᴀɢᴇ:* v${settings.version || '1.0.0'}
╚══════════════════🥷
 🥷 𝗟𝗜𝗦𝗧𝗘 𝗗𝗘𝗦 𝗖𝗢𝗠𝗠𝗔𝗡𝗗𝗘𝗦
╔══════════════════🥷
║ ❍ 𝗚𝗘𝗡𝗘𝗥𝗔𝗟-BRINDI ❍
║ ⿻ ${p}help → aide du bot
║ ⿻ ${p}ping → vitesse du bot
║ ⿻ ${p}alive → état du bot
║ ⿻ ${p}uptime → temps en ligne
║ ⿻ ${p}tts → texte en audio
║ ⿻ ${p}owner → propriétaire
║ ⿻ ${p}joke → blague
║ ⿻ ${p}quote → citation
║ ⿻ ${p}fact → fait intéressant
║ ⿻ ${p}weather → météo
║ ⿻ ${p}news → actualités
║ ⿻ ${p}journal → journal en français
║ ⿻ ${p}attp → texte en sticker
║ ⿻ ${p}8ball → boule magique
║ ⿻ ${p}groupinfo → infos groupe
║ ⿻ ${p}staff → staff du groupe
║ ⿻ ${p}humm → coup d'oeil
║ ⿻ ${p}trt → traduction
║ ⿻ ${p}ss → capture ecran
║ ⿻ ${p}gjid → identifiant groupe
║ ⿻ ${p}url → lien raccourci
║ ⿻ ${p}theme → changer theme
║ ⿻ ${p}test → verifier bot actif
║ ⿻ ${p}info → infos du bot
║ ⿻ ${p}contact → contact proprio
║ ⿻ ${p}loi → regles du groupe
║ ⿻ ${p}restore → restaurer config
║ ⿻ ${p}clan → gerer un clan
╚══════════════════❒

╔══════════════════🥷
║ ❍𝗔𝗗𝗠𝗜𝗡-𝗕𝗥𝗜NDI ❍
║ ⿻ ${p}open → ouvrir le groupe
║ ⿻ ${p}close → fermer le groupe
║ ⿻ ${p}ban → bannir membre
║ ⿻ ${p}kick → expulser membre
║ ⿻ ${p}add → ajouter membre
║ ⿻ ${p}warn → avertir membre
║ ⿻ ${p}signal → signaler un user
║ ⿻ ${p}promote → rendre admin
║ ⿻ ${p}demote → retirer admin
║ ⿻ ${p}delete → supprimer message
║ ⿻ ${p}tagall → mentionner tous
║ ⿻ ${p}tag → tag avec message
║ ⿻ ${p}hidetag → tag cache
║ ⿻ ${p}gjid → id du groupe
║ ⿻ ${p}welcome → msg bienvenue
║ ⿻ ${p}goodbye → msg au revoir
║ ⿻ ${p}link → obtenir lien du groupe
║ ⿻ ${p}gstatus nom → changer nom
║ ⿻ ${p}gstatus desc → changer description 
║ ⿻ ${p}kickall → expulser tous
║ ⿻ ${p}acceptall → approuver membre
║ ⿻ ${p}rejectall → refuser membre
║ ⿻ ${p}sanction → sanctionner membre
║ ⿻ ${p}autorecording → simulation audio
╚══════════════════❒

╔══════════════════🥷
║ ❍ 𝗣𝗥𝗢𝗧𝗘𝗖𝗧𝗜𝗢𝗡-BRINDI ❍
║ ⿻ ${p}antilink → anti-lien
║ ⿻ ${p}antibadword → anti-insultes
║ ⿻ ${p}antibot → bloquer bots
║ ⿻ ${p}antileave → anti-depart
║ ⿻ ${p}antimention → anti-spam
║ ⿻ ${p}antisticker → anti-sticker
║ ⿻ ${p}antitag → anti-tag abusif
║ ⿻ ${p}antimentionstatus → antimention
║ ⿻ ${p}anticall → bloquer appels
║ ⿻ ${p}antidelete → anti-suppression
║ ⿻ ${p}antipurge → anti-purge abusive
║ ⿻ ${p}antimarabout → anti-arnaques
╚══════════════════❒

╔══════════════════🥷
║ ❍ 𝗢𝗪𝗡𝗘𝗥-BRINDI ❍
║ ⿻ ${p}mode → public / prive
║ ⿻ ${p}sudo → menu sudo
║ ⿻ ${p}pair → code connexion
║ ⿻ ${p}prompt → comportement IA
║ ⿻ ${p}autoviewstatus → vue statuts
║ ⿻ ${p}autoreactstatus → reagir
║ ⿻ ${p}autostatus → statut auto
║ ⿻ ${p}autoread → lecture auto
║ ⿻ ${p}autotyping → frappe auto
║ ⿻ ${p}clearsession → session
║ ⿻ ${p}cleartmp → vider tmp
║ ⿻ ${p}update → mettre a jour
║ ⿻ ${p}settings → parametres
║ ⿻ ${p}anticall → bloquer appels
║ ⿻ ${p}pmblocker → bloquer mp
║ ⿻ ${p}setpp → photo profil bot
║ ⿻ ${p}setmenuimage → image menu
║ ⿻ ${p}menustyle → style menu
║ ⿻ ${p}autobio → bio automatique
║ ⿻ ${p}maintenance → mode maintenance
╚══════════════════❒

╔══════════════════🥷
║ ❍ 𝗘𝗗𝗜𝗧𝗜𝗡𝗚-Brindi ❍
║ ⿻ ${p}crop → creer sticker
║ ⿻ ${p}stickersearch → chercher stickers
║ ⿻ ${p}toimage → sticker image
║ ⿻ ${p}take → modifier sticker
║ ⿻ ${p}waouh → capturer media discret
║ ⿻ ${p}image → generer image
║ ⿻ ${p}remini → ameliorer qualite
║ ⿻ ${p}removebg → enlever fond
║ ⿻ ${p}blur → flouter image
║ ⿻ ${p}meme → creer meme
║ ⿻ ${p}emojimix → mixer emojis
║ ⿻ ${p}kiss → emoji d’embrassade
║ ⿻ ${p}cry→ emoji de pleure
║ ⿻ ${p}comrade → fun edit
║ ⿻ ${p}igs → story instagram
║ ⿻ ${p}igsc → commentaires IG
╚══════════════════❒

╔══════════════════🥷
║ ❍ 𝗔𝗜 & 𝗚𝗔𝗠𝗘𝗦-BRINDI ❍
║ ⿻ ${p}ai → intelligence IA
║ ⿻ ${p}gpt → ChatGPT
║ ⿻ ${p}gemini → IA Gemini
║ ⿻ ${p}claude → Claude AI
║ ⿻ ${p}deepseek → DeepSeek AI
║ ⿻ ${p}lovable → assistant UI/UX
║ ⿻ ${p}copilot → assistant code
║ ⿻ ${p}codeai → generer code IA
║ ⿻ ${p}imagine → image IA
║ ⿻ ${p}flux → image flux
║ ⿻ ${p}sora → video IA
║ ⿻ ${p}tictactoe → jeu morpion
║ ⿻ ${p}hangman → jeu pendu
║ ⿻ ${p}trivia → quiz culture
║ ⿻ ${p}truth → verite
║ ⿻ ${p}dare → action
║ ⿻ ${p}drague → phrases de drague
╚══════════════════❒

╔══════════════════🥷
║ ❍ 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗘𝗥-BRINDI ❍
║ ⿻ ${p}play → jouer musique
║ ⿻ ${p}song → telecharger musique
║ ⿻ ${p}video → telecharger video
║ ⿻ ${p}spotify → musique spotify
║ ⿻ ${p}instagram → telecharger IG
║ ⿻ ${p}facebook → telecharger FB
║ ⿻ ${p}tiktok → telecharger TikTok
║ ⿻ ${p}lyrics → paroles musique
╚══════════════════❒

╔══════════════════🥷
║ ❍ 𝗧𝗘𝗫𝗧𝗠𝗔𝗞𝗘𝗥-BRINDI ❍
║ ⿻ ${p}neon → texte neon
║ ⿻ ${p}glitch → texte glitch
║ ⿻ ${p}fire → texte feu
║ ⿻ ${p}ice → texte glace
║ ⿻ ${p}snow → texte neige
║ ⿻ ${p}matrix → texte matrix
║ ⿻ ${p}hacker → style hacker
║ ⿻ ${p}devil → style demon
║ ⿻ ${p}sand → texte sable
╚══════════════════❒

╔══════════════════🥷
║ ❍ 𝗦𝗬𝗦𝗧𝗘𝗠-BRINDI ❍
║ ⿻ ${p}git → info git
║ ⿻ ${p}github → lien github
║ ⿻ ${p}sc → code source
║ ⿻ ${p}repo → depot bot
║ ⿻ ${p}script → script bot
║ ⿻ ${p}meta → infos Meta/WhatsApp
║ ⿻ ${p}footballnews → actus football
╚══════════════════❒

╔══════════════════❒
║ ❍ *𝗖𝗢𝗡𝗧𝗔𝗖𝗧𝗘𝗭-𝗠𝗢𝗜* ❍
║ *Brandon*:237673355468
╚══════════════════❒

🥷══════════════════🥷
      _propulsé par *Brandon*_
🥷══════════════════🥷`;

    await sock.sendMessage(chatId, {
        image: { url: imageUrl },
        caption: menu,
    }, { quoted: message });
}

module.exports = allmenuCommand;
