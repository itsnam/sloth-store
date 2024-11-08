import { Button, Form, Input, message, Modal } from 'antd';
import { Link } from 'react-router-dom';
import instance from '../../../axios';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';

interface SignUpForm {
  username: string;
  email: string;
  password: string;
  repeatpassword: string;
}

interface ErrorResponse {
    message: string;
}

const SignUp = () => {
  const [form] = Form.useForm<SignUpForm>();
  const navigate = useNavigate();

  const validateUsername = (_: unknown, value: string) => {
    const usernameRegex = /^[a-zA-Z0-9]+$/;
    if (!value) {
      return Promise.reject(new Error('Vui lòng nhập tài khoản của bạn!'));
    }
    if (!usernameRegex.test(value)) {
      return Promise.reject(new Error('Tài khoản không được chứa ký tự đặc biệt!'));
    }
    return Promise.resolve();
  };

  const validateRepeatPassword = (_: unknown, value: string) => {
    const password = form.getFieldValue('password');
    if (!value) {
      return Promise.reject(new Error('Vui lòng nhập lại mật khẩu!'));
    }
    if (value !== password) {
      return Promise.reject(new Error('Mật khẩu không khớp!'));
    }
    return Promise.resolve();
  };

  const onFinish = async (values : SignUpForm ) => {
    try {
        const response = await instance.post('/auth/signup',{
            username: values.username,
            email: values.email,
            password: values.password
            
        });

        Modal.confirm({
          title: 'Đăng ký thành công!',
          content: 'Bạn có muốn chuyển đến trang đăng nhập không?',
          onOk() {
            navigate('../')
          },
          onCancel() {
            form.resetFields();
          },
        });
        console.log('Signup successful:', response.data);
    } catch (error) {
        const err = error as AxiosError<ErrorResponse>; 
        const errorMessage = err.response?.data?.message || 'Đăng ký thất bại. Vui lòng kiểm tra thông tin của bạn.';
        message.error(errorMessage); 
    }
  }

  return (
    <>
        <div style={{fontSize: 30, fontWeight: 'bold', marginBottom: 30}}>
            Đăng ký
            <p style={{marginTop: 8, fontSize: 16, fontWeight: 'normal', color: '#667085'}}>Vui lòng điền chi tiết để tạo tài khoản của bạn</p>
        </div>
        <Form
            requiredMark={false} 
            layout='vertical'
            autoComplete="off"
            form={form}
            onFinish={onFinish}
        >

            <Form.Item
                label="Tài khoản"
                name="username"
                rules={[{validator: validateUsername},]}
                >
                <Input placeholder="Tài khoản của bạn" size='large'/>
            </Form.Item>

            <Form.Item
                label="Email"
                name="email"
                rules={[
                    { required: true, message: 'Vui lòng nhập email của bạn!' },
                    { type: 'email', message: 'Vui lòng nhập email hợp lệ!'},
                ]}
                >
                <Input placeholder="Example@example.com" size='large'/>
            </Form.Item>

            <Form.Item
                label="Mật khẩu"
                name="password"
                rules={[
                    { required: true, message: 'Vui lòng nhập mật khẩu của bạn!'},
                    { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự' }
                ]}
                >
                <Input.Password placeholder="Ít nhất 8 ký tự"  size='large'/>
            </Form.Item>

            <Form.Item
                label="Nhập lại mật khẩu"
                name="repeatpassword"
                rules={[{validator: validateRepeatPassword}]}
                >
                <Input.Password placeholder="Nhập lại mật khẩu của bạn"  size='large'/>
            </Form.Item>

            <Form.Item>
                <Button type={'primary'} block htmlType="submit" className={'btn-sign-in'}>
                    Đăng ký
                </Button>
            </Form.Item>
            <div style={{ textAlign: 'center', marginTop: 20 }}>
                <p style={{fontSize: 16, fontWeight: 'normal', color: '#667085'}}>
                    Bạn đã có tài khoản? <Link to='../'>Đăng nhập</Link>
                </p>
            </div>
        </Form>
    </>
  );
};
export default SignUp;