import CryptoJS from "crypto-js";

const SECRET_KEY =
  "9f1a4d67e9b3d4f123c6a5b8f09d7c2e8f45a2bcd89ef120abcde3456789abcd";

export const encryptData = (data) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
};

export const decryptData = (ciphertext) => {
  if (!ciphertext || typeof ciphertext !== "string") {
    console.warn("Invalid ciphertext input");
    return null;
  }

  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    const decryptedText = bytes.toString(CryptoJS.enc.Utf8);

    if (!decryptedText) {
      console.warn("Failed to decrypt (tampered or invalid ciphertext)");
      return null;
    }

    return JSON.parse(decryptedText);
  } catch (e) {
    console.error("Decryption failed", e);
    return null;
  }
};
