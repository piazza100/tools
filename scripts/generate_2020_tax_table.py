import json
import re
from pathlib import Path

import pdfplumber

root = Path(__file__).resolve().parents[1]
source = root / "frontend/src/data/withholding-2020.pdf"
target = root / "frontend/src/data/withholding-2020.generated.ts"
rows = []

with pdfplumber.open(source) as pdf:
    for page in pdf.pages:
        for line in (page.extract_text(x_tolerance=2, y_tolerance=2) or "").splitlines():
            parts = line.strip().split()
            if len(parts) < 13:
                continue
            try:
                low = int(parts[0].replace(",", ""))
                high = int(parts[1].replace(",", ""))
            except ValueError:
                continue
            if low < 770 or high <= low or high > 10_000:
                continue
            values = []
            for value in parts[2:13]:
                if value == "-":
                    values.append(0)
                elif re.fullmatch(r"[\d,]+", value):
                    values.append(int(value.replace(",", "")))
                else:
                    break
            if len(values) == 11:
                rows.append([low, high, *values[:4]])

if len(rows) < 600:
    raise RuntimeError(f"Expected at least 600 brackets, extracted {len(rows)}")
if any(rows[i][1] != rows[i + 1][0] for i in range(len(rows) - 1)):
    raise RuntimeError("Withholding brackets are not contiguous")

target.write_text(
    "// Generated from the official 2020-02-11 Income Tax Act simplified withholding table.\n"
    f"export const withholdingRows2020={json.dumps(rows, separators=(',', ':'))} as const\n",
    encoding="utf-8",
)
print(f"generated {len(rows)} withholding brackets")
