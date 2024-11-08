const express = require('express');
const router = express.Router();
const { createOrUpdateOrder, getOrder, placeOrder, getOrdersByStatus, patchOrderStatus, getAllOrdersByStatus } = require('../controllers/orderController');
const { protect, restrictTo } = require('../middleware/auth');

router.post('/', protect, createOrUpdateOrder);
router.get('/', protect, getOrder);
router.get('/status', protect, getOrdersByStatus);
router.post('/place-order', protect, placeOrder);
router.patch('/status', protect, patchOrderStatus);
router.get('/status-all', protect, restrictTo('admin'), getAllOrdersByStatus);


module.exports = router;
