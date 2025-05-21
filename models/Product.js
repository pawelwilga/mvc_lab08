const { getDatabase } = require("../database");
const Cart = require('./Cart');
const COLLECTION_NAME = "products";

class Product {
  constructor(name, description, price) {
    this.name = name;
    this.description = description;
    this.price = price;
  }

  static async getAll() {
    const db = getDatabase();

    try {
      const products = await db.collection(COLLECTION_NAME).find({}).toArray();

      return products;
    } catch (error) {
      console.error("Error occurred while searching for all products");

      return [];
    }
  }

  static async add(product) {
    const db = getDatabase();

    try {
      await db.collection(COLLECTION_NAME).insertOne(product);
    } catch (error) {
      console.error("Error occurred while adding product");
    }
  }

  static async findByName(name) {
    const db = getDatabase();

    try {
      const searchedProduct = await db
        .collection(COLLECTION_NAME)
        .findOne({ name });

      return searchedProduct;
    } catch (error) {
      console.error("Error occurred while searching product");

      return null;
    }
  }

  static async deleteByName(name) {
    const db = getDatabase();

    Cart.deleteProductByName(name);

    try {
      await db.collection(COLLECTION_NAME).deleteOne({ name });
    } catch (error) {
      console.error("Error occurred while deleting product");
    }
  }

  static async getLast() {
    const db = getDatabase();

    try {
      const lastAddedProduct = await db
        .collection(COLLECTION_NAME)
        .find({})
        .sort({ _id: -1 })
        .limit(1)
        .toArray()
        .then((docs) => docs[0]);

      return lastAddedProduct;
    } catch (error) {
      console.error("Error occurred while searching for last product");

      return null;
    }
  }
}

module.exports = Product;
