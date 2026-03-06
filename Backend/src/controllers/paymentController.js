const pool = require('../db');
const axios = require('axios');

const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY ? process.env.CHAPA_SECRET_KEY.trim() : '';

exports.initializePayment = async (req, res) => {
    try {
        const userId = req.user.id;
        const { amount, currency = 'ETB' } = req.body;

        // 1. Get provider profile and email
        const userQuery = await pool.query(
            `SELECT u.email, u.name, pp.id as provider_id 
             FROM users u 
             JOIN provider_profiles pp ON u.id = pp.user_id 
             WHERE u.id = $1`,
            [userId]
        );

        if (userQuery.rows.length === 0) {
            return res.status(404).json({ message: "Provider profile not found" });
        }

        const { email, name, provider_id } = userQuery.rows[0];
        const tx_ref = `quickserve-${Date.now()}-${userId}`;

        const names = name.split(' ');
        const firstName = names[0] || 'Provider';
        const lastName = names.slice(1).join(' ') || 'User';

        // 2. Initialize Chapa Transaction
        const chapaResponse = await axios.post(
            'https://api.chapa.co/v1/transaction/initialize',
            {
                amount: amount || 200,
                currency: currency,
                email: email,
                first_name: firstName,
                last_name: lastName,
                tx_ref: tx_ref,
                callback_url: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/payments/verify-payment/${tx_ref}`,
                return_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/provider/subscription-success?tx_ref=${tx_ref}`,
                "customization[title]": "QuickServe Subscription",
                "customization[description]": "Monthly provider subscription fee"
            },
            {
                headers: {
                    Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (chapaResponse.data.status === 'success') {
            res.json({
                checkout_url: chapaResponse.data.data.checkout_url,
                tx_ref: tx_ref
            });
        } else {
            res.status(400).json({ message: "Payment initialization failed", detail: chapaResponse.data });
        }

    } catch (error) {
        console.error("Chapa Initialization Error:", error.response?.data || error.message);
        res.status(500).json({
            message: "Server error during payment initialization",
            error: error.response?.data || error.message
        });
    }
};

exports.verifyPayment = async (req, res) => {
    const { tx_ref } = req.params;
    try {
        const fs = require('fs');
        const path = require('path');
        const logPath = path.join(process.cwd(), 'notif_error.log');
        fs.appendFileSync(logPath, `[${new Date().toISOString()}] Starting verification for tx_ref: ${tx_ref}\n`);

        // 1. Call Chapa to verify
        const chapaResponse = await axios.get(
            `https://api.chapa.co/v1/transaction/verify/${tx_ref}`,
            {
                headers: {
                    Authorization: `Bearer ${CHAPA_SECRET_KEY}`
                }
            }
        );

        if (chapaResponse.data.status === 'success' && chapaResponse.data.data.status === 'success') {
            const data = chapaResponse.data.data;

            // Extract provider_id from tx_ref or query it
            const userId = tx_ref.split('-').pop();
            const profileQuery = await pool.query(
                "SELECT id FROM provider_profiles WHERE user_id = $1",
                [userId]
            );

            if (profileQuery.rows.length === 0) {
                return res.status(404).json({ message: "Provider profile not found during verification" });
            }

            const providerId = profileQuery.rows[0].id;

            // 2. Start transaction for DB update
            const client = await pool.connect();
            try {
                await client.query('BEGIN');

                // Check if payment already recorded
                const existingPayment = await client.query(
                    "SELECT id FROM payments WHERE tx_ref = $1",
                    [tx_ref]
                );

                if (existingPayment.rows.length === 0) {
                    // Insert payment record
                    await client.query(
                        `INSERT INTO payments (provider_id, tx_ref, amount, status, payment_method) 
                         VALUES ($1, $2, $3, $4, $5)`,
                        [providerId, tx_ref, data.amount, data.status, data.method || 'chapa']
                    );

                    // Update provider subscription
                    const expiryDate = new Date();
                    expiryDate.setDate(expiryDate.getDate() + 30);

                    await client.query(
                        `UPDATE provider_profiles 
                         SET subscription_status = 'active', 
                             subscription_expiry = $1 
                         WHERE id = $2`,
                        [expiryDate, providerId]
                    );

                    // 3. Notify Admin and Provider
                    try {
                        const { createNotification } = require('./notificationController');

                        // Notify Provider
                        await createNotification(
                            userId,
                            "Subscription Active",
                            `Your subscription is now active until ${expiryDate.toLocaleDateString()}. Your profile is visible!`,
                            "subscription",
                            "/provider"
                        );

                        // Notify Admin
                        const adminRes = await client.query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
                        if (adminRes.rows.length > 0) {
                            const providerNameRes = await client.query("SELECT name FROM users WHERE id = $1", [userId]);
                            const pName = providerNameRes.rows[0]?.name || "A provider";
                            await createNotification(
                                adminRes.rows[0].id,
                                "New Subscription Payment",
                                `${pName} has just paid their monthly subscription (${data.amount} ${data.currency}).`,
                                "payment",
                                "/admin/subscriptions"
                            );
                        }
                    } catch (notifErr) {
                        console.error("Failed to send verification notifications:", notifErr);
                    }
                }

                await client.query('COMMIT');
                fs.appendFileSync(logPath, `[${new Date().toISOString()}] Verification SUCCESS for tx_ref: ${tx_ref}\n`);
                res.json({ message: "Payment verified and subscription activated" });
            } catch (err) {
                await client.query('ROLLBACK');
                fs.appendFileSync(logPath, `[${new Date().toISOString()}] DB Transaction Error for ${tx_ref}: ${err.message}\n`);
                throw err;
            } finally {
                client.release();
            }
        } else {
            res.status(400).json({ message: "Payment verification failed", detail: chapaResponse.data });
        }

    } catch (error) {
        console.error("Chapa Verification Error:", error.response?.data || error.message);
        try {
            const fs = require('fs');
            const path = require('path');
            const logPath = path.join(process.cwd(), 'notif_error.log');
            fs.appendFileSync(logPath, `[${new Date().toISOString()}] Verification Error for ${tx_ref}: ${error.message}\nDetail: ${JSON.stringify(error.response?.data || {})}\n`);
        } catch (e) { }
        res.status(500).json({
            message: "Server error during payment verification",
            error: error.response?.data || error.message
        });
    }
};
