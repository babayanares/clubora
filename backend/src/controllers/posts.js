const prisma = require('../lib/prisma');

async function getPosts(req, res, next) {
  try {
    const clubId = parseInt(req.params.id, 10);
    if (isNaN(clubId)) return res.status(400).json({ error: 'Invalid club ID' });

    const club = await prisma.club.findUnique({ where: { id: clubId }, select: { id: true } });
    if (!club) return res.status(404).json({ error: 'Club not found' });

    const posts = await prisma.post.findMany({
      where: { clubId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        content: true,
        createdAt: true,
        author: { select: { id: true, name: true } },
      },
    });

    res.json({ posts });
  } catch (err) {
    next(err);
  }
}

async function createPost(req, res, next) {
  try {
    const clubId = parseInt(req.params.id, 10);
    if (isNaN(clubId)) return res.status(400).json({ error: 'Invalid club ID' });

    const club = await prisma.club.findUnique({ where: { id: clubId }, select: { id: true } });
    if (!club) return res.status(404).json({ error: 'Club not found' });

    const membership = await prisma.membership.findUnique({
      where: { userId_clubId: { userId: req.user.userId, clubId } },
    });
    if (!membership) return res.status(403).json({ error: 'You must be a member to post' });

    const content = (req.body.content || '').trim();
    if (!content) return res.status(400).json({ error: 'Post content is required' });
    if (content.length > 1000) return res.status(400).json({ error: 'Post content cannot exceed 1000 characters' });

    const post = await prisma.post.create({
      data: { content, authorId: req.user.userId, clubId },
      select: {
        id: true,
        content: true,
        createdAt: true,
        author: { select: { id: true, name: true } },
      },
    });

    res.status(201).json({ post });
  } catch (err) {
    next(err);
  }
}

module.exports = { getPosts, createPost };
