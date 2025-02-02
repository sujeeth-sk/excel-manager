import ExcelJS, { Row } from "exceljs";

export const processExcelFile = async (buffer: Buffer) => {
  const workbook = await parseExcelFile(buffer);
  return processWorkbook(workbook);
};

export const parseExcelFile = async (buffer: Buffer): Promise<ExcelJS.Workbook> => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  return workbook;
};

export const processWorkbook = async (workbook: ExcelJS.Workbook) => {
  const sheetsData: any[] = [];

  workbook.eachSheet((worksheet) => {
    const sheetName = worksheet.name;
    const sheetData = {
      sheetName,
      numRows: worksheet.rowCount > 0 ? worksheet.rowCount - 1 : 0, // Exclude header
      numValidRows: 0,
      numInvalidRows: 0,
      validationErrors: [] as any[],
    };

    // Validate headers
    const headerRow = worksheet.getRow(1);
    const headers = headerRow.values as string[];
    const requiredColumns = ['Name', 'Amount', 'Date', 'Verified'];
    const missingColumns = requiredColumns.filter(col => !headers.includes(col));

    if (missingColumns.length > 0) {
      sheetData.validationErrors.push({
        rowNumber: 1,
        error: `Missing required columns: ${missingColumns.join(', ')}`
      });
      sheetData.numInvalidRows = sheetData.numRows;
      sheetsData.push(sheetData);
      return;
    }

    // Process data rows (skip header)
    worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header row

      const rowData = parseRow(row, headers);
      if (rowData.errors.length > 0) {
        sheetData.validationErrors.push(...rowData.errors);
        sheetData.numInvalidRows++;
      } else {
        sheetData.numValidRows++;
      }
    });

    sheetsData.push(sheetData);
  });

  return sheetsData;
};


export const parseRow = (row: Row, headers: string[]) => {
  const errors: { rowNumber: number; error: string }[] = [];
  const values: Record<string, any> = {};

  // Get column indices from headers (ExcelJS uses 1-based indexing)
  const colIndices = {
    name: headers.indexOf('Name') + 1,
    amount: headers.indexOf('Amount') + 1,
    date: headers.indexOf('Date') + 1,
    verified: headers.indexOf('Verified') + 1
  };

  // Validate Name (Column 1)
  if (!row.getCell(colIndices.name).value) {
    errors.push({ rowNumber: row.number, error: 'Name is required' });
  }

  // Validate Amount (Column 2)
  const amount = row.getCell(colIndices.amount).value;
  if (typeof amount !== 'number' || amount <= 0) {
    errors.push({ rowNumber: row.number, error: 'Amount must be a positive number' });
  }

  // Validate Date (Column 3)
  const dateValue = row.getCell(colIndices.date).value;
  const currentDate = new Date();
  if (!(dateValue instanceof Date)) {
    errors.push({ rowNumber: row.number, error: 'Invalid date format' });
  } else if (
    dateValue.getMonth() !== currentDate.getMonth() ||
    dateValue.getFullYear() !== currentDate.getFullYear()
  ) {
    errors.push({ rowNumber: row.number, error: 'Date must be in current month' });
  }

  // Validate Verified (Column 4)
  const verified = String(row.getCell(colIndices.verified).value);
  if (!['Yes', 'No'].includes(verified)) {
    errors.push({ rowNumber: row.number, error: 'Verified must be "Yes" or "No"' });
  }

  return { values, errors };
};