const Notification = require('../models/Notification');

async function notifyUser(userId, { title, body, category, actionUrl }) {
  return Notification.create({
    user: userId,
    title,
    body,
    category,
    actionUrl,
  });
}

module.exports = { notifyUser };
