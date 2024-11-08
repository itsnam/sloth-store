import React, { useEffect, useState } from 'react';
import { Layout, Menu, theme, Dropdown, Space } from 'antd';
import IconLogo from '../../../assets/iconlogo.png';
import Logo from '../../../assets/logo.png';
import { Link, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import './Profile.css';
import Profile from './Profile';
import ChangePassword from './changepassword/ChangePassword';
import Address from './address/Address';
import History from './history/History';
import CartLink from '../../components/CartLink';
import HistoryIcon from '../../components/HistoryIcon';

const { Header, Content } = Layout;

const ProfileLayout: React.FC = () => {
  const [pageTitle, setPageTitle] = useState<string>('Thông tin tài khoản');
  const navigate = useNavigate();
  const location = useLocation(); 
  const username = localStorage.getItem('username');

  const handleLogout = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/auth');
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth');
    }
  }, [navigate]);

  useEffect(() => {
    const path = location.pathname;
    if (path === '/profile') {
      setPageTitle('Thông tin tài khoản');
    } else if (path === '/profile/change-password') {
      setPageTitle('Thay đổi mật khẩu');
    } else if (path === '/profile/history') {
      setPageTitle('Lịch sử mua hàng');
    } else if (path === '/profile/address') {
      setPageTitle('Cập nhật địa chỉ');
    }
  }, [location.pathname]);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" onClick={() => navigate('/profile')}>
        <span>Thông tin cá nhân</span>
      </Menu.Item>
      {localStorage.getItem('role') === 'admin' && (
        <Menu.Item key="admin" onClick={() => navigate('/admin')}>
          <span>Về trang admin</span>
        </Menu.Item>
      )}
      <Menu.Item key="logout" onClick={handleLogout}>
        <span>Đăng xuất</span>
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Layout style={{ backgroundColor: colorBgContainer }}>
        <Header
          style={{
            padding: '0 16px',
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
            height: '80px',
          }}
        >
          <Link to="/">
            <img
              src={Logo}
              alt="Logo"
              style={{ objectFit: 'contain', maxHeight: '96px' }}
            />
          </Link>
          <div style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            fontWeight: 'bold',
            fontSize: '24px',
          }}>
            {pageTitle}
          </div>
          <div style={{ position: 'absolute', right: '1%', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <HistoryIcon />
            <CartLink />
            {username ? (
              <Dropdown overlay={userMenu}>
                <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <img
                    style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                    src={IconLogo}
                    alt="Profile"
                  />
                  <Space style={{ marginLeft: '8px' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#333333' }}>{username}</span>
                  </Space>
                </div>
              </Dropdown>
            ) : (
              <a style={{ fontSize: '16px', color: '#333333' }} onClick={() => navigate('/auth')}>
                <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <img
                    style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                    src={IconLogo}
                    alt="Profile"
                  />
                  <Space style={{ marginLeft: '8px' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#333333' }}>Login</span>
                  </Space>
                </div>
              </a>
            )}
          </div>
        </Header>
        <Content style={{ margin: '0 16px 16px' }}>
          <div
            style={{
              minHeight: '100%',
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Link to="/profile">
              <img
                style={{ width: '160px', height: '160px', borderRadius: '50%' }}
                src={IconLogo}
                alt="Profile"
              />
            </Link>
            <p style={{ fontWeight: 'bold', fontSize: '20px', color: '#333333', marginBottom: 32 }}>{username}</p>
            <Routes>
              <Route 
                path="/" 
                element={<Profile/>} 
              />
              <Route
                path='/history'
                element={<History /> }
              /> 
              <Route 
                path="/change-password" 
                element={<ChangePassword/>} 
              />
              <Route 
                path="/address" 
                element={<Address isCartPage={false}/>} 
              />
            </Routes>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default ProfileLayout;