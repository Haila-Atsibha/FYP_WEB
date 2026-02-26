require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnoseStorage() {
    console.log("--- Supabase Storage Diagnostics ---");
    console.log("URL:", supabaseUrl);
    console.log("Key Length:", supabaseKey?.length);
    console.log("Target Bucket:", process.env.SUPABASE_BUCKET || 'QuickServe_files');

    try {
        console.log("\n1. Listing all buckets...");
        const { data: buckets, error: listError } = await supabase.storage.listBuckets();

        if (listError) {
            console.error("❌ Error listing buckets:", listError.message);
            console.error("This often means the API key lacks storage permissions (need Service Role key for management).");
        } else {
            console.log("✅ Successfully connected to Storage.");
            console.log("Available buckets:", buckets.map(b => b.name));

            const target = process.env.SUPABASE_BUCKET || 'QuickServe_files';
            const found = buckets.find(b => b.name === target);
            if (found) {
                console.log(`✅ Found target bucket: ${target}`);
                console.log(`   Public: ${found.public}`);
            } else {
                console.log(`❌ Target bucket '${target}' NOT found in the list above.`);
            }
        }

        console.log("\n2. Attempting a small test upload...");
        const testBuffer = Buffer.from("test content");
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from(process.env.SUPABASE_BUCKET || 'QuickServe_files')
            .upload(`test-${Date.now()}.txt`, testBuffer, { contentType: 'text/plain' });

        if (uploadError) {
            console.error("❌ Upload test failed:", uploadError.message);
            console.error("Error details:", JSON.stringify(uploadError, null, 2));
        } else {
            console.log("✅ Upload test successful!");
            console.log("Path:", uploadData.path);
        }

    } catch (err) {
        console.error("Unexpected error during diagnostics:", err);
    }
}

diagnoseStorage();
