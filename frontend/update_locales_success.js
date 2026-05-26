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
    verifying_payment: "Verifying your payment...",
    verifying_payment_desc: "Please wait while we activate your subscription.",
    verification_pending: "Verification Pending",
    verification_pending_desc: "We couldn't verify your payment immediately. Don't worry, it might take a few minutes for Chapa to confirm. Your status will update soon!",
    btn_go_to_dashboard: "Go to Dashboard",
    payment_successful: "Payment Successful!",
    payment_successful_desc: "Your subscription has been activated. Your profile is now visible to customers, and you can start receiving booking requests."
};

const amKeys = {
    verifying_payment: "ክፍያዎን በማረጋገጥ ላይ...",
    verifying_payment_desc: "የምዝገባዎን ስናነቃ እባክዎ ይጠብቁ።",
    verification_pending: "ማረጋገጫ በመጠባበቅ ላይ",
    verification_pending_desc: "ክፍያዎን ወዲያውኑ ማረጋገጥ አልቻልንም። አይጨነቁ፣ ቻፓ ለማረጋገጥ ጥቂት ደቂቃዎች ሊወስድ ይችላል። የእርስዎ ሁኔታ በቅርቡ ይዘመናል!",
    btn_go_to_dashboard: "ወደ ዳሽቦርድ ይሂዱ",
    payment_successful: "ክፍያ ተሳክቷል!",
    payment_successful_desc: "ምዝገባዎ ነቅቷል። አሁን መገለጫዎ ለደንበኞች የሚታይ ነው፣ እና የቦታ ማስያዣ ጥያቄዎችን መቀበል መጀመር ይችላሉ።"
};

updateLocale('./src/locales/en.js', enKeys);
updateLocale('./src/locales/am.js', amKeys);
console.log('Updated locales.');
