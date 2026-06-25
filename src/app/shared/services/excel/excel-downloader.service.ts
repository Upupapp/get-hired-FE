import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
// QA10 FIX-1: Migrated from xlsx (CVE-2023-30533 — no patched version published
// to the public npm registry; 0.19.3 is SheetJS Pro only) to exceljs 4.x which
// has no known critical CVEs. The service only exports CSV so the API surface
// needed is minimal: build a workbook, add a worksheet, write rows, export as
// CSV blob. The public call signature (exportAsExcelFile) is unchanged.
import * as ExcelJS from 'exceljs';

const EXCEL_EXTENSION = '.csv';

@Injectable({
  providedIn: 'root'
})
export class ExcelDownloaderService {

  constructor() { }

  public exportAsExcelFile(json: any[], excelFileName: string): void {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('data');

    if (json && json.length > 0) {
      // Use the first object's keys as the header row.
      const headers = Object.keys(json[0]);
      worksheet.addRow(headers);
      json.forEach(row => {
        worksheet.addRow(headers.map(h => row[h]));
      });
    }

    // ExcelJS's csv.writeBuffer() returns a Promise<Buffer>.
    workbook.csv.writeBuffer().then((buffer) => {
      const data: Blob = new Blob([buffer], {
        type: 'text/csv;charset=UTF-8'
      });
      FileSaver.saveAs(data, excelFileName + '_exported' + EXCEL_EXTENSION);
    });
  }
}
