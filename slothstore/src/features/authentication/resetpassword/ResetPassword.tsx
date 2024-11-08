import { useState } from 'react';
import { Button, Form, Input, message } from 'antd';
import axios from 'axios';
import instance from '../../../axios';
import { useNavigate } from 'react-router-dom';

interface ResetPasswordForm {
  email: string;
}

const ResetPassword = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: ResetPasswordForm) => {
    setLoading(true);
    try {
      const response = await instance.post('/auth/forgot-password', { email: values.email });
      message.success(response.data.message);
      localStorage.setItem('resetEmail', values.email);
      navigate('/auth/otp-page');
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
  

  return (
    <>
      <div style={{fontSize: 30, fontWeight: 'bold', marginBottom: 30}}>
        Đặt lại mật khẩu
        <p style={{marginTop: 8, fontSize: 16, fontWeight: 'normal', color: '#667085'}}>
          Vui lòng cung cấp địa chỉ email mà bạn đã sử dụng khi đăng ký tài khoản của mình <br />
          Một email sẽ được gửi đến địa chỉ này nếu tài khoản tồn tại
        </p>
      </div>
      <Form requiredMark={false} form={form} autoComplete={'off'} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Vui lòng nhập email của bạn' },
            { type: 'email', message: 'Vui lòng nhập email hợp lệ!' }
          ]}
        >
          <Input size="large" placeholder="Example@example.com" />
        </Form.Item>
        <Form.Item>
          <Button type={'primary'} block htmlType="submit" className={'btn-sign-in'} loading={loading}>
            Đặt lại mật khẩu
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export default ResetPassword;