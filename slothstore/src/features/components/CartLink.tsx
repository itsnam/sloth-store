import React, { useEffect } from 'react';
import { Badge } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import instance from '../../axios';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setProductCount } from '../../store/cartSlice';

const CartLink: React.FC = () => {
  const dispatch = useAppDispatch();
  const productCount = useAppSelector((state) => state.cart.productCount);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await instance.get('/orders', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const order = response.data;
        if (order && order.products) {
          dispatch(setProductCount(order.products.length));
        } else {
          dispatch(setProductCount(0));
        }
      } catch (error) {
        console.error('Error fetching the order:', error);
        dispatch(setProductCount(0));
      }
    };
    fetchOrder();
  }, [dispatch]);

  return (
    <Link style={{ marginTop: 8 }} to="/cart">
      <Badge count={productCount}>
        <ShoppingCartOutlined style={{ fontSize: '24px', color: '#333333' }} />
      </Badge>
    </Link>
  );
};

export default CartLink;