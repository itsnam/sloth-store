import { useEffect, useState } from 'react';
import { ManOutlined, WomanOutlined } from '@ant-design/icons';
import { Layout, Menu, theme, Dropdown, Space } from 'antd';
import IconLogo from '../../assets/iconlogo.png';
import Logo from '../../assets/logo.png';
import Home from './Home';
import ProductDetail from './ProductDetail';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { Product } from '../../types/product';
import instance from '../../axios';
import CartLink from '../components/CartLink';
import { setProductCount } from '../../store/cartSlice';
import { useDispatch } from 'react-redux';
import HistoryIcon from '../components/HistoryIcon';

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
  getItem('Trang phục nam', 'sub1', <ManOutlined />, [
    getItem('Tất cả trang phục nam', '1'),
    getItem('Đồ thun nam', '2'),
    getItem('Áo sơ mi nam', '3'),
    getItem('Áo khoác nam', '4'),
    getItem('Quần nam', '5'),
  ]),
  getItem('Trang phục nữ', 'sub2', <WomanOutlined />, [
    getItem('Tất cả trang phục nữ', '6'),
    getItem('Đồ thun nữ', '7'),
    getItem('Áo khoác nữ', '8'),
    getItem('Quần và váy nữ', '9'),
    getItem('Trang phục bầu', '10'),
  ]),
];

const HomeLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [currentMenu, setCurrentMenu] = useState('1');
  const [products, setProducts] = useState<Product[]>([]);
  const [user, setUser] = useState<string | null>(localStorage.getItem('username'));
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
    dispatch(setProductCount(0));
    setUser(null);
  };

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleMenuClick = (e: { key: string }) => {
    setCurrentMenu(e.key);
    navigate('/');
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

  const getTypeByKey = (key: string): string[] => {
    switch(key) {
      case '1': return ['all-mens', 'mens-tshirts', 'mens-shirts','mens-jackets', 'mens-pants'];
      case '2': return ['mens-tshirts'];
      case '3': return ['mens-shirts'];
      case '4': return ['mens-jackets'];
      case '5': return ['mens-pants'];
      case '6': return ['all-womens', 'womens-tshirts', 'womens-jackets', 'womens-pants-skirts', 'maternity-wear'];
      case '7': return ['womens-tshirts'];
      case '8': return ['womens-jackets'];
      case '9': return ['womens-pants-skirts'];
      case '10': return ['maternity-wear'];
      default: return ['all-mens'];
    }
  };

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
          defaultOpenKeys={['sub1', 'sub2']}
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
            <HistoryIcon />
            <CartLink />
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
              <Route
                path="/"
                element={<Home products={products.filter(p => getTypeByKey(currentMenu).includes(p.type))} />}
              />
              <Route
                path="/:productId"
                element={<ProductDetail products={products}/>}
              />
            </Routes>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default HomeLayout;