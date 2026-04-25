const { PDFParse } = require('pdf-parse');
const fs = require('fs');
const buf = new Uint8Array(fs.readFileSync('spectrum-soap-api.pdf'));
const parser = new PDFParse(buf);
parser.load().then(async () => {
  const text = await parser.getText();
  console.log(text);
}).catch(e => console.error(e));
