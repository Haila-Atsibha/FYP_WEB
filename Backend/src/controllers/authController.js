const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.registerUser = async (req, res) => {
    try {
        // multer stores files in memory, accessible via req.files
        const { name, email, password, role, categories } = req.body;

        // mandatory form fields
        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // make sure uploaded files exist
        if (
            !req.files ||
            !req.files.profileImage ||
            !req.files.nationalId ||
            !req.files.verificationSelfie
        ) {
            return res.status(400).json({ message: "All verification files are required" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // helper that uploads a buffer to Supabase and returns public URL
        const upload = require('../utils/supabaseHelper').uploadFile;

        const profileImageUrl = await upload(
            req.files.profileImage[0].buffer,
            req.files.profileImage[0].mimetype,
            'profile-images'
        );
        const nationalIdUrl = await upload(
            req.files.nationalId[0].buffer,
            req.files.nationalId[0].mimetype,
            'national-ids'
        );
        const verificationSelfieUrl = await upload(
            req.files.verificationSelfie[0].buffer,
            req.files.verificationSelfie[0].mimetype,
            'selfies'
        );

        const newUser = await pool.query(
            `INSERT INTO users 
                (name, email, password, role, status, profile_image_url, national_id_url, verification_selfie_url) 
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8) 
             RETURNING id, name, email, role, status, profile_image_url, national_id_url, verification_selfie_url`,
            [
                name,
                email,
                hashedPassword,
                role,
                'pending',
                profileImageUrl,
                nationalIdUrl,
                verificationSelfieUrl
            ]
        );

        const user = newUser.rows[0];

        // if provider, create profile and add categories
        if (role === 'provider') {
            // 1. Create mandatory provider profile
            await pool.query(
                "INSERT INTO provider_profiles (user_id, bio) VALUES ($1, $2)",
                [user.id, `Hi, I am ${name}`]
            );

            // Notify admins about new application
            const { createNotification } = require('./notificationController');
            const admins = await pool.query("SELECT id FROM users WHERE role = 'admin'");
            for (const admin of admins.rows) {
                await createNotification(
                    admin.id,
                    "New Provider Application",
                    `${name} has registered as a provider and is waiting for verification.`,
                    'verification',
                    '/admin/pending'
                );
            }

            // 2. Add categories if present
            // Multer/Express might send categories[] as the key
            let cats = categories || req.body['categories[]'];

            if (cats) {
                if (typeof cats === 'string') {
                    try {
                        cats = JSON.parse(cats);
                    } catch (e) {
                        // try splitting if it's a comma separated string
                        cats = cats.split(',').map((c) => c.trim());
                    }
                }

                // Ensure it's an array
                const catArray = Array.isArray(cats) ? cats : [cats];

                if (catArray.length > 0) {
                    const insertPromises = catArray.map((catId) => {
                        return pool.query(
                            "INSERT INTO provider_categories (provider_id, category_id) VALUES ($1, $2)",
                            [user.id, catId]
                        );
                    });
                    await Promise.all(insertPromises);
                }
            }

            // 3. Add educational documents if present
            const eduDocs = req.files.educationalDocuments || req.files['educationalDocuments[]'];
            if (eduDocs) {
                for (const file of eduDocs) {
                    try {
                        const docUrl = await upload(
                            file.buffer,
                            file.mimetype,
                            'educational-docs'
                        );
                        await pool.query(
                            "INSERT INTO provider_documents (provider_id, document_url, document_name) VALUES ($1, $2, $3)",
                            [user.id, docUrl, file.originalname]
                        );
                    } catch (uploadError) {
                        console.error(`Error uploading educational document ${file.originalname}:`, uploadError);
                        // We continue with other files even if one fails, or we could throw. 
                        // For registration, it's better to log and decide if it's fatal.
                        // Here we'll throw to ensure the user knows something went wrong.
                        throw uploadError;
                    }
                }
            }
        }

        res.status(201).json({
            message: "User registered successfully",
            user
        });

    } catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({ message: "Email already exists" });
        }
        console.error(error);
        res.status(500).json({ message: "Server error", error });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const userResult = await pool.query(
            "SELECT * FROM users WHERE email=$1",
            [email]
        );

        if (userResult.rows.length === 0) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const user = userResult.rows[0];

        // disallow login if account not yet approved by admin
        if (user.status === 'pending') {
            return res.status(403).json({
                message: "Account pending admin approval"
            });
        }

        if (user.status === 'rejected') {
            return res.status(403).json({
                message: `Account rejected: ${user.rejection_reason || 'No reason provided'}`
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                profile_image_url: user.profile_image_url
            }
        });

    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};
