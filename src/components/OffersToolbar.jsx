import { useId } from 'react';
import { SORT_OPTIONS } from '../utils/constants.js';

/**
 * Панель фильтров и сортировки списка аналогов.
 * @param {object} props
 * @param {string} props.text — текст поиска
 * @param {boolean} props.inStockOnly — только позиции с остатком
 * @param {string} props.sort — текущая сортировка
 * @param {(value: string) => void} props.onTextChange
 * @param {(checked: boolean) => void} props.onInStockOnlyChange
 * @param {(value: string) => void} props.onSortChange
 */
function OffersToolbar({
  text,
  inStockOnly,
  sort,
  onTextChange,
  onInStockOnlyChange,
  onSortChange,
}) {
  const baseId = useId();
  const searchId = `${baseId}-search`;
  const sortId = `${baseId}-sort`;
  const stockId = `${baseId}-stock`;

  return (
    <div className="row g-2 align-items-end mb-3">
      <div className="col-12 col-md-6">
        <label className="form-label" htmlFor={searchId}>
          Поиск среди аналогов
        </label>
        <input
          id={searchId}
          type="search"
          className="form-control"
          value={text}
          autoComplete="off"
          placeholder="Бренд, название или номер"
          onChange={(event) => onTextChange(event.target.value)}
        />
      </div>
      <div className="col-12 col-md-6">
        <label className="form-label" htmlFor={sortId}>
          Сортировка
        </label>
        <select
          id={sortId}
          className="form-select"
          value={sort}
          onChange={(event) => onSortChange(event.target.value)}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="col-12 col-md-12">
        <div className="form-check form-switch">
          <input
            id={stockId}
            type="checkbox"
            className="form-check-input"
            role="switch"
            checked={inStockOnly}
            onChange={(event) => onInStockOnlyChange(event.target.checked)}
          />
          <label className="form-check-label" htmlFor={stockId}>
            Только в наличии
          </label>
        </div>
      </div>
    </div>
  );
}

export default OffersToolbar;
