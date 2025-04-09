import React, { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa6";
import { IoTrashOutline } from "react-icons/io5";
import { BiSolidSave } from "react-icons/bi";

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

type Filter = {
  id: string;
  value: {
    filterType: string;
    value: string;
  };
};

function FilterColumnsMenu({
  tableData,
  onFilterChange,
  activeFilters = [],
}: {
  tableData: Table;
  onFilterChange: (filters: Filter[]) => void;
  activeFilters: any[];
}) {
  const [filters, setFilters] = useState<Filter[]>(activeFilters);

  const getColumnNameById = (columnId: string) => {
    const column = tableData?.columns.find((col) => col.id === columnId);
    return column ? column.name : "";
  };

  const getColumnIdByName = (columnName: string) => {
    const column = tableData?.columns.find((col) => col.name === columnName);
    return column ? column.id : "";
  };

  const getFilterOptions = (columnName: string) => {
    if (!columnName) return ["Select a field first"];

    const selectedColumnObj = tableData.columns.find(
      (col) => col.name === columnName,
    );

    if (!selectedColumnObj) return ["Select a field first"];
    return selectedColumnObj.columnType === "TEXT"
      ? textFilters
      : numberFilters;
  };

  const updateFilter = (
    index: number,
    field: "id" | "filterType" | "value",
    newValue: string,
  ) => {
    const updatedFilters = [...filters];

    if (updatedFilters[index]) {
      if (field === "id") {
        console.log("newValue " + newValue);

        const columnId = getColumnIdByName(newValue);
        updatedFilters[index].id = columnId;

        const filterOptions = getFilterOptions(newValue);
        updatedFilters[index].value.filterType = filterOptions[0] || "Contains";
      } else if (field === "filterType") {
        updatedFilters[index].value.filterType = newValue;
      } else {
        updatedFilters[index].value.value = newValue;
      }

      console.log("okokok " + updatedFilters[index].id);
    }

    setFilters(updatedFilters);
  };

  const saveFilter = () => {
    if (filters.length > 0) {
      onFilterChange(filters);
    }
  };

  const addFilter = () => {
    const newFilters = [
      ...filters,
      { id: "", value: { filterType: "Contains", value: "" } },
    ];
    setFilters(newFilters);
  };

  const deleteFilter = (index: number) => {
    if (filters.length === 1) {
      setFilters([]);
      onFilterChange([]);
    } else {
      const updatedFilters = filters.filter((_, i) => i !== index);
      setFilters(updatedFilters);
      onFilterChange(updatedFilters);
    }
  };

  return (
    <div className="absolute z-2 mt-36 w-120 rounded border border-gray-300 bg-white px-4 py-1 shadow">
      <p className="my-2 font-normal text-gray-500">
        In this view, show records
      </p>

      {filters?.map((filter, index) => {
        const columnName = getColumnNameById(filter.id);
        console.log("columnName " + columnName);

        return (
          <div
            key={index}
            className="my-4 flex w-full flex-row items-center gap-x-2 font-normal"
          >
            <p>{index === 0 ? "Where" : "And"}</p>
            <div className="flex h-10 w-full flex-row gap-x-2">
              {/* Dropdown for column names */}
              <select
                value={columnName}
                onChange={(e) => updateFilter(index, "id", e.target.value)}
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
                value={filter.value.filterType}
                onChange={(e) =>
                  updateFilter(index, "filterType", e.target.value)
                }
                className="h-10 w-[70%] rounded-sm border border-gray-300 px-2"
              >
                {getFilterOptions(columnName).map((filter) => (
                  <option key={filter} value={filter}>
                    {filter}
                  </option>
                ))}
              </select>

              <div className="flex h-10 w-[60%] items-center rounded-sm border border-gray-300 px-1">
                <input
                  type="text"
                  value={filter.value.value}
                  placeholder="Enter a value"
                  className="h-full w-full focus:outline-none"
                  onChange={(e) => updateFilter(index, "value", e.target.value)}
                ></input>
              </div>

              <button
                onClick={saveFilter}
                className="flex h-10 w-10 items-center justify-center text-gray-400 hover:text-gray-600"
              >
                <BiSolidSave />
              </button>

              <button
                onClick={() => deleteFilter(index)}
                className="flex h-10 w-10 items-center justify-center text-gray-400 hover:text-gray-600"
              >
                <IoTrashOutline />
              </button>
            </div>
          </div>
        );
      })}

      <button
        className="flex cursor-pointer flex-row items-center gap-x-2 py-2 text-gray-500 hover:text-gray-800"
        onClick={addFilter}
      >
        <FaPlus /> Add condition
      </button>
    </div>
  );
}

export default FilterColumnsMenu;
