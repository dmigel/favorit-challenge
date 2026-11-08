/**
 * Бейдж остатка: количество или «Нет в наличии».
 * @param {object} props
 * @param {number} props.stock — суммарный остаток
 * @param {'count'|'labeled'} [props.variant='count'] — count: только число; labeled: «В наличии: N»
 */
function StockBadge({ stock, variant = 'count' }) {
  if (stock > 0) {
    const text = variant === 'labeled' ? `В наличии: ${stock}` : String(stock);
    return <span className="badge text-bg-success">{text}</span>;
  }

  return <span className="badge text-bg-secondary">Нет в наличии</span>;
}

export default StockBadge;
