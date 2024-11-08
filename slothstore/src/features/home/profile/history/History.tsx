import { Button, Card, Col, message, Modal, Row, Tag } from "antd";
import { useEffect, useState } from "react";
import instance from "../../../../axios";
import './History.css';
import { AddressData } from "../address/Address";

interface Product {
  id: {
    _id: string;
    name: string;
    images: string[];
    price: number;
  };
  quantity: number;
  size: string;
  color: string;
}

interface OrderData {
  _id: string;
  products: Product[];
  status: number;
  address: AddressData | null
  total: number; 
  createdAt: Date;
}

const History: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
  const [orders, setOrders] = useState<OrderData[]>([]);

  useEffect(() => {
    fetchOrders();
  }, []); 

  const fetchOrders = async () => {
    try {
      const { data } = await instance.get<OrderData[]>('/orders/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
  
      const sortedOrders = data.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA; 
      });
  
      setOrders(sortedOrders);
    } catch (error) {
      console.log(error);
    }
  };
  
  
  const handleSelectOrder = (order: OrderData) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const getStatusTag = (status: number) => {
    switch (status) {
      case 0:
        return <Tag color="red">Huỷ</Tag>;
      case 2:
        return <Tag color="orange">Đang duyệt</Tag>;
      case 3:
        return <Tag color="green">Đã duyệt</Tag>;
      default:
        return null;
    }
  };

  const handleChangeOrderStatus = async (orderId: string, newStatus: number) => {
    try {
      await instance.patch('/orders/status', { orderId, status: newStatus }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      message.success('Huỷ đơn hàng thành công');

      if (selectedOrder) {
        setSelectedOrder(prev => ({
          ...prev!,
          status: newStatus 
        }));
      }
      
      await fetchOrders();
    } catch (error) {
      console.error(error);
      message.error('Huỷ đơn hàng thất bại');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ paddingBottom: 20, width: 1000 }}>
        <Row gutter={[20, 20]} justify={"start"} align={'middle'}>
          {orders.map((order) => (
            <Col xs={24} sm={12} md={8} key={order._id}>
              <Card 
                className="hover-card" 
                onClick={() => handleSelectOrder(order)}
              >
                <div style={{ fontWeight: 'bold' }}>Đơn hàng: {order._id}</div>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                  {getStatusTag(order.status)}
                  {order.products.length > 0 && (
                    <img src={order.products[0].id.images[0]} alt="Product" style={{ width: '75%', height: 'auto', marginTop: 10 }} />
                  )}
                </div>
                <div style={{ marginTop: 10 }}>
                  {order.address ? (
                    <>
                      <h4>{order.address.fullName}</h4>
                      <p>{order.address.phoneNumber}</p>
                      <p>{order.address.street}, {order.address.ward}, {order.address.district}, {order.address.province}</p>
                    </>
                  ) : (
                    <p>Địa chỉ không có sẵn</p>
                  )}
                  <h4>Tổng: {order.total.toLocaleString()} VNĐ</h4>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>{`Đơn hàng: ${selectedOrder?._id}`}</span>
            {selectedOrder && getStatusTag(selectedOrder.status)}
          </div>
        }
        open={isModalOpen}
        onCancel={handleOk}
        onOk={handleOk}
        width={800}
        okText={'Xác nhận'}
        footer={(_, { OkBtn }) => (
          <>
            <Button 
              type="primary" 
              danger 
              onClick={() => handleChangeOrderStatus(selectedOrder!._id, 0)}
              disabled={selectedOrder?.status === 0 || selectedOrder?.status === 3}
            >
              Huỷ đơn hàng
            </Button>
            <OkBtn />
          </>
        )}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
          {selectedOrder && selectedOrder.products.map((product, index) => (
            <div 
              key={index} 
              style={{ display: 'flex', gap: 12, alignItems: 'center', width: '48%' }}
            >
              <img src={product.id.images[0]} alt="Product" style={{ width: '85px', height: 'auto' }} />
              <div style={{ flexDirection: 'column' }}>
                <h3>{product.id.name}</h3>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div>
                    <p>Size: {product.size}</p>
                    <p>Số lượng: {product.quantity}</p>
                  </div>
                  <div>
                    <p>Màu: {product.color}</p>
                    <p>Tổng: {(product.quantity * product.id.price).toLocaleString()} VNĐ</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {selectedOrder?.address && (
          <div style={{ marginTop: 20 }}>
            <h4>Thông tin giao hàng:</h4>
            <h4>{selectedOrder.address.fullName}</h4>
            <p>{selectedOrder.address.phoneNumber}</p>
            <p>{selectedOrder.address.street}, {selectedOrder.address.ward}, {selectedOrder.address.district}, {selectedOrder.address.province}</p>
            <b style={{display: 'flex', justifyContent: 'end'}}>Tổng: {selectedOrder.total.toLocaleString()} VNĐ</b>
          </div>
        )}
</Modal>
    </div>
  );
};

export default History;
