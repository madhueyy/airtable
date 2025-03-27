import React, { useState } from "react";

interface Row {
  id: number;
  [key: string]: string | number;
}

function Table() {
  const [columns, setColumns] = useState(["Name", "Number"]);
  const [data, setData] = useState<Row[]>([
    { id: 1, Name: "", Number: "" },
    { id: 2, Name: "", Number: "" },
    { id: 3, Name: "", Number: "" },
  ]);

  const handleCellChange = (column: string, row: number, value: string) => {
    console.log(column, row, value);
    // Change data in cells
  };

  const addColumn = () => {
    const newColumnName = `Column ${columns.length + 1}`;

    setColumns((prevColumns) => [...prevColumns, newColumnName]);
    setData((prevData) =>
      prevData.map((row) => ({ ...row, [newColumnName]: "" })),
    );
  };

  return (
    <div className="flex flex-col">
      {/* The table */}
      <div>
        <table>
          {/* Each column's headings */}
          <thead className="h-10 w-52 border border-gray-300 bg-gray-200">
            <tr>
              {columns.map((col, index) => (
                <th key={index} className="border border-gray-300 font-normal">
                  {col}
                </th>
              ))}

              {/* Add column button */}
              <th className="border border-gray-300 px-8 py-1">
                <button className="rounded text-black" onClick={addColumn}>
                  +
                </button>
              </th>
            </tr>
          </thead>

          {/* Actual cells */}
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={row.id}>
                {columns.map((col, colIndex) => (
                  <td
                    key={colIndex}
                    className="h-10 w-52 border border-gray-300"
                  >
                    <input
                      type="text"
                      value={row[col] as string}
                      onChange={(e) =>
                        handleCellChange(col, rowIndex, e.target.value)
                      }
                      className="h-full w-full"
                    />
                  </td>
                ))}
              </tr>
            ))}

            {/* Add row button */}
            <tr>
              <td className="h-10 w-52 border border-gray-300 pl-4">
                <button className="rounded text-black">+</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Table;
