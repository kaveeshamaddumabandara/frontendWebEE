const DEFAULT_API_URL = 'http://localhost:3001/api';

export const API_BASE_URL =
  process.env.REACT_APP_API_URL?.replace(/\/$/, '') || DEFAULT_API_URL;

export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

export const resolveMediaUrl = (url?: string): string => {
  if (!url) {
    return '';
  }

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  return `${API_ORIGIN}${url.startsWith('/') ? url : `/${url}`}`;
};
