import { Component, Fragment } from 'react';
import { formatPrice } from '../utils/format.js';
import WarehouseList from './WarehouseList.jsx';

/**
 * Строка позиции в таблице предложений (с раскрываемым списком складов).
 * @extends {Component<{ part: import('../api/normalizers.js').Part }>}
 */
export class PartRow extends Component {
  state = { expanded: false };

  /**
   * Переключает раскрытие списка складов.
   */
  toggle = () => {
    this.setState((prevState) => ({ expanded: !prevState.expanded }));
  };

  render() {
    const { part } = this.props;
    const { expanded } = this.state;
    const warehousesId = `warehouses-${part.id}`;

    return (
      <Fragment>
        <tr>
          <td>
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
          <td className="text-end text-nowrap">
            {part.minPrice !== null ? `от ${formatPrice(part.minPrice)}` : '—'}
          </td>
          <td className="text-end">
            {part.totalStock > 0 ? (
              <span className="badge text-bg-success">{part.totalStock}</span>
            ) : (
              <span className="badge text-bg-secondary">Нет в наличии</span>
            )}
          </td>
        </tr>
        {expanded ? (
          <tr id={warehousesId}>
            <td colSpan={3}>
              <WarehouseList offers={part.offers} />
            </td>
          </tr>
        ) : null}
      </Fragment>
    );
  }
}

export default PartRow;
