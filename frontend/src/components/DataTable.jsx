export function DataTable({ title, rows, columns, empty }) {
  return (
    <div className="table-wrap">
      {title && <h2>{title}</h2>}
      <table>
        <thead>
          <tr>{columns.map((column) => <th key={column.label}>{column.label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={columns.length} className="empty">{empty}</td></tr>
          ) : rows.map((row, index) => (
            <tr key={row._id}>
              {columns.map((column) => <td key={column.label}>{column.render(row, index)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
