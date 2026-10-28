// node test/pdf.test.js  —  buildImagePdf 구조/오프셋 검증 (프레임워크 없음)
const assert = require("assert");
const { buildImagePdf } = require("../extension/pdf.js");

// JPEG 내용은 검증 대상이 아니므로 임의 바이트로 대체(길이·오프셋만 검증)
const jpegA = new Uint8Array([0xff, 0xd8, 1, 2, 3, 0xff, 0xd9]);
const jpegB = new Uint8Array([0xff, 0xd8, 9, 8, 7, 6, 5, 0xff, 0xd9]);
const pages = [
  { jpeg: jpegA, w: 816, h: 1056 },
  { jpeg: jpegB, w: 1056, h: 816 },
];

const pdf = buildImagePdf(pages);
const txt = Buffer.from(pdf).toString("latin1");

assert.ok(txt.startsWith("%PDF-1.4"), "PDF 헤더");
assert.ok(txt.includes("/Count 2"), "페이지 수");
assert.ok(txt.endsWith("%%EOF"), "EOF");

// xref 오프셋이 실제 "N 0 obj" 위치를 가리키는지 (오프셋 산술이 핵심)
const m = txt.match(/startxref\n(\d+)\n%%EOF$/);
assert.ok(m, "startxref 존재");
const xrefOff = +m[1];
assert.strictEqual(txt.slice(xrefOff, xrefOff + 4), "xref", "startxref가 xref를 가리킴");

const header = txt.slice(xrefOff).match(/xref\n0 (\d+)\n/);
const size = +header[1]; // total+1
const entryRe = /(\d{10}) 00000 n /g;
const body = txt.slice(xrefOff);
let i = 1;
let e;
while ((e = entryRe.exec(body)) !== null) {
  const off = +e[1];
  assert.strictEqual(
    txt.slice(off, off + (`${i} 0 obj`).length),
    `${i} 0 obj`,
    `객체 ${i} 오프셋`
  );
  i++;
}
assert.strictEqual(i, size, "xref 엔트리 수 == Size");

// JPEG 바이트가 손상 없이 임베드되고 /Length가 일치하는지
assert.ok(txt.includes(`/Length ${jpegA.length}`), "img A Length");
assert.ok(txt.includes(`/Length ${jpegB.length}`), "img B Length");

console.log("OK: buildImagePdf", pages.length, "pages,", pdf.length, "bytes");
