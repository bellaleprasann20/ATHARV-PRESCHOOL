/**
 * Global Validation Utilities for Atharv Preschool
 */

// 1. Email Validator
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

// 2. Indian Phone Number Validator (10 digits, starting with 6-9)
export const validatePhone = (phone) => {
  const re = /^[6-9]\d{9}$/;
  return re.test(String(phone));
};

// 3. Password Strength Validator 
// (Min 8 chars, at least one uppercase, one lowercase, one number)
export const validatePassword = (password) => {
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  return re.test(password);
};

// 4. Currency/Amount Validator
// (Ensures the amount is a positive number)
export const validateAmount = (amount) => {
  const num = Number(amount);
  return !isNaN(num) && num > 0;
};

// 5. Date of Birth Validator
// (Ensures the child is between 2 and 6 years old for preschool)
export const validatePreschoolAge = (dob) => {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age >= 2 && age <= 6;
};

// 6. Name Validator (Only letters and spaces)
export const validateName = (name) => {
  const re = /^[a-zA-Z\s]{2,50}$/;
  return re.test(name);
};