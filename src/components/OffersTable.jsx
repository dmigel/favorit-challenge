import { Component } from 'react';
import PartRow from './PartRow.jsx';

/**
 * Таблица позиций (искомая деталь или аналоги).
 * @extends {Component<{ items: import('../api/normalizers.js').Part[], caption: string }>}
 */
export class OffersTable extends Component {
  render() {
    const { items, caption } = this.props;

    return (
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <caption className="visually-hidden">{caption}</caption>
          <thead>
            <tr>
              <th scope="col">Позиция</th>
              <th scope="col" className="text-end">
                Цена
              </th>
              <th scope="col" className="text-end">
                Остаток
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((part) => (
              <PartRow key={part.id} part={part} />
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

export default OffersTable;
