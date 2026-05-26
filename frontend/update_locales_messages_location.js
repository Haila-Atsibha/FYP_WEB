const fs = require('fs');
const updateLocale = (file, newKeys) => {
    let content = fs.readFileSync(file, 'utf8');
    const lastBraceIndex = content.lastIndexOf('}');
    if (lastBraceIndex === -1) return;
    let toAdd = '';
    for (const [k, v] of Object.entries(newKeys)) {
        if (!content.includes('  ' + k + ':')) {
            toAdd += '\n  ' + k + ': ' + JSON.stringify(v) + ',';
        }
    }
    if (toAdd) {
        content = content.substring(0, lastBraceIndex) + toAdd + '\n' + content.substring(lastBraceIndex);
        fs.writeFileSync(file, content);
    }
};

const enKeys = {
    share_location_title: "Share Location",
    share_location_desc: "How would you like to share your location?",
    btn_send_current_gps: "Send Current GPS Location",
    btn_select_on_map: "Select on Map",
    select_location_title: "Select Location",
    select_location_desc: "Click anywhere on the map to drop a pin at the location you want to share.",
    btn_confirm_location: "Confirm Location"
};

const amKeys = {
    share_location_title: "አካባቢን ያጋሩ",
    share_location_desc: "አካባቢዎን እንዴት ማጋራት ይፈልጋሉ?",
    btn_send_current_gps: "የአሁኑን የጂፒኤስ አካባቢ ይላኩ",
    btn_select_on_map: "በካርታ ላይ ይምረጡ",
    select_location_title: "አካባቢ ይምረጡ",
    select_location_desc: "ማጋራት በሚፈልጉት ቦታ ላይ ፒን ለመጣል በካርታው ላይ የትኛውም ቦታ ላይ ጠቅ ያድርጉ።",
    btn_confirm_location: "አካባቢን ያረጋግጡ"
};

updateLocale('./src/locales/en.js', enKeys);
updateLocale('./src/locales/am.js', amKeys);
console.log('Updated locales.');
