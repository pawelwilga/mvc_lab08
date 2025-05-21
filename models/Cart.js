const { getDatabase } = require("../database");

const COLLECTION_NAME = "carts";

class Cart {
  constructor() {}

  static async getCart() {
    const db = getDatabase();

    try {
      let cart = await db.collection(COLLECTION_NAME).findOne({});

      
      if (!cart) {
        cart = { items: [] };
        await db.collection(COLLECTION_NAME).insertOne(cart);
        return cart;
      }

      if (!cart.items) {
        cart.items = [];
        await db.collection(COLLECTION_NAME).updateOne({}, { $set: { items: [] } });
      }

      return cart;
    } catch (error) {
      console.error("Error occurred while searching cart:", error);
      return { items: [] };
    }
  }

  static async add(product) {
    const db = getDatabase();

    try {
      if (!product || typeof product !== "object") {
        throw new Error("Invalid product provided. Product must be an object.");
      }
      if (!product.name || typeof product.name !== "string") {
        throw new Error("Product must have a 'name' property of type string.");
      }
      if (typeof product.price === "undefined" || product.price < 0) {
        throw new Error("Product must have a non-negative 'price' property.");
      }

      const cart = await this.getCart();
      const searchedProduct = cart.items.find(
        (item) => item.product.name === product.name
      );

      if (searchedProduct) {
        searchedProduct.quantity += 1;
      } else {
        cart.items.push({ product: { name: product.name, price: product.price }, quantity: 1 });
      }

      await db
        .collection(COLLECTION_NAME)
        .updateOne({}, { $set: { items: cart.items } });

      console.log(`Product '${product.name}' added/updated in cart.`);
    } catch (error) {
      console.error("Error occurred while adding product to cart:", error.message);
    }
  }

  

  static async deleteProductByName(productName) {
    const db = getDatabase();

    try {
      const cart = await this.getCart();
      const initialItemCount = cart.items.length;

      cart.items = cart.items.filter(
        (item) => item.product.name !== productName
      );

      if (cart.items.length < initialItemCount) {
        await db
          .collection(COLLECTION_NAME)
          .updateOne({}, { $set: { items: cart.items } });
        console.log(`Product '${productName}' removed from cart.`); 
      } else {
        console.log(`Product '${productName}' not found in cart.`); 
      }
    } catch (error) {
      console.error(
        `Error occurred while deleting product '${productName}' from cart:`,
        error
      );
    }
  }

  static async getItems() {
    try {
      const cart = await this.getCart();
      return cart.items;
    } catch (error) {
      console.error("Error occurred while searching for products in cart:", error); 
      return [];
    }
  }

  static async getProductsQuantity() {
    try {
      const cart = await this.getCart();
      const productsQuantity = cart.items.reduce(
        (total, item) => total + item.quantity,
        0
      );
      return productsQuantity;
    } catch (error) {
      console.error("Error occurred while getting quantity of items in cart:", error); 
      return 0;
    }
  }

  static async getTotalPrice() {
    const db = getDatabase();

    try {
      const cart = await this.getCart();
      const totalPrice = cart.items.reduce(
        (total, item) => total + item.product.price * item.quantity,
        0
      );
      return totalPrice;
    } catch (error) {
      console.error(
        "Error occurred while calculating total price of items in cart:", error
      ); 
      return 0;
    }
  }

  static async clearCart() {
    const db = getDatabase();

    try {
      await db
        .collection(COLLECTION_NAME)
        .updateOne({}, { $set: { items: [] } });
      console.log("Cart cleared successfully."); 
    } catch (error) {
      console.error("Error occurred while clearing cart:", error);
    }
  }
}

module.exports = Cart;