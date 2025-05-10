import MenuItem from "../models/menuItem.model.js";
import { redisClient } from "../db/redis.js";
import { respondSuccess, respondError } from "../utils/response.util.js";
import uploadOnCloudinary, { deleteImage } from "../utils/cloudinary.js";


// Key used for caching the menu
const MENU_CACHE_KEY = "menu_items";

// GET all menu items (from cache if available)
export const getAllMenuItems = async (_req, res) => {
  try {
    // const cachedMenu = await redisClient.get(MENU_CACHE_KEY);

    // if (cachedMenu) {
    //   return respondSuccess(
    //     res,
    //     "Menu fetched from cache",
    //     JSON.parse(cachedMenu)
    //   );
    // }

    const menuItems = await MenuItem.find().lean();
    // await redisClient.set(MENU_CACHE_KEY, JSON.stringify(menuItems));
    return respondSuccess(res, "Menu fetched from DB", menuItems);
  } catch (err) {
    return respondError(res, err);
  }
};

// GET menu items by category
export const getMenuItemsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const categoryKey = `menu_items_category_${category}`;

    // First try to get data from Redis cache
    const cachedCategoryItems = await redisClient.get(categoryKey);

    if (cachedCategoryItems) {
      return respondSuccess(res, `Menu items for ${category} fetched from cache`, JSON.parse(cachedCategoryItems));
    }

    // If not in cache, fetch from database
    const menuItems = await MenuItem.find({ category }).lean();
    
    // Store in Redis cache with an expiry time (e.g., 1 hour = 3600 seconds)
    await redisClient.set(categoryKey, JSON.stringify(menuItems), {
      EX: 3600
    });

    return respondSuccess(res, `Menu items for ${category} fetched from DB`, menuItems);
  } catch (err) {
    return respondError(res, err);
  }
};

// POST add new menu item
export const addMenuItem = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      sizeOptions,
      isSpecial,
      isHealthy,
      available,
      ingredients,
    } = req.body;

    const imageFile = req.file;
    let imageUrl = "";

    if (imageFile) {
      const cloudinaryResponse = await uploadOnCloudinary(imageFile.path);
      if (cloudinaryResponse) {
        imageUrl = cloudinaryResponse.secure_url;
      } else {
        return respondError(res, new Error("Failed to upload image"), 400);
      }
    }

    // Parse sizeOptions if it's sent as a string
    let parsedSizeOptions = sizeOptions;
    if (typeof sizeOptions === "string") {
      try {
        parsedSizeOptions = JSON.parse(sizeOptions);
      } catch (err) {
        return respondError(res, new Error("Invalid size options format"), 400);
      }
    }

    // Parse ingredients if it's sent as a string
    let parsedIngredients = ingredients;
    if (typeof ingredients === "string") {
      try {
        parsedIngredients = JSON.parse(ingredients);
      } catch (err) {
        parsedIngredients = ingredients
          ? ingredients.split(",").map((item) => item.trim())
          : [];
      }
    }

    const newItem = await MenuItem.create({
      name,
      description: description || "",
      price,
      category,
      sizeOptions: parsedSizeOptions || [],
      imageUrl,
      isSpecial: isSpecial === "true" || isSpecial === true,
      isHealthy: isHealthy === "true" || isHealthy === true,
      available: available !== "false" && available !== false,
      ingredients: parsedIngredients || [],
    });

    // Update main menu cache
    const updatedMenu = await MenuItem.find().lean();
    await redisClient.set(MENU_CACHE_KEY, JSON.stringify(updatedMenu));
    
    // Update category-specific cache
    if (category) {
      const categoryKey = `menu_items_category_${category}`;
      const categoryItems = await MenuItem.find({ category }).lean();
      await redisClient.set(categoryKey, JSON.stringify(categoryItems), {
        EX: 3600
      });
    }
    
    // If item is marked as special, update featured items cache
    if (newItem.isSpecial) {
      const featuredItems = await MenuItem.find({ isSpecial: true }).lean();
      await redisClient.set('featured_menu_items', JSON.stringify(featuredItems), {
        EX: 3600
      });
    }
    
    // If item is marked as healthy, update healthy items cache
    if (newItem.isHealthy) {
      const healthyItems = await MenuItem.find({ isHealthy: true }).lean();
      await redisClient.set('healthy_menu_items', JSON.stringify(healthyItems), {
        EX: 3600
      });
    }

    return respondSuccess(res, "Menu item added", newItem, 201);
  } catch (err) {
    return respondError(res, err);
  }
};

// PUT update menu item
export const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    // Get the original item to compare changes
    const originalItem = await MenuItem.findById(id);
    if (!originalItem) {
      return respondError(res, new Error("Menu item not found"), 404);
    }

    // Parse sizeOptions if it's sent as a string
    if (typeof updateData.sizeOptions === "string") {
      try {
        updateData.sizeOptions = JSON.parse(updateData.sizeOptions);
      } catch (err) {
        return respondError(res, new Error("Invalid size options format"), 400);
      }
    }

    // Parse ingredients if it's sent as a string
    if (typeof updateData.ingredients === "string") {
      try {
        updateData.ingredients = JSON.parse(updateData.ingredients);
      } catch (err) {
        updateData.ingredients = updateData.ingredients
          ? updateData.ingredients.split(",").map((item) => item.trim())
          : [];
      }
    }

    // Convert string boolean values to actual booleans
    if (updateData.isSpecial !== undefined) {
      updateData.isSpecial =
        updateData.isSpecial === "true" || updateData.isSpecial === true;
    }

    if (updateData.isHealthy !== undefined) {
      updateData.isHealthy =
        updateData.isHealthy === "true" || updateData.isHealthy === true;
    }

    if (updateData.available !== undefined) {
      updateData.available =
        updateData.available !== "false" && updateData.available !== false;
    }

    // Handle image upload if a new image is provided
    if (req.file) {
      const cloudinaryResponse = await uploadOnCloudinary(req.file.path);
      if (cloudinaryResponse) {
        // Delete previous image if it exists
        if (originalItem.imageUrl) {
          await deleteImage(originalItem.imageUrl);
        }
        updateData.imageUrl = cloudinaryResponse.secure_url;
      } else {
        return respondError(res, new Error("Failed to upload image"), 400);
      }
    }

    const updatedItem = await MenuItem.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    // Update main menu cache
    const updatedMenu = await MenuItem.find().lean();
    await redisClient.set(MENU_CACHE_KEY, JSON.stringify(updatedMenu));
    
    // Update category cache for both old and new category (if changed)
    const originalCategory = originalItem.category;
    const newCategory = updateData.category || originalCategory;
    
    if (originalCategory) {
      const categoryKey = `menu_items_category_${originalCategory}`;
      const categoryItems = await MenuItem.find({ category: originalCategory }).lean();
      await redisClient.set(categoryKey, JSON.stringify(categoryItems), {
        EX: 3600
      });
    }
    
    if (newCategory && newCategory !== originalCategory) {
      const categoryKey = `menu_items_category_${newCategory}`;
      const categoryItems = await MenuItem.find({ category: newCategory }).lean();
      await redisClient.set(categoryKey, JSON.stringify(categoryItems), {
        EX: 3600
      });
    }
    
    // Update featured items cache if special status changed or was special
    const wasSpecial = originalItem.isSpecial;
    const isSpecial = updateData.isSpecial !== undefined ? updateData.isSpecial : wasSpecial;
    if (wasSpecial || isSpecial) {
      const featuredItems = await MenuItem.find({ isSpecial: true }).lean();
      await redisClient.set('featured_menu_items', JSON.stringify(featuredItems), {
        EX: 3600
      });
    }
    
    // Update healthy items cache if healthy status changed or was healthy
    const wasHealthy = originalItem.isHealthy;
    const isHealthy = updateData.isHealthy !== undefined ? updateData.isHealthy : wasHealthy;
    if (wasHealthy || isHealthy) {
      const healthyItems = await MenuItem.find({ isHealthy: true }).lean();
      await redisClient.set('healthy_menu_items', JSON.stringify(healthyItems), {
        EX: 3600
      });
    }

    return respondSuccess(res, "Menu item updated", updatedItem);
  } catch (err) {
    return respondError(res, err);
  }
};

// DELETE menu item
export const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const menuItem = await MenuItem.findById(id);

    if (!menuItem)
      return respondError(res, new Error("Menu item not found"), 404);

    // Delete image from Cloudinary if it exists
    if (menuItem.imageUrl) {
      await deleteImage(menuItem.imageUrl);
    }
    
    // Store category, isSpecial and isHealthy before deleting
    const category = menuItem.category;
    const isSpecial = menuItem.isSpecial;
    const isHealthy = menuItem.isHealthy;

    await MenuItem.findByIdAndDelete(id);

    // Update main menu cache
    const updatedMenu = await MenuItem.find().lean();
    await redisClient.set(MENU_CACHE_KEY, JSON.stringify(updatedMenu));
    
    // Update category-specific cache
    if (category) {
      const categoryKey = `menu_items_category_${category}`;
      const categoryItems = await MenuItem.find({ category }).lean();
      await redisClient.set(categoryKey, JSON.stringify(categoryItems), {
        EX: 3600
      });
    }
    
    // Update featured items cache if item was special
    if (isSpecial) {
      const featuredItems = await MenuItem.find({ isSpecial: true }).lean();
      await redisClient.set('featured_menu_items', JSON.stringify(featuredItems), {
        EX: 3600
      });
    }
    
    // Update healthy items cache if item was healthy
    if (isHealthy) {
      const healthyItems = await MenuItem.find({ isHealthy: true }).lean();
      await redisClient.set('healthy_menu_items', JSON.stringify(healthyItems), {
        EX: 3600
      });
    }

    return respondSuccess(res, "Menu item deleted", menuItem);
  } catch (err) {
    return respondError(res, err);
  }
};

// GET featured menu items (those marked as special)
export const getFeaturedItems = async (_req, res) => {
  try {
    const featuredItems = await MenuItem.find({ isSpecial: true }).lean();
    return respondSuccess(res, "Featured menu items fetched", featuredItems);
  } catch (err) {
    return respondError(res, err);
  }
};

// GET healthy menu items
export const getHealthyItems = async (_req, res) => {
  try {
    const healthyItems = await MenuItem.find({ isHealthy: true }).lean();
    return respondSuccess(res, "Healthy menu items fetched", healthyItems);
  } catch (err) {
    return respondError(res, err);
  }
};
