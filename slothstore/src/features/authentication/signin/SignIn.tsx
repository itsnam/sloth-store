import { Button, Checkbox, Flex, Form, Input, message } from 'antd';
import GoogleLogo from '../../../assets/Google.svg';
import { Link, useNavigate } from 'react-router-dom';
import instance from '../../../axios';
import './SignIn.css';
import { AxiosError } from 'axios';

interface SignInForm {
  username: string;
  password: string;
  remember: boolean;
}

interface LoginResponse {
  token: string;
  username: string;
  role: string;
}

interface ErrorResponse {
  message: string;
}

const SignIn: React.FC = () => {
  const [form] = Form.useForm<SignInForm>();
  const navigate = useNavigate();
  
  const onFinish = async (values: SignInForm) => {
    try {
      const response = await instance.post<LoginResponse>('/auth/login', {
        loginId: values.username,
        password: values.password,
      });

      message.success('Đăng nhập thành công');
      const { token, username, role } = response.data;
      localStorage.setItem('token', token); 
      localStorage.setItem('username', username);
      localStorage.setItem('role', role);

      if(role === 'admin'){
        navigate('/admin');
      }else{
        navigate('/');
      }
    } catch (error) {
      const err = error as AxiosError<ErrorResponse>; 
      const errorMessage = err.response?.data?.message || 'Đăng nhập thất bại. Sai tài khoản/email hoặc mật khẩu';
      message.error(errorMessage);
    }
  };

  return (
    <>
      <div style={{fontSize: 30, fontWeight: 'bold', marginBottom: 30}}>
        Đăng nhập
        <p style={{marginTop: 8, fontSize: 16, fontWeight: 'normal', color: '#667085'}}>Vui lòng điền thông tin của bạn bên dưới</p>
      </div>
      <Form<SignInForm>
        requiredMark={false} 
        layout='vertical'
        autoComplete="off"
        form={form}
        onFinish={onFinish}
      >
        <Form.Item
          label="Tài khoản hoặc Email"
          name="username"
          rules={[{ required: true, message: 'Vui lòng nhập tài khoản hoặc email của bạn!' }]}
        >
          <Input size="large" placeholder="Tài khoản hoặc Email của bạn" />
        </Form.Item>

        <Form.Item
          label="Mật khẩu"
          name="password"
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu của bạn!' },
            { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự' }
          ]}
        >
          <Input.Password placeholder="Mật khẩu của bạn"  size='large'/>
        </Form.Item>

        <Form.Item>
          <Flex justify="space-between" align="center">
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>Lưu mật khẩu</Checkbox>
            </Form.Item>
            <Link to={'reset-password'}>Quên mật khẩu?</Link>
          </Flex>
        </Form.Item>

        <Form.Item>
          <Button type={'primary'} block htmlType="submit" className={'btn-sign-in'}>
            Đăng nhập
          </Button>
        </Form.Item>

        <div className='or'>Hoặc</div>

        <Button type={'primary'} block htmlType="submit" className={'btn-google'}>
          <img src={GoogleLogo} alt={'google-logo'} />
          Đăng nhập bằng Google
        </Button>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <p style={{fontSize: 16, fontWeight: 'normal', color: '#667085'}}>
            Bạn chưa có tài khoản? <Link to="sign-up" > Đăng ký</Link>
          </p>
        </div>
      </Form>
    </>
  );
};

export default SignIn;