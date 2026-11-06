import { setupServer } from 'msw/node';
import { handlers } from './handlers';

/** MSW-сервер для тестов. */
export const server = setupServer(...handlers);
