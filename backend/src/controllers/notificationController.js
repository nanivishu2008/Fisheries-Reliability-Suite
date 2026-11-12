import { Notification } from '../models/Notification.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getNotifications = async (req, res, next) => {
  try {
    const { limit = 30 } = req.query;

    const query = {
      $or: [
        { recipientId: req.user._id },
        { roleTarget: req.user.role },
        { recipientId: null, roleTarget: '' },
      ],
    };

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10));

    const unreadCount = await Notification.countDocuments({ ...query, isRead: false });

    return sendSuccess(res, { notifications, unreadCount }, 'Notifications retrieved');
  } catch (err) {
    next(err);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return sendError(res, 'Notification not found', 404);

    notification.isRead = true;
    await notification.save();

    return sendSuccess(res, { notification }, 'Notification marked as read');
  } catch (err) {
    next(err);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      {
        $or: [
          { recipientId: req.user._id },
          { roleTarget: req.user.role },
          { recipientId: null, roleTarget: '' },
        ],
        isRead: false,
      },
      { $set: { isRead: true } }
    );

    return sendSuccess(res, {}, 'All notifications marked as read');
  } catch (err) {
    next(err);
  }
};

export const deleteNotification = async (req, res, next) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    return sendSuccess(res, {}, 'Notification removed');
  } catch (err) {
    next(err);
  }
};
