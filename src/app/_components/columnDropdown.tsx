import React, { useState } from "react";
import { MdNumbers } from "react-icons/md";
import { BsAlphabetUppercase } from "react-icons/bs";
import { addColumn } from "./tableHelperFunctions";

type Table = {
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

function ColumnDropdown({
  setColumnDropdownOpen,
  table,
  data,
  setData,
  tableId,
  createColumn,
  setColumns,
}: {
  setColumnDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  table: Table | undefined | null;
  data: any[] | undefined;
  setData: React.Dispatch<React.SetStateAction<any[]>>;
  tableId: string;
  /* eslint-disable */
  createColumn: any;
  setColumns: React.Dispatch<React.SetStateAction<any[]>>;
}) {
  const [columnName, setColumnName] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!columnName.trim || !selectedType) {
      setError("Name and type are required");
      return;
    }

    setError("");

    addColumn(
      table,
      data,
      setData,
      tableId,
      createColumn,
      columnName,
      selectedType,
      setColumns,
    );

    setColumnDropdownOpen(false);
  };

  return (
    <form
      className="absolute z-1 mt-5 ml-[-90px] w-100 cursor-pointer rounded-md border border-gray-300 bg-white text-start font-normal text-gray-600 shadow-sm"
      onSubmit={handleSubmit}
    >
      <div className="w-full px-2 pt-2 pb-1 text-gray-600">
        <p>New field</p>
        <input
          type="text"
          value={columnName}
          placeholder="Field name"
          className="mt-2 mb-4 h-8 w-full rounded border border-gray-300 px-2 focus:outline-blue-500"
          onChange={(e) => setColumnName(e.target.value)}
        ></input>
      </div>

      <div className="w-full px-2 py-1 text-gray-600">
        <p>Choose a type</p>
        <ul className="text-md my-2 w-full rounded border border-gray-300 px-1 py-1">
          <li>
            <p
              className={`flex flex-row items-center gap-x-2 rounded px-1 py-1 text-gray-700 hover:bg-blue-100 ${selectedType === "TEXT" ? "bg-blue-200" : ""}`}
              onClick={() => setSelectedType("TEXT")}
            >
              <BsAlphabetUppercase />
              Text
            </p>
          </li>
          <li>
            <div
              className={`flex flex-row items-center gap-x-2 rounded px-1 py-1 text-gray-700 hover:bg-blue-100 ${selectedType === "NUMBER" ? "bg-blue-200" : ""}`}
              onClick={() => setSelectedType("NUMBER")}
            >
              <MdNumbers />
              Number
            </div>
          </li>
        </ul>

        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>

      <div className="flex flex-row justify-end gap-x-4 px-2 py-2">
        <button
          type="button"
          className="cursor-pointer rounded px-2 py-1 hover:bg-gray-200"
          onClick={() => setColumnDropdownOpen(false)}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="cursor-pointer rounded bg-blue-500 px-2 py-1 text-white hover:bg-blue-600"
        >
          Create field
        </button>
      </div>
    </form>
  );
}

export default ColumnDropdown;
