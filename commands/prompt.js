const fs = require('fs');
const path = require('path');
const isOwnerOrSudo = require('../lib/isOwner');

const promptPath = path.join(__dirname, '../data/prompt.json');

const DEFAULT_PROMPT = "Tu es BRINDI-XMD, un assistant WhatsApp intelligent, utile et sympa. Tu réponds toujours en français de façon claire et concise.";

if (!fs.existsSync(promptPath)) {
    fs.writeFileSync(promptPath, JSON.stringify({ prompt: DEFAULT_PROMPT }));
}
function getPrompt() {
    try { return JSON.parse(fs.readFileSync(promptPath)).prompt || DEFAULT_PROMPT; }
    catch { return DEFAULT_PROMPT; }
}
function savePrompt(p) { fs.writeFileSync(promptPath, JSON.stringify({ prompt: p }, null, 2)); }

async function promptCommand(sock, chatId, senderId, args, message) {
    const action = args[0]?.toLowerCase();
    const current = getPrompt();

    // Afficher le prompt actuel
    if (!action) {
        return await sock.sendMessage(chatId, {
            image: { url: './assets/IMG-20240812-WA0097.jpg' },
            caption: `🤖 *COMPORTEMENT IA*

📝 *Prompt actuel :*
│ ${current}

📌 *Commandes :*
│ ⬡ .prompt set <texte>
│   → Définir un nouveau comportement
│ ⬡ .prompt reset
│   → Remettre le comportement par défaut
│ ⬡ .prompt voir
│   → Voir le prompt actuel

💡 *Exemples :*
│ .prompt set Tu es un assistant médical
│ .prompt set Réponds toujours avec humour

> BRINDI-XMD`,
            
        }, { quoted: message });
    }

    if (action === 'set') {
        const newPrompt = args.slice(1).join(' ');
        if (!newPrompt) {
            return await sock.sendMessage(chatId, {
                text: `❌ *Spécifie un comportement !*\n_Ex : .prompt set Tu es un expert en finance_\n> BRINDI-XMD`,
                
            }, { quoted: message });
        }
        savePrompt(newPrompt);
        return await sock.sendMessage(chatId, {
            text: `✅ *Comportement IA mis à jour !*\n\n📝 *Nouveau prompt :*\n│ ${newPrompt}\n\n> BRINDI-XMD`,
        
        }, { quoted: message });
    }

    if (action === 'reset') {
        savePrompt(DEFAULT_PROMPT);
        return await sock.sendMessage(chatId, {
            text: `🔄 *Comportement IA réinitialisé !*\n\n📝 *Prompt par défaut restauré :*\n│ ${DEFAULT_PROMPT}\n\n> BRINDI-XMD`,
            
        }, { quoted: message });
    }

    if (action === 'voir') {
        return await sock.sendMessage(chatId, {
            text: `🤖 *PROMPT ACTUEL*\n\n📝 *Comportement IA :*\n│ ${current}\n\n> BRINDI-XMD`,
            
        }, { quoted: message });
    }
}

// Export du prompt pour l'utiliser dans les commandes AI
module.exports = promptCommand;
module.exports.getPrompt = getPrompt;
