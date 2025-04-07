import React, { useEffect, useState } from "react";
import { handleCellChange } from "./tableHelperFunctions";

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

function EditableCell({
  getValue,
  cellId,
  columnType,
  tableId,
  updateCellValue,
}: {
  /* eslint-disable */
  getValue: any;
  cellId: string;
  columnType: string;
  tableId: string;
  /* eslint-disable */
  updateCellValue: any;
}) {
  const initialValue = getValue();
  const [value, setValue] = useState(initialValue);

  const onBlur = () => {
    handleCellChange(cellId, value, tableId, updateCellValue);
  };

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return (
    <input
      type={columnType}
      value={value ?? ""}
      className="py-1.5 pl-2"
      onChange={(e) => setValue(e.target.value)}
      onBlur={onBlur}
    ></input>
  );
}

export default EditableCell;
