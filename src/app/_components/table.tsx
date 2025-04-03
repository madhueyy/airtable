import React, { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import { FaPlus } from "react-icons/fa6";
import { IoIosArrowDown } from "react-icons/io";
import Dropdown from "./dropdown";
import { MdNumbers } from "react-icons/md";
import { BsAlphabetUppercase } from "react-icons/bs";
import { useVirtualizer } from "@tanstack/react-virtual";
import { IoIosSearch } from "react-icons/io";
import {
  addColumn,
  handleCellChange,
  handleColumnTypeChange,
  addRow,
  addRows,
} from "./tableHelperFunctions";
import { GiHamburgerMenu } from "react-icons/gi";
import { PiGridNineThin } from "react-icons/pi";
import { HiOutlineUserGroup } from "react-icons/hi2";
import { BiHide } from "react-icons/bi";
import { IoFilter } from "react-icons/io5";
import { BsCardList } from "react-icons/bs";
import { PiArrowsDownUp } from "react-icons/pi";
import { IoColorFillOutline } from "react-icons/io5";
import { CgFormatLineHeight } from "react-icons/cg";
import { GrShare } from "react-icons/gr";

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
  const [searchInput, setSearchInput] = useState("");
  const [highlightedCells, setHighlightedCells] = useState(new Set());

  const { data: table, error } = api.table.getTable.useQuery({ tableId });
  const createColumn = api.table.addColumn.useMutation();
  const createRow = api.table.addRow.useMutation();
  const updateCellValue = api.table.updateCellValue.useMutation();
  const updateColumnType = api.table.updateColumnType.useMutation();

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
  const handleColumnTypeChangeFn = (columnId: string, newType: string) =>
    handleColumnTypeChange(
      columnId,
      newType,
      setData,
      setDropdownOpen,
      tableId,
      updateColumnType,
    );
  const addColumnFn = () =>
    addColumn(table, data, setData, tableId, createColumn);
  const addRowFn = () => addRow(table, data, setData, tableId, createRow);
  const addRowsFn = () => addRows(data, setData, tableId, createRow);

  const openDropdown = (columnId: string) => {
    setDropdownOpen((prevState) => ({
      ...prevState,
      [columnId]: !prevState[columnId],
    }));
  };

  const { data: highlightedCellIds } = api.table.getHighlightedCells.useQuery(
    { tableId, searchQuery: searchInput },
    { enabled: !!searchInput },
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  useEffect(() => {
    setHighlightedCells(new Set(highlightedCellIds ?? []));
  }, [highlightedCellIds]);

  return (
    <div className="flex flex-col">
      {/* Searching and sorting buttons */}
      <div className="flex flex-row items-center justify-between gap-x-4 bg-white px-4 py-2">
        {/* Filter, sort, view etc. buttons */}
        <div className="flex flex-row items-center gap-x-2">
          <div className="flex cursor-pointer flex-row items-center gap-x-2 rounded-xs px-2 py-1 text-sm font-medium hover:bg-gray-100">
            <GiHamburgerMenu className="text-gray-500" />
            <p>Views</p>
          </div>

          <div className="mx-2 h-[18px] w-[1px] bg-black/30"></div>

          <div className="flex cursor-pointer flex-row items-center gap-x-2 rounded-xs px-2 py-1 font-medium hover:bg-gray-100">
            <PiGridNineThin className="text-xl text-blue-500" />
            <p className="text-sm">Grid view</p>
            <HiOutlineUserGroup />
            <IoIosArrowDown />
          </div>

          <div className="flex cursor-pointer flex-row items-center gap-x-2 rounded-xs px-2 py-1 text-sm font-medium hover:bg-gray-100">
            <BiHide className="text-gray-600" />
            <p>Hide Fields</p>
          </div>

          <div className="flex cursor-pointer flex-row items-center gap-x-2 rounded-xs px-2 py-1 text-sm font-medium hover:bg-gray-100">
            <IoFilter className="text-gray-500" />
            <p>Filter</p>
          </div>

          <div className="flex cursor-pointer flex-row items-center gap-x-2 rounded-xs px-2 py-1 text-sm font-medium hover:bg-gray-100">
            <BsCardList className="text-gray-600" />
            <p>Group</p>
          </div>

          <div className="flex cursor-pointer flex-row items-center gap-x-2 rounded-xs px-2 py-1 text-sm font-medium hover:bg-gray-100">
            <PiArrowsDownUp className="text-gray-600" />
            <p>Sort</p>
          </div>

          <div className="flex cursor-pointer flex-row items-center gap-x-2 rounded-xs px-2 py-1 text-sm font-medium hover:bg-gray-100">
            <IoColorFillOutline className="text-gray-600" />
            <p>Colour</p>
          </div>

          <div className="flex cursor-pointer flex-row items-center gap-x-2 rounded-xs px-2 py-1 font-medium hover:bg-gray-100">
            <CgFormatLineHeight className="text-gray-600" />
          </div>

          <div className="flex cursor-pointer flex-row items-center gap-x-2 rounded-xs px-2 py-1 font-medium hover:bg-gray-100">
            <GrShare className="text-xs text-gray-600" />
            <p className="text-sm">Share and Sync</p>
          </div>
        </div>

        {/* Search */}
        <div className="mr-2 flex items-center gap-x-2 rounded-full border border-gray-300 px-4 py-1">
          <IoIosSearch className="text-gray-400" />
          <input
            type="text"
            value={searchInput}
            placeholder="Search here..."
            onChange={handleSearchChange}
          ></input>
        </div>
      </div>

      {/* The table */}
      <div ref={parentRef} className="max-h-[74vh] overflow-auto">
        <table>
          {/* Each column's headings */}
          <thead className="sticky top-0 border border-gray-300 bg-[#f4f4f4]">
            <tr>
              {data?.map((col, index) => (
                <th
                  key={index}
                  className="border border-gray-300 py-2 font-normal"
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
                      Column {col.columnNum}
                    </div>

                    <IoIosArrowDown
                      className="mr-2 ml-auto text-gray-400"
                      size={14}
                    />
                  </div>

                  {/* Dropdown menu for column type */}
                  {dropdownOpen[col.id] && (
                    <Dropdown
                      onColumnTypeChange={handleColumnTypeChangeFn}
                      columnId={col.id}
                    />
                  )}
                </th>
              ))}

              {/* Add column button */}
              <th
                className="cursor-pointer border border-gray-300 px-8 hover:bg-gray-100"
                onClick={addColumnFn}
              >
                <button className="flex cursor-pointer items-center text-black">
                  <FaPlus />
                </button>
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

                    return (
                      <td
                        key={col.id}
                        className={`border border-gray-300 ${searchInput && highlightedCells.has(cell?.id) ? "bg-yellow-200" : "bg-white/75"}`}
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
                <button className="flex cursor-pointer items-center text-black">
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
