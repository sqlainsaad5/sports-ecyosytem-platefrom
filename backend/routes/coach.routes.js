const { Router } = require('express');
const { body, param } = require('express-validator');
const c = require('../controllers/coachController');
const { authenticate, requireRole, loadUser } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { validateRequest } = require('../middleware/validate');

const r = Router();
r.use(authenticate, loadUser, requireRole('coach'));

r.get('/me/profile', c.getProfile);
r.put('/me/profile', c.updateProfile);
r.put('/me/availability', c.updateAvailability);
r.get('/training-requests', c.listTrainingRequests);
r.patch(
  '/training-requests/:id',
  [
    body('status').isIn(['accepted', 'rejected', 'pending']),
    body('scheduledAt').optional().isISO8601(),
  ],
  validateRequest,
  c.updateTrainingRequest
);
r.get('/training-sessions', c.listTrainingSessions);
r.post(
  '/training-plans',
  [
    body('player').isMongoId().withMessage('Valid player user id required'),
    body('weekStartDate').notEmpty(),
  ],
  validateRequest,
  c.createTrainingPlan
);
r.get('/training-plans', c.listTrainingPlans);
r.put('/training-plans/:id', c.updateTrainingPlan);
r.post(
  '/sessions/:sessionId/attendance',
  [param('sessionId').isMongoId(), body('present').isBoolean()],
  validateRequest,
  c.markAttendance
);
r.post(
  '/performance',
  [
    body('playerId').notEmpty(),
    body('weekStartDate').notEmpty(),
    body('technique').optional().isFloat({ min: 0, max: 100 }),
    body('fitness').optional().isFloat({ min: 0, max: 100 }),
    body('attitude').optional().isFloat({ min: 0, max: 100 }),
  ],
  c.addPerformance
);
r.get('/players/:playerId/progress', c.getPlayerProgress);
r.get('/ground-bookings', c.listCoachGroundBookings);
r.get('/feedback', c.listFeedback);
r.post('/feedback/:id/reply', [body('reply').notEmpty()], c.replyFeedback);
r.get('/payments', c.listPayments);
r.get('/notifications', c.listNotifications);
r.post('/documents', upload.single('file'), c.uploadDocumentMeta);
r.get('/documents', c.listDocuments);

module.exports = r;
