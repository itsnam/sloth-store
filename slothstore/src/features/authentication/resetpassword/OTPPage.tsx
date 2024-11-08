import { useState } from 'react';
import { Button, Form, message } from 'antd';
import { InputOTP } from 'antd-input-otp';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import instance from '../../../axios';

interface OTPPageForm {
    otp: string[];
  }

const OTPPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFinish = async (values: OTPPageForm) => {
    setLoading(true);
    try {
      const otpString = values.otp.join('');
      const response = await instance.post('/auth/verify-otp', {
        email: localStorage.getItem('resetEmail'),
        otp: otpString
      });
      message.success('OTP hợp lệ');
      localStorage.setItem('resetToken', response.data.resetToken);
      navigate('/auth/update-password');
    } catch (error: unknown) { 
      if (axios.isAxiosError(error) && error.response) {
        message.error(error.response.data.message || 'An error occurred');
      } else {
        message.error('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    try {
      await instance.post('/auth/forgot-password', { email: localStorage.getItem('resetEmail') });
      message.success('Mã OTP mới đã được gửi tới email của bạn');
    } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response) {
            message.error(error.response.data.message || 'Gửi OTP thất bại  ');
        } else {
            message.error('An unexpected error occurred');
        }
    }
  };

  return (
    <>
      <div style={{fontSize: 30, fontWeight: 'bold', marginBottom: 30}}>
        Xác nhận OTP
        <p style={{marginTop: 8, fontSize: 16, fontWeight: 'normal', color: '#667085'}}>
          Nhập mã 6 chữ số bạn đã nhận qua {localStorage.getItem('resetEmail')}. Mã này sẽ hết hạn trong <b style={{color: '#333333'}}>10:00</b>
        </p>
      </div>
      <Form onFinish={handleFinish} form={form}>
        <Form.Item style={{textAlign: 'center'}} name="otp" rules={[{ required: true, message: 'Vui lòng nhập mã OTP!' }]}>
          <InputOTP autoSubmit={form} inputType="numeric" />
        </Form.Item>
        <div style={{display: 'flex', justifyContent: 'center'}}>
          <Button style={{maxWidth: 500}} type="primary" block htmlType="submit" className="btn-sign-in" loading={loading}>
            Xác nhận
          </Button>
        </div>
      </Form>
      <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center'}}>
        <p style={{fontSize: 16, fontWeight: 'normal', color: '#667085'}}>Chưa nhận được OTP?
          <Link to='' onClick={resendOTP} style={{ textDecoration: 'none' }}> Gửi lại OTP</Link>
        </p>
      </div>
    </>
  );
};

export default OTPPage;