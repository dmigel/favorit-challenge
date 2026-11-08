import { Component } from 'react';
import { SORT_OPTIONS } from '../utils/constants.js';

const SEARCH_ID = 'offers-toolbar-search';
const SORT_ID = 'offers-toolbar-sort';
const STOCK_ID = 'offers-toolbar-stock';

/**
 * Панель фильтров и сортировки списка аналогов.
 * @extends {Component<{
 *   text: string,
 *   inStockOnly: boolean,
 *   sort: string,
 *   onTextChange: (value: string) => void,
 *   onInStockOnlyChange: (checked: boolean) => void,
 *   onSortChange: (value: string) => void
 * }>}
 */
export class OffersToolbar extends Component {
  /**
   * Передаёт текст поиска родителю.
   * @param {import('react').ChangeEvent<HTMLInputElement>} event
   */
  handleTextChange = (event) => {
    this.props.onTextChange(event.target.value);
  };

  /**
   * Передаёт состояние фильтра «только в наличии» родителю.
   * @param {import('react').ChangeEvent<HTMLInputElement>} event
   */
  handleInStockChange = (event) => {
    this.props.onInStockOnlyChange(event.target.checked);
  };

  /**
   * Передаёт выбранную сортировку родителю.
   * @param {import('react').ChangeEvent<HTMLSelectElement>} event
   */
  handleSortChange = (event) => {
    this.props.onSortChange(event.target.value);
  };

  render() {
    const { text, inStockOnly, sort } = this.props;

    return (
      <div className="row g-2 align-items-end mb-3">
        <div className="col-12 col-md-6">
          <label className="form-label" htmlFor={SEARCH_ID}>
            Поиск среди аналогов
          </label>
          <input
            id={SEARCH_ID}
            type="search"
            className="form-control"
            value={text}
            autoComplete="off"
            placeholder="Бренд, название или номер"
            onChange={this.handleTextChange}
          />
        </div>
        <div className="col-12 col-md-6">
          <label className="form-label" htmlFor={SORT_ID}>
            Сортировка
          </label>
          <select
            id={SORT_ID}
            className="form-select"
            value={sort}
            onChange={this.handleSortChange}
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
              id={STOCK_ID}
              type="checkbox"
              className="form-check-input"
              role="switch"
              checked={inStockOnly}
              onChange={this.handleInStockChange}
            />
            <label className="form-check-label" htmlFor={STOCK_ID}>
              Только в наличии
            </label>
          </div>
        </div>
      </div>
    );
  }
}

export default OffersToolbar;
