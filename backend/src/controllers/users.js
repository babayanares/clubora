const prisma = require('../lib/prisma');

async function getProfile(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid user ID' });

    if (req.user.userId !== id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        location: true,
        interests: true,
        createdAt: true,
        memberships: {
          select: {
            role: true,
            joinedAt: true,
            club: {
              select: {
                id: true,
                name: true,
                category: true,
                visibility: true,
                _count: { select: { memberships: true } },
              },
            },
          },
          orderBy: { joinedAt: 'desc' },
        },
      },
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ user });
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid user ID' });

    if (req.user.userId !== id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { name, bio, location, interests } = req.body;

    const trimmedName = (name || '').trim();
    if (!trimmedName) return res.status(400).json({ error: 'Name is required' });
    if (trimmedName.length < 2) return res.status(400).json({ error: 'Name must be at least 2 characters' });
    if (trimmedName.length > 100) return res.status(400).json({ error: 'Name cannot exceed 100 characters' });

    const trimmedBio = bio !== undefined ? bio.trim() : undefined;
    if (trimmedBio !== undefined && trimmedBio.length > 300) {
      return res.status(400).json({ error: 'Bio cannot exceed 300 characters' });
    }

    const trimmedLocation = location !== undefined ? location.trim() : undefined;
    if (trimmedLocation !== undefined && trimmedLocation.length > 100) {
      return res.status(400).json({ error: 'Location cannot exceed 100 characters' });
    }

    let parsedInterests = undefined;
    if (interests !== undefined) {
      const tags = [...new Set((interests || '').split(',').map((t) => t.trim().toLowerCase()).filter(Boolean))];
      if (tags.length > 20) {
        return res.status(400).json({ error: 'You can add up to 20 interest tags' });
      }
      const tooLong = tags.find((t) => t.length > 50);
      if (tooLong) {
        return res.status(400).json({ error: 'Each interest tag must be 50 characters or fewer' });
      }
      parsedInterests = tags.length > 0 ? tags.join(',') : null;
    }

    const data = { name: trimmedName };
    if (trimmedBio !== undefined) data.bio = trimmedBio || null;
    if (trimmedLocation !== undefined) data.location = trimmedLocation || null;
    if (parsedInterests !== undefined) data.interests = parsedInterests;

    const user = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, bio: true, location: true, interests: true },
    });

    res.json({ user });
  } catch (err) {
    next(err);
  }
}

module.exports = { getProfile, updateProfile };
