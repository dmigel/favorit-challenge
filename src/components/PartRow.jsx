import { Component, Fragment } from 'react';
import { formatPrice } from '../utils/format.js';
import StockBadge from './StockBadge.jsx';
import WarehouseList from './WarehouseList.jsx';

/**
 * Строка позиции в таблице предложений (с раскрываемым списком складов).
 * @extends {Component<{
 *   part: import('../api/normalizers.js').Part,
 *   rowClassName?: string,
 * }>}
 */
class PartRow extends Component {
  state = { expanded: false };

  /**
   * Переключает раскрытие списка складов.
   */
  toggle = () => {
    this.setState((prevState) => ({ expanded: !prevState.expanded }));
  };

  render() {
    const { part, rowClassName } = this.props;
    const { expanded } = this.state;
    const warehousesId = `warehouses-${part.id}`;

    return (
      <Fragment>
        <tr role="row" className={rowClassName}>
          <td role="cell">
            <div className="fw-semibold">{part.brand}</div>
            <div>{part.name}</div>
            <div className="small text-muted">№ {part.number}</div>
            {part.notRefund ? (
              <span className="badge text-bg-warning">Невозвратная позиция</span>
            ) : null}
            {part.offers.length > 0 ? (
              <button
                type="button"
                className="btn btn-link btn-sm p-0 d-block"
                aria-expanded={expanded}
                aria-controls={warehousesId}
                onClick={this.toggle}
              >
                Склады ({part.offers.length})
              </button>
            ) : null}
          </td>
          <td className="text-end text-nowrap" data-label="Цена" role="cell">
            {part.minPrice !== null ? `от ${formatPrice(part.minPrice)}` : '—'}
          </td>
          <td className="text-end" data-label="Остаток" role="cell">
            <StockBadge stock={part.totalStock} />
          </td>
        </tr>
        {expanded ? (
          <tr id={warehousesId} className="parts-table__details" role="row">
            <td colSpan={3} role="cell">
              <WarehouseList offers={part.offers} />
            </td>
          </tr>
        ) : null}
      </Fragment>
    );
  }
}

export default PartRow;
