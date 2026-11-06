import { ApiError } from './ApiError.js';

/**
 * Выполняет GET-запрос к API подбора запчастей и возвращает сырой массив goods.
 * @param {{ number?: string, brand?: string, analogues?: string, info?: string }} params
 * @returns {Promise<object[]>}
 */
export async function requestParts(params = {}) {
  const url = new URL(import.meta.env.VITE_API_BASE_URL, window.location.origin);
  const searchParams = new URLSearchParams();

  searchParams.set('key', import.meta.env.VITE_API_KEY);

  for (const [name, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') {
      continue;
    }
    searchParams.set(name, String(value));
  }

  url.search = searchParams.toString();

  let response;
  try {
    response = await fetch(url);
  } catch {
    throw new ApiError('network');
  }

  if (!response.ok) {
    throw new ApiError('http', { status: response.status });
  }

  let body;
  try {
    body = await response.json();
  } catch {
    throw new ApiError('parse');
  }

  if (body.error != null) {
    throw new ApiError('api', { details: body.error });
  }

  if (!Array.isArray(body.goods)) {
    throw new ApiError('parse');
  }

  return body.goods;
}
