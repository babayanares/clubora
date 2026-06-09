const prisma = require('../lib/prisma');

const APPROVED_ONLY = { where: { status: 'approved' } };

async function createNotification(data) {
  try {
    await prisma.notification.create({ data });
  } catch (_) {
    // non-blocking — don't fail the main request if notification fails
  }
}

function parseInterests(raw) {
  if (!raw) return null;
  return raw.split(',').map((t) => t.trim()).filter(Boolean).join(',');
}

async function createClub(req, res) {
  const { name, description, category, location, interests, visibility } = req.body;
  const ownerId = req.user.userId;

  const trimmedName = typeof name === 'string' ? name.trim() : '';
  if (!trimmedName) return res.status(400).json({ error: 'Club name is required' });
  if (trimmedName.length < 3) return res.status(400).json({ error: 'Club name must be at least 3 characters' });
  if (trimmedName.length > 100) return res.status(400).json({ error: 'Club name must be under 100 characters' });
  if (description && description.length > 500) return res.status(400).json({ error: 'Description must be under 500 characters' });
  if (location && location.trim().length > 100) return res.status(400).json({ error: 'Location must be under 100 characters' });

  const parsedInterests = parseInterests(interests);
  if (!parsedInterests) return res.status(400).json({ error: 'At least one interest is required' });

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
    data: { userId: ownerId, clubId: club.id, role: 'admin', status: 'approved' },
  });

  res.status(201).json({ club });
}

async function getClubs(req, res) {
  const clubs = await prisma.club.findMany({
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
      _count: { select: { memberships: APPROVED_ONLY } },
    },
  });
  res.json({ clubs });
}

async function getClub(req, res) {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid club ID' });

  const club = await prisma.club.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true } },
      memberships: {
        select: {
          userId: true,
          role: true,
          status: true,
          user: { select: { id: true, name: true } },
        },
      },
      _count: { select: { memberships: APPROVED_ONLY } },
    },
  });

  if (!club) return res.status(404).json({ error: 'Club not found' });

  res.json({ club });
}

async function joinClub(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid club ID' });

    const club = await prisma.club.findUnique({
      where: { id },
      select: { id: true, visibility: true, name: true, ownerId: true },
    });
    if (!club) return res.status(404).json({ error: 'Club not found' });

    const existing = await prisma.membership.findUnique({
      where: { userId_clubId: { userId: req.user.userId, clubId: id } },
    });
    if (existing) return res.status(409).json({ error: 'You are already a member of this club' });

    const isPrivate = club.visibility === 'private';
    const status = isPrivate ? 'pending' : 'approved';

    const membership = await prisma.membership.create({
      data: { userId: req.user.userId, clubId: id, role: 'member', status },
      select: { userId: true, clubId: true, role: true, status: true, joinedAt: true },
    });

    const memberCount = await prisma.membership.count({
      where: { clubId: id, status: 'approved' },
    });

    if (isPrivate) {
      const requester = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { name: true },
      });
      await createNotification({
        type: 'join_request',
        userId: club.ownerId,
        clubId: id,
        clubName: club.name,
        fromUserId: req.user.userId,
        fromUserName: requester?.name || 'Unknown',
      });
    }

    const statusCode = isPrivate ? 202 : 201;
    res.status(statusCode).json({ membership, memberCount, pending: isPrivate });
  } catch (err) {
    next(err);
  }
}

async function leaveClub(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid club ID' });

    const club = await prisma.club.findUnique({ where: { id }, select: { id: true } });
    if (!club) return res.status(404).json({ error: 'Club not found' });

    const membership = await prisma.membership.findUnique({
      where: { userId_clubId: { userId: req.user.userId, clubId: id } },
    });
    if (!membership) return res.status(404).json({ error: 'You are not a member of this club' });
    if (membership.role === 'admin') return res.status(403).json({ error: 'Club owners cannot leave their own club' });

    await prisma.membership.delete({
      where: { userId_clubId: { userId: req.user.userId, clubId: id } },
    });

    const memberCount = await prisma.membership.count({
      where: { clubId: id, status: 'approved' },
    });

    res.json({ memberCount });
  } catch (err) {
    next(err);
  }
}

async function approveRequest(req, res, next) {
  try {
    const clubId = parseInt(req.params.id, 10);
    const userId = parseInt(req.params.userId, 10);
    if (isNaN(clubId) || isNaN(userId)) return res.status(400).json({ error: 'Invalid ID' });

    const club = await prisma.club.findUnique({ where: { id: clubId }, select: { id: true, ownerId: true, name: true } });
    if (!club) return res.status(404).json({ error: 'Club not found' });
    if (club.ownerId !== req.user.userId) return res.status(403).json({ error: 'Only the club owner can do this' });

    const membership = await prisma.membership.findUnique({
      where: { userId_clubId: { userId, clubId } },
    });
    if (!membership || membership.status !== 'pending') {
      return res.status(404).json({ error: 'Join request not found' });
    }

    const updated = await prisma.membership.update({
      where: { userId_clubId: { userId, clubId } },
      data: { status: 'approved' },
      select: { userId: true, clubId: true, role: true, status: true },
    });

    const memberCount = await prisma.membership.count({
      where: { clubId, status: 'approved' },
    });

    const owner = await prisma.user.findUnique({ where: { id: req.user.userId }, select: { name: true } });
    await createNotification({
      type: 'request_approved',
      userId,
      clubId,
      clubName: club.name,
      fromUserId: req.user.userId,
      fromUserName: owner?.name || 'Club Owner',
    });

    // Mark the owner's join_request notification as read and convert to history record
    await prisma.notification.updateMany({
      where: { userId: req.user.userId, type: 'join_request', clubId, fromUserId: userId },
      data: { read: true, type: 'join_request_owner_approved' },
    });

    res.json({ membership: updated, memberCount });
  } catch (err) {
    next(err);
  }
}

async function rejectRequest(req, res, next) {
  try {
    const clubId = parseInt(req.params.id, 10);
    const userId = parseInt(req.params.userId, 10);
    if (isNaN(clubId) || isNaN(userId)) return res.status(400).json({ error: 'Invalid ID' });

    const club = await prisma.club.findUnique({ where: { id: clubId }, select: { id: true, ownerId: true, name: true } });
    if (!club) return res.status(404).json({ error: 'Club not found' });
    if (club.ownerId !== req.user.userId) return res.status(403).json({ error: 'Only the club owner can do this' });

    const membership = await prisma.membership.findUnique({
      where: { userId_clubId: { userId, clubId } },
    });
    if (!membership || membership.status !== 'pending') {
      return res.status(404).json({ error: 'Join request not found' });
    }

    await prisma.membership.delete({
      where: { userId_clubId: { userId, clubId } },
    });

    const owner = await prisma.user.findUnique({ where: { id: req.user.userId }, select: { name: true } });
    await createNotification({
      type: 'request_rejected',
      userId,
      clubId,
      clubName: club.name,
      fromUserId: req.user.userId,
      fromUserName: owner?.name || 'Club Owner',
    });

    // Mark the owner's join_request notification as read and convert to history record
    await prisma.notification.updateMany({
      where: { userId: req.user.userId, type: 'join_request', clubId, fromUserId: userId },
      data: { read: true, type: 'join_request_owner_rejected' },
    });

    res.json({ message: 'Request rejected' });
  } catch (err) {
    next(err);
  }
}

async function updateClub(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid club ID' });

    const club = await prisma.club.findUnique({ where: { id }, select: { id: true, ownerId: true } });
    if (!club) return res.status(404).json({ error: 'Club not found' });
    if (club.ownerId !== req.user.userId) return res.status(403).json({ error: 'Only the club owner can do this' });

    const { name, description, category, location, interests, visibility } = req.body;

    const trimmedName = typeof name === 'string' ? name.trim() : '';
    if (!trimmedName) return res.status(400).json({ error: 'Club name is required' });
    if (trimmedName.length < 3) return res.status(400).json({ error: 'Club name must be at least 3 characters' });
    if (trimmedName.length > 100) return res.status(400).json({ error: 'Club name must be under 100 characters' });
    if (description && description.length > 500) return res.status(400).json({ error: 'Description must be under 500 characters' });
    if (location && location.trim().length > 100) return res.status(400).json({ error: 'Location must be under 100 characters' });

    const parsedInterests = parseInterests(interests);
    if (!parsedInterests) return res.status(400).json({ error: 'At least one interest is required' });

    const updated = await prisma.club.update({
      where: { id },
      data: {
        name: trimmedName,
        description: description ? description.trim() : null,
        category: category ? category.trim() : null,
        location: location ? location.trim() : null,
        interests: parsedInterests,
        visibility: visibility === 'private' ? 'private' : 'public',
      },
    });

    res.json({ club: updated });
  } catch (err) {
    next(err);
  }
}

async function deleteClub(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid club ID' });

    const club = await prisma.club.findUnique({ where: { id }, select: { id: true, ownerId: true } });
    if (!club) return res.status(404).json({ error: 'Club not found' });
    if (club.ownerId !== req.user.userId) return res.status(403).json({ error: 'Only the club owner can do this' });

    await prisma.post.deleteMany({ where: { clubId: id } });
    await prisma.membership.deleteMany({ where: { clubId: id } });
    await prisma.club.delete({ where: { id } });

    res.json({ message: 'Club deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { createClub, getClubs, getClub, joinClub, leaveClub, approveRequest, rejectRequest, updateClub, deleteClub };
