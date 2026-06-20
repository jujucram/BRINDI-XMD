require('dotenv').config();

global.APIs = {
    xteam: 'https://api.xteam.xyz',
    dzx: 'https://api.dhamzxploit.my.id',
    lol: 'https://api.lolhuman.xyz',
    violetics: 'https://violetics.pw',
    neoxr: 'https://api.neoxr.my.id',
    zenzapis: 'https://zenzapis.xyz',
    akuari: 'https://api.akuari.my.id',
    akuari2: 'https://apimu.my.id',
    nrtm: 'https://fg-nrtm.ddns.net',
    bg: 'http://bochil.ddns.net',
    fgmods: 'https://api-fgmods.ddns.net'
};

global.APIKeys = {

    // Get your API key: https://api.xteam.xyz
    'https://api.xteam.xyz': 'YOUR_XTEAM_API_KEY',

    // Get your API key: https://api.lolhuman.xyz
    'https://api.lolhuman.xyz': 'YOUR_LOLHUMAN_API_KEY',

    // Get your API key: https://api.neoxr.my.id
    'https://api.neoxr.my.id': 'YOUR_NEOXR_API_KEY',

    // Get your API key: https://violetics.pw
    'https://violetics.pw': 'YOUR_VIOLETICS_API_KEY',

    // Get your API key: https://zenzapis.xyz
    'https://zenzapis.xyz': 'YOUR_ZENZAPIS_API_KEY',

    // Get your API key: https://api-fgmods.ddns.net
    'https://api-fgmods.ddns.net': 'YOUR_FGMODS_API_KEY'
};

module.exports = {
    WARN_COUNT: 3,
    APIs: global.APIs,
    APIKeys: global.APIKeys
};
