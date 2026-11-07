/**
 * Заглушка пустого результата.
 * @param {object} props
 * @param {string} props.title — заголовок
 * @param {string} [props.description] — поясняющий текст
 * @param {import('react').ReactNode} [props.children] — действие (например, кнопка)
 */
function EmptyState({ title, description, children }) {
  return (
    <div className="text-center text-muted py-5">
      <h3 className="fs-5">{title}</h3>
      {description ? <p>{description}</p> : null}
      {children}
    </div>
  );
}

export default EmptyState;
