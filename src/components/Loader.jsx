/**
 * Индикатор загрузки.
 * @param {object} props
 * @param {string} [props.label='Загрузка…'] — скрытый текст для скринридеров
 * @param {string} [props.className] — дополнительные CSS-классы контейнера
 */
function Loader({ label = 'Загрузка…', className }) {
  const classes = ['d-flex', 'justify-content-center', 'align-items-center', 'py-5'];
  if (className) {
    classes.push(className);
  }

  return (
    <div role="status" className={classes.join(' ')}>
      <div className="spinner-border text-primary" aria-hidden="true" />
      <span className="visually-hidden">{label}</span>
    </div>
  );
}

export default Loader;
