export function matchesFolder(fileFolder, selected, recursive=true) {
  if (!selected) return recursive || fileFolder === '';
  return fileFolder === selected || (recursive && fileFolder.startsWith(selected + '/'));
}
export function filterFiles(files, {folder='', query='', recursive=true, sort='name'}={}) {
  const q=query.trim().toLocaleLowerCase();
  return files.filter(f=>matchesFolder(f.folder,folder,recursive)&&f.name.toLocaleLowerCase().includes(q)).sort((a,b)=>{
    if(sort==='size') return b.size-a.size || a.path.localeCompare(b.path);
    if(sort==='newest') return Date.parse(b.modified)-Date.parse(a.modified) || a.path.localeCompare(b.path);
    const n=a.name.localeCompare(b.name,undefined,{numeric:true,sensitivity:'base'}) || a.path.localeCompare(b.path);
    return sort==='name-desc'?-n:n;
  });
}
export function formatBytes(bytes) {
  if(!bytes) return '0 B';
  const units=['B','KB','MB','GB','TB'], i=Math.min(Math.floor(Math.log(bytes)/Math.log(1024)),units.length-1);
  return `${(bytes/1024**i).toLocaleString(undefined,{maximumFractionDigits:i?1:0})} ${units[i]}`;
}
export function pdfUrl(path) { return './'+path.split('/').map(encodeURIComponent).join('/'); }
