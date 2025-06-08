
import CryptoJS from 'crypto-js';

const SECRET_KEY = 'certificate-app-secret-2024';

export const hashPassword = (password) => {
  return CryptoJS.SHA256(password + SECRET_KEY).toString();
};

export const generateUniqueCode = () => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8);
  return `CERT-${timestamp.slice(-6)}-${random.toUpperCase()}`;
};

export const validatePassword = (inputPassword, hashedPassword) => {
  const inputHash = hashPassword(inputPassword);
  return inputHash === hashedPassword;
};
