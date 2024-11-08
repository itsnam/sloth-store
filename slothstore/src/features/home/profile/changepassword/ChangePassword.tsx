import { Button, Form, Input, message } from 'antd';
import instance from "../../../../axios";
import { AxiosError } from "axios";

interface ChangePasswordForm {
  currentpassword: string;
  newpassword: string;
  repeatpassword: string;
}

interface ErrorResponse {
  message: string;
}

const ChangePassword: React.FC = () => {
  const [form] = Form.useForm<ChangePasswordForm>();

  const validateRepeatPassword = (_: unknown, value: string) => {
    const password = form.getFieldValue('newpassword');
    if (!value) {
      return Promise.reject(new Error('Vui lòng nhập lại mật khẩu!'));
    }
    if (value !== password) {
      return Promise.reject(new Error('Mật khẩu không khớp!'));
    }
    return Promise.resolve();
  };

  const onFinish = async (values: ChangePasswordForm) => {
    try {
      const response = await instance.patch('/auth/change-password', {
        currentPassword: values.currentpassword,
        newPassword: values.newpassword
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.status === 200) {
        message.success('Đổi mật khẩu thành công!');
        localStorage.setItem('token', response.data.token);
        form.resetFields();
      } else {
        message.error('Có lỗi xảy ra khi đổi mật khẩu.');
      }
    } catch (error) {
      const err = error as AxiosError<ErrorResponse>;
      const errorMessage = err.response?.data?.message || 'Đăng ký thất bại. Vui lòng kiểm tra thông tin của bạn.';
      message.error(errorMessage);
    }
  };

  return (
    <div style={{ width: 500 }}>
      <Form
        requiredMark={false}
        layout='vertical'
        autoComplete="off"
        form={form}
        onFinish={onFinish}
      >
        <Form.Item
          label="Mật khẩu"
          name="currentpassword"
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu của bạn!' },
            { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự' }
          ]}
        >
          <Input.Password placeholder="Ít nhất 8 ký tự" size='large' />
        </Form.Item>

        <Form.Item
          label="Mật khẩu mới"
          name="newpassword"
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu mới của bạn!' },
            { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự' }
          ]}
        >
          <Input.Password placeholder="Ít nhất 8 ký tự" size='large' />
        </Form.Item>

        <Form.Item
          label="Nhập lại mật khẩu"
          name="repeatpassword"
          rules={[{ validator: validateRepeatPassword }]}
        >
          <Input.Password placeholder="Nhập lại mật khẩu của bạn" size='large' />
        </Form.Item>

        <Form.Item>
          <Button type={'primary'} block htmlType="submit" className={'btn-sign-in'}>
            Đổi mật khẩu
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ChangePassword;