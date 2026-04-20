const { Router } = require('express');
const { body } = require('express-validator');
const a = require('../controllers/adminController');
const { authenticate, requireRole, loadUser } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validate');

const r = Router();
const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
r.use(authenticate, loadUser, requireRole('admin'));

r.get('/dashboard', a.dashboard);
r.get('/verification/coaches', a.verificationCoaches);
r.patch(
  '/verification/coaches/:userId',
  [body('action').isIn(['approve', 'reject', 'more_info'])],
  validateRequest,
  a.patchCoachVerification
);
r.get('/verification/business', a.verificationBusiness);
r.patch(
  '/verification/business/:userId',
  [body('action').isIn(['approve', 'reject', 'more_info'])],
  validateRequest,
  a.patchBusinessVerification
);
r.post(
  '/users',
  [
    body('email').isEmail(),
    body('password')
      .matches(strongPasswordRegex)
      .withMessage(
        'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.'
      ),
    body('role').isIn(['player', 'coach', 'business_owner']),
  ],
  validateRequest,
  a.createUser
);
r.get('/users', a.listUsers);
r.patch('/users/:id', a.patchUser);
r.delete('/users/:id', a.deleteUser);
r.get('/coaches', a.listCoachesAdmin);
r.get('/business-owners', a.listBusinessAdmin);
r.get('/sports', a.listSports);
r.post('/sports', [body('name').notEmpty()], a.createSport);
r.put('/sports/:id', a.updateSport);
r.delete('/sports/:id', a.deleteSport);
r.get('/grounds', a.listGrounds);
r.post('/grounds', a.createGround);
r.put('/grounds/:id', a.updateGround);
r.delete('/grounds/:id', a.deleteGround);
r.get('/monitor/bookings', a.monitorBookings);
r.get('/monitor/performance', a.monitorPerformance);
r.get('/complaints', a.listComplaints);
r.patch(
  '/complaints/:id',
  [
    body('status')
      .optional()
      .isIn(['open', 'investigating', 'resolved', 'dismissed']),
    body('resolution').optional().isString(),
    body('adminNotes').optional().isString(),
  ],
  validateRequest,
  a.patchComplaint
);
r.get('/reports/summary', a.reportsSummary);
r.get('/subscriptions', a.listSubscriptions);
r.get('/settings', a.getSettings);
r.put('/settings', [body('settings').isArray()], a.putSettings);

module.exports = r;
