import { useEffect, useState } from 'react';
import { DashboardOutlined, ShoppingCartOutlined, ContainerOutlined } from '@ant-design/icons'; // Change the import for a new icon
import { Layout, Menu, theme, Dropdown, Space } from 'antd';
import IconLogo from '../../assets/iconlogo.png';
import Logo from '../../assets/logo.png';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { Product } from '../../types/product';
import instance from '../../axios';
import Dashboard from './Dashboard';
import ProductManagement from './ProductManagement';
import OrderManagement from './OrderManagement';

interface MenuItem {
  key: string;
  icon?: React.ReactNode;
  children?: MenuItem[];
  label: string;
}

const { Header, Content, Sider } = Layout;

function getItem(label: string, key: string, icon?: React.ReactNode, children?: MenuItem[]): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  };
}

const items: MenuItem[] = [
  getItem('Dashboard', 'dashboard', <DashboardOutlined />),
  getItem('Quản lý sản phẩm', 'productManagement', <ShoppingCartOutlined />),
  getItem('Quản lý đơn hàng', 'orderManagement', <ContainerOutlined />),
];

const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [currentMenu, setCurrentMenu] = useState('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [user, setUser] = useState<string | null>(localStorage.getItem('username'));
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (!token) {
      navigate('/auth');
    } else if (role !== 'admin') {
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await instance.get('/products');
        setProducts(response.data);
        console.log(response);
        console.log(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setUser(null);
    navigate('/');
  };

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleMenuClick = (e: { key: string }) => {
    setCurrentMenu(e.key);
    if (e.key === 'dashboard') {
      navigate(`/admin`);
    } else {
      navigate(`/admin/${e.key}`);
    }
  };

  const getLabelByKey = (key: string): string => {
    for (const item of items) {
      if (item.key === key) {
        return item.label;
      }
      if (item.children) {
        const childItem = item.children.find(child => child.key === key);
        if (childItem) {
          return childItem.label;
        }
      }
    }
    return 'Dashboard';
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" onClick={() => navigate('/profile')}>
        <span>Thông tin cá nhân</span>
      </Menu.Item>
      <Menu.Item key="shop" onClick={() => navigate('/')}>
        <span>Về trang shop</span>
      </Menu.Item>
      <Menu.Item key="logout" onClick={handleLogout}>
        <span>Đăng xuất</span>
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={230} theme="light" collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div className="logo-container" style={{ padding: 16 }}>
          <div style={{ width: '100%' }}>
            <a href="/">
              <img
                src={collapsed ? IconLogo : Logo}
                alt="Logo"
                style={{ objectFit: 'contain', maxHeight: '96px' }}
              />
            </a>
          </div>
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[currentMenu]}
          onClick={handleMenuClick}
          items={items}
        />
      </Sider>
      <Layout style={{ backgroundColor: '#CBD2DC' }}>
        <Header
          style={{
            padding: '0 16px',
            background: '#CBD2DC',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ fontWeight: 'bold', fontSize: '24px' }}>
            {getLabelByKey(currentMenu)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {user ? (
              <Dropdown overlay={userMenu}>
                <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <img
                    style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                    src={IconLogo}
                    alt="Profile"
                  />
                  <Space style={{ marginLeft: '8px' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#333333' }}>{user}</span>
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
              padding: 24,
              minHeight: '100%',
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Routes>
              <Route path="/" element={<Dashboard products={products} />} />
              <Route path="/productManagement" element={<ProductManagement products={products} />} />
              <Route path="/orderManagement" element={<OrderManagement />} /> 
            </Routes>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;