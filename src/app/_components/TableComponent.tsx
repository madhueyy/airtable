/* eslint-ignore */
import React, { useEffect, useState, useRef } from "react";
import { api } from "~/trpc/react";
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
  flexRender,
  getFilteredRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";
import type { ColumnDef, Row } from "@tanstack/react-table";
import { FaPlus } from "react-icons/fa6";
import { IoIosArrowDown } from "react-icons/io";
import Dropdown from "./dropdown";
import { MdNumbers } from "react-icons/md";
import { BsAlphabetUppercase } from "react-icons/bs";
import { useVirtualizer } from "@tanstack/react-virtual";
import { addRow, addRows } from "./tableHelperFunctions";
import TableTopBar from "./tableTopBar";
import ColumnDropdown from "./columnDropdown";
import EditableCell from "./EditableCell";

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

function TableComponent({ tableId }: { tableId: string }) {
  /* eslint-disable */
  const [data, setData] = useState<any[]>([]);
  const [columns, setColumns] = useState<any[]>([]);
  const [columnFilters, setColumnFilters] = useState<any[]>([]);

  const [columnDropdownOpen, setColumnDropdownOpen] = useState(false);
  const [editDropdownOpen, setEditDropdownOpen] = useState<
    Record<string, boolean>
  >({});
  const [searchIsOpen, setSearchIsOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [highlightedCells, setHighlightedCells] = useState(new Set());
  const [currHighlightIndex, setCurrHighlightIndex] = useState(0);
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >({});

  const { data: tableFromDb, refetch } = api.table.getTable.useQuery({
    tableId,
  });
  const createColumn = api.table.addColumn.useMutation();
  const createRow = api.table.addRow.useMutation();
  const updateCellValue = api.table.updateCellValue.useMutation();
  const { data: highlightedCellIds } = api.table.getHighlightedCells.useQuery(
    { tableId, searchQuery: searchInput },
    { enabled: !!searchInput },
  );

  const addRowFn = () =>
    addRow(tableFromDb, setData, tableId, createRow, refetch);
  const addRowsFn = () => addRows(tableFromDb, tableId, createRow, refetch);
  const openDropdown = (columnId: string) => {
    setEditDropdownOpen((prevState) => ({
      ...prevState,
      [columnId]: !prevState[columnId],
    }));
  };

  useEffect(() => {
    if (!tableFromDb) return;

    const rowMap: Record<number, any> = {};
    for (const col of tableFromDb.columns) {
      for (const cell of col.cells) {
        if (!rowMap[cell.rowNum]) {
          rowMap[cell.rowNum] = { _rowNum: cell.rowNum };
        }

        rowMap[cell.rowNum][col.name] = cell.value;
      }
    }

    const rowData = Object.values(rowMap);
    console.log(rowData);
    setData(rowData);

    const colDefs = tableFromDb?.columns.map((col) => ({
      accessorKey: col.name,
      header: col.name,
      id: col.id,
      filterFn: "custom",
      cell: (props: any) => {
        const rowIndex = props.row.index;
        const rowNum = rowData[rowIndex]._rowNum;
        const cellId =
          col.cells.find((cell) => cell.rowNum === rowNum)?.id ?? "";

        return (
          <EditableCell
            getValue={props.getValue}
            cellId={cellId}
            columnType={col.columnType}
            tableId={tableId}
            updateCellValue={updateCellValue}
          />
        );
      },
    }));
    setColumns(colDefs ?? []);
  }, [tableFromDb]);

  const customFilterFn = (row: any, columnId: any, filterValue: any) => {
    const cellValue = row.getValue(columnId);
    const { filterType, value } = filterValue;

    if (filterType === "Is empty") return !cellValue;
    if (filterType === "Is not empty") return !!cellValue;

    if (typeof cellValue === "string") {
      switch (filterType) {
        case "Contains":
          return cellValue.toLowerCase().includes(value.toLowerCase());
        case "Not contains":
          return !cellValue.toLowerCase().includes(value.toLowerCase());
        case "Equal to":
          return cellValue === value;
      }
    }

    if (typeof cellValue === "number" || !isNaN(Number(cellValue))) {
      const numericValue = parseFloat(value);
      const cellNumber = parseFloat(cellValue);
      switch (filterType) {
        case "Greater than":
          return cellNumber > numericValue;
        case "Smaller than":
          return cellNumber < numericValue;
      }
    }

    return true;
  };

  const table = useReactTable({
    data,
    columns,
    state: {
      columnVisibility,
      columnFilters,
    },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setSearchInput,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    enableColumnFilters: true,
    filterFns: {
      custom: customFilterFn,
    },
  });

  useEffect(() => {
    if (searchIsOpen && highlightedCellIds && highlightedCellIds.length > 0) {
      setHighlightedCells(new Set(highlightedCellIds));
      setCurrHighlightIndex(0);
      scrollToHighlightedCell(0);
    } else if (!searchIsOpen) {
      setHighlightedCells(new Set());
      setCurrHighlightIndex(0);
    }
  }, [highlightedCellIds, searchIsOpen]);

  const handleSearchClose = () => {
    setSearchIsOpen(false);
    setHighlightedCells(new Set());
    setCurrHighlightIndex(0);
    setSearchInput("");
  };

  const navToNextHighlight = () => {
    if (highlightedCells.size > 0) {
      const highlightedArray = Array.from(highlightedCells);
      const newIndex = (currHighlightIndex + 1) % highlightedArray.length;
      setCurrHighlightIndex(newIndex);
      scrollToHighlightedCell(newIndex);
    }
  };

  const navToPrevHighlight = () => {
    if (highlightedCells.size > 0) {
      const highlightedArray = Array.from(highlightedCells);
      const newIndex =
        (currHighlightIndex - 1 + highlightedArray.length) %
        highlightedArray.length;
      setCurrHighlightIndex(newIndex);
      scrollToHighlightedCell(newIndex);
    }
  };

  const scrollToHighlightedCell = (index: number) => {
    const highlightedArray = Array.from(highlightedCells);
    const cellId = highlightedArray[index];

    // Find the cell element and scroll to it
    const cellElement = document.getElementById(`cell-${cellId}`);
    if (cellElement) {
      cellElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  const toggleColumnVisibility = (columnId: string) => {
    table.getColumn(columnId)?.toggleVisibility();
  };

  const handleFilterChange = (
    selectedColumn: string,
    filterType: string,
    inputValue: string,
  ) => {
    const matchingColumn = tableFromDb?.columns.find(
      (c) => c.name === selectedColumn,
    );

    if (!matchingColumn) return;

    const filter = {
      id: matchingColumn.id,
      value: {
        filterType,
        value: inputValue,
      },
    };

    setColumnFilters([filter]);
  };

  return (
    <div>
      <TableTopBar
        searchIsOpen={searchIsOpen}
        setSearchIsOpen={setSearchIsOpen}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        highlightedCellsCount={highlightedCells.size}
        currHighlightIndex={currHighlightIndex}
        onNextHighlight={navToNextHighlight}
        onPrevHighlight={navToPrevHighlight}
        onCloseSearch={handleSearchClose}
        table={table}
        tableData={tableFromDb}
        onFilterChange={handleFilterChange}
      />

      {/* The table */}
      <table>
        {/* Each column's headings */}
        <thead className="sticky top-0 bg-[#f4f4f4]">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const originalColumn = tableFromDb?.columns.find(
                  (col) => col.id === header.column.columnDef.id,
                );

                const columnId = originalColumn?.id ?? "";
                const columnType = originalColumn?.columnType ?? "";
                const columnName = originalColumn?.name ?? "";

                return (
                  <th
                    key={header.id}
                    className="h-8 border border-gray-300 font-normal"
                  >
                    {/* Column heading name, type and drop down arrow */}
                    <div
                      className="flex cursor-pointer flex-row items-center text-[14px]"
                      onClick={() => openDropdown(columnId)}
                    >
                      <div className="ml-2 flex flex-row items-center gap-x-2">
                        {columnType === "TEXT" && (
                          <BsAlphabetUppercase className="text-gray-500" />
                        )}
                        {columnType === "NUMBER" && (
                          <MdNumbers className="text-gray-500" />
                        )}
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                      </div>

                      <IoIosArrowDown
                        className="mr-2 ml-auto text-gray-400"
                        size={14}
                      />
                    </div>

                    {/* Dropdown menu for column type */}
                    {editDropdownOpen[originalColumn?.id ?? ""] && (
                      <Dropdown
                        columnId={columnId}
                        columnName={columnName}
                        columnType={columnType}
                        tableId={tableId}
                        closeDropdown={() =>
                          setEditDropdownOpen((prev) => ({
                            ...prev,
                            [columnId]: false,
                          }))
                        }
                        refetch={refetch}
                        toggleColumnVisibility={toggleColumnVisibility}
                        toggleColumnSort={header.column.getToggleSortingHandler()}
                        isSorted={header.column.getIsSorted()}
                      />
                    )}
                  </th>
                );
              })}

              {/* Add column button */}
              <th
                className="cursor-pointer border border-gray-300 px-8 hover:bg-white"
                onClick={() => setColumnDropdownOpen(true)}
              >
                <button className="flex cursor-pointer items-center text-gray-500">
                  <FaPlus />
                </button>
              </th>

              {/* Add column dropdown */}
              <th>
                {columnDropdownOpen && (
                  <ColumnDropdown
                    setColumnDropdownOpen={setColumnDropdownOpen}
                    table={tableFromDb}
                    data={data}
                    setData={setData}
                    tableId={tableId}
                    createColumn={createColumn}
                    setColumns={setColumns}
                  />
                )}
              </th>
            </tr>
          ))}
        </thead>

        {/* All the cells */}
        <tbody>
          {table.getFilteredRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => {
                // Get cellId from column in table
                const originalColumn = tableFromDb?.columns.find(
                  (col) => col.id === cell.column.columnDef.id,
                );
                const dbCell = originalColumn?.cells.find(
                  (c) => c.rowNum === row.original._rowNum,
                );
                const cellId = dbCell?.id || "";

                // Check if cellId is included in highlightedCells
                const isHighlighted = highlightedCells.has(cellId);
                const isCurrentHighlight =
                  isHighlighted &&
                  Array.from(highlightedCells)[currHighlightIndex] === cellId;

                return (
                  <td
                    key={cell.id}
                    id={`cell-${cellId}`}
                    className={`h-8 w-50 border border-gray-300 bg-white text-[14px] ${
                      isCurrentHighlight
                        ? "bg-yellow-200"
                        : isHighlighted
                          ? "bg-yellow-100"
                          : "bg-white/75"
                    }`}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                );
              })}
            </tr>
          ))}

          {/* Add row button */}
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

export default TableComponent;
