import { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { selectBrandsItems } from '../features/brands/selectors.js';
import { formatPrice } from '../utils/format.js';
import { buildOffersPath } from '../utils/routes.js';

/**
 * Список производителей по номеру детали.
 * @extends {Component<{ items: import('../api/normalizers.js').Part[], number: string }>}
 */
export class BrandList extends Component {
  render() {
    const { items, number } = this.props;

    return (
      <>
        <p className="text-muted small">
          Найдено производителей: {items.length}. Выберите нужного:
        </p>
        <nav aria-label="Производители">
          <div className="list-group">
            {items.map((item) => (
              <Link
                key={item.id}
                className="list-group-item list-group-item-action"
                to={buildOffersPath(number, item.brand)}
              >
                <div className="d-flex flex-column flex-sm-row justify-content-between gap-1">
                  <div>
                    <strong>{item.brand}</strong>
                    <div className="small text-muted">
                      {item.name} · № {item.number}
                    </div>
                  </div>
                  <div className="text-sm-end">
                    {item.totalStock > 0 ? (
                      <span className="badge text-bg-success">
                        В наличии: {item.totalStock}
                      </span>
                    ) : (
                      <span className="badge text-bg-secondary">Нет в наличии</span>
                    )}
                    {item.minPrice != null ? (
                      <span className="ms-2">от {formatPrice(item.minPrice)}</span>
                    ) : null}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </nav>
      </>
    );
  }
}

/**
 * Подключает список брендов к Redux-состоянию.
 * @param {object} state
 * @returns {{ items: import('../api/normalizers.js').Part[] }}
 */
function mapStateToProps(state) {
  return {
    items: selectBrandsItems(state),
  };
}

// Именованный класс нужен тестам; default — подключённый к Redux.
// eslint-disable-next-line react-refresh/only-export-components -- connect + named export
export default connect(mapStateToProps)(BrandList);
