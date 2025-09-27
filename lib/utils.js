import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount) {
  if (!amount) return 'Rp 0';
  
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numAmount);
}

export function formatDate(date, options = {}) {
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  };
  
  return new Intl.DateTimeFormat('id-ID', defaultOptions).format(new Date(date));
}

export function formatTime(date, options = {}) {
  const defaultOptions = {
    hour: '2-digit',
    minute: '2-digit',
    ...options
  };
  
  return new Intl.DateTimeFormat('id-ID', defaultOptions).format(new Date(date));
}

export function generateSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Replace multiple hyphens with single
}

export function truncateText(text, maxLength = 100) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

export function calculateDiscountAmount(originalAmount, discountType, discountValue, maxDiscountAmount = null) {
  let discountAmount = 0;
  
  if (discountType === 'percentage') {
    discountAmount = (originalAmount * discountValue) / 100;
  } else if (discountType === 'fixed_amount') {
    discountAmount = discountValue;
  }
  
  // Apply maximum discount limit if specified
  if (maxDiscountAmount && discountAmount > maxDiscountAmount) {
    discountAmount = maxDiscountAmount;
  }
  
  // Ensure discount doesn't exceed original amount
  if (discountAmount > originalAmount) {
    discountAmount = originalAmount;
  }
  
  return Math.round(discountAmount);
}

export function calculateTaxAmount(amount, taxType, taxValue) {
  if (taxType === 'percentage') {
    return Math.round((amount * taxValue) / 100);
  } else if (taxType === 'fixed_amount') {
    return taxValue;
  }
  
  return 0;
}

export function generateOrderNumber() {
  const prefix = 'ORD';
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${timestamp.slice(-6)}${random}`;
}

export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhone(phone) {
  const phoneRegex = /^(\+62|62|0)[0-9]{8,13}$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ''));
}

export function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}