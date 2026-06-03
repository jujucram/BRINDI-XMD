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
│ ✦ 𝖳𝗈𝗍𝖺𝗅 𝖢𝗈𝗆𝗆𝖺𝗇𝖽𝖾𝗌 : 152⚡
│ ✦ 𝖴𝗉𝗍𝗂𝗆𝖾 : ${getUptime()}
│ ✦ 𝖱𝖺𝗆 : ${getRamBar()}
│ ✦ 𝖵𝖾𝗋𝗌𝗂𝗈念 : 𝗏${settings.version || '1.0.0'}
└──────────────────────────────┘

 🥷🏾 𝗟𝗜𝗦𝗧𝗘 𝗗𝗘𝗦 𝗠𝗘𝗡𝗨𝗦 🥷🏾

┌── ❍ 𝖦𝖤𝖭𝖤𝖱𝖠𝖫 ❍ ───────────┐
│ ⚝ ${p}help
│ ⚝ ${p}ping
│ ⚝ ${p}alive
│ ⚝ ${p}uptime
│ ⚝ ${p}info
│ ⚝ ${p}test
│ ⚝ ${p}contact
│ ⚝ ${p}owner
│ ⚝ ${p}calc
│ ⚝ ${p}horoscope 
│ ⚝ ${p}quote
│ ⚝ ${p}joke
│ ⚝ ${p}fact
│ ⚝ ${p}roseday
│ ⚝ ${p}journal
│ ⚝ ${p}countryinfo 
│ ⚝ ${p}weather
│ ⚝ ${p}news
│ ⚝ ${p}footballnews
│ ⚝ ${p}device
│ ⚝ ${p}humm
│ ⚝ ${p}ss
│ ⚝ ${p}url
│ ⚝ ${p}bible
│ ⚝ ${p}trt
│ ⚝ ${p}fancy
│ ⚝ ${p}8ball
└──────────────────────────────┘

┌── ❍ 𝖠𝖣𝖬𝖨𝖭 & 𝖦𝖱𝖮𝖴𝖯𝖤 ❍ ───────┐
│ ⚝ ${p}lock
│ ⚝ ${p}unlock
│ ⚝ ${p}kick
│ ⚝ ${p}add
│ ⚝ ${p}ban
│ ⚝ ${p}unban
│ ⚝ ${p}warn
│ ⚝ ${p}signal
│ ⚝ ${p}promote
│ ⚝ ${p}demote
│ ⚝ ${p}staff
│ ⚝ ${p}poll
│ ⚝ ${p}tagall
│ ⚝ ${p}tag
│ ⚝ ${p}hidetag
│ ⚝ ${p}delete
│ ⚝ ${p}link
│ ⚝ ${p}resetlink 
│ ⚝ ${p}chatbot
│ ⚝ ${p}vcf
│ ⚝ ${p}gjid
│ ⚝ ${p}groupinfo
│ ⚝ ${p}welcome
│ ⚝ ${p}goodbye
│ ⚝ ${p}loi
│ ⚝ ${p}ship
│ ⚝ ${p}gstatus
│ ⚝ ${p}kickall
│ ⚝ ${p}totalmembers
│ ⚝ ${p}topmembers
│ ⚝ ${p}sanction
│ ⚝ ${p}listonline
│ ⚝ ${p}acceptall
│ ⚝ ${p}rejectall
└──────────────────────────────┘

┌── ❍ 𝖯𝖱𝖮𝖳𝖤𝖢𝖳𝖨𝖮𝖭 ❍ ────┐
│ ⚝ ${p}antilink
│ ⚝ ${p}antibadword
│ ⚝ ${p}antibot
│ ⚝ ${p}antileave
│ ⚝ ${p}antimention
│ ⚝ ${p}antisticker
│ ⚝ ${p}antitag
│ ⚝ ${p}anticall
│ ⚝ ${p}antidelete
│ ⚝ ${p}antipurge
│ ⚝ ${p}antimarabout
│ ⚝ ${p}antimentionstatus
└──────────────────────────────┘

┌── ❍ 𝖮𝖶𝖭𝖤𝖱 🥷🏾 ❍ ─────────────┐
│ ⚝ ${p}mode
│ ⚝ ${p}sudo
│ ⚝ ${p}pair
│ ⚝ ${p}update
│ ⚝ ${p}theme
│ ⚝ ${p}menustyle
│ ⚝ ${p}setmenuimage
│ ⚝ ${p}setpp
│ ⚝ ${p}setbio
│ ⚝ ${p}prompt
│ ⚝ ${p}restore
│ ⚝ ${p}mention
│ ⚝ ${p}gcreate
│ ⚝ ${p}join
│ ⚝ ${p}block
│ ⚝ ${p}unblock
│ ⚝ ${p}autoviewstatus
│ ⚝ ${p}autoreactstatus
│ ⚝ ${p}autostatus
│ ⚝ ${p}autoread
│ ⚝ ${p}autotyping
│ ⚝ ${p}autorecording
│ ⚝ ${p}clearsession
│ ⚝ ${p}cleartmp
│ ⚝ ${p}getprivacy
│ ⚝ ${p}lastseen
│ ⚝ ${p}groupadd
│ ⚝ ${p}online
│ ⚝ ${p}settings
│ ⚝ ${p}clan
└──────────────────────────────┘

┌── ❍ 𝖤𝖣𝖨𝖳𝖨𝖭𝖦 & 𝖬𝖤𝖣𝖨𝖠 ❍ ────────┐
│ ⚝ ${p}sticker
│ ⚝ ${p}stickersearch
│ ⚝ ${p}toimage
│ ⚝ ${p}take
│ ⚝ ${p}waouh
│ ⚝ ${p}viewonce
│ ⚝ ${p}remini
│ ⚝ ${p}removebg
│ ⚝ ${p}blur
│ ⚝ ${p}meme
│ ⚝ ${p}emojimix
│ ⚝ ${p}animu
│ ⚝ ${p}stickertelegram 
│ ⚝ ${p}comrade
│ ⚝ ${p}stupid
│ ⚝ ${p}wasted
│ ⚝ ${p}attp
│ ⚝ ${p}tts
│ ⚝ ${p}igs
│ ⚝ ${p}igsc
│ ⚝ ${p}simpcard
│ ⚝ ${p}whois
└──────────────────────────────┘

┌── ❍ 𝖠𝖨 & 𝖦𝖠𝖬𝖤𝖲 ❍ ──────────┐
│ ⚝ ${p}ai
│ ⚝ ${p}gpt
│ ⚝ ${p}gemini
│ ⚝ ${p}claude
│ ⚝ ${p}deepseek
│ ⚝ ${p}lovable
│ ⚝ ${p}copilot
│ ⚝ ${p}codeai
│ ⚝ ${p}imagine
│ ⚝ ${p}flux
│ ⚝ ${p}sora
│ ⚝ ${p}tictactoe
│ ⚝ ${p}hangman
│ ⚝ ${p}trivia
│ ⚝ ${p}truth
│ ⚝ ${p}dare
│ ⚝ ${p}drague
│ ⚝ ${p}insult
└──────────────────────────────┘

┌── ❍ 𝖣𝖮𝖶𝖭𝖫𝖮𝖠𝖣𝖤𝖱 ❍ ─────────┐
│ ⚝ ${p}play
│ ⚝ ${p}song
│ ⚝ ${p}video
│ ⚝ ${p}spotify
│ ⚝ ${p}instagram
│ ⚝ ${p}gif
│ ⚝ ${p}facebook
│ ⚝ ${p}tiktok
│ ⚝ ${p}save
│ ⚝ ${p}dlstatus
│ ⚝ ${p}pies
└──────────────────────────────┘

┌── ❍ 𝖳𝖤𝖷𝖳𝖬𝖠𝖦𝖨𝖢 ❍ ──────────┐
│ ⚝ ${p}neon
│ ⚝ ${p}glitch
│ ⚝ ${p}fire
│ ⚝ ${p}ice
│ ⚝ ${p}snow
│ ⚝ ${p}matrix
│ ⚝ ${p}hacker
│ ⚝ ${p}devil
│ ⚝ ${p}sand
│ ⚝ ${p}image
└──────────────────────────────┘

┌── ❍ 𝖲𝖸𝖲𝖳𝖤𝖬 & 𝖡𝖴𝖦 ❍ ─────────┐
│ ⚝ ${p}repo
│ ⚝ ${p}sc
│ ⚝ ${p}github
│ ⚝ ${p}meta
│ ⚝ ${p}brindi-kill
│ ⚝ ${p}brindi-ios
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
