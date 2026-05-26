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
    provider_reviews_title: 'Customer Reviews',
    provider_reviews_desc: 'See what your customers are saying about your services',
    provider_reviews_overall_rating: 'Overall Rating',
    provider_reviews_based_on: 'Based on',
    provider_reviews_total_reviews: 'total reviews',
    provider_reviews_recent_feedback: 'Recent Feedback',
    provider_reviews_sort_newest: 'Sort: Newest First',
    provider_reviews_no_reviews: 'No reviews yet',
    provider_reviews_no_reviews_desc: 'Finish more bookings to start getting feedback from customers!',
    provider_reviews_booked: 'Booked:'
};

const amKeys = {
    provider_reviews_title: 'የደንበኛ ግምገማዎች',
    provider_reviews_desc: 'ደንበኞችዎ ስለአገልግሎትዎ ምን እያሉ እንደሆነ ይመልከቱ',
    provider_reviews_overall_rating: 'አጠቃላይ ደረጃ',
    provider_reviews_based_on: 'በዚህ ላይ የተመሰረተ',
    provider_reviews_total_reviews: 'ጠቅላላ ግምገማዎች',
    provider_reviews_recent_feedback: 'የቅርብ ጊዜ አስተያየቶች',
    provider_reviews_sort_newest: 'በአዲስ ቅደም ተከተል',
    provider_reviews_no_reviews: 'እስካሁን ምንም ግምገማዎች የሉም',
    provider_reviews_no_reviews_desc: 'ከደንበኞች አስተያየት ማግኘት ለመጀመር ተጨማሪ ቦታ ማስያዣዎችን ያጠናቅቁ!',
    provider_reviews_booked: 'የተያዘ:'
};

updateLocale('./src/locales/en.js', enKeys);
updateLocale('./src/locales/am.js', amKeys);
console.log('Updated locales.');
