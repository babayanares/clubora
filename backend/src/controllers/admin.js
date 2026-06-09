const prisma = require('../lib/prisma');

const APPROVED_ONLY = { where: { status: 'approved' } };

async function getStats(req, res, next) {
  try {
    const [userCount, clubCount, postCount, membershipCount] = await Promise.all([
      prisma.user.count(),
      prisma.club.count(),
      prisma.post.count(),
      prisma.membership.count({ where: { status: 'approved' } }),
    ]);
    res.json({ stats: { userCount, clubCount, postCount, membershipCount } });
  } catch (err) {
    next(err);
  }
}

async function getAdminClubs(req, res, next) {
  try {
    const clubs = await prisma.club.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        visibility: true,
        createdAt: true,
        owner: { select: { id: true, name: true, email: true } },
        _count: {
          select: {
            memberships: APPROVED_ONLY,
            posts: true,
          },
        },
      },
    });
    res.json({ clubs });
  } catch (err) {
    next(err);
  }
}

async function deleteAdminClub(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid club ID' });

    const club = await prisma.club.findUnique({ where: { id }, select: { id: true } });
    if (!club) return res.status(404).json({ error: 'Club not found' });

    await prisma.post.deleteMany({ where: { clubId: id } });
    await prisma.membership.deleteMany({ where: { clubId: id } });
    await prisma.club.delete({ where: { id } });

    res.json({ message: 'Club deleted' });
  } catch (err) {
    next(err);
  }
}

async function getAdminUsers(req, res, next) {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            ownedClubs: true,
            memberships: APPROVED_ONLY,
          },
        },
      },
    });
    res.json({ users });
  } catch (err) {
    next(err);
  }
}

module.exports = { getStats, getAdminClubs, deleteAdminClub, getAdminUsers };
