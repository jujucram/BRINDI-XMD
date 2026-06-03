require('dotenv').config();
global.APIs = { 
  xteam: '', 
  dzx: '', 
  lol: '', 
  violetics: '', 
  neoxr: '', 
  zenzapis: '', 
  akuari: '', 
  akuari2: '', 
  nrtm: '', 
  bg: '', 
  fgmods: '' 
};
global.APIKeys = { 
  '': '', 
  '': '', 
  '': '', 
  '': '', 
  '': '', 
  '': '' 
}; // veuillez entrer vos propres apikeys

module.exports = { 
  WARN_COUNT: 3, 
  APIs: global.APIs, 
  APIKeys: global.APIKeys 
};
