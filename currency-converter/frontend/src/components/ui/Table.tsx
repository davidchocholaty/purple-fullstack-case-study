import { ReactNode } from "react";

interface TableColumn<T> {
  header: string;
  accessor: keyof T | ((row: T) => ReactNode);
  render?: (value: unknown, row: T) => ReactNode;
}

interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  title?: string;
  className?: string;
}

export default function Table<T>({ 
  data, 
  columns, 
  title,
  className = "" 
}: TableProps<T>) {
  const getValue = (row: T, column: TableColumn<T>): ReactNode => {
    if (typeof column.accessor === "function") {
      return column.accessor(row);
    }
    return row[column.accessor] as ReactNode;
  };

  return (
    <div className={`history-table-container ${className}`.trim()}>
      {title && <h2 className="history-title">{title}</h2>}
      <table className="history-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.header}>{column.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column, colIndex) => {
                const value = getValue(row, column);
                const rendered: ReactNode = column.render 
                  ? column.render(value, row)
                  : value;
                
                return <td key={`cell-${rowIndex}-${colIndex}`}>{rendered}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

