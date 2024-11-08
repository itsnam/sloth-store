const jwt = require('jsonwebtoken');
const User = require('../models/user');
require('dotenv').config();

exports.protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Bạn chưa đăng nhập' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'Người dùng không còn tồn tại' });
    }

    if (user.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({ message: 'Người dùng đã thay đổi mật khẩu gần đây! Vui lòng đăng nhập lại.' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token không hợp lệ' });
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Bạn không có quyền thực hiện hành động này' });
    }
    next();
  };
};