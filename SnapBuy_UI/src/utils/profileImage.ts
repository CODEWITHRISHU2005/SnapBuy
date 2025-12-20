const BASE64_REGEX = /^[A-Za-z0-9+/]+={0,2}$/;

const isLikelyBase64 = (value: string): boolean => {
  // Remove all whitespace (newlines, spaces)
  const cleanValue = value.replace(/\s/g, '');
  
  if (cleanValue.length < 16) {
    return false;
  }

  // If it's very long, assume it's base64 data
  // Removed this check as it can falsely identify long URLs as base64
  // if (cleanValue.length > 200) {
  //   return true;
  // }

  if (cleanValue.length % 4 !== 0) {
    return false;
  }
  return BASE64_REGEX.test(cleanValue);
};

export const normalizeProfileImage = (value?: string): string | undefined => {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  if (/^(data:image\/|https?:\/\/|blob:)/i.test(trimmed)) {
    return trimmed;
  }

  if (isLikelyBase64(trimmed)) {
    const cleanValue = trimmed.replace(/\s/g, '');
    return `data:image/jpeg;base64,${cleanValue}`;
  }

  return trimmed;
};

export const resolveProfileImage = (...sources: (string | undefined)[]): string | undefined => {
  for (const source of sources) {
    const normalized = normalizeProfileImage(source);
    if (normalized) {
      return normalized;
    }
  }
  return undefined;
};

