import { deflateSync } from "node:zlib";
import { writeFile } from "node:fs/promises";

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) { crc ^= byte; for (let i=0;i<8;i++) crc=(crc>>>1)^((crc&1)?0xedb88320:0); }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const name=Buffer.from(type); const out=Buffer.alloc(data.length+12);
  out.writeUInt32BE(data.length,0); name.copy(out,4); data.copy(out,8); out.writeUInt32BE(crc32(Buffer.concat([name,data])),data.length+8); return out;
}
function icon(size) {
  const raw=Buffer.alloc((size*4+1)*size); const radius=size*.24;
  for(let y=0;y<size;y++){const row=y*(size*4+1); for(let x=0;x<size;x++){
    const dx=Math.max(radius-x,0,x-(size-1-radius)),dy=Math.max(radius-y,0,y-(size-1-radius)); const inside=dx*dx+dy*dy<=radius*radius;
    const p=row+1+x*4; let [r,g,b,a]=inside?[19,33,52,255]:[0,0,0,0];
    const w=Math.max(1,size*.12), left=x>size*.23&&x<size*.23+w, right=x>size*.65&&x<size*.65+w;
    const diagonalA=y>size*.28&&y<size*.72&&Math.abs(x-(size*.29+(y-size*.28)*.8))<w*.62;
    const diagonalB=y>size*.28&&y<size*.72&&Math.abs(x-(size*.71-(y-size*.28)*.8))<w*.62;
    if(inside&&(left||right||diagonalA||diagonalB)&&y>size*.26&&y<size*.76){const t=y/size;r=Math.round(216-112*t);g=Math.round(255-24*t);b=Math.round(247-26*t);}
    raw[p]=r;raw[p+1]=g;raw[p+2]=b;raw[p+3]=a;
  }}
  const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(size,0);ihdr.writeUInt32BE(size,4);ihdr[8]=8;ihdr[9]=6;
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk("IHDR",ihdr),chunk("IDAT",deflateSync(raw)),chunk("IEND",Buffer.alloc(0))]);
}
for(const size of [16,32,48,128]) await writeFile(`assets/icon-${size}.png`,icon(size));
console.log("✓ 扩展 PNG 图标已生成");
