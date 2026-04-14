const mongoose = require('mongoose');
const Notification = require('../models/Notification');

function toObjectId(id) {
  if (id == null || id === '') return id;
  return id instanceof mongoose.Types.ObjectId ? id : new mongoose.Types.ObjectId(String(id));
}

/**
 * In-app notification only (no outbound email).
 * The targeted user sees this via GET .../notifications for their role.
 */
async function notifyUser(userId, { title, body, category, actionUrl }) {
  return Notification.create({
    user: toObjectId(userId),
    title,
    body,
    category,
    actionUrl,
  });
}

module.exports = { notifyUser };
