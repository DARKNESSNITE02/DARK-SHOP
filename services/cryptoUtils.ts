// Utility to convert ArrayBuffer to Base64 string
const bufferToBase64 = (buffer: ArrayBuffer): string => {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
};

// Utility to convert Base64 string to ArrayBuffer
const base64ToBuffer = (base64: string): ArrayBuffer => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

// Hash the email to use as a lookup key (so we don't store plain email as key)
export const hashEmail = async (email: string): Promise<string> => {
  const msgBuffer = new TextEncoder().encode(email);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  return bufferToBase64(hashBuffer);
};

// Derive a cryptographic key from the user's password
const getDerivedKey = async (password: string, salt: Uint8Array): Promise<CryptoKey> => {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );

  return await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
};

export const encryptData = async (data: any, password: string): Promise<string> => {
  try {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await getDerivedKey(password, salt);
    
    const encodedData = new TextEncoder().encode(JSON.stringify(data));
    
    const encryptedContent = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv
      },
      key,
      encodedData
    );

    // Pack everything into a JSON string
    const pack = {
      salt: bufferToBase64(salt),
      iv: bufferToBase64(iv),
      data: bufferToBase64(encryptedContent)
    };

    return JSON.stringify(pack);
  } catch (error) {
    console.error("Encryption failed:", error);
    throw new Error("Falha ao criptografar dados.");
  }
};

export const decryptData = async (encryptedPackage: string, password: string): Promise<any> => {
  try {
    const pack = JSON.parse(encryptedPackage);
    const salt = new Uint8Array(base64ToBuffer(pack.salt));
    const iv = new Uint8Array(base64ToBuffer(pack.iv));
    const data = base64ToBuffer(pack.data);

    const key = await getDerivedKey(password, salt);

    const decryptedContent = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv
      },
      key,
      data
    );

    const decodedString = new TextDecoder().decode(decryptedContent);
    return JSON.parse(decodedString);
  } catch (error) {
    console.error("Decryption failed:", error);
    throw new Error("Senha incorreta ou dados corrompidos.");
  }
};