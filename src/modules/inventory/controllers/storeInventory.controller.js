import {

  assignProductToStore as assignProductToStoreService,

  getStoreInventory as getStoreInventoryService,

  getAllInventory as getAllInventoryService,

  updateInventoryQuantity as updateInventoryQuantityService,

} from "../services/storeInventory.service.js";

/* =========================================
   ASSIGN PRODUCT TO STORE
========================================= */

export const assignProductToStore =
  async (data) => {

    try {

      const inventory =

        await assignProductToStoreService(
          data
        );

      return inventory;

    }

    catch (err) {

      console.log(

        "ASSIGN PRODUCT CONTROLLER ERROR:",

        err

      );

      throw err;

    }

  };

/* =========================================
   GET SINGLE STORE INVENTORY
========================================= */

export const getStoreInventory =
  async (storeId) => {

    try {

      const inventory =

        await getStoreInventoryService(
          storeId
        );

      return inventory;

    }

    catch (err) {

      console.log(

        "GET STORE INVENTORY CONTROLLER ERROR:",

        err

      );

      throw err;

    }

  };

/* =========================================
   GET ALL INVENTORY
========================================= */

export const getAllInventory =
  async () => {

    try {

      const inventory =

        await getAllInventoryService();

      return inventory;

    }

    catch (err) {

      console.log(

        "GET ALL INVENTORY CONTROLLER ERROR:",

        err

      );

      throw err;

    }

  };

/* =========================================
   UPDATE INVENTORY QUANTITY
========================================= */

export const updateInventoryQuantity =
  async (

    inventoryId,

    quantity

  ) => {

    try {

      const inventory =

        await updateInventoryQuantityService(

          inventoryId,

          quantity

        );

      return inventory;

    }

    catch (err) {

      console.log(

        "UPDATE INVENTORY CONTROLLER ERROR:",

        err

      );

      throw err;

    }

  };