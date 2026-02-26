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

        // if provider add categories
        if (role === 'provider' && categories) {
            let cats = categories;
            if (typeof cats === 'string') {
                try {
                    cats = JSON.parse(cats);
                } catch (e) {
                    // string of comma-separated ids
                    cats = cats.split(',').map((c) => c.trim());
                }
            }
            if (Array.isArray(cats) && cats.length > 0) {
                const insertPromises = cats.map((catId) => {
                    return pool.query(
                        "INSERT INTO provider_categories (provider_id, category_id) VALUES ($1, $2)",
                        [user.id, catId]
                    );
                });
                await Promise.all(insertPromises);
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
        if (user.status !== 'approved') {
            return res.status(403).json({
                message: "Account pending admin approval"
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
                status: user.status
            }
        });

    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};
