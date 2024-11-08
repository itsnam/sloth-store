const User = require('../models/user');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/email');
const crypto = require('crypto');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

exports.signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ 
      $or: [{ username }, { email }] 
    });

    if (existingUser) {
      return res.status(400).json({
        status: 'fail',
        message: 'Tài khoản hoặc email đã tồn tại!'
      });
    }

    const newUser = await User.create({
      username,
      email,
      password
    });

    const token = signToken(newUser._id);

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: newUser
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { loginId, password } = req.body;

    if (!loginId || !password) {
      return res.status(400).json({ message: 'Please provide username/email and password' });
    }

    const user = await User.findOne({
      $or: [{ email: loginId }, { username: loginId }]
    }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Tài khoản/email hoặc mật khẩu không đúng' });
    }

    const token = signToken(user._id);

    res.json({
      status: 'success',
      token,
      username: user.username,
      role: user.role
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');

    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ message: 'Mật khẩu hiện tại không đúng' });
    }

    user.password = newPassword;
    user.passwordChangedAt = Date.now() - 1000;
    await user.save();

    const token = signToken(user._id);
    res.json({
      status: 'success',
      token
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng với email này' });
    }

    const otp = user.createPasswordResetOTP();
    await user.save({ validateBeforeSave: false });

    const message = `Mã OTP của bạn là: ${otp}. Mã này sẽ hết hạn sau 10 phút.`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Mã OTP đặt lại mật khẩu của bạn',
        message
      });

      res.status(200).json({
        status: 'success',
        message: 'Mã OTP đã được gửi đến email của bạn'
      });
    } catch (err) {
      user.passwordResetOTP = undefined;
      user.passwordResetOTPExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        message: 'Có lỗi khi gửi email. Vui lòng thử lại sau!'
      });
    }
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({
      email,
      passwordResetOTP: otp,
      passwordResetOTPExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Mã OTP không hợp lệ hoặc đã hết hạn' });
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      status: 'success',
      resetToken
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetOTP = undefined;
    user.passwordResetOTPExpires = undefined;
    user.passwordChangedAt = Date.now() - 1000;
    await user.save();

    const token = signToken(user._id);
    res.json({
      status: 'success',
      token
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

exports.addUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ status: 'fail', message: 'Tài khoản hoặc email đã tồn tại!' });
    }

    const newUser = await User.create({ username, email, password, role });
    res.status(201).json({ status: 'success', data: { user: newUser } });
  } catch (error) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const user = await User.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'Người dùng không tìm thấy!' });
    }

    res.json({ status: 'success', data: { user } });
  } catch (error) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'Người dùng không tìm thấy!' });
    }

    res.json({ status: 'success', message: 'Người dùng đã được xóa' });
  } catch (error) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};
