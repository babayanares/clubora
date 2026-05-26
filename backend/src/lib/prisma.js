const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const path = require('path');

// __dirname here is backend/src/lib — three levels up reaches the project root
const dbPath = path.resolve(__dirname, '../../../database/dev.db');
const adapter = new PrismaBetterSqlite3({ url: 'file:' + dbPath });

const prisma = new PrismaClient({ adapter });

module.exports = prisma;
