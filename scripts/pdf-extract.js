const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');

async function extractText(pdfPath) {
  const dataBuffer = fs.readFileSync(path.resolve(pdfPath));
  const parser = new PDFParse({ data: dataBuffer });
  const result = await parser.getText();
  await parser.destroy();
  return result.text;
}

const pdfPath = process.argv[2];
if (!pdfPath) {
  console.error('Usage: node pdf-extract.js <path-to-pdf>');
  process.exit(1);
}

extractText(pdfPath)
  .then(text => console.log(text))
  .catch(err => {
    console.error('Error extracting PDF:', err.message);
    process.exit(1);
  });
