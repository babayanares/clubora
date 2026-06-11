const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const path = require('path');

// Use DATABASE_URL when set (production); fall back to local path for dev
const dbUrl = process.env.DATABASE_URL
  || ('file:' + path.resolve(__dirname, '../../../database/dev.db'));

const adapter = new PrismaBetterSqlite3({ url: dbUrl });

const prisma = new PrismaClient({ adapter });

module.exports = prisma;
