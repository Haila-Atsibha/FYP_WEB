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

const safeStringify = (obj, maxLen = 2000) => {
    try {
        const str = JSON.stringify(obj);
        if (str.length <= maxLen) return str;
        return str.slice(0, maxLen) + `... [truncated ${str.length - maxLen} chars]`;
    } catch {
        return "[unserializable]";
    }
};

const logFaceppDebug = (context, payload) => {
    // Never log API keys/secrets. We only log Face++ response metadata.
    console.warn(`[Face++ Debug] ${context}: ${safeStringify(payload)}`);
};

const inferNoConfidenceReason = (data) => {
    const faces1Count = Array.isArray(data?.faces1) ? data.faces1.length : null;
    const faces2Count = Array.isArray(data?.faces2) ? data.faces2.length : null;

    // Face++ compare normally returns faces1/faces2 arrays. When it doesn't, we can only say payload was unexpected.
    if (faces1Count === null || faces2Count === null) {
        return "Face++ returned an unexpected response (no faces array).";
    }

    if (faces1Count === 0 && faces2Count === 0) {
        return "No face detected in both ID image and selfie.";
    }
    if (faces1Count === 0) {
        return "No face detected in the ID image.";
    }
    if (faces2Count === 0) {
        return "No face detected in the selfie.";
    }
    if (faces1Count > 1 && faces2Count > 1) {
        return "Multiple faces detected in both ID image and selfie.";
    }
    if (faces1Count > 1) {
        return "Multiple faces detected in the ID image.";
    }
    if (faces2Count > 1) {
        return "Multiple faces detected in the selfie.";
    }

    // If we have faces but no confidence, still unusual.
    return "Face++ detected faces but did not return a confidence score.";
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
        logFaceppDebug("error_message returned", {
            error_message: response.data.error_message,
            request_id: response.data.request_id,
            time_used: response.data.time_used
        });
        return {
            status: 'manual_review',
            score: null,
            message: `Face++ error: ${response.data.error_message}`,
            provider: 'facepp'
        };
    }

    const confidence = toFloatOrNull(response.data?.confidence);
    if (confidence === null) {
        // This is the case you asked about: Face++ responded but no usable confidence was returned.
        // Log a sanitized subset of the payload to understand why.
        logFaceppDebug("missing/invalid confidence", {
            request_id: response.data?.request_id,
            time_used: response.data?.time_used,
            confidence: response.data?.confidence ?? null,
            thresholds: response.data?.thresholds ?? null,
            faces1: Array.isArray(response.data?.faces1) ? response.data.faces1.length : response.data?.faces1 ?? null,
            faces2: Array.isArray(response.data?.faces2) ? response.data.faces2.length : response.data?.faces2 ?? null,
            // include full payload but truncated
            raw: response.data
        });
        const inferred = inferNoConfidenceReason(response.data);
        const requestId = response.data?.request_id;
        return {
            status: 'manual_review',
            score: null,
            message: `Manual review required: ${inferred}${requestId ? ` (Face++ request_id: ${requestId})` : ''}`,
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
