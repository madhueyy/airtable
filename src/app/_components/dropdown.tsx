import React, { useState } from "react";
import { MdNumbers } from "react-icons/md";
import { BsAlphabetUppercase } from "react-icons/bs";
import { IoTrashOutline } from "react-icons/io5";
import { PiSortAscending } from "react-icons/pi";
import { PiSortDescending } from "react-icons/pi";
import { BiHide } from "react-icons/bi";
import { api } from "~/trpc/react";
import { handleColumnEdit } from "./tableHelperFunctions";

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

function Dropdown({
  columnId,
  columnName,
  columnType,
  setData,
  tableId,
  closeDropdown,

  // onColumnHide,
}: {
  columnId: string;
  columnName: string;
  columnType: string;
  setData: React.Dispatch<React.SetStateAction<Column[] | undefined>>;
  tableId: string;
  closeDropdown: () => void;

  // onColumnHide: (columnId: string, newType: string) => void;
}) {
  const [newColumnName, setNewColumnName] = useState(columnName);
  const [selectedType, setSelectedType] = useState(columnType);
  const [error, setError] = useState("");

  const updateColumn = api.table.editColumn.useMutation();
  const deleteColumn = api.table.deleteColumn.useMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newColumnName.trim() || !selectedType) {
      setError("Name and type are required");
      return;
    }

    handleColumnEdit(
      columnId,
      selectedType,
      newColumnName,
      setData,
      tableId,
      updateColumn,
    );

    setError("");

    closeDropdown();
  };

  const handleDeleteColumn = async (e: React.MouseEvent) => {
    e.stopPropagation();

    await deleteColumn.mutateAsync({ id: columnId });

    setData((prevColumns) =>
      prevColumns?.filter((column) => column.id !== columnId),
    );
  };

  return (
    <form
      className="absolute z-1 mt-2 ml-4 w-100 rounded-md border border-gray-300 bg-white text-start shadow-sm"
      onSubmit={handleSubmit}
    >
      <div className="w-full px-2 pt-2 pb-1">
        <p className="text-gray-600">Edit field</p>
        <input
          type="text"
          value={newColumnName}
          placeholder="Field name"
          className="mt-2 mb-4 h-8 w-full rounded border border-gray-300 px-2 focus:outline-blue-500"
          onChange={(e) => setNewColumnName(e.target.value)}
        ></input>
      </div>

      <div className="w-full px-2 py-1 text-gray-600">
        <p>Choose a type</p>
        <ul className="text-md my-2 w-full rounded border border-gray-300 px-1 py-1">
          <li>
            <p
              className={`flex cursor-pointer flex-row items-center gap-x-2 rounded px-1 py-1 text-gray-700 hover:bg-blue-100 ${selectedType === "TEXT" ? "bg-blue-200" : ""}`}
              onClick={() => setSelectedType("TEXT")}
            >
              <BsAlphabetUppercase />
              Text
            </p>
          </li>
          <li>
            <div
              className={`flex cursor-pointer flex-row items-center gap-x-2 rounded px-1 py-1 text-gray-700 hover:bg-blue-100 ${selectedType === "NUMBER" ? "bg-blue-200" : ""}`}
              onClick={() => setSelectedType("NUMBER")}
            >
              <MdNumbers />
              Number
            </div>
          </li>
        </ul>
      </div>

      {error && <p className="px-4 pb-2 text-sm text-red-500">{error}</p>}

      <hr className="mx-2 pt-1 text-gray-300"></hr>
      <div className="flex w-full flex-col items-start px-2 py-2">
        <button className="flex w-full cursor-pointer items-center gap-x-2 rounded-sm px-2 py-1 hover:bg-gray-100">
          <PiSortAscending />
          {columnType === "TEXT" ? <p>Sort A → Z</p> : <p>Sort 1 → 9</p>}
        </button>
        <button className="flex w-full cursor-pointer items-center gap-x-2 rounded-sm px-2 py-1 hover:bg-gray-100">
          <PiSortDescending />
          {columnType === "TEXT" ? <p>Sort Z → A</p> : <p>Sort 9 → 1</p>}
        </button>
      </div>
      <hr className="mx-2 pt-1 text-gray-300"></hr>

      <div className="w-full px-2 pt-1">
        <button className="flex w-full cursor-pointer items-center gap-x-2 rounded-sm px-2 py-1 hover:bg-gray-100">
          <BiHide />
          Hide field
        </button>
      </div>

      <div className="w-full px-2 pt-1">
        <button
          className="flex w-full cursor-pointer items-center gap-x-2 rounded-sm px-2 py-1 hover:bg-gray-100"
          onClick={(e) => handleDeleteColumn(e)}
        >
          <IoTrashOutline />
          <p className="text-red-500">Delete field</p>
        </button>
      </div>

      <div className="flex flex-row justify-end gap-x-4 px-2 py-2">
        <button
          type="button"
          className="cursor-pointer rounded px-2 py-1 hover:bg-gray-200"
          onClick={closeDropdown}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="cursor-pointer rounded bg-blue-500 px-2 py-1 text-white hover:bg-blue-600"
        >
          Edit field
        </button>
      </div>
    </form>
  );
}

export default Dropdown;
