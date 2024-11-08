import React, { useState, useEffect } from 'react';
import { Input, Modal, Button, Radio } from 'antd';
import { Link } from 'react-router-dom';
import { Product } from '../../types/product';
import './Home.css';

const { Search } = Input;

interface HomeProps {
    products: Product[];
}

const Home: React.FC<HomeProps> = ({ products }) => {
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [selectedColor, setSelectedColor] = useState<string>('');
    const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
    const [currentStock, setCurrentStock] = useState<number>(0);
    const [currentSold, setCurrentSold] = useState<number>(0);

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const showModal = (product: Product) => {
        setSelectedProduct(product);
        setSelectedSize(product.sizes[0]);
        setSelectedColor(product.colors[0]);
        setSelectedImageIndex(0);
        setCurrentStock(0);
        setCurrentSold(0);
    };

    const handleCancel = () => {
        setSelectedProduct(null);
    };

    const onSearch = (value: string) => {
        setSearchQuery(value);
    };

    useEffect(() => {
        if (selectedProduct && selectedSize && selectedColor) {
            const inventoryItem = selectedProduct.inventory.find(
                item => item.size === selectedSize && item.color === selectedColor
            );
            if (inventoryItem) {
                setCurrentStock(inventoryItem.stock);
                setCurrentSold(inventoryItem.sold);
            } else {
                setCurrentStock(0);
                setCurrentSold(0);
            }
        } else {
            setCurrentStock(0);
            setCurrentSold(0);
        }
    }, [selectedProduct, selectedSize, selectedColor]);

    return (
        <div>
            <Search
                placeholder="input search text"
                allowClear
                onSearch={onSearch}
                onChange={(e) => setSearchQuery(e.target.value)}
                value={searchQuery}
            />
            <div className="products-grid">
                {filteredProducts.map(product => (
                    <div key={product._id} className="product-container">
                        <Link to={`/${product._id}`} className="product-link">
                            <img alt={product.name} src={product.images[0]} className="product-image" />
                        </Link>
                        <Button
                            className="product-button"
                            onClick={() => showModal(product)}
                        >
                            XEM
                        </Button>
                        <div className="product-info">
                            <Link to={`/${product._id}`} className="product-link">
                                <p>{product.name}</p>
                                <p><b>{product.price.toLocaleString()}</b> VND</p>
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
            {selectedProduct && (
                <Modal open={!!selectedProduct} onCancel={handleCancel} footer={null} width={800}>
                    <div className="modal-content">
                        <div className="modal-images">
                            <img alt={selectedProduct.name} src={selectedProduct.images[selectedImageIndex]} className="modal-main-image" />
                            <div className="modal-thumbnail-list">
                                {selectedProduct.images.map((image, index) => (
                                    <img
                                        key={index}
                                        src={image}
                                        alt={`${selectedProduct.name} - ${index + 1}`}
                                        className={`modal-thumbnail ${selectedImageIndex === index ? 'active' : ''}`}
                                        onMouseEnter={() => setSelectedImageIndex(index)}
                                        onClick={() => setSelectedImageIndex(index)}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="modal-details">
                            <div className="modal-details-content">
                                <b>{selectedProduct.name}</b>
                                <p>{selectedProduct.description}</p>
                                <p><b>{selectedProduct.price.toLocaleString()}</b> VND</p>
                                <p>KÍCH THƯỚC</p>
                                <Radio.Group onChange={(e) => setSelectedSize(e.target.value)} value={selectedSize}>
                                    {selectedProduct.sizes.map((size) => (
                                        <Radio.Button key={size} value={size}>{size}</Radio.Button>
                                    ))}
                                </Radio.Group>
                                <p>MÀU SẮC</p>
                                <Radio.Group onChange={(e) => setSelectedColor(e.target.value)} value={selectedColor}>
                                    {selectedProduct.colors.map((color) => (
                                        <Radio.Button key={color} value={color}>{color}</Radio.Button>
                                    ))}
                                </Radio.Group>
                                <p>KHO: {currentStock}</p>
                                <p>ĐÃ BÁN: {currentSold}</p>

                            </div>
                            <div>
                                <Link to={`/${selectedProduct._id}`}>
                                    <Button style={{ width: '100%', height: 60 }}>CHI TIẾT SẢN PHẨM</Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default Home;