import type { ReactNode } from "react";

export type TableRow = {
  key: string;
  cells: ReactNode[];
};

export function Table({
  columns,
  rows,
  onRowClick,
}: {
  columns: string[];
  rows: TableRow[];
  onRowClick?: (rowKey: string) => void;
}) {
  return (
    <table-container>
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.key}
              className={onRowClick ? "is-clickable" : undefined}
              onClick={onRowClick ? () => onRowClick(row.key) : undefined}
            >
              {row.cells.map((cell, cellIndex) => (
                <td key={columns[cellIndex]}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </table-container>
  );
}
