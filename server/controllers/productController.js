const Product = require('../models/product');

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createProduct = async (req, res) => {
  const productData = req.body;

  const isValidInventory = productData.inventory.every(item => 
    productData.sizes.includes(item.size) && productData.colors.includes(item.color)
  );

  if (!isValidInventory) {
    return res.status(400).json({ message: 'Inventory items must match product sizes and colors' });
  }

  const product = new Product(productData);
  try {
    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  if (updateData.inventory) {
    const sizes = updateData.sizes || req.body.sizes || [];
    const colors = updateData.colors || req.body.colors || [];

    const isValidInventory = updateData.inventory.every(item => 
      sizes.includes(item.size) && colors.includes(item.color)
    );

    if (!isValidInventory) {
      return res.status(400).json({ message: 'Updated inventory items must match product sizes and colors' });
    }
  }

  try {
    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};