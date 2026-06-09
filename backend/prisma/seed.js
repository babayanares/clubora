const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const path = require('path');

const adapter = new PrismaBetterSqlite3({ url: 'file:' + path.resolve(__dirname, '../../database/dev.db') });
const prisma = new PrismaClient({ adapter });

async function main() {
  const password = await bcrypt.hash('Admin123!', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@clubora.com' },
    update: { role: 'admin' },
    create: {
      email: 'admin@clubora.com',
      name: 'Clubora Admin',
      password,
      role: 'admin',
    },
  });
  console.log(`Admin user ready — id: ${admin.id}, email: ${admin.email}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
