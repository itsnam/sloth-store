import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Radio, message } from 'antd';
import { Product } from '../../types/product';
import './Home.css';
import instance from '../../axios';
import { useAppSelector, useAppDispatch  } from '../../store/hooks';
import { setProductCount } from '../../store/cartSlice';

interface ProductDetailProps {
  products: Product[];
}

const ProductDetail: React.FC<ProductDetailProps> = ({ products }) => {
  const { productId } = useParams<{ productId?: string }>();
  const product = products.find(p => p._id === productId);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(0);
  const [currentStock, setCurrentStock] = useState<number>(0);
  const [currentSold, setCurrentSold] = useState<number>(0);
  const dispatch = useAppDispatch();
  const currentProductCount = useAppSelector((state) => state.cart.productCount);
  const navigate = useNavigate();

  useEffect(() => {
    if (product) {
      setSelectedSize(product.sizes[0]);
      setSelectedColor(product.colors[0]);
    }
  }, [product]);

  useEffect(() => {
    if (product && selectedSize && selectedColor) {
      const inventoryItem = product.inventory.find(
        item => item.size === selectedSize && item.color === selectedColor
      );
      if (inventoryItem) {
        setCurrentStock(inventoryItem.stock);
        setCurrentSold(inventoryItem.sold);
      } else {
        setCurrentStock(0);
        setCurrentSold(0);
      }
    }
  }, [product, selectedSize, selectedColor]);

  useEffect(() => {
    setQuantity(0);
  }, [selectedSize, selectedColor]);

  const increaseQuantity = () => {
    if (quantity < currentStock) {
      setQuantity(prev => prev + 1);
    }
  };
  
  const decreaseQuantity = () => {
    setQuantity(prev => (prev > 1 ? prev - 1 : 0));
  };

  const handleAddToCart = async () => {
    if (quantity === 0) {
      message.warning('Số lượng phải lớn hơn 0');
      return;
    }
  
    const token = localStorage.getItem('token');
    if (!token) {
      message.warning('Bạn cần đăng nhập trước khi thêm sản phẩm vào giỏ hàng');
      navigate('/auth');
      return;
    }
  
    const orderDetails = {
      products: [
        {
          id: productId,
          quantity: quantity,
          size: selectedSize,
          color: selectedColor,
        },
      ],
      addressId: null,
    };

    console.log(products)
  
    try {
      const response = await instance.post('/orders', orderDetails, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status !== 200 && response.status !== 201) {
        throw new Error('Thêm vào giỏ hàng thất bại');
      }
  
      if ((response.status === 200 && response.data.message === 'Products changed') || (response.status === 201 && response.data.message === 'Order created successfully') ) {
        dispatch(setProductCount(currentProductCount + 1));
      }

      message.success('Thêm vào giỏ hàng thành công!');
      console.log(response.data);
  
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      message.error('Error adding product to cart: ' + errorMessage);
      console.error(error);
    }
  };
  
  

  if (!product) {
    return <div>Product not found.</div>;
  }

  return (
    <div className="modal-content">
      <div className="modal-images">
        <img
          alt={product.name}
          src={product.images[selectedImageIndex]}
          className="modal-main-image"
        />
        <div className="modal-thumbnail-list">
          {product.images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`${product.name} - ${index + 1}`}
              className={`modal-thumbnail ${selectedImageIndex === index ? 'active' : ''}`}
              onMouseEnter={() => setSelectedImageIndex(index)}
              onClick={() => setSelectedImageIndex(index)}
            />
          ))}
        </div>
      </div>
      <div className="modal-details">
        <div className="modal-details-content">
          <b>{product.name}</b>
          <p>{product.description}</p>
          <p><b>{product.price.toLocaleString()}</b> VND</p>
          <p>KÍCH THƯỚC</p>
          <Radio.Group onChange={(e) => setSelectedSize(e.target.value)} value={selectedSize}>
            {product.sizes.map((size) => (
              <Radio.Button key={size} value={size}>{size}</Radio.Button>
            ))}
          </Radio.Group>
          <p>MÀU SẮC</p>
          <Radio.Group onChange={(e) => setSelectedColor(e.target.value)} value={selectedColor}>
            {product.colors.map((color) => (
              <Radio.Button key={color} value={color}>{color}</Radio.Button>
            ))}
          </Radio.Group>
          <p>SỐ LƯỢNG</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Button onClick={decreaseQuantity}>-</Button>
            <span>{quantity}</span>
            <Button onClick={increaseQuantity}>+</Button>
          </div>
          <p>KHO: {currentStock}</p>
          <p>ĐÃ BÁN: {currentSold}</p>
        </div>
        <Button className={'btn-sign-in'} style={{ height: 60 }} type={'primary'} block onClick={handleAddToCart} >
          THÊM VÀO GIỎ HÀNG
        </Button>
      </div>
    </div>
  );
};

export default ProductDetail;
