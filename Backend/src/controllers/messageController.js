const pool = require('../db');
const { uploadFile } = require('../utils/supabaseHelper');

function parseLegacyOrJsonMessage(raw) {
    if (raw === null || raw === undefined) return null;
    if (typeof raw !== 'string') return null;
    const trimmed = raw.trim();
    if (!trimmed) return null;

    if (trimmed.startsWith("__QS_PAYLOAD__")) {
        const payloadPart = trimmed.replace("__QS_PAYLOAD__", "");
        try {
            const payload = JSON.parse(payloadPart);
            const media = payload.media || null;
            return {
                type: media?.kind || (payload.location ? "location" : "text"),
                text: payload.text || "",
                media_url: media?.url || null,
                location: payload.location || null
            };
        } catch {
            return null;
        }
    }

    if (trimmed.startsWith("LOCATION:")) {
        const coords = trimmed.replace("LOCATION:", "").split(",");
        const lat = Number(coords[0]);
        const lng = Number(coords[1]);
        if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
            return { type: "location", text: "", media_url: null, location: { lat, lng, label: "Shared location" } };
        }
        return null;
    }

    try {
        const parsed = JSON.parse(trimmed);
        if (parsed && typeof parsed === 'object' && (parsed.type || parsed.media_url || parsed.location || parsed.text !== undefined)) {
            return {
                type: parsed.type || "text",
                text: parsed.text || "",
                media_url: parsed.media_url || null,
                location: parsed.location || null
            };
        }
        return null;
    } catch {
        return null;
    }
}

// messaging between customer and provider tied to a booking

exports.sendMessage = async (req, res) => {
    try {
        const userId = req.user.id;
        const { booking_id, content, location_lat, location_lng, location_label } = req.body;
        const mediaFile = req.file;

        const hasText = typeof content === "string" && content.trim().length > 0;
        const hasMedia = !!mediaFile;
        const hasLocation = location_lat !== undefined && location_lng !== undefined;

        if (!booking_id) {
            return res.status(400).json({ message: "booking_id is required" });
        }

        if (!hasText && !hasMedia && !hasLocation) {
            return res.status(400).json({ message: "Message must include text, media, or location" });
        }

        // query booking with provider user_id
        const bookingRes = await pool.query(
            `SELECT b.*, pp.user_id AS provider_user_id 
             FROM bookings b 
             JOIN provider_profiles pp ON b.provider_id = pp.id 
             WHERE b.id = $1`,
            [booking_id]
        );
        if (bookingRes.rows.length === 0) {
            return res.status(404).json({ message: "Booking not found" });
        }
        const booking = bookingRes.rows[0];

        // Status check: only accepted bookings
        if (booking.status !== 'accepted') {
            return res.status(403).json({ message: "Chat is only available for accepted bookings" });
        }

        // ensure sender is either customer or provider
        const isCustomer = booking.customer_id === userId;
        const isProvider = booking.provider_user_id === userId;
        if (!isCustomer && !isProvider) {
            return res.status(403).json({ message: "Forbidden" });
        }

        let messageType = 'text';
        let mediaUrl = null;
        let location = null;

        if (hasLocation) {
            const lat = Number(location_lat);
            const lng = Number(location_lng);
            if (Number.isNaN(lat) || Number.isNaN(lng)) {
                return res.status(400).json({ message: "Invalid location coordinates" });
            }
            messageType = 'location';
            location = { lat, lng, label: location_label || null };
        }

        if (hasMedia) {
            const isImage = mediaFile.mimetype?.startsWith('image/');
            const isVideo = mediaFile.mimetype?.startsWith('video/');
            if (!isImage && !isVideo) {
                return res.status(400).json({ message: "Only image and video files are allowed" });
            }
            mediaUrl = await uploadFile(
                mediaFile.buffer,
                mediaFile.mimetype,
                isImage ? 'chat-images' : 'chat-videos'
            );
            messageType = isImage ? 'image' : 'video';
        }

        const payload = {
            type: messageType,
            text: hasText ? content.trim() : "",
            media_url: mediaUrl,
            location
        };

        const insert = await pool.query(
            `INSERT INTO messages
             (booking_id, sender_id, message)
             VALUES ($1,$2,$3) RETURNING id, booking_id, sender_id, message AS content, created_at`,
            [booking_id, userId, JSON.stringify(payload)]
        );

        // Notify receiver
        const receiverId = isCustomer ? booking.provider_user_id : booking.customer_id;
        const { createNotification } = require('./notificationController');
        await createNotification(
            receiverId,
            "New Message",
            `You have a new message regarding your booking.`,
            'message',
            `/chat/${booking_id}`
        );

        const inserted = insert.rows[0];
        let parsedContent = payload;
        try {
            parsedContent = JSON.parse(inserted.content);
        } catch {
            // Keep fallback payload if parse fails unexpectedly.
        }
        res.status(201).json({
            message: "Message sent",
            messageObj: {
                ...inserted,
                content: parsedContent.text || "",
                message_type: parsedContent.type || "text",
                media_url: parsedContent.media_url || null,
                location: parsedContent.location || null
            }
        });
    } catch (error) {
        console.error("SendMessage Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.getConversations = async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;

        let query;
        let params = [userId];

        if (role === 'customer') {
            query = `
                SELECT DISTINCT ON (b.id)
                    b.id AS booking_id,
                    b.status AS booking_status,
                    s.title AS service_title,
                    u.name AS partner_name,
                    u.id AS partner_id,
                    m.message AS last_message,
                    m.created_at AS last_message_time,
                    (SELECT COUNT(*) FROM messages m2 WHERE m2.booking_id = b.id AND m2.sender_id != $1 AND m2.is_read = false) AS unread_count
                FROM bookings b
                JOIN services s ON b.service_id = s.id
                JOIN provider_profiles pp ON b.provider_id = pp.id
                JOIN users u ON pp.user_id = u.id
                LEFT JOIN messages m ON b.id = m.booking_id
                WHERE b.customer_id = $1
                ORDER BY b.id, m.created_at DESC
            `;
        } else if (role === 'provider') {
            query = `
                SELECT DISTINCT ON (b.id)
                    b.id AS booking_id,
                    b.status AS booking_status,
                    s.title AS service_title,
                    u.name AS partner_name,
                    u.id AS partner_id,
                    m.message AS last_message,
                    m.created_at AS last_message_time,
                    (SELECT COUNT(*) FROM messages m2 WHERE m2.booking_id = b.id AND m2.sender_id != $1 AND m2.is_read = false) AS unread_count
                FROM bookings b
                JOIN services s ON b.service_id = s.id
                JOIN users u ON b.customer_id = u.id
                JOIN provider_profiles pp ON b.provider_id = pp.id
                LEFT JOIN messages m ON b.id = m.booking_id
                WHERE pp.user_id = $1
                ORDER BY b.id, m.created_at DESC
            `;
        } else {
            return res.status(403).json({ message: "Role not supported for conversations" });
        }

        const conversations = await pool.query(query, params);

        // Sort by last message time (descending)
        const sortedConversations = conversations.rows.sort((a, b) => {
            const timeA = a.last_message_time ? new Date(a.last_message_time) : new Date(0);
            const timeB = b.last_message_time ? new Date(b.last_message_time) : new Date(0);
            return timeB - timeA;
        });

        const normalizedConversations = sortedConversations.map((conv) => {
            let lastMessage = conv.last_message;
            try {
                const parsed = parseLegacyOrJsonMessage(conv.last_message) || JSON.parse(conv.last_message);
                if (parsed?.type === 'image') {
                    lastMessage = '[Photo]';
                } else if (parsed?.type === 'video') {
                    lastMessage = '[Video]';
                } else if (parsed?.type === 'location') {
                    lastMessage = '[Location]';
                } else if (typeof parsed?.text === 'string') {
                    lastMessage = parsed.text;
                }
            } catch {
                // legacy plain-text message, keep as is
            }
            return { ...conv, last_message: lastMessage };
        });

        res.json(normalizedConversations);
    } catch (error) {
        console.error("Error in getConversations:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.getMessagesByBooking = async (req, res) => {
    try {
        const userId = req.user.id;
        const { booking_id } = req.params;

        if (!booking_id) {
            return res.status(400).json({ message: "booking_id is required" });
        }

        const bookingRes = await pool.query(
            `SELECT b.*, pp.user_id AS provider_user_id 
             FROM bookings b 
             JOIN provider_profiles pp ON b.provider_id = pp.id 
             WHERE b.id = $1`,
            [booking_id]
        );
        if (bookingRes.rows.length === 0) {
            return res.status(404).json({ message: "Booking not found" });
        }
        const booking = bookingRes.rows[0];

        if (booking.status === 'pending') {
            return res.status(403).json({ message: "Chat is not available for pending bookings" });
        }

        if (booking.customer_id !== userId && booking.provider_user_id !== userId) {
            return res.status(403).json({ message: "Forbidden" });
        }

        const messagesRes = await pool.query(
            `SELECT m.id, m.booking_id, m.sender_id, m.message AS content, m.created_at, u.name AS sender_name
             FROM messages m
             LEFT JOIN users u ON m.sender_id = u.id
             WHERE m.booking_id = $1
             ORDER BY m.created_at ASC`,
            [booking_id]
        );
        const normalizedMessages = messagesRes.rows.map((msg) => {
            const parsed = parseLegacyOrJsonMessage(msg.content);
            if (!parsed || typeof parsed !== 'object') {
                return {
                    ...msg,
                    content: msg.content,
                    message_type: 'text',
                    media_url: null,
                    location: null
                };
            }
            return {
                ...msg,
                content: parsed.text || '',
                message_type: parsed.type || 'text',
                media_url: parsed.media_url || null,
                location: parsed.location || null
            };
        });

        res.json(normalizedMessages);
    } catch (error) {
        console.error("GetMessagesByBooking Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.markMessagesAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const { booking_id } = req.params;

        if (!booking_id) {
            return res.status(400).json({ message: "booking_id is required" });
        }

        await pool.query(
            `UPDATE messages SET is_read = true WHERE booking_id = $1 AND sender_id != $2 AND is_read = false`,
            [booking_id, userId]
        );

        res.json({ message: "Marked as read" });
    } catch (error) {
        console.error("markMessagesAsRead Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};