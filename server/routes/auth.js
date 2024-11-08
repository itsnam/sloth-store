const express = require('express');
const authController = require('../controllers/authController');
const { protect, restrictTo } = require('../middleware/auth');
const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.patch('/change-password', protect, authController.changePassword);
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-otp', authController.verifyOTP);
router.post('/reset-password', authController.resetPassword);
router.post('/add-user', authController.addUser);
router.patch('/update-user/:id', protect, restrictTo('admin'), authController.updateUser);
router.delete('/delete-user/:id', protect, restrictTo('admin'), authController.deleteUser);

module.exports = router;