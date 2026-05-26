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
    msg_response_success: "Response submitted successfully.",
    msg_response_error: "Failed to submit response",
    provider_disputes_title: "Disputes",
    provider_disputes_desc: "Manage and respond to customer complaints",
    provider_no_disputes: "No Disputes Found",
    provider_no_disputes_desc: "You currently have no complaints filed against you. Keep up the great work!",
    provider_respond_dispute: "Respond to Dispute",
    provider_respond_dispute_desc: "Provide your side of the story for this complaint.",
    provider_customer_claim: "Customer's Claim:",
    provider_your_response: "Your Response",
    provider_response_placeholder: "Explain your side of the situation clearly...",
    provider_submitting: "Submitting...",
    btn_submit_response: "Submit Response",
    status_resolved: "Resolved",
    status_active_dispute: "Active Dispute",
    label_customer: "Customer",
    label_you_responded: "You Responded",
    btn_submit_your_response: "Submit Your Response"
};

const amKeys = {
    msg_response_success: "ምላሽ በተሳካ ሁኔታ ቀርቧል።",
    msg_response_error: "ምላሽ ማቅረብ አልተሳካም",
    provider_disputes_title: "ክርክሮች",
    provider_disputes_desc: "የደንበኛ ቅሬታዎችን ያስተዳድሩ እና ምላሽ ይስጡ",
    provider_no_disputes: "ምንም ክርክሮች አልተገኙም",
    provider_no_disputes_desc: "በአሁኑ ጊዜ በእርስዎ ላይ የቀረበ ምንም ቅሬታ የለም። ጥሩ ስራዎን ይቀጥሉ!",
    provider_respond_dispute: "ለክርክር ምላሽ ይስጡ",
    provider_respond_dispute_desc: "ለዚህ ቅሬታ የእርስዎን አቋም ያብራሩ።",
    provider_customer_claim: "የደንበኛው የይገባኛል ጥያቄ:",
    provider_your_response: "የእርስዎ ምላሽ",
    provider_response_placeholder: "የሁኔታውን የእርስዎን አቅጣጫ በግልፅ ያብራሩ...",
    provider_submitting: "በማቅረብ ላይ...",
    btn_submit_response: "ምላሽ አስገባ",
    status_resolved: "መፍትሄ አግኝቷል",
    status_active_dispute: "ንቁ ክርክር",
    label_customer: "ደንበኛ",
    label_you_responded: "ምላሽ ሰጥተዋል",
    btn_submit_your_response: "ምላሽዎን ያስገቡ"
};

updateLocale('./src/locales/en.js', enKeys);
updateLocale('./src/locales/am.js', amKeys);
console.log('Updated locales.');
