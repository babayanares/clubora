const prisma = require('../lib/prisma');

function parseInterests(raw) {
  if (!raw) return null;
  return raw
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
    .join(',');
}

async function createClub(req, res) {
  const { name, description, category, location, interests, visibility } = req.body;
  const ownerId = req.user.userId;

  const trimmedName = typeof name === 'string' ? name.trim() : '';
  if (!trimmedName) {
    return res.status(400).json({ error: 'Club name is required' });
  }
  if (trimmedName.length < 3) {
    return res.status(400).json({ error: 'Club name must be at least 3 characters' });
  }
  if (trimmedName.length > 100) {
    return res.status(400).json({ error: 'Club name must be under 100 characters' });
  }
  if (description && description.length > 500) {
    return res.status(400).json({ error: 'Description must be under 500 characters' });
  }

  const parsedInterests = parseInterests(interests);
  if (!parsedInterests) {
    return res.status(400).json({ error: 'At least one interest is required' });
  }

  const safeVisibility = visibility === 'private' ? 'private' : 'public';

  const club = await prisma.club.create({
    data: {
      name: trimmedName,
      description: description ? description.trim() : null,
      category: category ? category.trim() : null,
      location: location ? location.trim() : null,
      interests: parsedInterests,
      visibility: safeVisibility,
      ownerId,
    },
  });

  await prisma.membership.create({
    data: { userId: ownerId, clubId: club.id, role: 'admin' },
  });

  res.status(201).json({ club });
}

async function getClubs(req, res) {
  const clubs = await prisma.club.findMany({
    where: { visibility: 'public' },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      description: true,
      category: true,
      location: true,
      interests: true,
      visibility: true,
      createdAt: true,
      ownerId: true,
      _count: { select: { memberships: true } },
    },
  });
  res.json({ clubs });
}

async function getClub(req, res) {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid club ID' });
  }

  const club = await prisma.club.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true } },
      memberships: { select: { userId: true, role: true } },
      _count: { select: { memberships: true } },
    },
  });

  if (!club) {
    return res.status(404).json({ error: 'Club not found' });
  }

  res.json({ club });
}

async function joinClub(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid club ID' });

    const club = await prisma.club.findUnique({
      where: { id },
      select: { id: true, visibility: true },
    });
    if (!club) return res.status(404).json({ error: 'Club not found' });
    if (club.visibility === 'private') return res.status(403).json({ error: 'This club is private' });

    const existing = await prisma.membership.findUnique({
      where: { userId_clubId: { userId: req.user.userId, clubId: id } },
    });
    if (existing) return res.status(409).json({ error: 'You are already a member of this club' });

    const membership = await prisma.membership.create({
      data: { userId: req.user.userId, clubId: id, role: 'member' },
      select: { userId: true, clubId: true, role: true, joinedAt: true },
    });

    const memberCount = await prisma.membership.count({ where: { clubId: id } });

    res.status(201).json({ membership, memberCount });
  } catch (err) {
    next(err);
  }
}

async function leaveClub(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid club ID' });

    const club = await prisma.club.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!club) return res.status(404).json({ error: 'Club not found' });

    const membership = await prisma.membership.findUnique({
      where: { userId_clubId: { userId: req.user.userId, clubId: id } },
    });
    if (!membership) return res.status(404).json({ error: 'You are not a member of this club' });
    if (membership.role === 'admin') return res.status(403).json({ error: 'Club owners cannot leave their own club' });

    await prisma.membership.delete({
      where: { userId_clubId: { userId: req.user.userId, clubId: id } },
    });

    const memberCount = await prisma.membership.count({ where: { clubId: id } });

    res.json({ memberCount });
  } catch (err) {
    next(err);
  }
}

module.exports = { createClub, getClubs, getClub, joinClub, leaveClub };
