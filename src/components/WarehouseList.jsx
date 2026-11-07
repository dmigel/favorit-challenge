import { formatPrice, formatShipment } from '../utils/format.js';

/**
 * Список складов с ценами и остатками для позиции.
 * @param {object} props
 * @param {import('../api/normalizers.js').Offer[]} props.offers — складские предложения
 */
function WarehouseList({ offers }) {
  return (
    <ul className="list-group list-group-flush" aria-label="Склады">
      {offers.map((offer) => (
        <li key={offer.id} className="list-group-item">
          <div className="d-flex flex-column flex-md-row justify-content-between gap-1">
            <div>
              <strong>{offer.code}</strong>
              {offer.own ? (
                <span className="badge text-bg-info ms-2">Свой склад</span>
              ) : null}
              <div className="small text-muted">{formatShipment(offer.shipmentDate)}</div>
            </div>
            <div className="text-md-end">
              {formatPrice(offer.price)}
              {` · остаток: ${offer.stock}`}
              {offer.notRefund ? (
                <span className="badge text-bg-warning ms-2">Невозвратный</span>
              ) : null}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default WarehouseList;
