const Product = require("../models/Product");
const Cart = require("../models/Cart");

const { STATUS_CODE } = require("../constants/statusCode");

exports.addProductToCart = async (request, response) => {
  console.log(`Dodawanie produktu do koszyka ${request.body.productName}`);
  const product = await Product.findByName(request.body.productName);

  if (product === undefined)
    return response.status(STATUS_CODE.NOT_FOUND);

  await Cart.add(product);

  response.status(STATUS_CODE.OK).json({ success: true });
};

exports.getProductsCount = async () => {
  return await Cart.getProductsQuantity();
};
