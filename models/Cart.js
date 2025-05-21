const { getDatabase } = require("../database");

const COLLECTION_NAME = "carts";

class Cart {
  constructor() {}

  static async getCart() {
    const db = getDatabase();

    try {
      let cart = await db.collection(COLLECTION_NAME).findOne({});

      // Jeśli koszyk nie istnieje, utwórz go
      if (!cart) {
        cart = { items: [] }; // Inicjalizuj lokalnie
        await db.collection(COLLECTION_NAME).insertOne(cart); // Wstaw do bazy
        return cart;
      }

      // Jeśli koszyk istnieje, ale nie ma pola 'items' lub jest ono null/undefined, zainicjalizuj je
      if (!cart.items) {
        cart.items = [];
        // Opcjonalnie: zaktualizuj bazę danych, aby upewnić się, że to pole istnieje na stałe
        await db.collection(COLLECTION_NAME).updateOne({}, { $set: { items: [] } });
      }

      return cart;
    } catch (error) {
      console.error("Error occurred while searching cart:", error); // Loguj cały błąd
      return { items: [] };
    }
  }

  // ... (reszta Twojego kodu, np. add, deleteProductByName, etc.)
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

      const cart = await this.getCart(); // Upewniamy się, że cart.items jest zawsze dostępne
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
      // Możesz też rzucić błąd dalej, aby obsłużyć go na wyższym poziomie
      // throw error;
    }
  }

  // ... (pozostałe metody)

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
        console.log(`Product '${productName}' removed from cart.`); // Dodany console.log
      } else {
        console.log(`Product '${productName}' not found in cart.`); // Dodany console.log
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
      console.error("Error occurred while searching for products in cart:", error); // Loguj cały błąd
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
      console.error("Error occurred while getting quantity of items in cart:", error); // Loguj cały błąd
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
      ); // Loguj cały błąd
      return 0;
    }
  }

  static async clearCart() {
    const db = getDatabase();

    try {
      await db
        .collection(COLLECTION_NAME)
        .updateOne({}, { $set: { items: [] } });
      console.log("Cart cleared successfully."); // Dodany console.log
    } catch (error) {
      console.error("Error occurred while clearing cart:", error);
    }
  }
}

module.exports = Cart;