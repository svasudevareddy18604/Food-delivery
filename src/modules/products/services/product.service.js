import Product from "../models/product.model.js";

import QRCode from "qrcode";

/* =========================================
   GET PRODUCTS
========================================= */

export const getProducts =
  async (search = "") => {

    try {

      const query =

        search

          ? {

              $or: [

                {

                  name: {

                    $regex: search,

                    $options: "i",

                  },

                },

                {

                  sku: {

                    $regex: search,

                    $options: "i",

                  },

                },

                {

                  category: {

                    $regex: search,

                    $options: "i",

                  },

                },

                {

                  brand: {

                    $regex: search,

                    $options: "i",

                  },

                },

              ],

            }

          : {};

      const products =

        await Product.find(query)

        .sort({

          createdAt: -1,

        });

      console.log(
        "SERVICE PRODUCTS:",
        products.length
      );

      return products;

    }

    catch (err) {

      console.log(
        "GET PRODUCTS SERVICE ERROR:",
        err
      );

      throw err;

    }

  };

/* =========================================
   ADD PRODUCT
========================================= */

export const addProduct =
  async (data, file) => {

    try {

      const price =
        Number(data.price);

      /* VALIDATION */

      if (

        !data.name ||

        !data.sku ||

        !data.category ||

        !data.price

      ) {

        throw new Error(

          "Please fill all required fields"

        );

      }

      if (

        isNaN(price)

      ) {

        throw new Error(

          "Invalid price"

        );

      }

      /* CHECK SKU */

      const existingSku =

        await Product.findOne({

          sku: data.sku,

        });

      if (existingSku) {

        throw new Error(

          "SKU already exists"

        );

      }

      /* QR DATA */

      const qrData =

        JSON.stringify({

          sku:
            data.sku,

          name:
            data.name,

          category:
            data.category,

          price,

        });

      /* QR IMAGE */

      const qrCodeImage =

        await QRCode.toDataURL(
          qrData
        );

      /* CREATE PRODUCT */

      const product =

        await Product.create({

          name:
            data.name,

          sku:
            data.sku,

          category:
            data.category,

          brand:
            data.brand || "",

          color:
            data.color || "",

          ram:
            data.ram || "",

          storage:
            data.storage || "",

          description:
            data.description || "",

          price,

          image:

            file
              ? file.filename
              : null,

          qrCode:
            qrCodeImage,

        });

      console.log(
        "PRODUCT CREATED:",
        product
      );

      return product;

    }

    catch (err) {

      console.log(
        "ADD PRODUCT SERVICE ERROR:",
        err
      );

      throw err;

    }

  };

/* =========================================
   UPDATE PRODUCT
========================================= */

export const updateProduct =
  async (

    id,

    data,

    file

  ) => {

    try {

      const price =
        Number(data.price);

      if (

        isNaN(price)

      ) {

        throw new Error(

          "Invalid price"

        );

      }

      const updatedData = {

        name:
          data.name,

        sku:
          data.sku,

        category:
          data.category,

        brand:
          data.brand || "",

        color:
          data.color || "",

        ram:
          data.ram || "",

        storage:
          data.storage || "",

        description:
          data.description || "",

        price,

      };

      if (file) {

        updatedData.image =
          file.filename;

      }

      const product =

        await Product.findByIdAndUpdate(

          id,

          updatedData,

          {

            new: true,

            runValidators: true,

          }

        );

      if (!product) {

        throw new Error(

          "Product not found"

        );

      }

      console.log(
        "PRODUCT UPDATED:",
        product
      );

      return product;

    }

    catch (err) {

      console.log(
        "UPDATE PRODUCT SERVICE ERROR:",
        err
      );

      throw err;

    }

  };

/* =========================================
   DELETE PRODUCT
========================================= */

export const deleteProduct =
  async (id) => {

    try {

      const product =

        await Product.findByIdAndDelete(
          id
        );

      if (!product) {

        throw new Error(

          "Product not found"

        );

      }

      console.log(
        "PRODUCT DELETED:",
        id
      );

      return product;

    }

    catch (err) {

      console.log(
        "DELETE PRODUCT SERVICE ERROR:",
        err
      );

      throw err;

    }

  };

/* =========================================
   GET PRODUCT BY SKU
========================================= */

export const getProductBySku =
  async (sku) => {

    try {

      const product =

        await Product.findOne({

          sku,

        });

      if (!product) {

        throw new Error(

          "Product not found"

        );

      }

      console.log(
        "PRODUCT FOUND:",
        product
      );

      return product;

    }

    catch (err) {

      console.log(
        "GET PRODUCT SKU SERVICE ERROR:",
        err
      );

      throw err;

    }

  };