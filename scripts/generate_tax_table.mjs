import fs from 'node:fs/promises'
import {FileBlob,SpreadsheetFile} from '@oai/artifact-tool'
const input=await FileBlob.load('D:/PROJECT2/WonderLife/frontend/src/data/nts_withholding_table.xlsx')
const workbook=await SpreadsheetFile.importXlsx(input)
const sheet=workbook.worksheets.getItem('Sheet1')
const values=sheet.getRange('A6:I662').values
const rows=values.filter(row=>Number.isFinite(row[0])&&Number.isFinite(row[1])).map(row=>[row[0],row[1],row[2]||0,row[4]||0,row[6]||0,row[8]||0])
const source=`// Generated from the National Tax Service 2023 simplified withholding table.\nexport const withholdingRows=${JSON.stringify(rows)} as const\n`
await fs.writeFile('D:/PROJECT2/WonderLife/frontend/src/data/withholding.generated.ts',source,'utf8')
console.log(`generated ${rows.length} withholding brackets`)
