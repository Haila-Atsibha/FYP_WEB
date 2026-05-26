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
    provider_my_reports: "My Reports",
    provider_reports_desc: "Generate and print your business performance reports",
    btn_print_export: "Print / Export PDF",
    provider_compiling_report: "Compiling report data...",
    provider_performance_report: "Provider Performance Report",
    provider_generated_on: "Generated on",
    provider_performance_summary: "Performance Summary",
    provider_total_earnings: "Total Earnings",
    provider_average_rating: "Average Rating",
    provider_total_reviews: "Total Reviews",
    provider_total_customers: "Total Customers",
    provider_booking_analytics: "Booking Analytics",
    provider_total_bookings: "Total Bookings",
    provider_completed_jobs: "Completed Jobs",
    provider_active_bookings: "Active Bookings",
    provider_pending_requests: "Pending Requests",
    provider_cancelled_rejected: "Cancelled/Rejected",
    provider_services_offered: "Services Offered",
    provider_subscription_payments: "Subscription & Payments",
    provider_total_sub_payments: "Total Sub Payments",
    provider_total_amount_paid: "Total Amount Paid",
    provider_subscription_status: "Subscription Status",
    provider_valid_until: "Valid Until",
    provider_end_of_report: "End of Report",
    provider_portal_footer: "QuickServe Provider Portal"
};

const amKeys = {
    provider_my_reports: "የእኔ ሪፖርቶች",
    provider_reports_desc: "የንግድዎን አፈጻጸም ሪፖርቶች ያመንጩ እና ያትሙ",
    btn_print_export: "አትም / ፒዲኤፍ ላክ",
    provider_compiling_report: "የሪፖርት ውሂብ በማጠናቀር ላይ...",
    provider_performance_report: "የአቅራቢ አፈጻጸም ሪፖርት",
    provider_generated_on: "የተፈጠረበት ቀን",
    provider_performance_summary: "የአፈጻጸም ማጠቃለያ",
    provider_total_earnings: "ጠቅላላ ገቢ",
    provider_average_rating: "አማካይ ደረጃ",
    provider_total_reviews: "ጠቅላላ ግምገማዎች",
    provider_total_customers: "ጠቅላላ ደንበኞች",
    provider_booking_analytics: "የቦታ ማስያዣ ትንታኔ",
    provider_total_bookings: "ጠቅላላ ቦታ ማስያዣዎች",
    provider_completed_jobs: "የተጠናቀቁ ስራዎች",
    provider_active_bookings: "ንቁ ቦታ ማስያዣዎች",
    provider_pending_requests: "በመጠባበቅ ላይ ያሉ ጥያቄዎች",
    provider_cancelled_rejected: "የተሰረዙ/ውድቅ የተደረጉ",
    provider_services_offered: "የሚቀርቡ አገልግሎቶች",
    provider_subscription_payments: "ምዝገባ እና ክፍያዎች",
    provider_total_sub_payments: "ጠቅላላ የምዝገባ ክፍያዎች",
    provider_total_amount_paid: "ጠቅላላ የተከፈለ መጠን",
    provider_subscription_status: "የምዝገባ ሁኔታ",
    provider_valid_until: "እስከሚያበቃበት",
    provider_end_of_report: "የሪፖርቱ መጨረሻ",
    provider_portal_footer: "የ QuickServe አቅራቢ ፖርታል"
};

updateLocale('./src/locales/en.js', enKeys);
updateLocale('./src/locales/am.js', amKeys);
console.log('Updated locales.');
