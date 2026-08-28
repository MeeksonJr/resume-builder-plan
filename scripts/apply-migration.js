const fs = require('fs');
const path = require('path');
const postgres = require('postgres');

// Parse .env file
const envPath = path.join(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
        let val = match[2] || '';
        if (val.startsWith('"') && val.endsWith('"')) {
            val = val.slice(1, -1);
        } else if (val.startsWith("'") && val.endsWith("'")) {
            val = val.slice(1, -1);
        }
        env[match[1]] = val.trim();
    }
});

const connectionString = env.POSTGRES_URL_NON_POOLING;
if (!connectionString) {
    console.error('Error: POSTGRES_URL_NON_POOLING not found in .env');
    process.exit(1);
}

const sqlPath = path.join(__dirname, '../supabase/migrations/030_user_api_keys.sql');
const sqlContent = fs.readFileSync(sqlPath, 'utf8');

const sql = postgres(connectionString, { ssl: 'require' });

async function main() {
    console.log('Applying migration 030_user_api_keys.sql to Supabase DB...');
    try {
        await sql.unsafe(sqlContent);
        console.log('Migration successfully applied!');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await sql.end();
    }
}

main();
