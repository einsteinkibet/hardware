// src/utils/validators.js
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone) => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

export const validateRequired = (value) => {
  return value !== null && value !== undefined && value.toString().trim() !== '';
};

export const validateNumber = (value, min = null, max = null) => {
  const num = parseFloat(value);
  if (isNaN(num)) return false;
  if (min !== null && num < min) return false;
  if (max !== null && num > max) return false;
  return true;
};

export const validatePrice = (value) => {
  return validateNumber(value, 0);
};

export const validatePassword = (password) => {
  return password.length >= 8;
};

export const validateSKU = (sku) => {
  return sku.length >= 3 && /^[a-zA-Z0-9\-_]+$/.test(sku);
};

export const validateBarcode = (barcode) => {
  return barcode.length >= 8 && /^[0-9]+$/.test(barcode);
};

export const validateQuantity = (quantity) => {
  return validateNumber(quantity, 1);
};