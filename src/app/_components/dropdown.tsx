/* eslint-disable no-use-before-define */
import React, { useState } from "react";
import { MdNumbers } from "react-icons/md";
import { BsAlphabetUppercase } from "react-icons/bs";
import { IoTrashOutline } from "react-icons/io5";
import { PiSortAscending } from "react-icons/pi";
import { PiSortDescending } from "react-icons/pi";
import { BiHide } from "react-icons/bi";
import { api } from "~/trpc/react";
import { handleColumnEdit } from "./tableHelperFunctions";

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

function Dropdown({
  columnId,
  columnName,
  columnType,
  tableId,
  closeDropdown,
  refetch,
  toggleColumnVisibility,
  isLoading,
  setIsLoading,
  activeViewId,
  viewConfig,
  refetchActive,
}: {
  columnId: string;
  columnName: string;
  columnType: string;
  tableId: string;
  closeDropdown: () => void;
  refetch: () => void;
  /* eslint-disable */
  toggleColumnVisibility: any;
  /* eslint-disable */
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  activeViewId: string | undefined;
  /* eslint-disable */
  viewConfig: any;
  refetchActive: any;
}) {
  const [newColumnName, setNewColumnName] = useState(columnName);
  const [selectedType, setSelectedType] = useState(columnType);
  const [error, setError] = useState("");

  const updateColumn = api.table.editColumn.useMutation();
  const deleteColumn = api.table.deleteColumn.useMutation();
  const saveViewConfig = api.view.saveViewConfig.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newColumnName.trim() || !selectedType) {
      setError("Name and type are required");
      return;
    }

    setIsLoading(true);

    await handleColumnEdit(
      columnId,
      selectedType,
      newColumnName,
      tableId,
      updateColumn,
    );

    closeDropdown();

    await refetch();

    setIsLoading(false);

    setError("");
  };

  const handleDeleteColumn = async (e: React.MouseEvent) => {
    e.stopPropagation();

    setIsLoading(true);

    await deleteColumn.mutateAsync({ id: columnId });

    closeDropdown();

    await refetch();

    setIsLoading(false);

    // setData((prevColumns) =>
    //   prevColumns?.filter((column) => column.id !== columnId),
    // );
  };

  const handleSortClick =
    (direction: "asc" | "desc") => async (e: React.MouseEvent) => {
      e.preventDefault();

      setIsLoading(true);

      if (activeViewId) {
        let sorts = viewConfig.sorts || [];
        const existingSortIndex = sorts.findIndex(
          (sort: any) => sort.columnId === columnId,
        );

        const isCurrentSort =
          existingSortIndex >= 0 &&
          sorts[existingSortIndex].direction === direction;

        // REMOVING SORT NOT WORKING -- FIX
        if (isCurrentSort) {
          sorts = sorts.filter((sort: any) => sort.columnId !== columnId);
        } else {
          const newSort = {
            columnId,
            direction,
          };
          if (existingSortIndex >= 0) {
            sorts[existingSortIndex] = newSort;
          } else {
            sorts = [newSort, ...sorts];
          }
        }

        await saveViewConfig.mutateAsync({
          viewId: activeViewId,
          sorts,
          filters: viewConfig.filters || [],
          hiddenColumns: viewConfig.hiddenColumns || [],
        });

        await refetchActive();
        await refetch();
      }

      closeDropdown();

      setIsLoading(false);
    };

  const currSortDirection =
    viewConfig.sorts
      ?.find((sort: any) => sort.columnId === columnId)
      ?.direction.toLocaleLowerCase() || null;

  console.log("currSortDirection " + currSortDirection);

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

      {/* For sorting columns */}
      <hr className="mx-2 pt-1 text-gray-300"></hr>
      <div className="flex w-full flex-col items-start px-2 py-2">
        <button
          className={`flex w-full cursor-pointer items-center gap-x-2 rounded-sm px-2 py-1 hover:bg-gray-100 ${
            currSortDirection === "asc" ? "bg-blue-200" : ""
          }`}
          onClick={handleSortClick("asc")}
        >
          <PiSortAscending />
          {columnType === "TEXT" ? <p>Sort A → Z</p> : <p>Sort 1 → 9</p>}
        </button>
        <button
          className={`flex w-full cursor-pointer items-center gap-x-2 rounded-sm px-2 py-1 hover:bg-gray-100 ${
            currSortDirection === "desc" ? "bg-blue-200" : ""
          }`}
          onClick={handleSortClick("desc")}
        >
          <PiSortDescending />
          {columnType === "TEXT" ? <p>Sort Z → A</p> : <p>Sort 9 → 1</p>}
        </button>
      </div>
      <hr className="mx-2 pt-1 text-gray-300"></hr>

      {/* For hiding columns */}
      <div className="w-full px-2 pt-1">
        <button
          className="flex w-full cursor-pointer items-center gap-x-2 rounded-sm px-2 py-1 hover:bg-gray-100"
          onClick={() => {
            toggleColumnVisibility(columnId);
            closeDropdown();
          }}
        >
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

      {/* Cancel and edit field buttons */}
      <div className="flex flex-row justify-end gap-x-4 px-2 py-2">
        <button
          type="button"
          disabled={isLoading}
          className="cursor-pointer rounded px-2 py-1 hover:bg-gray-200 disabled:cursor-auto disabled:hover:bg-white/0"
          onClick={closeDropdown}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="cursor-pointer rounded bg-blue-500 px-2 py-1 text-white hover:bg-blue-600 disabled:cursor-auto disabled:bg-gray-400"
        >
          Edit field
        </button>
      </div>
    </form>
  );
}

export default Dropdown;
