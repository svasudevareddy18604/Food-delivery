import {

  assignProductToStore as assignProductToStoreService,

  getStoreInventory as getStoreInventoryService,

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
   GET STORE INVENTORY
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