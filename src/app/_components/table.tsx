import React, { useEffect, useState } from "react";
import { api } from "~/trpc/react";

type Column = {
  tableId: string;
  id: string;
  columnNum: number;
  columnType: "TEXT" | "NUMBER";
};

type Cell = {
  id: string;
  tableId: string;
  columnId: string;
  rowNum: number;
  value: string;
};

function Table({ tableId }: { tableId: string }) {
  const [columns, setColumns] = useState<Column[] | undefined>([]);
  // Set initial table data
  const [data, setData] = useState<Cell[] | undefined>([]);

  const { data: table, error } = api.table.getTable.useQuery({ tableId });

  useEffect(() => {
    setColumns(table?.columns);
    setData(table?.cells);
    console.log(table?.cells);
  }, [table]);

  const handleCellChange = (
    column: string,
    rowIndex: number,
    value: string,
  ) => {
    console.log(column, rowIndex, value);

    // Change data in cells
    setData((prevData) => {
      return prevData?.map((row, index) => {
        if (index === rowIndex) {
          return { ...row, value };
        } else {
          return row;
        }
      });
    });
  };

  // const addColumn = () => {
  //   const newColumnName = `Column ${columns.length + 1}`;

  //   setColumns((prevColumns) => [...prevColumns, newColumnName]);
  //   setData((prevData) =>
  //     prevData.map((row) => ({ ...row, [newColumnName]: "" })),
  //   );
  // };

  // const addRow = () => {
  //   setData((prevData) => {
  //     const newRow = {
  //       id: prevData.length + 1,
  //       ...Object.fromEntries(columns.map((col) => [col, ""])),
  //     };

  //     return [...prevData, newRow];
  //   });
  // };

  return (
    <div className="flex flex-col">
      {/* The table */}
      <div>
        <table>
          {/* Each column's headings */}
          <thead className="h-10 w-52 border border-gray-300 bg-gray-200">
            <tr>
              {columns?.map((col, index) => (
                <th key={index} className="border border-gray-300 font-normal">
                  Column {col.columnNum}
                </th>
              ))}

              {/* Add column button */}
              <th
                className="cursor-pointer border border-gray-300 px-8 py-1 hover:bg-gray-100"
                // onClick={addColumn}
              >
                <button className="cursor-pointer rounded text-black">+</button>
              </th>
            </tr>
          </thead>

          {/* Actual cells */}
          <tbody>
            {data?.map((row, rowIndex) => (
              <tr key={row.id}>
                {columns?.map((column, columnIndex) => (
                  <td
                    key={columnIndex}
                    className="h-10 w-52 border border-gray-300"
                  >
                    <input
                      type={column.columnType.toLocaleLowerCase()}
                      value={row.value as string}
                      onChange={(e) =>
                        handleCellChange(column.id, rowIndex, e.target.value)
                      }
                      className="h-full w-full"
                    />
                  </td>
                ))}
              </tr>
            ))}

            {/* Add row button */}
            <tr>
              <td
                className="h-10 w-52 cursor-pointer border border-gray-300 pl-4 hover:bg-gray-200"
                // onClick={addRow}
              >
                <button className="cursor-pointer rounded text-black">+</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Table;
