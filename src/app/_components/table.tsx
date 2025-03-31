import React, { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import { nanoid } from "nanoid";
import { FaPlus } from "react-icons/fa6";
import { IoIosArrowDown } from "react-icons/io";
import Dropdown from "./dropdown";
import { MdNumbers } from "react-icons/md";
import { BsAlphabetUppercase } from "react-icons/bs";

type Column = {
  tableId: string;
  id: string;
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

function Table({ tableId }: { tableId: string }) {
  const [data, setData] = useState<Column[] | undefined>([]);
  const [dropdownOpen, setDropdownOpen] = useState<Record<string, boolean>>({});

  const { data: table, error } = api.table.getTable.useQuery({ tableId });
  const createColumn = api.table.addColumn.useMutation();
  const createRow = api.table.addRow.useMutation();
  const updateCellValue = api.table.updateCellValue.useMutation();
  const updateColumnType = api.table.updateColumnType.useMutation();

  useEffect(() => {
    setData(table?.columns);
    console.log(table);
  }, [table]);

  // Updates cell value in data and sends request to update cell
  // value to database
  const handleCellChange = async (cellId: string, value: string) => {
    console.log(cellId, value);

    // Change data in cells
    setData((prevData) => {
      if (!prevData) return prevData;

      return prevData.map((column) => {
        const updatedCells = column.cells.map((cell) =>
          cell.id === cellId ? { ...cell, value } : cell,
        );

        return { ...column, cells: updatedCells };
      });
    });

    const column = data?.find((col) =>
      col.cells.some((cell) => cell.id === cellId),
    );
    const updatedCell = column?.cells.find((cell) => cell.id === cellId);

    // Send request to db
    if (updatedCell) {
      try {
        await updateCellValue.mutateAsync({
          tableId: tableId,
          cellId: updatedCell.id,
          value: updatedCell.value,
        });
      } catch (error) {
        console.log(error);
      }
    }
  };

  // Updates column type in data, closes column type drop down and
  // sends request to update column type to database
  const handleColumnTypeChange = async (columnId: string, newType: string) => {
    // Change column type in data
    setData((prevData) => {
      if (!prevData) return prevData;

      return prevData.map((column) =>
        column.id === columnId ? { ...column, columnType: newType } : column,
      );
    });

    setDropdownOpen((prevState) => ({
      ...prevState,
      [columnId]: false,
    }));

    // Send request to db
    try {
      await updateColumnType.mutateAsync({
        tableId: tableId,
        columnId: columnId,
        newType: newType as "TEXT" | "NUMBER",
      });
    } catch (error) {
      console.log(error);
    }
  };

  // Adds new column to data and sends request to add new column
  // to database
  const addColumn = async () => {
    if (!table) {
      return;
    }

    const colLength = data?.length ?? 0;
    const newColumnId = nanoid();
    const rowLength = table.columns[0]?.cells.length ?? 3;

    const newColumn = {
      tableId: tableId,
      id: newColumnId,
      columnNum: colLength + 1,
      columnType: "TEXT",
      cells: Array.from({ length: rowLength }, (_, i) => ({
        id: nanoid(),
        rowNum: i + 1,
        value: "",
        tableId: tableId,
        columnId: newColumnId,
        columnNum: colLength + 1,
      })),
    };

    setData((prev) => [...(prev ?? []), newColumn]);

    // Send request to db
    try {
      await createColumn.mutateAsync({
        tableId: tableId,
        id: newColumn.id,
        columnNum: newColumn.columnNum,
        columnType: "TEXT",
        cells: newColumn.cells,
      });
    } catch (error) {
      console.log(error);
    }
  };

  // Adds new row to data and sends request to add new row
  // to database
  const addRow = async () => {
    console.log("ok");
    if (!table) {
      return;
    }

    const newRowNum = table.columns[0]?.cells.length ?? 0;

    const newCells = (data ?? []).map((col) => ({
      id: nanoid(),
      rowNum: newRowNum + 1,
      value: "",
      tableId: tableId,
      columnId: col.id,
      columnNum: col.columnNum,
    }));

    setData((prev) => {
      return prev?.map((column) => {
        const updatedCells = [
          ...column?.cells,
          newCells.find((cell) => cell.columnId === column.id)!,
        ];

        return { ...column, cells: updatedCells };
      });
    });

    // Send request to db
    try {
      await createRow.mutateAsync({
        tableId: tableId,
        cells: newCells,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const addRows = async () => {
    const newRows = Array.from({ length: 100000 }).map((_, rowIndex) => ({
      id: nanoid(),
      value: "",
      tableId: tableId,
    }));
  };

  const openDropdown = (columnId: string) => {
    setDropdownOpen((prevState) => ({
      ...prevState,
      [columnId]: !prevState[columnId],
    }));
  };

  return (
    <div className="flex flex-col">
      {/* The table */}
      <div>
        <table>
          {/* Each column's headings */}
          <thead className="border border-gray-300 bg-gray-200">
            <tr>
              {data?.map((col, index) => (
                <th
                  key={index}
                  className="border border-gray-300 py-2 font-normal"
                >
                  {/* Column heading name, type and drop down arrow */}
                  <div
                    className="flex cursor-pointer flex-row items-center justify-center"
                    onClick={() => openDropdown(col.id)}
                  >
                    <div className="ml-auto flex flex-row items-center gap-x-2">
                      {col.columnType === "TEXT" && (
                        <BsAlphabetUppercase className="text-gray-500" />
                      )}
                      {col.columnType === "NUMBER" && (
                        <MdNumbers className="text-gray-500" />
                      )}
                      Column {col.columnNum}
                    </div>

                    <IoIosArrowDown className="mr-2 ml-auto" />
                  </div>

                  {/* Dropdown menu for column type */}
                  {dropdownOpen[col.id] && (
                    <Dropdown
                      onColumnTypeChange={handleColumnTypeChange}
                      columnId={col.id}
                    />
                  )}
                </th>
              ))}

              {/* Add column button */}
              <th
                className="cursor-pointer border border-gray-300 px-8 hover:bg-gray-100"
                onClick={addColumn}
              >
                <button className="flex cursor-pointer items-center text-black">
                  <FaPlus />
                </button>
              </th>
            </tr>
          </thead>

          {/* All the cells */}
          <tbody>
            {Array.from({ length: data?.[0]?.cells.length ?? 0 }).map(
              (row, rowIndex) => (
                <tr key={rowIndex}>
                  {data?.map((col) => {
                    // Get each cell
                    const cell = col.cells.find(
                      (cell) => cell.rowNum === rowIndex + 1,
                    );

                    return (
                      <td key={col.id} className="border border-gray-300">
                        <input
                          type={col.columnType}
                          value={cell?.value}
                          className="p-2"
                          onChange={(e) =>
                            handleCellChange(cell!.id, e.target.value)
                          }
                        ></input>
                      </td>
                    );
                  })}
                </tr>
              ),
            )}
            <tr>
              <td
                className="cursor-pointer border border-gray-300 p-3 hover:bg-gray-200"
                onClick={addRow}
              >
                <button className="flex cursor-pointer items-center text-black">
                  <FaPlus />
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <button
          className="mx-auto mt-2 flex cursor-pointer items-center justify-center gap-x-2 rounded bg-blue-500 px-3 py-1 text-white"
          onClick={addRows}
        >
          Add 100k Rows
        </button>
      </div>
    </div>
  );
}

export default Table;
