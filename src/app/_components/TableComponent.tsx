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
import { useInfiniteQuery } from "@tanstack/react-query";
import { addRow, addRows } from "./tableHelperFunctions";
import TableTopBar from "./tableTopBar";
import ColumnDropdown from "./columnDropdown";
import EditableCell from "./EditableCell";
import ViewsSidebar from "./ViewsSidebar";

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

const filterLabelMap: Record<string, string> = {
  // prettier-ignore
  "Equal to": "EQUALS",
  // prettier-ignore
  "Not equal to": "NOT_EQUALS",
  // prettier-ignore
  "Contains": "CONTAINS",
  // prettier-ignore
  "Not contains": "NOT_CONTAINS",
  // prettier-ignore
  "Is empty": "IS_EMPTY",
  // prettier-ignore
  "Is not empty": "IS_NOT_EMPTY",
  // prettier-ignore
  "Greater than": "GT",
  // prettier-ignore
  "Smaller than": "LT",
};

function TableComponent({ tableId }: { tableId: string }) {
  /* eslint-disable */
  const [data, setData] = useState<any[]>([]);
  const [columns, setColumns] = useState<any[]>([]);
  const [columnFilters, setColumnFilters] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingInitially, setIsLoadingInitially] = useState(true);
  const [viewsMenuOpen, setViewsMenuOpen] = useState(false);
  const [activeViewId, setActiveViewId] = useState<string | undefined>("");

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
  const [sorting, setSorting] = useState<any[]>([]);

  const {
    data: tableData,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = api.table.getTable.useInfiniteQuery(
    {
      tableId,
      viewId: activeViewId,
      limit: 25,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialCursor: 0,
    },
  );

  const createColumn = api.table.addColumn.useMutation();
  const createRow = api.table.addRow.useMutation();
  const updateCellValue = api.table.updateCellValue.useMutation();
  const { data: highlightedCellIds } = api.table.getHighlightedCells.useQuery(
    { tableId, searchQuery: searchInput },
    { enabled: !!searchInput },
  );
  const { data: views } = api.view.getViewsByTable.useQuery({ tableId });
  const { data: activeViewConfig, refetch: refetchActive } =
    api.view.getViewConfig.useQuery(
      { viewId: activeViewId as string },
      { enabled: !!activeViewId },
    );
  const saveViewConfig = api.view.saveViewConfig.useMutation();

  const addRowFn = () =>
    addRow(tableFromDb, setData, tableId, createRow, refetch, setIsLoading);
  const addRowsFn = () =>
    addRows(tableFromDb, tableId, createRow, refetch, setIsLoading);
  const openDropdown = (columnId: string) => {
    setEditDropdownOpen((prevState) => ({
      ...prevState,
      [columnId]: !prevState[columnId],
    }));
  };

  const parentRef = React.useRef<HTMLDivElement>(null);
  const tableFromDb = tableData?.pages?.[0]?.table;

  useEffect(() => {
    if (!tableFromDb) return;

    console.log(tableFromDb);

    console.log(activeViewConfig);

    const rowMap: Record<number, any> = {};
    tableData.pages.forEach((page) => {
      const table = page.table;

      for (const col of table.columns) {
        for (const cell of col.cells) {
          if (!rowMap[cell.rowNum]) {
            rowMap[cell.rowNum] = { _rowNum: cell.rowNum };
          }

          rowMap[cell.rowNum][col.name] = cell.value;
        }
      }
    });

    const rowData = Object.values(rowMap);

    // Apply sorting
    if (activeViewConfig?.sorts && activeViewConfig.sorts.length > 0) {
      // Get the first column with sorting applied
      const primarySortConfig = activeViewConfig.sorts[0];
      const primarySortColumn = tableFromDb.columns.find(
        (col) => col.id === primarySortConfig?.columnId,
      );

      console.log("hahaha " + activeViewConfig?.sorts[0]?.direction);

      if (primarySortColumn) {
        rowData.sort((a, b) => {
          const aValue = a[primarySortColumn.name];
          const bValue = b[primarySortColumn.name];

          if (primarySortColumn.columnType === "NUMBER") {
            const aNum = Number(aValue) || 0;
            const bNum = Number(bValue) || 0;
            return primarySortConfig?.direction.toLowerCase() === "asc"
              ? aNum - bNum
              : bNum - aNum;
          } else {
            return primarySortConfig?.direction.toLowerCase() === "asc"
              ? String(aValue).localeCompare(String(bValue))
              : String(bValue).localeCompare(String(aValue));
          }
        });
      }
    }

    setData(rowData);

    // Adding select column with row nums
    const selectionColumn = {
      id: "selection",
      header: () => (
        <div className="flex items-center justify-center">
          <input type="checkbox" className="h-3 w-3" />
        </div>
      ),
      accessorKey: "_rowNum",
      cell: ({ row }: { row: Row<any> }) => (
        <div className="flex items-center justify-start pl-3 text-xs text-gray-500">
          <p className="mt-2">{row.original._rowNum}</p>
        </div>
      ),
    };

    const colDefs = [
      selectionColumn,
      ...tableFromDb?.columns.map((col) => ({
        accessorKey: col.name,
        header: col.name,
        id: col.id,
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
      })),
    ];

    setColumns(colDefs ?? []);
  }, [tableData, sorting, activeViewConfig, columnFilters]);

  useEffect(() => {
    if (tableData) {
      setIsLoadingInitially(false);
    }
  }, [tableData]);

  useEffect(() => {
    setActiveViewId(views?.[0]?.id);
  }, [views]);

  useEffect(() => {
    if (activeViewConfig) {
      // Apply filters from view config
      if (activeViewConfig.filters && activeViewConfig.filters.length > 0) {
        setColumnFilters(activeViewConfig.filters);
      } else {
        setColumnFilters([]);
      }

      // Apply sorting from view config
      if (activeViewConfig.sorts && activeViewConfig.sorts.length > 0) {
        const sorts = activeViewConfig.sorts.map((sort) => ({
          id: sort.columnId,
          desc: sort.direction.toLocaleLowerCase(),
        }));
        setSorting(sorts);
      } else {
        setSorting([]);
      }

      // Apply hidden columns from view config
      if (activeViewConfig.hiddenColumns) {
        const newColumnVisibility: Record<string, boolean> = {};
        activeViewConfig.hiddenColumns.forEach((columnId) => {
          newColumnVisibility[columnId] = false;
        });
        setColumnVisibility(newColumnVisibility);
      } else {
        setColumnVisibility({});
      }
    }
  }, [activeViewConfig]);

  const table = useReactTable({
    data,
    columns,
    state: {
      columnVisibility,
    },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setSearchInput,
  });

  const rowVirtualizer = useVirtualizer({
    count: hasNextPage
      ? table.getRowModel().rows.length + 1
      : table.getRowModel().rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 35,
    overscan: 5,
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

  // HIDING SAVING CAUSING PROBLEMS FOR SORT AND FILTER -- FIX
  // useEffect(() => {
  //   if (activeViewId && table) {
  //     setIsLoading(true);

  //     const hiddenColumnIds = Object.entries(columnVisibility)
  //       .filter(([_, isVisible]) => isVisible === false)
  //       .map(([columnId]) => columnId);

  //     saveViewConfig.mutateAsync({
  //       viewId: activeViewId,
  //       filters: columnFilters,
  //       sorts: sorting,
  //       hiddenColumns: hiddenColumnIds,
  //     });

  //     refetchActive();
  //     refetch();

  //     setIsLoading(false);
  //   }
  // }, [columnVisibility]);

  const toggleColumnVisibility = (columnId: string) => {
    table.getColumn(columnId)?.toggleVisibility();
  };

  const handleFilterChange = async (filters: any[]) => {
    setIsLoading(true);

    const newFilters = filters.map((filter) => ({
      columnId: filter.id,
      filterType: filterLabelMap[filter.filterType] ?? filter.filterType,
      value: filter.value,
    }));

    setColumnFilters(newFilters);

    if (activeViewId && table) {
      const hiddenColumnIds = Object.entries(columnVisibility)
        .filter(([_, isVisible]) => isVisible === false)
        .map(([columnId]) => columnId);

      const sorts = sorting.map((sort) => ({
        columnId: sort.id,
        direction: sort.desc,
      }));

      await saveViewConfig.mutateAsync({
        viewId: activeViewId,
        filters: newFilters,
        sorts,
        hiddenColumns: hiddenColumnIds,
      });
    }

    await refetchActive();
    await refetch();

    setIsLoading(false);
  };

  // Load more rows
  useEffect(() => {
    const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse();
    const isLastItemVisible =
      lastItem &&
      lastItem.index >= table.getRowModel().rows.length - 1 &&
      parentRef.current &&
      lastItem.start <
        parentRef.current.scrollTop + parentRef.current.clientHeight;

    if (isLastItemVisible && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [
    hasNextPage,
    fetchNextPage,
    table.getRowModel().rows.length,
    isFetchingNextPage,
    rowVirtualizer.getVirtualItems(),
  ]);

  const formattedFilters = activeViewConfig?.filters.map((filter) => ({
    id: filter.columnId,
    filterType: filterLabelMap[filter.operator] || filter.operator,
    value: filter.value,
  }));

  return (
    <div className="bg-[#f7f7f7]">
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
        isLoading={isLoading || isLoadingInitially}
        viewsMenuOpen={viewsMenuOpen}
        setViewsMenuOpen={setViewsMenuOpen}
        columnSortCount={activeViewConfig?.sorts.length}
        activeViewName={views?.find((view) => activeViewId === view.id)?.name}
        activeFilters={formattedFilters}
      />

      {viewsMenuOpen && (
        <ViewsSidebar
          tableId={tableId}
          activeViewId={activeViewId}
          setActiveViewId={setActiveViewId}
        />
      )}

      {/* The table */}
      <div>
        {/* Each column's headings */}
        <div className="sticky top-0 z-1 flex flex-row border border-gray-300 bg-[#fbfbfb]">
          {table.getHeaderGroups().map((headerGroup) => (
            <div key={headerGroup.id} className="flex flex-row">
              {headerGroup.headers.map((header) => {
                const originalColumn = tableFromDb?.columns.find(
                  (col) => col.id === header.column.columnDef.id,
                );

                const columnId = originalColumn?.id ?? "";
                const columnType = originalColumn?.columnType ?? "";
                const columnName = originalColumn?.name ?? "";

                const isSelectionColumn = header.column.id === "selection";
                const firstColumn = tableFromDb?.columns[0]?.id;
                const isFirstColumn = firstColumn === header.column.id;

                return (
                  <div
                    key={header.id}
                    className={`flex h-9 ${isSelectionColumn ? "w-10" : "w-50"} flex-row ${isFirstColumn ? "" : "border-l"} border-gray-300 bg-[#f4f4f4] font-normal`}
                  >
                    {/* Column heading name, type and drop down arrow */}
                    <div
                      className="flex w-full cursor-pointer flex-row items-center text-[14px]"
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

                      {!isSelectionColumn && (
                        <IoIosArrowDown
                          className="mr-2 ml-auto text-gray-400"
                          size={14}
                        />
                      )}
                    </div>
                    {/* Dropdown menu for column type */}
                    {!isSelectionColumn &&
                      editDropdownOpen[originalColumn?.id ?? ""] && (
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
                          isLoading={isLoading}
                          setIsLoading={setIsLoading}
                          activeViewId={activeViewId}
                          viewConfig={activeViewConfig}
                          refetchActive={refetchActive}
                        />
                      )}
                  </div>
                );
              })}

              {/* Add column button */}
              <div
                className="flex cursor-pointer flex-row items-center border-r border-l border-gray-300 bg-[#f4f4f4] px-8 hover:bg-white"
                onClick={() => setColumnDropdownOpen(true)}
              >
                <button className="flex cursor-pointer items-center text-gray-500">
                  <FaPlus />
                </button>
              </div>

              {/* Add column dropdown */}
              <div>
                {columnDropdownOpen && (
                  <ColumnDropdown
                    setColumnDropdownOpen={setColumnDropdownOpen}
                    table={tableFromDb}
                    data={data}
                    setData={setData}
                    tableId={tableId}
                    createColumn={createColumn}
                    setColumns={setColumns}
                    refetch={refetch}
                    setIsLoading={setIsLoading}
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* All the cells */}
        <div ref={parentRef} className="overflow-auto">
          <div
            className="relative"
            style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const isLoaderRow =
                virtualRow.index > table.getRowModel().rows.length - 1;

              if (isLoaderRow) {
                return (
                  <div
                    key="loader"
                    className="absolute top-0 left-0 flex w-full items-center justify-center"
                    style={{
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    {isFetchingNextPage ? "Loading rows..." : "Load more rows"}
                  </div>
                );
              }

              const row = table.getRowModel().rows[virtualRow.index];

              return (
                <div
                  key={row?.id}
                  className="absolute top-0 left-0 flex border-r border-b border-l border-gray-300"
                  style={{
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  {row?.getVisibleCells().map((cell) => {
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
                      Array.from(highlightedCells)[currHighlightIndex] ===
                        cellId;

                    const isSelectionColumn = cell.column.id === "selection";
                    const firstColumn = tableFromDb?.columns[0]?.id;
                    const isFirstColumn = firstColumn === cell.column.id;

                    // Cell content
                    return (
                      <div
                        key={cell.id}
                        id={`cell-${cellId}`}
                        className={`h-9 ${isSelectionColumn ? "w-10" : "w-50"} ${isFirstColumn ? "" : "border-l"} border-gray-300 text-[14px] ${
                          isCurrentHighlight
                            ? "bg-yellow-200"
                            : isHighlighted
                              ? "bg-yellow-100"
                              : "bg-white/75"
                        }`}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Add row button */}
          <div className="border-l-2 border-gray-300">
            <div
              className="h-9 w-60 cursor-pointer border-t border-r border-l border-gray-300 bg-white/75 py-2 pl-2 hover:bg-gray-200"
              onClick={addRowFn}
            >
              <button className="flex cursor-pointer items-center text-gray-500">
                <FaPlus />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 z-0 flex w-full border-t border-gray-300 bg-[#f7f7f7] py-2">
        <button
          className="mx-auto flex cursor-pointer items-center gap-x-2 rounded bg-blue-500 px-3 py-1 text-white"
          onClick={addRowsFn}
        >
          <FaPlus />
          Add 100k Rows
        </button>
      </div>
    </div>
  );
}

export default TableComponent;
