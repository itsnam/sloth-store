const Address = require('../models/address');

exports.getAllAddresses = async (req, res) => {
  try {
    const addressRecord = await Address.findOne({ user: req.user._id });
    res.json(addressRecord.addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createAddress = async (req, res) => {
    try {
      let addressRecord = await Address.findOne({ user: req.user._id });
  
      if (!addressRecord) {
        addressRecord = new Address({
          user: req.user._id,
          addresses: [req.body]
        });
      } else {
        addressRecord.addresses.push(req.body);
      }
  
      const newAddressRecord = await addressRecord.save();
      res.status(201).json(newAddressRecord);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
  
exports.updateAddress = async (req, res) => {
    try {
      const addressRecord = await Address.findOne({ user: req.user._id });
  
      if (!addressRecord) {
        return res.status(404).json({ message: 'Không tìm thấy địa chỉ nào cho người dùng này' });
      }
  
      const addressIndex = addressRecord.addresses.findIndex(address => address._id.toString() === req.params.id);
      if (addressIndex === -1) {
        return res.status(404).json({ message: 'Không tìm thấy địa chỉ cần cập nhật' });
      }
  
      addressRecord.addresses[addressIndex] = { ...addressRecord.addresses[addressIndex], ...req.body };
  
      const updatedAddressRecord = await addressRecord.save();
      res.json(updatedAddressRecord);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
  

exports.deleteAddress = async (req, res) => {
    try {
        const addressRecord = await Address.findOne({ user: req.user._id });

        if (!addressRecord) {
        return res.status(404).json({ message: 'Không tìm thấy địa chỉ nào cho người dùng này' });
        }

        const addressIndex = addressRecord.addresses.findIndex(address => address._id.toString() === req.params.id);
        if (addressIndex === -1) {
        return res.status(404).json({ message: 'Không tìm thấy địa chỉ cần xóa' });
        }

        addressRecord.addresses.splice(addressIndex, 1);

        const updatedAddressRecord = await addressRecord.save();
        res.json({ message: 'Đã xóa địa chỉ', updatedAddressRecord });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
