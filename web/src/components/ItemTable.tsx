import { Link } from 'react-router';
import type { Item } from '../graphql/types';
import { CATEGORY_LABELS, formatDateTime } from './labels';
import { StatusBadge } from './StatusBadge';

export function ItemTable({ items }: { items: Item[] }) {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Category</th>
            <th>Found at</th>
            <th>Found on</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>
                <Link to={`/items/${item.id}`}>{item.name}</Link>
              </td>
              <td>{CATEGORY_LABELS[item.category]}</td>
              <td>{item.locationFound}</td>
              <td>{formatDateTime(item.foundAt)}</td>
              <td>
                <StatusBadge status={item.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
