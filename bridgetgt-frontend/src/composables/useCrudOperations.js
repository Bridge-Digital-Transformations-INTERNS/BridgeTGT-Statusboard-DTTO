/**
 * Generic CRUD operations composable
 * Provides common patterns for Create, Read, Update, Delete operations
 */
export function useCrudOperations() {
  /**
   * Generate a unique ID for new items
   * @param {string} prefix - Optional prefix for the ID
   * @returns {number} - Timestamp-based unique ID
   */
  const generateId = (prefix = "") => {
    const timestamp = Date.now();
    return prefix ? `${prefix}_${timestamp}` : timestamp;
  };

  /**
   * Generic add operation for arrays
   * @param {Array} collection - The array to add to
   * @param {Object} item - The item to add
   * @param {Object} options - Options for the add operation
   * @returns {Object} - The added item with ID
   */
  const addItem = (collection, item, options = {}) => {
    const { idField = "id", generateIdFn = generateId } = options;

    const newItem = {
      ...item,
      [idField]: generateIdFn(),
    };

    collection.value.push(newItem);
    return newItem;
  };

  /**
   * Generic update operation for arrays
   * @param {Array} collection - The array to update in
   * @param {string|number} id - The ID of the item to update
   * @param {Object} updates - The updates to apply
   * @param {Object} options - Options for the update operation
   * @returns {Object|null} - The updated item or null if not found
   */
  const updateItem = (collection, id, updates, options = {}) => {
    const { idField = "id" } = options;

    const index = collection.value.findIndex((item) => item[idField] === id);
    if (index !== -1) {
      collection.value[index] = { ...collection.value[index], ...updates };
      return collection.value[index];
    }
    return null;
  };

  /**
   * Generic delete operation for arrays
   * @param {Array} collection - The array to delete from
   * @param {string|number} id - The ID of the item to delete
   * @param {Object} options - Options for the delete operation
   * @returns {boolean} - Whether the item was successfully deleted
   */
  const deleteItem = (collection, id, options = {}) => {
    const { idField = "id" } = options;

    const index = collection.value.findIndex((item) => item[idField] === id);
    if (index !== -1) {
      collection.value.splice(index, 1);
      return true;
    }
    return false;
  };

  /**
   * Generic find operation for arrays
   * @param {Array} collection - The array to search in
   * @param {string|number} id - The ID of the item to find
   * @param {Object} options - Options for the find operation
   * @returns {Object|null} - The found item or null
   */
  const findItem = (collection, id, options = {}) => {
    const { idField = "id" } = options;
    return collection.value.find((item) => item[idField] === id) || null;
  };

  /**
   * Generic find multiple items operation
   * @param {Array} collection - The array to search in
   * @param {Array} ids - Array of IDs to find
   * @param {Object} options - Options for the find operation
   * @returns {Array} - Array of found items
   */
  const findItems = (collection, ids, options = {}) => {
    const { idField = "id" } = options;
    if (!Array.isArray(ids)) return [];
    return collection.value.filter((item) => ids.includes(item[idField]));
  };

  /**
   * Create a complete CRUD interface for a collection
   * @param {Array} collection - The reactive array to manage
   * @param {Object} options - Configuration options
   * @returns {Object} - Complete CRUD interface
   */
  const createCrudInterface = (collection, options = {}) => {
    const { itemName = "item", idField = "id", generateIdFn = generateId } = options;

    return {
      // Create
      [`add${itemName.charAt(0).toUpperCase() + itemName.slice(1)}`]: (item) =>
        addItem(collection, item, { idField, generateIdFn }),

      // Update
      [`update${itemName.charAt(0).toUpperCase() + itemName.slice(1)}`]: (id, updates) =>
        updateItem(collection, id, updates, { idField }),

      // Delete
      [`delete${itemName.charAt(0).toUpperCase() + itemName.slice(1)}`]: (id) =>
        deleteItem(collection, id, { idField }),

      // Read single
      [`get${itemName.charAt(0).toUpperCase() + itemName.slice(1)}ById`]: (id) =>
        findItem(collection, id, { idField }),

      // Read multiple
      [`get${itemName.charAt(0).toUpperCase() + itemName.slice(1)}sByIds`]: (ids) =>
        findItems(collection, ids, { idField }),
    };
  };

  return {
    generateId,
    addItem,
    updateItem,
    deleteItem,
    findItem,
    findItems,
    createCrudInterface,
  };
}
