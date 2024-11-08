import { Button, Modal, Form, Input, Select, message, Row, Col, Card } from "antd";
import { useState, useEffect } from "react";
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import instance from "../../../../axios";
import provincesData from '../../../../assets/provinces.json';
import './Address.css';

export interface AddressData {
  _id: string;
  fullName: string;
  phoneNumber: string;
  province: string;
  district: string;
  ward: string;
  street: string;
}

interface District {
  name: string;
  code: number;
  wards: Ward[];
}

interface Ward {
  name: string;
  code: number;
}

interface AddressProps {
  isCartPage: boolean;
  onSelectAddress?: (address: AddressData | null) => void;
}

const { Option } = Select;

const Address: React.FC<AddressProps> = ({ isCartPage, onSelectAddress }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [form] = Form.useForm();
  const [addresses, setAddresses] = useState<AddressData[]>([]);
  const [editingAddressIndex, setEditingAddressIndex] = useState<number | null>(null);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const provinces = provincesData;
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const { data } = await instance.get('/addresses', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setAddresses(data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = (index: number) => {
    const addressToDelete = addresses[index];
    Modal.confirm({
      title: 'Xóa địa chỉ',
      content: 'Bạn có chắc chắn muốn xóa địa chỉ này không?',
      onOk: async () => {
        try {
          await instance.delete(`/addresses/${addressToDelete._id}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          message.success('Xóa địa chỉ thành công');
          fetchAddresses();
        } catch (error) {
          message.error('Lỗi khi xóa địa chỉ!');
          console.log(error);
        }
      },
      onCancel: () => {
        message.info('Xóa địa chỉ đã bị hủy.');
      },
    });
  };

  const handleEdit = (index: number) => {
    const addressToEdit = addresses[index];
    setIsModalOpen(true);
    setIsEditMode(true);
    setEditingAddressIndex(index);
    form.setFieldsValue(addressToEdit);

    const selectedProvince = provinces.find(p => p.name === addressToEdit.province);
    if (selectedProvince) {
      setDistricts(selectedProvince.districts);
      const selectedDistrict = selectedProvince.districts.find(d => d.name === addressToEdit.district);
      if (selectedDistrict) {
        setWards(selectedDistrict.wards);
      }
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (isEditMode && editingAddressIndex !== null) {
        const addressToUpdate = addresses[editingAddressIndex];
        await instance.put(`/addresses/${addressToUpdate._id}`, values, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        message.success('Cập nhật địa chỉ thành công');
      } else {
        await instance.post('/addresses', values, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        message.success('Thêm địa chỉ thành công');
      }
      fetchAddresses();
      setIsModalOpen(false);
      form.resetFields();
      setDistricts([]);
      setWards([]);
    } catch (error) {
      message.error('Lỗi khi thêm/cập nhật địa chỉ!');
      console.log(error);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
    setDistricts([]);
    setWards([]);
  };

  const resetSelection = (field: string) => {
    form.setFieldsValue({ [field]: undefined });
    if (field === 'province') {
      setDistricts([]);
      setWards([]);
      form.setFieldsValue({ district: undefined, ward: undefined });
    } else if (field === 'district') {
      setWards([]);
      form.setFieldsValue({ ward: undefined });
    }
  };

  const handleProvinceChange = (value: string) => {
    const selectedProvince = provinces.find(p => p.name === value);
    if (selectedProvince) {
      setDistricts(selectedProvince.districts);
      setWards([]);
      form.setFieldsValue({ district: undefined, ward: undefined });
    }
  };

  const handleDistrictChange = (value: string) => {
    const selectedDistrict = districts.find(d => d.name === value);
    if (selectedDistrict) {
      setWards(selectedDistrict.wards || []);
      form.setFieldsValue({ ward: undefined });
    }
  };

  const handleSelectAddress = (addressId: string) => {
    setSelectedAddressId(addressId);
    const selectedAddress = addresses.find(addr => addr._id === addressId) || null;
    if (onSelectAddress) {
      onSelectAddress(selectedAddress);
    }
    console.log(selectedAddress);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ paddingBottom: 20, width: 1000 }}>
        <Row gutter={[16, 16]} justify={"start"} align={'middle'} style={{ flexDirection: isCartPage ? 'column' : 'row' }}>
          {addresses.map((address, index) => (
            <Col xs={24} sm={12} md={8} key={address._id}>
              <Card
                className={`card-address ${selectedAddressId === address._id ? 'selected' : ''}`}
                onClick={() => handleSelectAddress(address._id)}
                actions={[
                  <EditOutlined onClick={() => handleEdit(index)} />,
                  <DeleteOutlined onClick={() => handleDelete(index)} />,
                ]}
              >
                <div style={{ fontWeight: 'bold' }}>{address.fullName}</div>
                <div>{address.phoneNumber}</div>
                <div>{`${address.street}, ${address.ward}, ${address.district}, ${address.province}`}</div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
      <Button
        style={{ width: 200 }}
        type="default"
        block
        className="btn-profile"
        onClick={() => {
          setIsModalOpen(true);
          setIsEditMode(false);
          form.resetFields();
          setDistricts([]);
          setWards([]);
        }}
      >
        Thêm địa chỉ
      </Button>

      <Modal
        title={isEditMode ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ"}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okText={isEditMode ? "Cập nhật" : "Thêm"}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" requiredMark={false}>
          <Form.Item
            name="fullName"
            label="Họ và tên"
            rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
          >
            <Input size="large" placeholder="Nhập họ và tên" />
          </Form.Item>

          <Form.Item
            name="phoneNumber"
            label="Số điện thoại"
            rules={[
              { required: true, message: "Vui lòng nhập số điện thoại!" },
              { pattern: /^[0-9]{10}$/, message: "Số điện thoại không hợp lệ!" },
            ]}
          >
            <Input size="large" placeholder="Nhập số điện thoại" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="province"
                label="Tỉnh/Thành phố"
                rules={[{ required: true, message: "Vui lòng chọn tỉnh/thành phố!" }]}
              >
                <Select
                  size="large"
                  placeholder="Chọn tỉnh/thành phố"
                  onChange={handleProvinceChange}
                  showSearch
                  optionFilterProp="children"
                  dropdownRender={(menu) => (
                    <>
                      {menu}
                      <Button style={{ width: '100%' }} onClick={() => resetSelection('province')}>Đặt lại</Button>
                    </>
                  )}
                >
                  {provinces.map((province) => (
                    <Option key={province.code} value={province.name}>
                      {province.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="district"
                label="Quận/Huyện"
                rules={[{ required: true, message: "Vui lòng chọn quận/huyện!" }]}
              >
                <Select
                  size="large"
                  placeholder="Chọn quận/huyện"
                  onChange={handleDistrictChange}
                  showSearch
                  optionFilterProp="children"
                  disabled={!form.getFieldValue('province')}
                  dropdownRender={(menu) => (
                    <>
                      {menu}
                      <Button style={{ width: '100%' }} onClick={() => resetSelection('district')}>Đặt lại</Button>
                    </>
                  )}
                >
                  {districts.map((district) => (
                    <Option key={district.code} value={district.name}>
                      {district.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="ward"
                label="Phường/Xã"
                rules={[{ required: true, message: "Vui lòng chọn phường/xã!" }]}
              >
                <Select
                  size="large"
                  placeholder="Chọn phường/xã"
                  disabled={!form.getFieldValue('district')}
                  showSearch
                  optionFilterProp="children"
                  dropdownRender={(menu) => (
                    <>
                      {menu}
                      <Button style={{ width: '100%' }} onClick={() => resetSelection('ward')}>Đặt lại</Button>
                    </>
                  )}
                >
                  {wards.map((ward) => (
                    <Option key={ward.code} value={ward.name}>
                      {ward.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="street"
            label="Địa chỉ cụ thể"
            rules={[{ required: true, message: "Vui lòng nhập địa chỉ cụ thể!" }]}
          >
            <Input size="large" placeholder="Nhập địa chỉ cụ thể" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Address;