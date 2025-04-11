import { nanoid } from "nanoid";

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

// Updates cell value in data and sends request to update cell
// value to database
export const handleCellChange = async (
  cellId: string,
  value: string,
  tableId: string,
  /* eslint-disable */
  updateCellValue: any,
) => {
  console.log("cellId " + cellId + "value " + value);

  if (!cellId || !value) {
    return;
  }

  // Change data in cells
  // setData((prevData) => {
  //   if (!prevData) return prevData;

  //   return prevData.map((column) => {
  //     const updatedCells = column.cells.map((cell) =>
  //       cell.id === cellId ? { ...cell, value } : cell,
  //     );

  //     return { ...column, cells: updatedCells };
  //   });
  // });

  // const column = data?.find((col) =>
  //   col.cells.some((cell) => cell.id === cellId),
  // );
  // const updatedCell = column?.cells.find((cell) => cell.id === cellId);

  // Send request to db
  try {
    await updateCellValue.mutateAsync({
      tableId: tableId,
      cellId: cellId,
      value: value,
    });
  } catch (error) {
    console.log(error);
  }
};

// Updates column type in data, closes column type drop down and
// sends request to update column type to database
export const handleColumnEdit = async (
  columnId: string,
  newType: string,
  newName: string,
  tableId: string,
  /* eslint-disable */
  updateColumn: any,
) => {
  // Send request to db
  try {
    await updateColumn.mutateAsync({
      tableId: tableId,
      columnId: columnId,
      newType: newType as "TEXT" | "NUMBER",
      newName: newName,
    });
  } catch (error) {
    console.log(error);
  }
};

// Adds new column to data and sends request to add new column
// to database
export const addColumn = async (
  table: Table | undefined | null,
  data: any[] | undefined,
  setData: React.Dispatch<React.SetStateAction<any[]>>,
  tableId: string,
  /* eslint-disable */
  createColumn: any,
  columnName: string,
  columnType: string,
  setColumns: React.Dispatch<React.SetStateAction<any[]>>,
  refetch: () => void,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
) => {
  if (!table) {
    return;
  }

  setIsLoading(true);

  const colLength = data?.length ?? 0;
  const newColumnId = nanoid();
  const rowLength = table.columns[0]?.cells.length ?? 3;

  const newColumn = {
    tableId: tableId,
    id: newColumnId,
    name: columnName,
    columnNum: colLength + 1,
    columnType: columnType,
    cells: Array.from({ length: rowLength }, (_, i) => ({
      id: nanoid(),
      rowNum: i + 1,
      value: "",
      tableId: tableId,
      columnId: newColumnId,
      columnNum: colLength + 1,
    })),
  };

  // Update in UI -- NOT WORKING PROPERLY (ONLY ADDS P INSTEAD OF INPUT)
  // setData((prevRows) => {
  //   return prevRows.map((row, index) => {
  //     return {
  //       ...row,
  //       [columnName]: "",
  //     };
  //   });
  // });

  // setColumns((prevColumns) => [
  //   ...prevColumns,
  //   {
  //     accessorKey: columnName,
  //     header: columnName,
  //     cell: (props: any) => props.getValue(),
  //   },
  // ]);

  console.log(data);

  // Send request to db
  try {
    await createColumn.mutateAsync({
      tableId: tableId,
      id: newColumn.id,
      name: columnName,
      columnNum: newColumn.columnNum,
      columnType: columnType,
      cells: newColumn.cells,
    });

    await refetch();

    setIsLoading(false);
  } catch (error) {
    console.log(error);
  }
};

// Adds new row to data and sends request to add new row
// to database
export const addRow = async (
  table: Table | undefined | null,
  setData: React.Dispatch<React.SetStateAction<any[]>>,
  tableId: string,
  /* eslint-disable */
  createRow: any,
  refetch: () => void,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
) => {
  console.log("ok");
  if (!table) {
    return;
  }

  setIsLoading(true);

  const newRowNum = table.columns[0]?.cells.length ?? 0;

  const newCells = table.columns.map((col) => ({
    id: nanoid(),
    rowNum: newRowNum + 1,
    value: "",
    tableId: tableId,
    columnId: col.id,
    columnNum: col.columnNum,
  }));

  // Send request to db
  try {
    await createRow.mutateAsync({
      tableId: tableId,
      cells: newCells,
    });

    await refetch();

    setIsLoading(false);
  } catch (error) {
    console.log(error);
  }
};

export const addRows = async (
  table: Table | undefined | null,
  tableId: string,
  /* eslint-disable */
  createRow: any,
  refetch: () => void,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
) => {
  console.log("hello");
  setIsLoading(true);

  const BATCH_SIZE = 1000;
  const TOTAL = 100000;
  const currRowLength = table?.columns[0]?.cells.length ?? 0;

  // Send request to db
  try {
    for (let batchStart = 0; batchStart < TOTAL; batchStart += BATCH_SIZE) {
      const batchSize = Math.min(BATCH_SIZE, TOTAL - batchStart);

      const newCells = Array.from({ length: batchSize }).flatMap(
        (_, rowIndex) => {
          const newRowNum = currRowLength + rowIndex + 1;

          return table?.columns?.map((column) => ({
            id: nanoid(),
            rowNum: newRowNum,
            value: "",
            tableId: tableId,
            columnId: column.id,
            columnNum: column.columnNum,
          }));
        },
      );

      await createRow.mutateAsync({
        tableId: tableId,
        cells: newCells.map(({ ...rest }) => rest),
      });
    }

    await refetch();
  } catch (error) {
    console.log(error);
  } finally {
    setIsLoading(false);
  }
};
