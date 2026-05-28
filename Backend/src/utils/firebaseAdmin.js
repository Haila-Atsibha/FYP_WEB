const admin = require('firebase-admin');

let isFirebaseInitialized = false;

try {
    let serviceAccount = null;

    // Preferred for deployment: store full JSON string in env
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    } else {
        // Local fallback: allow a file at backend root
        // eslint-disable-next-line global-require
        serviceAccount = require('../../firebase-service-account.json');
    }

    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    isFirebaseInitialized = true;
    console.log("Firebase Admin initialized successfully.");
} catch (error) {
    console.warn("Firebase Admin initialization failed. Push notifications will not be sent.");
    console.warn(error?.message || error);
}

const sendPushNotification = async (fcmToken, title, body, data = {}) => {
    if (!isFirebaseInitialized || !fcmToken) return false;

    try {
        const message = {
            notification: { title, body },
            data: {
                ...data,
                click_action: 'FLUTTER_NOTIFICATION_CLICK'
            },
            token: fcmToken
        };

        await admin.messaging().send(message);
        return true;
    } catch (error) {
        console.error("Error sending push notification:", error?.message || error);
        return false;
    }
};

module.exports = { sendPushNotification };

