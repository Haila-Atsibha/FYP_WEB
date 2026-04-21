const axios = require('axios');
const pool = require('../db');

let columnsEnsured = false;

const ensureVerificationColumns = async () => {
    if (columnsEnsured) return;

    await pool.query(`
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS ai_verification_status VARCHAR(30),
        ADD COLUMN IF NOT EXISTS ai_verification_score NUMERIC,
        ADD COLUMN IF NOT EXISTS ai_verification_message TEXT,
        ADD COLUMN IF NOT EXISTS ai_verification_provider VARCHAR(50),
        ADD COLUMN IF NOT EXISTS ai_verification_checked_at TIMESTAMP;
    `);

    columnsEnsured = true;
};

const toFloatOrNull = (value) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : null;
};

const verifyWithFacePlusPlus = async (idImageUrl, selfieUrl) => {
    const apiKey = process.env.FACEPP_API_KEY;
    const apiSecret = process.env.FACEPP_API_SECRET;
    const minConfidence = Number(process.env.FACE_MATCH_MIN_CONFIDENCE || 75);

    if (!apiKey || !apiSecret) {
        return {
            status: 'manual_review',
            score: null,
            message: 'Face API keys are missing; manual review is required.',
            provider: 'facepp'
        };
    }

    const body = new URLSearchParams();
    body.append('api_key', apiKey);
    body.append('api_secret', apiSecret);
    body.append('image_url1', idImageUrl);
    body.append('image_url2', selfieUrl);

    const response = await axios.post(
        'https://api-us.faceplusplus.com/facepp/v3/compare',
        body.toString(),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: 15000 }
    );

    if (response.data?.error_message) {
        return {
            status: 'manual_review',
            score: null,
            message: `Face++ error: ${response.data.error_message}`,
            provider: 'facepp'
        };
    }

    const confidence = toFloatOrNull(response.data?.confidence);
    if (confidence === null) {
        return {
            status: 'manual_review',
            score: null,
            message: 'Face comparison did not return a confidence score.',
            provider: 'facepp'
        };
    }

    return {
        status: confidence >= minConfidence ? 'matched' : 'not_matched',
        score: confidence,
        message: confidence >= minConfidence
            ? `AI face check passed with confidence ${confidence.toFixed(2)}%.`
            : `AI face check failed with confidence ${confidence.toFixed(2)}% (required ${minConfidence}%).`,
        provider: 'facepp'
    };
};

const verifyRegistrationFaces = async ({ nationalIdUrl, verificationSelfieUrl }) => {
    try {
        const idImageUrls = (nationalIdUrl || '')
            .split(',')
            .map((url) => url.trim())
            .filter(Boolean);

        if (idImageUrls.length === 0 || !verificationSelfieUrl) {
            return {
                status: 'manual_review',
                score: null,
                message: 'Missing ID image or selfie for AI verification.',
                provider: 'none'
            };
        }

        const provider = (process.env.FACE_VERIFICATION_PROVIDER || 'facepp').toLowerCase();
        if (provider !== 'facepp') {
            return {
                status: 'manual_review',
                score: null,
                message: `Unsupported face verification provider: ${provider}.`,
                provider
            };
        }

        // Compare selfie against each uploaded ID image (front/back) and keep best result.
        let bestResult = null;
        for (const idImageUrl of idImageUrls) {
            const result = await verifyWithFacePlusPlus(idImageUrl, verificationSelfieUrl);

            if (!bestResult) {
                bestResult = result;
                continue;
            }

            if ((result.score ?? -1) > (bestResult.score ?? -1)) {
                bestResult = result;
            }
        }

        return bestResult || {
            status: 'manual_review',
            score: null,
            message: 'AI verification returned no usable result.',
            provider: process.env.FACE_VERIFICATION_PROVIDER || 'facepp'
        };
    } catch (error) {
        console.error('AI face verification failed:', error.message);
        return {
            status: 'error',
            score: null,
            message: 'AI verification failed due to an internal error. Manual review required.',
            provider: process.env.FACE_VERIFICATION_PROVIDER || 'facepp'
        };
    }
};

module.exports = {
    ensureVerificationColumns,
    verifyRegistrationFaces
};
