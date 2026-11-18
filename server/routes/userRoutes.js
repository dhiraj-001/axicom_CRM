const express = require('express');
const router = express.Router();
const {
  getUsers,
  createUser,
  updateUser,
  toggleLock,
  resetPassword
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect);
router.use(authorize('Admin'));

router.route('/')
  .get(getUsers)
  .post(createUser);

router.route('/:id')
  .put(updateUser);

router.post('/:id/toggle-lock', toggleLock);
router.post('/:id/reset-password', resetPassword);

module.exports = router;

