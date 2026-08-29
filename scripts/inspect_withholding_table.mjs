import {FileBlob,SpreadsheetFile} from '@oai/artifact-tool'
const input=await FileBlob.load('D:/PROJECT2/WonderLife/frontend/src/data/nts_withholding_table.xlsx')
const workbook=await SpreadsheetFile.importXlsx(input)
const overview=await workbook.inspect({kind:'sheet,table',include:'id,name,values,formulas',maxChars:8000,tableMaxRows:12,tableMaxCols:12})
console.log(overview.ndjson)
const sample=await workbook.inspect({kind:'table',sheetId:'Sheet1',range:'A260:V360',include:'values,formulas',maxChars:20000,tableMaxRows:110,tableMaxCols:22})
console.log(sample.ndjson)
