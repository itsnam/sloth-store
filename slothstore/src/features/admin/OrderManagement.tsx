import React, { useEffect, useMemo, useState } from 'react';
import { Table, Button, Modal, message, Select, Input, Tag } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import instance from '../../axios';

const { Search } = Input;

interface Product {
  id: {
    _id: string;
    images: string[];
    name: string;
    description: string;
    price: number;
    sizes: string[];
    colors: string[];
    type: string;
    inventory: Array<{
      size: string;
      color: string;
      stock: number;
      sold: number;
      _id: string;
    }>;
  };
  quantity: number;
  size: string;
  color: string;
  _id: string;
}

interface Address {
  fullName: string;
  phoneNumber: string;
  province: string;
  district: string;
  ward: string;
  street: string;
  _id: string;
}

interface Order {
  _id: string;
  user: {
    name: string;
  };
  products: Product[];
  address: Address;
  total: number;
  status: number;
  createdAt: string;
  updatedAt: string;
}

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<number | undefined>(undefined);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  const statusOptions = useMemo(() => [
    { value: 0, label: 'Đã huỷ', color: 'red' },
    { value: 2, label: 'Chờ xử lý', color: 'orange' },
    { value: 3, label: 'Đã duyệt', color: 'green' },
  ], []);


  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await instance.get('/orders/status-all', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const sortedOrders = response.data.sort((a: { createdAt: string; }, b: { createdAt: string; }) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(sortedOrders);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };  
  
  const onSearch = (value: string) => {
    setSearchQuery(value);
  };

  const handleStatusChange = async (orderId: string, status: number) => {
    try {
      setLoading(true);
      await instance.patch(`/orders/status`, { orderId, status }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      message.success('Cập nhật trạng thái đơn hàng thành công');
      fetchOrders();
    } catch (error) {
      console.error(error);
      message.error('Không thể cập nhật trạng thái đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterStatus = (value: number | undefined) => {
    setStatusFilter(value);
  };

  const filteredOrders = orders.filter((order) => {
    if (statusFilter !== undefined && order.status !== statusFilter) {
      return false;
    }
    
    if (
      searchQuery &&
      !order._id.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !order.address?.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
  
    return true;
  });

  const columns = [
    {
      title: 'Mã Đơn Hàng',
      dataIndex: '_id',
      key: '_id',
      width: '20%',
    },
    {
      title: 'Người Mua',
      dataIndex: 'address',
      key: 'address',
      render: (address: Address) => address?.fullName || 'N/A',
      width: '20%',
    },
    {
      title: 'Tổng Tiền',
      dataIndex: 'total',
      key: 'total',
      render: (_: number) => _.toLocaleString(),
      width: '20%',
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      align: 'center' as const,
      render: (status: number, record: Order) => (
        <Select
          value={status}
          onChange={(value: number) => handleStatusChange(record._id, value)}
          style={{ width: '100%' }}
        >
          {statusOptions.map((option) => (
            <Select.Option key={option.value} value={option.value}>
              <span style={{ backgroundColor: option.color, width: '8px', height: '8px', borderRadius: '50%', display: 'inline-block', marginRight: 4 }} />
              {option.label}
            </Select.Option>
          ))}
        </Select>
      ),
      width: '20%',
    },
    {
      title: 'Chi Tiết Đơn Hàng',
      key: 'details',
      render: (_: string, record: Order) => (
        <Button
          icon={<EyeOutlined />}
          onClick={() => {
            setEditingOrder(record);
            setModalVisible(true);
          }}
        >
          Xem
        </Button>
      ),
      width: '20%',
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', marginBottom: 16 }}>
        <Search
          placeholder="Tìm kiếm đơn hàng"
          allowClear
          onSearch={onSearch}
          onChange={(e) => setSearchQuery(e.target.value)}
          value={searchQuery}
          style={{ flex: 1, marginRight: 20 }}
        />
        <Select
          style={{ width: 200 }}
          onChange={handleFilterStatus}
          placeholder="Lọc theo trạng thái"
          allowClear
        >
          {statusOptions.map((option) => (
            <Select.Option key={option.value} value={option.value}>
              <span 
                style={{ 
                  backgroundColor: option.color, 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  display: 'inline-block', 
                  marginRight: 4 
                }} 
              />
              {option.label}
            </Select.Option>
          ))}
        </Select>
      </div>

      <Table
        columns={columns}
        dataSource={filteredOrders}
        rowKey="_id"
        loading={loading}
        pagination={{
          pageSize: 7,
          showTotal: (total) => `Tổng ${total} đơn hàng`,
        }}
      />

      <Modal
        title="Chi Tiết Đơn Hàng"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        <div>
          <h3>Thông tin giao hàng:</h3>
          <p><strong>Họ và tên:</strong> {editingOrder?.address.fullName}</p>
          <p><strong>Số điện thoại:</strong> {editingOrder?.address.phoneNumber}</p>
          <p><strong>Địa chỉ:</strong> {editingOrder?.address.street}, {editingOrder?.address.ward}, {editingOrder?.address.district}, {editingOrder?.address.province}</p>
          <p><strong>Tổng tiền:</strong> {editingOrder?.total.toLocaleString()} VND</p>
          <div style={{ marginBottom: '16px' }}>
            <strong>Trạng thái: </strong>
            {statusOptions.map(option => 
              option.value === editingOrder?.status && (
                <Tag key={option.value} color={option.color}>{option.label}</Tag>
              )
            )}
          </div>

          <h4>Danh sách sản phẩm:</h4>
          <ul style={{ listStyle: 'none' }}>
            {editingOrder?.products.map((product, index) => (
              <li key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100px', height: '100px' }}>
                  <img src={product.id.images[0]} alt={product.id.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                </div>
                <div style={{ marginLeft: '10px' }}>
                  <div>{product.id.name} - {product.quantity} x {product.id.price.toLocaleString()} VND</div>
                  <div><strong>Kích thước:</strong> {product.size}, <strong>Màu sắc:</strong> {product.color}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Modal>
    </div>
  );
};

export default OrderManagement;