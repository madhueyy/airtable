/* eslint-ignore */
import React from "react";
import { MdToggleOn } from "react-icons/md";
import { MdToggleOff } from "react-icons/md";

type Table = {
  name: string;
  id: string;
  columns: Column[];
};

type Column = {
  tableId: string;
  id: string;
  name: string;
  columnNum: number;
  columnType: string;
  cells: Cell[];
};

type Cell = {
  id: string;
  rowNum: number;
  value: string;
  tableId: string;
  columnId: string;
  columnNum: number;
};

function HiddenColumnsMenu({
  table,
  tableData,
}: {
  /* eslint-disable */
  table: any;
  tableData: Table;
}) {
  return (
    <div className="absolute z-2 mt-42 w-70 rounded border border-gray-300 bg-white px-2 py-1 shadow">
      <div className="p-2 text-sm font-medium">Hide a field</div>
      <div className="max-h-60 overflow-auto">
        {tableData?.columns.map((column) => {
          const columnId = column.id;
          const columnName = column.name;
          const isVisible =
            !table.getState().columnVisibility[columnId] === false;

          return (
            <div
              key={columnId}
              className="flex cursor-pointer items-center justify-start gap-x-2 px-2 py-1 hover:bg-gray-100"
              onClick={() => table.getColumn(columnId)?.toggleVisibility()}
            >
              {isVisible ? (
                <MdToggleOn className="text-xl text-green-600" />
              ) : (
                <MdToggleOff className="text-xl text-gray-200" />
              )}
              <p>{columnName}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default HiddenColumnsMenu;
