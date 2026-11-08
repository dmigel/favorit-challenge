import { STATUS } from '../store/helpers.js';
import { UNKNOWN_ERROR_MESSAGE } from '../utils/constants.js';
import EmptyState from './EmptyState.jsx';
import ErrorAlert from './ErrorAlert.jsx';
import Loader from './Loader.jsx';

/**
 * Выбирает UI по статусу асинхронного запроса.
 * @param {object} props
 * @param {'idle'|'loading'|'succeeded'|'failed'} props.status — статус запроса
 * @param {{ kind: string, message: string }|null} [props.error] — сериализованная ошибка
 * @param {boolean} [props.isEmpty] — пустой успешный результат
 * @param {() => void} [props.onRetry] — повтор запроса при ошибке
 * @param {string} [props.emptyTitle] — заголовок пустого состояния
 * @param {string} [props.emptyDescription] — описание пустого состояния
 * @param {string} [props.loadingLabel] — подпись лоадера
 * @param {import('react').ReactNode} [props.children] — контент при успехе
 */
function AsyncView({
  status,
  error,
  isEmpty,
  onRetry,
  emptyTitle,
  emptyDescription,
  loadingLabel,
  children,
}) {
  if (status === STATUS.LOADING) {
    return <Loader label={loadingLabel} />;
  }

  if (status === STATUS.FAILED) {
    return (
      <ErrorAlert message={error?.message ?? UNKNOWN_ERROR_MESSAGE} onRetry={onRetry} />
    );
  }

  if (status === STATUS.SUCCEEDED && isEmpty) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  if (status === STATUS.SUCCEEDED) {
    return children;
  }

  return null;
}

export default AsyncView;
