import React from "react";

function Dropdown({
  columnId,
  onColumnTypeChange,
}: {
  columnId: string;
  onColumnTypeChange: (columnId: string, newType: string) => void;
}) {
  return (
    <div className="absolute z-1 mt-2 cursor-pointer border-gray-300 bg-white shadow-sm">
      <ul className="text-md border border-gray-300 text-gray-700">
        <li>
          <p
            className="border-b border-gray-300 px-19 py-2 text-black hover:bg-blue-100"
            onClick={() => onColumnTypeChange(columnId, "TEXT")}
          >
            Text
          </p>
        </li>
        <li>
          <p
            className="px-19 py-2 text-black hover:bg-blue-100"
            onClick={() => onColumnTypeChange(columnId, "NUMBER")}
          >
            Number
          </p>
        </li>
      </ul>
    </div>
  );
}

export default Dropdown;
