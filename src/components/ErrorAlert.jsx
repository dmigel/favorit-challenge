/**
 * Сообщение об ошибке с опциональной кнопкой повтора.
 * @param {object} props
 * @param {string} props.message — текст ошибки
 * @param {string} [props.title='Не удалось загрузить данные'] — заголовок алерта
 * @param {() => void} [props.onRetry] — обработчик кнопки повтора
 * @param {string} [props.retryLabel='Повторить'] — подпись кнопки повтора
 */
function ErrorAlert({
  message,
  title = 'Не удалось загрузить данные',
  onRetry,
  retryLabel = 'Повторить',
}) {
  return (
    <div className="alert alert-danger" role="alert">
      <h2 className="h5 alert-heading">{title}</h2>
      <p className="mb-0">{message}</p>
      {onRetry ? (
        <button type="button" className="btn btn-outline-danger btn-sm mt-3" onClick={onRetry}>
          {retryLabel}
        </button>
      ) : null}
    </div>
  );
}

export default ErrorAlert;
