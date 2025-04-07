import React, { useEffect, useState } from "react";

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

const textFilters = [
  "Contains",
  "Not contains",
  "Is empty",
  "Is not empty",
  "Equal to",
];

const numberFilters = ["Greater than", "Smaller than"];

function FilterColumnsMenu({
  tableData,
  onFilterChange,
}: {
  tableData: Table;
  onFilterChange: (
    selectedColumn: string,
    filterType: string,
    value: string,
  ) => void;
}) {
  const [selectedColumn, setSelectedColumn] = useState<string>("");
  const [selectedFilter, setSelectedFilter] = useState<string>("Contains");
  const [inputValue, setInputValue] = useState<string>("");
  const [filterOptions, setFilterOptions] = useState<string[]>([
    "Select a field first",
  ]);

  const handleSelectColumn = (selection: string, e: React.FormEvent) => {
    e.preventDefault();
    setSelectedColumn(selection);

    const selectedColumnObj = tableData.columns.find(
      (col) => col.name === selection,
    );

    if (selectedColumnObj?.columnType === "TEXT") {
      setFilterOptions(textFilters);
    } else {
      setFilterOptions(numberFilters);
    }
  };

  useEffect(() => {
    if (selectedColumn && selectedFilter) {
      console.log("selectedColumn " + selectedColumn);
      console.log("selectedFilter " + selectedFilter);
      console.log("inputValue " + inputValue);
      onFilterChange(selectedColumn, selectedFilter, inputValue);
    }
  }, [selectedColumn, selectedFilter, inputValue]);

  return (
    <div className="absolute z-2 mt-36 w-120 rounded border border-gray-300 bg-white px-4 py-1 shadow">
      <p className="my-2 font-normal text-gray-500">
        In this view, show records
      </p>

      <div className="my-4 flex w-full flex-row items-center gap-x-2 font-normal">
        <p>Where</p>
        <div className="flex h-10 w-full flex-row gap-x-2">
          {/* Dropdown for column names */}
          <select
            value={selectedColumn}
            onChange={(e) => handleSelectColumn(e.target.value, e)}
            className="h-10 w-[70%] rounded-sm border border-gray-300 px-2"
          >
            <option value="">Select column</option>
            {tableData?.columns.map((col) => (
              <option key={col.id} value={col.name}>
                {col.name}
              </option>
            ))}
          </select>

          {/* Dropdown for filters */}
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="h-10 w-[70%] rounded-sm border border-gray-300 px-2"
          >
            {filterOptions.map((filter) => (
              <option key={filter} value={filter}>
                {filter}
              </option>
            ))}
          </select>

          <div className="flex h-10 w-[60%] items-center rounded-sm border border-gray-300 px-1">
            <input
              type="text"
              value={inputValue}
              placeholder="Enter a value"
              className="h-full w-full focus:outline-none"
              onChange={(e) => setInputValue(e.target.value)}
            ></input>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FilterColumnsMenu;
