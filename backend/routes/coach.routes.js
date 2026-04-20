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
r.post(
  '/ground-bookings/hold',
  [body('groundId').notEmpty(), body('startTime').notEmpty(), body('endTime').notEmpty()],
  validateRequest,
  c.holdGroundBooking
);
r.post('/ground-bookings/:id/payment-intent', c.createGroundBookingPaymentIntent);
r.post('/ground-bookings/:id/confirm-payment', c.confirmGroundPayment);
r.get('/ground-bookings', c.listCoachGroundBookings);
r.delete('/ground-bookings/:id', c.cancelGroundBooking);
/** SRS UC-C4 — coach-side matching players (inverse of player recommendations) */
r.get('/recommended-players', c.getRecommendedPlayers);
r.post(
  '/recommended-players/:playerId/notify',
  [param('playerId').isMongoId()],
  validateRequest,
  c.notifyRecommendedPlayer
);
r.get('/feedback', c.listFeedback);
r.post('/feedback/:id/reply', [body('reply').notEmpty()], c.replyFeedback);
r.get('/payments', c.listPayments);
/** SRS UC-C12 — withdrawal request (prototype settlement) */
r.post(
  '/payments/withdrawal',
  [body('amount').isFloat({ min: 0.01 })],
  validateRequest,
  c.requestWithdrawal
);
r.get('/notifications', c.listNotifications);
r.post('/documents', upload.single('file'), c.uploadDocumentMeta);
r.get('/documents', c.listDocuments);

module.exports = r;
