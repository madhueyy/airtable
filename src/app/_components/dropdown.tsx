import React from "react";
import { MdNumbers } from "react-icons/md";
import { BsAlphabetUppercase } from "react-icons/bs";

function Dropdown({
  columnId,
  onColumnTypeChange,
}: {
  columnId: string;
  onColumnTypeChange: (columnId: string, newType: string) => void;
}) {
  return (
    <div className="absolute z-1 mt-2 ml-4 w-70 cursor-pointer rounded-md border border-gray-300 bg-white shadow-sm">
      <ul className="text-md px-2 py-2 text-gray-700">
        <li>
          <p
            className="flex flex-row items-center gap-x-2 rounded px-2 py-1 text-gray-700 hover:bg-blue-100"
            onClick={() => onColumnTypeChange(columnId, "TEXT")}
          >
            <BsAlphabetUppercase />
            Text
          </p>
        </li>
        <li>
          <div
            className="flex flex-row items-center gap-x-2 rounded px-2 py-1 text-gray-700 hover:bg-blue-100"
            onClick={() => onColumnTypeChange(columnId, "NUMBER")}
          >
            <MdNumbers />
            Number
          </div>
        </li>
      </ul>
    </div>
  );
}

export default Dropdown;
