import { Component } from 'react';
import PartRow from './PartRow.jsx';

/**
 * Таблица позиций (искомая деталь или аналоги).
 * @extends {Component<{ items: import('../api/normalizers.js').Part[], caption: string }>}
 */
class OffersTable extends Component {
  render() {
    const { items, caption } = this.props;

    return (
      <table
        className="table table-hover align-middle mb-0 parts-table"
        role="table"
      >
        <caption className="visually-hidden">{caption}</caption>
        <thead role="rowgroup">
          <tr role="row">
            <th scope="col" role="columnheader">
              Позиция
            </th>
            <th scope="col" className="text-end" role="columnheader">
              Цена
            </th>
            <th scope="col" className="text-end" role="columnheader">
              Остаток
            </th>
          </tr>
        </thead>
        <tbody role="rowgroup">
          {items.map((part) => (
            <PartRow key={part.id} part={part} />
          ))}
        </tbody>
      </table>
    );
  }
}

export default OffersTable;
