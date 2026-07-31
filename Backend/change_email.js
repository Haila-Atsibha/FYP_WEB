require('dotenv').config();
const pool = require('./src/db');

const oldEmail = process.argv[2];
const newEmail = process.argv[3];

if (!oldEmail || !newEmail) {
    console.error("Error: Please provide both the old email and the new email.");
    console.log("Usage: node change_email.js <old_email> <new_email>");
    process.exit(1);
}

async function changeEmail() {
    try {
        console.log(`Attempting to update email from "${oldEmail}" to "${newEmail}"...`);
        const result = await pool.query(
            "UPDATE users SET email = $1 WHERE email = $2 RETURNING id, name, email, role",
            [newEmail, oldEmail]
        );

        if (result.rows.length === 0) {
            console.log(`No user found with the email: ${oldEmail}`);
        } else {
            console.log("Success! Updated user details:");
            console.log(result.rows[0]);
        }
    } catch (err) {
        console.error("Database error occurred while updating email:", err.message);
    } finally {
        await pool.end();
    }
}

changeEmail();
