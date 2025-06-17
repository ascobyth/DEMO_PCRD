const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Database configuration
const DB_NAME = 'smr_augment';
const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smr_augment';
const OUTPUT_DIR = path.join(__dirname, 'database-export');
const OUTPUT_FILE = `${DB_NAME}_export_${new Date().toISOString().split('T')[0]}.archive`;

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const outputPath = path.join(OUTPUT_DIR, OUTPUT_FILE);

console.log('Starting database export...');
console.log(`Database: ${DB_NAME}`);
console.log(`Output file: ${outputPath}`);

// Extract host and port from URI
let host = 'localhost';
let port = '27017';
let authString = '';

if (DB_URI.includes('@')) {
    // Has authentication
    const match = DB_URI.match(/mongodb:\/\/([^@]+)@([^:]+):(\d+)/);
    if (match) {
        authString = match[1];
        host = match[2];
        port = match[3];
    }
} else {
    // No authentication
    const match = DB_URI.match(/mongodb:\/\/([^:]+):(\d+)/);
    if (match) {
        host = match[1];
        port = match[2];
    }
}

// Build mongodump command
let command = `mongodump --host ${host} --port ${port} --db ${DB_NAME} --archive="${outputPath}" --gzip`;

// Add authentication if present
if (authString && authString.includes(':')) {
    const [username, password] = authString.split(':');
    command = `mongodump --host ${host} --port ${port} --username ${username} --password ${password} --db ${DB_NAME} --archive="${outputPath}" --gzip`;
}

console.log('Executing export command...');

exec(command, (error, stdout, stderr) => {
    if (error) {
        console.error('Export failed:', error.message);
        if (stderr) console.error('Error details:', stderr);
        process.exit(1);
    }

    if (stderr) {
        console.warn('Warnings:', stderr);
    }

    console.log('\n✅ Database export completed successfully!');
    console.log(`📁 Output file: ${outputPath}`);
    console.log(`📊 File size: ${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB`);
    console.log('\nTo import on another computer, use:');
    console.log(`mongorestore --archive="${OUTPUT_FILE}" --gzip`);
});