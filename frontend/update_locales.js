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
    provider_profile_load_error: 'Failed to load profile information.',
    provider_profile_update_success: 'Profile updated successfully!',
    provider_profile_update_error: 'Failed to update profile. Please try again.',
    provider_profile_payment_init_error: 'Failed to initialize payment.',
    provider_profile_payment_connect_error: 'Error connecting to payment provider.',
    provider_profile_title: 'Manage Profile',
    provider_profile_desc: 'Update your professional details and contact information',
    provider_profile_change_photo: 'Change Photo',
    provider_profile_rating: 'Rating',
    provider_profile_verification_status: 'Verification Status',
    provider_profile_verified_professional: 'Verified Professional',
    provider_profile_verification_pending: 'Verification Pending',
    provider_profile_official_status: 'Official QuickServe Status',
    provider_profile_premium_subscription: 'Premium Subscription',
    provider_profile_boost_visibility: 'Boost Your Visibility',
    provider_profile_boost_desc: 'Get listed at the top of search results and unlock premium features.',
    provider_profile_active_premium_plan: 'Active Premium Plan',
    provider_profile_valid_until: 'Valid until',
    provider_profile_initializing: 'INITIALIZING...',
    provider_profile_upgrade_button: 'UPGRADE FOR 500 ETB / MONTH',
    provider_profile_full_name: 'Full Name',
    provider_profile_full_name_placeholder: 'Your full name',
    provider_profile_phone_number: 'Phone Number',
    provider_profile_phone_placeholder: '+251 ...',
    provider_profile_bio: 'Professional Bio',
    provider_profile_bio_placeholder: 'Tell your customers about your experience and expertise...',
    provider_profile_registered_email: 'Registered Email',
    provider_profile_email_security_notice: 'Email cannot be changed for security reasons.',
    provider_profile_saving_changes: 'SAVING CHANGES...',
    provider_profile_save_settings: 'SAVE PROFILE SETTINGS'
};

const amKeys = {
    provider_profile_load_error: 'የመገለጫ መረጃ መጫን አልተሳካም።',
    provider_profile_update_success: 'መገለጫ በተሳካ ሁኔታ ተዘምኗል!',
    provider_profile_update_error: 'መገለጫ ማዘመን አልተሳካም። እባክዎ እንደገና ይሞክሩ።',
    provider_profile_payment_init_error: 'ክፍያ መጀመር አልተሳካም።',
    provider_profile_payment_connect_error: 'ከክፍያ አቅራቢ ጋር በመገናኘት ላይ ስህተት ተፈጥሯል።',
    provider_profile_title: 'መገለጫዎን ያስተዳድሩ',
    provider_profile_desc: 'የሙያ ዝርዝሮችዎን እና የአድራሻ መረጃዎን ያዘምኑ',
    provider_profile_change_photo: 'ፎቶ ቀይር',
    provider_profile_rating: 'ደረጃ',
    provider_profile_verification_status: 'የማረጋገጫ ሁኔታ',
    provider_profile_verified_professional: 'የተረጋገጠ ባለሙያ',
    provider_profile_verification_pending: 'ማረጋገጫ በመጠባበቅ ላይ',
    provider_profile_official_status: 'ይፋዊ የ QuickServe ሁኔታ',
    provider_profile_premium_subscription: 'የፕሪሚየም ምዝገባ',
    provider_profile_boost_visibility: 'ታይነትዎን ያሳድጉ',
    provider_profile_boost_desc: 'በፍለጋ ውጤቶች አናት ላይ ይዘርዝሩ እና የፕሪሚየም ባህሪያትን ይክፈቱ።',
    provider_profile_active_premium_plan: 'ንቁ የፕሪሚየም ዕቅድ',
    provider_profile_valid_until: 'እስከሚያበቃበት:',
    provider_profile_initializing: 'በመጀመር ላይ...',
    provider_profile_upgrade_button: 'ለ 500 ብር / በወር ያሻሽሉ',
    provider_profile_full_name: 'ሙሉ ስም',
    provider_profile_full_name_placeholder: 'የእርስዎ ሙሉ ስም',
    provider_profile_phone_number: 'ስልክ ቁጥር',
    provider_profile_phone_placeholder: '+251 ...',
    provider_profile_bio: 'የሙያ ማብራሪያ',
    provider_profile_bio_placeholder: 'ስለ ተሞክሮዎ እና ክህሎትዎ ለደንበኞችዎ ይንገሩ...',
    provider_profile_registered_email: 'የተመዘገበ ኢሜይል',
    provider_profile_email_security_notice: 'ለደህንነት ሲባል ኢሜይል ሊቀየር አይችልም።',
    provider_profile_saving_changes: 'ለውጦችን በማስቀመጥ ላይ...',
    provider_profile_save_settings: 'የመገለጫ ቅንብሮችን ያስቀምጡ'
};

updateLocale('./src/locales/en.js', enKeys);
updateLocale('./src/locales/am.js', amKeys);
console.log('Updated locales.');
