import { useState } from 'react';
import { Button, Form, Input, message } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import instance from '../../../axios';
interface UpdatePasswordForm{
  resetToken: string;
  newPassword: string
}

const UpdatePassword = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: UpdatePasswordForm) => {
    setLoading(true);
    try {
      const resetToken = localStorage.getItem('resetToken');
      await instance.post('/auth/reset-password', {
        resetToken,
        newPassword: values.newPassword
      });
      message.success('Đổi mật khẩu thành công');
      localStorage.removeItem('resetToken');
      localStorage.removeItem('resetEmail');
      navigate('/auth/login');
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
        Cập nhật mật khẩu
      </div>
      <Form requiredMark={false} form={form} autoComplete={'off'} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Mật khẩu mới"
          name="newPassword"
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu mới' },
            { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự' }
          ]}
        >
          <Input size="large" type="password" placeholder="Ít nhất 8 ký tự" />
        </Form.Item>
        <Form.Item
          label="Nhập lại mật khẩu mới"
          name="repeatNewPassword"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: 'Vui lòng nhập lại mật khẩu mới của bạn' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Hai mật khẩu bạn đã nhập không khớp!'));
              },
            }),
          ]}
        >
          <Input size="large" type="password" placeholder="Nhập lại mật khẩu của bạn" />
        </Form.Item>
        <Form.Item>
          <Button type={'primary'} block htmlType="submit" className={'btn-sign-in'} loading={loading}>
            Cập nhật mật khẩu
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export default UpdatePassword;