/** Известные тексты ошибок API и их русские сообщения. */
const API_ERROR_MESSAGES = {
  'Empty key!': 'Не указан ключ API',
  'Invalid key client!': 'Неверный ключ API',
  'Empty number goods!': 'Введите номер детали',
  'Request quota exceeded!': 'Превышен лимит запросов, попробуйте позже',
};

/**
 * Приводит поле error ответа API к массиву строк.
 * @param {string|string[]|undefined|null} error
 * @returns {string[]}
 */
function toErrorDetails(error) {
  if (error == null) {
    return [];
  }
  const list = Array.isArray(error) ? error : [error];
  return list.map((item) => String(item));
}

/**
 * Переводит тексты ошибок API на русский.
 * @param {string[]} details
 * @returns {string}
 */
function formatApiMessage(details) {
  const messages = details.map((text) => {
    if (Object.prototype.hasOwnProperty.call(API_ERROR_MESSAGES, text)) {
      return API_ERROR_MESSAGES[text];
    }
    return `Ошибка сервиса: ${text}`;
  });
  return messages.join('; ');
}

/**
 * Ошибка слоя API с типом сбоя и деталями ответа.
 */
export class ApiError extends Error {
  /**
   * @param {'network'|'http'|'parse'|'api'} kind
   * @param {{ status?: number, details?: string|string[] }} [options]
   */
  constructor(kind, options = {}) {
    const details = toErrorDetails(options.details);
    let message;

    switch (kind) {
      case 'network':
        message = 'Нет соединения с сервером';
        break;
      case 'http':
        message = `Сервер вернул ошибку ${options.status}`;
        break;
      case 'parse':
        message = 'Некорректный ответ сервера';
        break;
      case 'api':
        message = formatApiMessage(details);
        break;
      default:
        message = 'Неизвестная ошибка';
    }

    super(message);
    this.name = 'ApiError';
    /** @type {'network'|'http'|'parse'|'api'} */
    this.kind = kind;
    /** @type {number|undefined} */
    this.status = options.status;
    /** @type {string[]} */
    this.details = details;
  }
}
