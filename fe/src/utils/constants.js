// src/utils/constants.js
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded'
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PARTIAL: 'partial',
  PAID: 'paid',
  REFUNDED: 'refunded'
};

export const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  BANK: 'bank',
  CREDIT: 'credit',
  MPESA: 'mpesa'
};

export const INVENTORY_ACTIONS = {
  RESTOCK: 'restock',
  SALE: 'sale',
  ADJUSTMENT: 'adjustment',
  DAMAGE: 'damage',
  RETURN: 'return'
};

export const RETURN_REASONS = {
  DEFECTIVE: 'defective',
  WRONG_ITEM: 'wrong_item',
  CUSTOMER_CHANGE_MIND: 'customer_change_mind',
  DAMAGED: 'damaged'
};