const Order = require('../models/order');
const Product = require('../models/product');
const Address = require('../models/address');

const createOrUpdateOrder = async (req, res) => {
  const { products } = req.body;
  const userId = req.user.id;

  try {
    const productDetails = await Product.find({ _id: { $in: products.map(p => p.id) } });
    
    let order = await Order.findOne({ user: userId, status: 1 });

    if (order) {
      const initialProductCount = order.products.length;

      products.forEach(product => {
        const productDetail = productDetails.find(p => p._id.toString() === product.id);

        if (productDetail) {
          const existingProductIndex = order.products.findIndex(p =>
            p.id.toString() === product.id &&
            p.size === product.size &&
            p.color === product.color
          );

          if (existingProductIndex > -1) {
            if (product.quantity === 0) {
              order.products.splice(existingProductIndex, 1);
            }else {
              order.products[existingProductIndex].quantity += (product.quantity || 1);
            }
          } else {
            order.products.push({
              id: product.id,
              quantity: product.quantity || 1,
              size: product.size,
              color: product.color,
            });
          }
        } else {
          console.warn(`Product with ID ${product.id} not found in the database`);
        }
      });

      order.address = null;
      order.total = 0;
      await order.save();
      const finalProductCount = order.products.length; 

      if (finalProductCount !== initialProductCount) {
        return res.status(200).json({ message: 'Products changed', order });
      } else {
        return res.status(200).json(order);
      }
    } else {
      const newProducts = products.map(product => ({
        id: product.id,
        quantity: product.quantity || 1,
        size: product.size,
        color: product.color,
      }));

      order = new Order({ user: userId, products: newProducts, address: null, total: 0 });
      await order.save();

      return res.status(201).json({ message: 'Order created successfully', order });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const getOrder = async (req, res) => {
  const userId = req.user.id;

  try {
    const order = await Order.findOne({ user: userId, status: 1 })
      .populate('products.id')
      .populate('address');

    if (!order) {
      return res.status(404).json({ message: 'No active order found' });
    }

    return res.status(200).json(order);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const placeOrder = async (req, res) => {
  const { total, addressId } = req.body;
  const userId = req.user.id;

  try {
    let order = await Order.findOne({ user: userId, status: 1 });

    if (!order) {
      return res.status(404).json({ message: 'No active order found' });
    }

    order.status = 2;
    order.total = total;
    order.address = addressId;

    const productUpdates = order.products.map(async product => {
      const productDetail = await Product.findById(product.id);
      if (productDetail) {
        const inventoryItem = productDetail.inventory.find(item => 
          item.size === product.size && item.color === product.color
        );
    
        if (inventoryItem) {
          inventoryItem.stock -= product.quantity;
        } else {
          console.warn(`Inventory item not found for product ${productDetail._id}, size ${product.size}, color ${product.color}`);
        }
        
        await productDetail.save();
      } else {
        console.warn(`Product with ID ${product.id} not found during order placement`);
      }
    });
    

    await Promise.all(productUpdates);

    await order.save();

    return res.status(200).json({ message: 'Order placed successfully', order });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const getOrdersByStatus = async (req, res) => {
  const userId = req.user.id;
  const statuses = [0, 2, 3];

  try {
    const orders = await Order.find({ user: userId, status: { $in: statuses } })
      .populate('products.id');

    if (orders.length === 0) {
      return res.status(404).json({ message: 'No orders found with the specified statuses' });
    }

    const addressIds = orders.map(order => order.address).filter(id => id);
    const addressRecords = await Address.find({ user: req.user._id, 'addresses._id': { $in: addressIds } });

    const addressMap = {};
    addressRecords.forEach(record => {
      record.addresses.forEach(addr => {
        addressMap[addr._id.toString()] = addr;
      });
    });

    const populatedOrders = orders.map(order => ({
      ...order._doc,
      address: addressMap[order.address.toString()] || null,
    }));

    return res.status(200).json(populatedOrders);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const patchOrderStatus = async (req, res) => {
  const userId = req.user.id;
  const { orderId, status } = req.body;  

  try {
    const validStatuses = [0, 1, 2, 3];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const isAdmin = req.user.role === 'admin';

    const order = await Order.findOne({ 
      $or: [
        { user: userId, _id: orderId },
        { _id: orderId }
      ]
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;

    if (status === 0 || status === 3) {
      await Promise.all(order.products.map(async (product) => {
        const productDetail = await Product.findById(product.id);
        if (productDetail) {
          const inventoryItem = productDetail.inventory.find(item => 
            item.size === product.size && item.color === product.color
          );
          if (inventoryItem) {
            if (status === 0) {
              inventoryItem.stock += product.quantity; 
            } else if (status === 3) {
              inventoryItem.sold += product.quantity; 
            }
            await productDetail.save();
          }
        }
      }));
    }

    await order.save(); 

    return res.status(200).json({ message: 'Order status updated successfully', order });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const getAllOrdersByStatus = async (req, res) => {
  const statuses = [0, 2, 3];

  try {
    const orders = await Order.find({ status: { $in: statuses } })
      .populate('products.id');

    if (orders.length === 0) {
      return res.status(404).json({ message: 'No orders found with the specified statuses' });
    }

    const addressIds = orders.map(order => order.address).filter(id => id);
    const addressRecords = await Address.find({ 'addresses._id': { $in: addressIds } });

    const addressMap = {};
    addressRecords.forEach(record => {
      record.addresses.forEach(addr => {
        addressMap[addr._id.toString()] = addr;
      });
    });

    const populatedOrders = orders.map(order => ({
      ...order._doc,
      address: order.address ? addressMap[order.address.toString()] : null,
    }));

    return res.status(200).json(populatedOrders);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createOrUpdateOrder,
  getOrder,
  placeOrder,
  getOrdersByStatus,
  patchOrderStatus,
  getAllOrdersByStatus
};

