import React, { useEffect, useState } from 'react';
import { Table, Form, Input, Button, Modal, InputNumber, Space, message, Select } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { Product } from '../../types/product';
import { InventoryItem } from '../../types/product';
import instance from '../../axios';

const { Search } = Input;

interface ProductManagementProps {
  products: Product[];
}

const ProductManagement: React.FC<ProductManagementProps> = ({ products: initialProducts }) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form] = Form.useForm();
  
  const [images, setImages] = useState<string[]>(['']);
  const [sizes, setSizes] = useState<string[]>(['']);
  const [colors, setColors] = useState<string[]>(['']);
  const [inventory, setInventory] = useState<{ size: string; color: string; stock: number; sold: number }[]>([]);

  const productTypeMapping: Record<string, string> = {
    'all-mens': 'Tất cả trang phục nam',
    'mens-tshirts': 'Đồ thun nam',
    'mens-shirts': 'Áo sơ mi nam',
    'mens-jackets': 'Áo khoác nam',
    'mens-pants': 'Quần nam',
    'all-womens': 'Tất cả trang phục nữ',
    'womens-tshirts': 'Đồ thun nữ',
    'womens-jackets': 'Áo khoác nữ',
    'womens-pants-skirts': 'Quần và váy nữ',
    'maternity-wear': 'Trang phục bầu',
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    fetchProducts();
  }, []);

  const onSearch = (value: string) => {
    setSearchQuery(value);
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await instance.get('/products');
      setProducts(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: {
    name: string;
    description: string;
    price: number;
    type: string;
  }) => {
    try {
      const validationErrors = validateProduct();
      if (validationErrors.length > 0) {
        Modal.error({
          title: 'Lỗi kiểm tra dữ liệu',
          content: (
            <ul>
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          ),
        });
        return;
      }

      setLoading(true);
      const productData = {
        ...values,
        images: images.filter(img => img.trim()),
        sizes: sizes.filter(size => size.trim()),
        colors: colors.filter(color => color.trim()),
        inventory,
        type: values.type,
        price: Math.round(values.price * 100) / 100
      };

      if (editingProduct) {
        await instance.put(`/products/${editingProduct._id}`, productData);
        message.success('Cập nhật sản phẩm thành công');
      } else {
        await instance.post('/products/', productData);
        message.success('Thêm sản phẩm thành công');
      }
      setModalVisible(false);
      form.resetFields();
      resetFormState();
      fetchProducts();
    } catch (error) {
      console.log(error);
      message.error('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      await instance.delete(`/products/${id}`);
      message.success('Xóa sản phẩm thành công');
      fetchProducts();
    } catch (error) {
      console.log(error);
      message.error('Không thể xóa sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const showEditModal = (product: Product) => {
    setEditingProduct(product);
    form.setFieldsValue({
      name: product.name,
      description: product.description,
      price: product.price,
      type: product.type,
    });
    setImages(product.images || ['']);
    setSizes(product.sizes || ['']);
    setColors(product.colors || ['']);
    setInventory(product.inventory || []);
    setModalVisible(true);
  };

  const addImageField = () => setImages([...images, '']);

  const addSizeField = () => {
    const newSizes = [...sizes, ''];
    setSizes(newSizes);
  };

  const addColorField = () => {
    const newColors = [...colors, ''];
    setColors(newColors);
  };

  const removeField = (index: number, type: 'image' | 'size' | 'color') => {
    if (type === 'image') {
      const newImages = [...images];
      newImages.splice(index, 1);
      setImages(newImages);
    } else if (type === 'size') {
      const newSizes = [...sizes];
      newSizes.splice(index, 1);
      setSizes(newSizes);
    } else if (type === 'color') {
      const newColors = [...colors];
      newColors.splice(index, 1);
      setColors(newColors);
    }
  };

  const generateInventory = () => {
    const newInventory: { size: string; color: string; stock: number; sold: number }[] = [];
    
    sizes.forEach(size => {
      if (size.trim()) {
        colors.forEach(color => {
          if (color.trim()) {
            const existingItem = inventory.find(
              item => item.size === size && item.color === color
            );
            
            newInventory.push({
              size,
              color,
              stock: existingItem?.stock || 0,
              sold: existingItem?.sold || 0
            });
          }
        });
      }
    });
    
    setInventory(newInventory);
    message.success('Đã tạo danh sách tồn kho');
  };

  const handleFieldChange = (index: number, value: string, type: 'image' | 'size' | 'color') => {
    const trimmedValue = value;
    if (type === 'image') {
      const newImages = [...images];
      newImages[index] = trimmedValue;
      setImages(newImages);
    } else if (type === 'size') {
      const newSizes = [...sizes];
      newSizes[index] = trimmedValue;
      setSizes(newSizes);
    } else if (type === 'color') {
      const newColors = [...colors];
      newColors[index] = trimmedValue;
      setColors(newColors);
    }
  };

  const validateProduct = () => {
    const errors: string[] = [];

    const name = form.getFieldValue('name');
    if (!name || !name.trim()) {
        errors.push('Tên sản phẩm không được để trống');
    }

    const description = form.getFieldValue('description');
    if (!description || !description.trim()) {
        errors.push('Mô tả sản phẩm không được để trống');
    }

    const price = form.getFieldValue('price');
    if (price === undefined) {
        errors.push('Giá không được để trống');
    }

    const type = form.getFieldValue('type');
    if (!type) {
        errors.push('Bạn phải chọn loại sản phẩm');
    }

    if (images.length === 0 || images.every(img => !img.trim())) {
        errors.push('Phải có ít nhất một hình ảnh');
    }

    images.forEach((img, index) => {
        if (!img.trim()) {
            errors.push(`Hình ảnh ${index + 1} không được để trống`);
        }
    });

    const validSizes = sizes.filter(size => size.trim());
    if (validSizes.length === 0) {
        errors.push('Phải có ít nhất một kích thước');
    }

    sizes.forEach((size, index) => {
        if (!size.trim()) {
            errors.push(`Kích thước ${index + 1} không được để trống`);
        }
    });

    const validColors = colors.filter(color => color.trim());
    if (validColors.length === 0) {
        errors.push('Phải có ít nhất một màu sắc');
    }

    colors.forEach((color, index) => {
        if (!color.trim()) {
            errors.push(`Màu sắc ${index + 1} không được để trống`);
        }
    });

    if (inventory.length === 0) {
        errors.push('Vui lòng tạo danh sách tồn kho');
    }

    validSizes.forEach(size => {
        validColors.forEach(color => {
            const hasInventory = inventory.some(
                item => item.size === size && item.color === color
            );
            if (!hasInventory) {
                errors.push(`Thiếu thông tin tồn kho cho kích thước ${size} và màu ${color}. Hãy tạo mới danh sách tồn kho`);
            }
        });
    });

    const combinations = new Set();
    inventory.forEach((item) => {
        const combo = `${item.size}-${item.color}`;
        if (combinations.has(combo)) {
            errors.push(`Tồn tại sự trùng lặp cho kích thước ${item.size} và màu ${item.color}`);
        }
        combinations.add(combo);
    });

    return errors;
  };

  const resetFormState = () => {
    setImages(['']);
    setSizes(['']);
    setColors(['']);
    setInventory([]);
    setEditingProduct(null);
  };

  const columns = [
    {
      title: 'Tên Sản Phẩm',
      dataIndex: 'name',
      key: 'name',
      width: '30%',
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (_: string, record: Product) => 
        record.price.toLocaleString(),
      width: '20%',
    },
    {
      title: 'Kho',
      key: 'stock',
      render: (_: string, record: Product) => 
        record.inventory.reduce((sum, item) => sum + item.stock, 0),
      width: '15%', 
    },
    {
      title: 'Đã Bán',
      key: 'sold',
      render: (_: string, record: Product) => 
        record.inventory.reduce((sum, item) => sum + item.sold, 0),
      width: '15%', 
    },
    {
      title: 'Thao Tác',
      key: 'actions',
      render: (_: string, record: Product) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => showEditModal(record)}
          >
            Sửa
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => Modal.confirm({
              title: 'Xác nhận xóa sản phẩm',
              content: 'Bạn có chắc chắn muốn xóa sản phẩm này?',
              onOk: () => handleDelete(record._id)
            })}
          >
            Xóa
          </Button>
        </Space>
      ),
      width: '20%', 
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', marginBottom: 16 }}>
        <Search
          placeholder="Tìm sản phẩm"
          allowClear
          onSearch={onSearch}
          onChange={(e) => setSearchQuery(e.target.value)}
          value={searchQuery}
          style={{ flex: 1, marginRight: 20 }}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingProduct(null);
            form.resetFields();
            setImages(['']);
            setSizes(['']);
            setColors(['']);
            setInventory([]);
            setModalVisible(true);
          }}
        >
          Thêm Sản Phẩm
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={filteredProducts}
        rowKey="_id"
        loading={loading}
        pagination={{
          pageSize: 7,
          showTotal: (total) => `Tổng ${total} sản phẩm`
        }}
      />

      <Modal
        title={editingProduct ? 'Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Tên sản phẩm"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="Mô tả sản phẩm"
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item
            name="price"
            label="Giá"
          >
            <InputNumber min={0} />
          </Form.Item>
          <Form.Item
            name="type"
            label="Loại sản phẩm"
          >
            <Select
              options={Object.entries(productTypeMapping).map(([value, label]) => ({ value, label }))}
              placeholder="Chọn loại sản phẩm"
            />
          </Form.Item>

          <Form.Item label="Hình ảnh">
            {images.map((image, index) => (
              <Space key={index} style={{ marginBottom: 8 }} align="baseline">
                <Input
                  value={image}
                  onChange={(e) => handleFieldChange(index, e.target.value, 'image')}
                  placeholder={`Hình ảnh ${index + 1}`}
                />
                <Button
                  type="link"
                  danger
                  icon={<MinusCircleOutlined />}
                  onClick={() => removeField(index, 'image')}
                />
              </Space>
            ))}
            <Button type="dashed" onClick={addImageField}>
              Thêm hình ảnh
            </Button>
          </Form.Item>

          <Form.Item label="Kích thước">
            {sizes.map((size, index) => (
              <Space key={index} style={{ marginBottom: 8 }} align="baseline">
                <Input
                  value={size}
                  onChange={(e) => handleFieldChange(index, e.target.value, 'size')}
                  placeholder={`Kích thước ${index + 1}`}
                />
                <Button
                  type="link"
                  danger
                  icon={<MinusCircleOutlined />}
                  onClick={() => removeField(index, 'size')}
                />
              </Space>
            ))}
            <Button type="dashed" onClick={addSizeField}>
              Thêm kích thước
            </Button>
          </Form.Item>

          <Form.Item label="Màu sắc">
            {colors.map((color, index) => (
              <Space key={index} style={{ marginBottom: 8 }} align="baseline">
                <Input
                  value={color}
                  onChange={(e) => handleFieldChange(index, e.target.value, 'color')}
                  placeholder={`Màu sắc ${index + 1}`}
                />
                <Button
                  type="link"
                  danger
                  icon={<MinusCircleOutlined />}
                  onClick={() => removeField(index, 'color')}
                />
              </Space>
            ))}
            <Button type="dashed" onClick={addColorField}>
              Thêm màu sắc
            </Button>
          </Form.Item>

          <Form.Item label="Tồn kho">
            <Button 
              type="default" 
              onClick={generateInventory}
              style={{ marginBottom: 16 }}
            >
              Tạo danh sách tồn kho từ size và màu sắc
            </Button>
            
            {inventory.length > 0 && (
              <Table
                dataSource={inventory}
                pagination={false}
                size="small"
                columns={[
                  {
                    title: 'Kích thước',
                    dataIndex: 'size',
                    key: 'size',
                  },
                  {
                    title: 'Màu sắc',
                    dataIndex: 'color',
                    key: 'color',
                  },
                  {
                    title: 'Tồn kho',
                    dataIndex: 'stock',
                    key: 'stock',
                    render: (value: number, _: InventoryItem, index: number) => (
                      <InputNumber
                        min={0}
                        value={value}
                        onChange={(value) => {  
                          const newInventory = [...inventory];
                          newInventory[index].stock = value || 0;
                          setInventory(newInventory);
                        }}
                      />
                    ),
                  },
                  {
                    title: 'Đã bán',
                    dataIndex: 'sold',
                    key: 'sold',
                    render: (value: number, _: InventoryItem, index: number) => (
                      <InputNumber
                        min={0}
                        value={value}
                        onChange={(value) => {
                          const newInventory = [...inventory];
                          newInventory[index].sold = value || 0;
                          setInventory(newInventory);
                        }}
                      />
                    ),
                  },
                ]}
              />
            )}
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              {editingProduct ? 'Cập nhật' : 'Thêm'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductManagement;