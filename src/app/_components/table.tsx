import React, { useEffect, useState, useRef } from "react";
import { api } from "~/trpc/react";
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
  flexRender,
  getFilteredRowModel,
} from "@tanstack/react-table";
import type { ColumnDef, Row } from "@tanstack/react-table";
import { FaPlus } from "react-icons/fa6";
import { IoIosArrowDown } from "react-icons/io";
import Dropdown from "./dropdown";
import { MdNumbers } from "react-icons/md";
import { BsAlphabetUppercase } from "react-icons/bs";
import { useVirtualizer } from "@tanstack/react-virtual";
import { handleCellChange, addRow, addRows } from "./tableHelperFunctions";
import TableTopBar from "./tableTopBar";
import ColumnDropdown from "./columnDropdown";

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

type TableRow = Record<string, string>;

function Table({ tableId }: { tableId: string }) {
  const [data, setData] = useState<Column[] | undefined>([]);
  const [tableData, setTableData] = useState<TableRow[]>([]);
  /* eslint-disable */
  const [tableCols, setTableCols] = useState<ColumnDef<TableRow, any>[]>([]);
  const [editDropdownOpen, setEditDropdownOpen] = useState<
    Record<string, boolean>
  >({});
  const [searchIsOpen, setSearchIsOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [highlightedCells, setHighlightedCells] = useState(new Set());
  const [currHighlightIndex, setCurrHighlightIndex] = useState(0);
  const [columnDropdownOpen, setColumnDropdownOpen] = useState(false);

  const highlightedCellsArrayRef = useRef<string[]>([]);
  const cellRefs = useRef<Record<string, HTMLTableCellElement | null>>({});

  const { data: table, error } = api.table.getTable.useQuery({ tableId });
  const createColumn = api.table.addColumn.useMutation();
  const createRow = api.table.addRow.useMutation();
  const updateCellValue = api.table.updateCellValue.useMutation();

  const parentRef = React.useRef(null);

  useEffect(() => {
    setData(table?.columns);
    console.log(table);
  }, [table]);

  const rowVirtualizer = useVirtualizer({
    count: data?.[0]?.cells.length ?? 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 35,
    overscan: 5,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();
  const paddingTop =
    virtualItems.length > 0 ? (virtualItems[0]?.start ?? 0) : 0;
  const paddingBottom =
    virtualItems.length > 0
      ? rowVirtualizer.getTotalSize() -
        ((virtualItems[virtualItems.length - 1]?.start ?? 0) +
          (virtualItems[virtualItems.length - 1]?.size ?? 0))
      : 0;

  const handleCellChangeFn = (cellId: string, value: string) =>
    handleCellChange(cellId, value, data, setData, tableId, updateCellValue);

  const addRowFn = () => addRow(table, data, setData, tableId, createRow);
  const addRowsFn = () => addRows(data, setData, tableId, createRow);

  const openDropdown = (columnId: string) => {
    setEditDropdownOpen((prevState) => ({
      ...prevState,
      [columnId]: !prevState[columnId],
    }));
  };

  const { data: highlightedCellIds } = api.table.getHighlightedCells.useQuery(
    { tableId, searchQuery: searchInput },
    { enabled: !!searchInput },
  );

  useEffect(() => {
    if (searchIsOpen && highlightedCellIds && highlightedCellIds.length > 0) {
      setHighlightedCells(new Set(highlightedCellIds));
      highlightedCellsArrayRef.current = highlightedCellIds;
      setCurrHighlightIndex(0);
    } else if (!searchIsOpen) {
      setHighlightedCells(new Set());
      highlightedCellsArrayRef.current = [];
      setCurrHighlightIndex(0);
    }
  }, [highlightedCellIds]);

  const handleSearchClose = () => {
    setSearchIsOpen(false);
    setHighlightedCells(new Set());
    highlightedCellsArrayRef.current = [];
    setCurrHighlightIndex(0);
    setSearchInput("");
  };

  const navToNextHighlight = () => {
    if (highlightedCellsArrayRef.current.length > 0) {
      const newIndex =
        (currHighlightIndex + 1) % highlightedCellsArrayRef.current.length;
      setCurrHighlightIndex(newIndex);
      scrollToHighlightedCell(newIndex);
    }
  };

  const navToPrevHighlight = () => {
    if (highlightedCellsArrayRef.current.length > 0) {
      const newIndex =
        (currHighlightIndex - 1 + highlightedCellsArrayRef.current.length) %
        highlightedCellsArrayRef.current.length;
      setCurrHighlightIndex(newIndex);
      scrollToHighlightedCell(newIndex);
    }
  };

  const scrollToHighlightedCell = (index: number) => {
    const cellId = highlightedCellsArrayRef.current[index];
    const cellElem = cellRefs.current[cellId ?? 0];

    if (cellElem) {
      cellElem.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  return (
    <div className="flex flex-col">
      <TableTopBar
        searchIsOpen={searchIsOpen}
        setSearchIsOpen={setSearchIsOpen}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        highlightedCellsCount={highlightedCellsArrayRef.current.length}
        currHighlightIndex={currHighlightIndex}
        onNextHighlight={navToNextHighlight}
        onPrevHighlight={navToPrevHighlight}
        onCloseSearch={handleSearchClose}
      />

      {/* The table */}
      <div ref={parentRef} className="max-h-[74vh] overflow-auto">
        <table>
          {/* Each column's headings */}
          <thead className="sticky top-0 bg-[#f4f4f4]">
            <tr>
              {data?.map((col, index) => (
                <th
                  key={index}
                  className="border-b border-gray-300 py-2 font-normal"
                >
                  {/* Column heading name, type and drop down arrow */}
                  <div
                    className="flex cursor-pointer flex-row items-center text-[14px]"
                    onClick={() => openDropdown(col.id)}
                  >
                    <div className="ml-2 flex flex-row items-center gap-x-2">
                      {col.columnType === "TEXT" && (
                        <BsAlphabetUppercase className="text-gray-500" />
                      )}
                      {col.columnType === "NUMBER" && (
                        <MdNumbers className="text-gray-500" />
                      )}
                      {col.name}
                    </div>

                    <IoIosArrowDown
                      className="mr-2 ml-auto text-gray-400"
                      size={14}
                    />
                  </div>

                  {/* Dropdown menu for column type */}
                  {editDropdownOpen[col.id] && (
                    <Dropdown
                      columnId={col.id}
                      columnName={col.name}
                      columnType={col.columnType}
                      setData={setData}
                      tableId={tableId}
                      closeDropdown={() =>
                        setEditDropdownOpen((prev) => ({
                          ...prev,
                          [col.id]: false,
                        }))
                      }

                      // onColumnHide={handleColumnHideFn}
                    />
                  )}
                </th>
              ))}

              {/* Add column button */}
              <th
                className="cursor-pointer border border-gray-300 px-8 hover:bg-gray-100"
                onClick={() => setColumnDropdownOpen(true)}
              >
                <button className="flex cursor-pointer items-center text-gray-500">
                  <FaPlus />
                </button>
              </th>

              <th>
                {columnDropdownOpen && (
                  <ColumnDropdown
                    setColumnDropdownOpen={setColumnDropdownOpen}
                    table={table}
                    data={data}
                    setData={setData}
                    tableId={tableId}
                    createColumn={createColumn}
                  />
                )}
              </th>
            </tr>
          </thead>

          {/* All the cells */}
          <tbody ref={parentRef}>
            {paddingTop > 0 && (
              <tr>
                <td
                  // Not working with tailwind styling not sure why
                  style={{ height: `${paddingTop}px` }}
                ></td>
              </tr>
            )}

            {virtualItems.map((virtualRow) => {
              const rowIndex = virtualRow.index;

              return (
                <tr key={rowIndex}>
                  {data?.map((col) => {
                    // Get each cell
                    const cell = col.cells.find(
                      (cell) => cell.rowNum === rowIndex + 1,
                    );

                    const isHighlighted = highlightedCells.has(cell?.id);
                    const isCurrHighlight =
                      isHighlighted &&
                      highlightedCellsArrayRef.current[currHighlightIndex] ===
                        cell?.id;

                    return (
                      <td
                        key={col.id}
                        ref={(elem) => {
                          if (isHighlighted) {
                            const cellId = cell?.id ?? 0;
                            cellRefs.current[cellId] = elem;
                          }
                        }}
                        className={`border border-gray-300 ${isCurrHighlight ? "bg-yellow-200" : isHighlighted ? "bg-yellow-100" : "bg-white/75"}`}
                      >
                        <input
                          type={col.columnType}
                          value={cell?.value}
                          className="py-1.5 pl-2"
                          onChange={(e) =>
                            handleCellChangeFn(cell!.id, e.target.value)
                          }
                        ></input>
                      </td>
                    );
                  })}
                </tr>
              );
            })}

            {paddingBottom > 0 && (
              <tr>
                <td
                  // Not working with tailwind styling not sure why
                  style={{ height: `${paddingBottom}px` }}
                ></td>
              </tr>
            )}

            <tr>
              <td
                className="cursor-pointer border border-gray-300 py-2 pl-2 hover:bg-gray-200"
                onClick={addRowFn}
              >
                <button className="flex cursor-pointer items-center text-gray-500">
                  <FaPlus />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mr-auto ml-2 flex">
        <button
          className="mx-auto mt-2 flex cursor-pointer items-center gap-x-2 rounded bg-blue-500 px-3 py-1 text-white"
          onClick={addRowsFn}
        >
          Add 100k Rows
        </button>
      </div>
    </div>
  );
}

export default Table;
