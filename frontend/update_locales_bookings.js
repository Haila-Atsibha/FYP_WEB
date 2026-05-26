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
    msg_success_status: "Booking status updated successfully",
    msg_error_status: "Failed to update booking status",
    manage_bookings_title: "Manage Bookings",
    manage_bookings_desc: "View and respond to customer requests",
    tab_active: "Active Requests",
    tab_history: "History",
    no_bookings: "No Bookings Found",
    no_active_bookings_desc: "You don't have any active booking requests at the moment.",
    no_history_bookings_desc: "You haven't completed or cancelled any bookings yet.",
    status_in_progress: "In Progress",
    status_completed: "Completed",
    status_rejected: "Rejected",
    status_cancelled: "Cancelled",
    job_description: "Job Description",
    customer_rating: "Customer Rating",
    total_amount: "Total Amount",
    btn_open_chat: "Open Chat",
    btn_mark_completed: "Mark as Completed",
    waiting_customer_completion: "Waiting for Customer to Complete",
    btn_finalized: "Finalized"
};

const amKeys = {
    msg_success_status: "የቦታ ማስያዣ ሁኔታ በተሳካ ሁኔታ ተዘምኗል",
    msg_error_status: "የቦታ ማስያዣ ሁኔታ ማዘመን አልተሳካም",
    manage_bookings_title: "ቦታ ማስያዣዎችን ያስተዳድሩ",
    manage_bookings_desc: "የደንበኛ ጥያቄዎችን ይመልከቱ እና ምላሽ ይስጡ",
    tab_active: "ንቁ ጥያቄዎች",
    tab_history: "ታሪክ",
    no_bookings: "ምንም ቦታ ማስያዣዎች አልተገኙም",
    no_active_bookings_desc: "በአሁኑ ጊዜ ምንም ንቁ የቦታ ማስያዣ ጥያቄዎች የሉዎትም።",
    no_history_bookings_desc: "እስካሁን ምንም ቦታ ማስያዣዎችን አላጠናቀቁም ወይም አልሰረዙም።",
    status_in_progress: "በመካሄድ ላይ",
    status_completed: "ተጠናቅቋል",
    status_rejected: "ውድቅ ተደርጓል",
    status_cancelled: "ተሰርዟል",
    job_description: "የሥራ መግለጫ",
    customer_rating: "የደንበኛ ደረጃ",
    total_amount: "ጠቅላላ መጠን",
    btn_open_chat: "ውይይት ክፈት",
    btn_mark_completed: "እንደተጠናቀቀ ምልክት አድርግ",
    waiting_customer_completion: "ደንበኛው እስኪያጠናቅቅ በመጠባበቅ ላይ",
    btn_finalized: "ተጠናቋል"
};

updateLocale('./src/locales/en.js', enKeys);
updateLocale('./src/locales/am.js', amKeys);
console.log('Updated locales.');
