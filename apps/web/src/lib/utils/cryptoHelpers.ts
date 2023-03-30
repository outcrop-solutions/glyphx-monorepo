import crypto from 'crypto';

// -------- Crypto helpers ----------
export const hmac = (key, value) => {
  return crypto.createHmac('sha256', key).update(value).digest();
};

export const hexhmac = (key, value) => {
  return crypto.createHmac('sha256', key).update(value).digest('hex');
};

export const hmacStepwise = (key, string) => {
  const hmac = createHmac('sha256', key);
  hmac.end(string);
  return hmac.read();
};

export const createHmac = crypto.createHmac;
