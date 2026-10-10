import { readdir, stat, mkdir, writeFile, open } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export async function createCatalog(base=root) {
 const pdfRoot=path.join(base,'pdfs'), files=[], folders=[];
 await mkdir(pdfRoot,{recursive:true});
 async function walk(dir,relative='') {
  const entries=(await readdir(dir,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name));
  for(const entry of entries){
   if(entry.name.startsWith('.')||entry.isSymbolicLink())continue;
   const rel=relative?relative+'/'+entry.name:entry.name, full=path.join(dir,entry.name);
   if(entry.isDirectory()){folders.push({name:entry.name,path:rel,count:0});await walk(full,rel)}
   else if(entry.isFile()&&entry.name.toLowerCase().endsWith('.pdf')){
    const s=await stat(full),handle=await open(full,'r');let header;
    try{const buf=Buffer.alloc(128);const result=await handle.read(buf,0,128,0);header=buf.subarray(0,result.bytesRead).toString('utf8')}finally{await handle.close()}
    if(header.startsWith('version https://git-lfs.github.com/spec/v1'))throw new Error(`LFS pointer instead of PDF: ${rel}. Store normal PDFs or configure LFS checkout.`);
    if(s.size>=100*1024*1024)throw new Error(`PDF exceeds the project's 100 MiB regular-Git limit: ${rel}`);
    files.push({name:entry.name,folder:relative,path:'pdfs/'+rel,size:s.size,modified:s.mtime.toISOString()});
   }
  }
 }
 await walk(pdfRoot);
 for(const folder of folders)folder.count=files.filter(f=>f.folder===folder.path||f.folder.startsWith(folder.path+'/')).length;
 return {version:1,generatedAt:new Date().toISOString(),files,folders};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const catalog=await createCatalog();await writeFile(path.join(root,'catalog.json'),JSON.stringify(catalog,null,2));console.log(`Indexed ${catalog.files.length} PDFs across ${catalog.folders.length} folders.`);
}
