import React, { useEffect, useState } from 'react';
import { Layout, Menu, theme, Dropdown, Space, Table, InputNumber, Button, message, Modal } from 'antd';
import IconLogo from '../../../assets/iconlogo.png';
import Logo from '../../../assets/logo.png';
import { Link, useNavigate } from 'react-router-dom';
import CartLink from '../../components/CartLink';
import instance from '../../../axios';
import { useAppSelector, useAppDispatch } from '../../../store/hooks';
import { setProductCount } from '../../../store/cartSlice';
import Address from '../profile/address/Address';
import { AddressData } from '../profile/address/Address';
import './Cart.css';
import HistoryIcon from '../../components/HistoryIcon';

const { Header, Content } = Layout;

interface ProductInventory {
  size: string;
  color: string;
  stock: number;
  sold: number;
  _id: string;
}

interface ProductDetails {
  _id: string;
  images: string[];
  name: string;
  description: string;
  price: number;
  sizes: string[];
  colors: string[];
  type: string;
  inventory: ProductInventory[];
  __v: number;
}

interface OrderProduct {
  id: ProductDetails;
  quantity: number;
  size: string;
  color: string;
  _id: string;
}

interface OrderResponse {
  _id: string;
  user: string;
  products: OrderProduct[];
}

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem('username');
  const [products, setProducts] = useState<OrderProduct[]>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const dispatch = useAppDispatch();
  const currentProductCount = useAppSelector((state) => state.cart.productCount);
  const [selectedAddress, setSelectedAddress] = useState<AddressData | null>(null);

  const handleSelectAddress = (address: AddressData | null) => {
    setSelectedAddress(address);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth');
    }
  }, [navigate]);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  useEffect(() => {
    const total = products.reduce((sum, product) => sum + (product.quantity * product.id.price), 0);
    setTotalPrice(total);
  }, [products]);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await instance.get<OrderResponse>('/orders', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setProducts(response.data.products);
      } catch (error) {
        console.log('Error fetching order', error);
      }
    };
    fetchOrder();
  }, []);

  const handlePlaceOrder = async () => {
    if (products.length === 0) {
      message.warning('Không có sản phẩm trong giỏ hàng.');
      return;
    }

    if (!selectedAddress) {
      message.warning('Vui lòng chọn địa chỉ để đặt hàng.');
      return;
    }

    try {
      const response = await instance.post('/orders/place-order', {
        total: totalPrice,
        addressId: selectedAddress._id,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      console.log(response);
      message.success('Đặt hàng thành công!');
      setProducts([]);
      dispatch(setProductCount(0));
    } catch (error) {
      console.error('Error placing order', error);
      message.error('Đặt hàng thất bại. Vui lòng thử lại.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/auth');
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

  const handleQuantityChange = async (id: string, newQuantity: number) => {
    const product = products.find(product => product._id === id);
    if (product) {
      const availableStock = product.id.inventory.find(inv => inv.size === product.size && inv.color === product.color)?.stock || 0;

      if (newQuantity > availableStock) {
        message.warning(`Số lượng tối đa cho sản phẩm ${product.id.name} là ${availableStock}.`);
      } else {
        const quantityChange = newQuantity - product.quantity;

        if (quantityChange !== 0) {
          const updatedProduct = { ...product, quantity: newQuantity };

          try {
            await instance.post('/orders', {
              products: [{
                id: updatedProduct.id._id,
                quantity: quantityChange,
                size: updatedProduct.size,
                color: updatedProduct.color,
              }],
              addressId: null,
            }, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
            });

            const updatedProducts = products.map(p => p._id === id ? updatedProduct : p);
            setProducts(updatedProducts);
          } catch (error) {
            console.error('Error updating order', error);
          }
        }
      }
    }
  };

  const handleDeleteProduct = (id: string) => {
    const product = products.find(product => product._id === id);

    if (!product) {
      message.error('Sản phẩm không tìm thấy.');
      return;
    }

    Modal.confirm({
      title: 'Xóa sản phẩm',
      content: 'Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?',
      onOk: async () => {
        try {
          await instance.post('/orders', {
            products: [{
              id: product.id._id,
              quantity: 0,
              size: product.size,
              color: product.color,
            }],
            addressId: null,
          }, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });
          setProducts(products.filter(p => p._id !== id));
          dispatch(setProductCount(currentProductCount - 1));
          message.success('Sản phẩm đã được xóa khỏi giỏ hàng.');
        } catch (error) {
          console.error('Error deleting product', error);
          message.error('Xóa sản phẩm thất bại.');
        }
      },
      onCancel: () => {
        message.info('Xóa sản phẩm đã bị hủy.');
      },
    });
  };

  const columns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'image',
      render: (_text: string, record: OrderProduct) => (
        <img src={record.id.images[0]} alt={record.id.name} style={{ width: '50px', height: '50px' }} />
      ),
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      render: (_text: string, record: OrderProduct) => record.id.name,
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      render: (_text: string, record: OrderProduct) => (
        <InputNumber
          min={1}
          value={record.quantity}
          onChange={(value) => handleQuantityChange(record._id, value!)}
        />
      ),
    },
    {
      title: 'Size',
      dataIndex: 'size',
      render: (_text: string, record: OrderProduct) => record.size,
    },
    {
      title: 'Color',
      dataIndex: 'color',
      render: (_text: string, record: OrderProduct) => record.color,
    },
    {
      title: 'Thành tiền',
      dataIndex: 'totalPrice',
      render: (_text: string, record: OrderProduct) => (
        (record.quantity * record.id.price).toLocaleString()
      ),
    },
    {
      title: 'Hành động',
      dataIndex: 'action',
      render: (_text: string, record: OrderProduct) => (
        <Button onClick={() => handleDeleteProduct(record._id)} danger>Xóa</Button>
      ),
    },
  ];

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
          <div
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              fontWeight: 'bold',
              fontSize: '24px',
            }}
          >
            Giỏ hàng
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
          <div className="cart-content" 
            style={{
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
              padding: 32,
              display: 'flex',
              gap: 20

            }}
          >
            <div style={{ flex: 2, marginBottom: 40 }}>
              <Table
                columns={columns}
                dataSource={products}
                pagination={false} 
                rowKey="_id"
              />
            </div>
            <div style={{ flex: 1, maxWidth: '350px', overflowX: 'hidden',  marginBottom: 40  }}>
              <b>Địa chỉ</b>
              <Address isCartPage={true} onSelectAddress={handleSelectAddress} />
            </div>
          </div>
          <div className="fixed-footer">
            <p style={{ fontSize: 16 }}><b>Tổng tiền: </b>{totalPrice.toLocaleString()} VND</p>
            <Button type={'primary'} block className='btn-order' onClick={handlePlaceOrder}>Đặt hàng</Button>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Cart;