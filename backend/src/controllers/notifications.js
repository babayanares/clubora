const prisma = require('../lib/prisma');

async function getNotifications(req, res, next) {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        type: true,
        read: true,
        createdAt: true,
        clubId: true,
        clubName: true,
        fromUserId: true,
        fromUserName: true,
      },
    });

    const unreadCount = notifications.filter((n) => !n.read).length;
    res.json({ notifications, unreadCount });
  } catch (err) {
    next(err);
  }
}

async function markAllRead(req, res, next) {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.userId, read: false },
      data: { read: true },
    });
    res.json({ message: 'Notifications marked as read' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getNotifications, markAllRead };
