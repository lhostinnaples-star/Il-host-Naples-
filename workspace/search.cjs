const fs = require('fs');
const path = require('path');

function walkSync(dir, filelist = []) {
  if (!fs.existsSync(dir)) return filelist;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (['node_modules', 'dist', '.git', 'build', '.cache'].includes(file)) continue;
    const filepath = path.join(dir, file);
    if (fs.statSync(filepath).isDirectory()) {
      walkSync(filepath, filelist);
    } else {
      const ext = path.extname(filepath);
      if (['.ts', '.tsx', '.json', '.html', '.svg', '.md', '.css'].includes(ext)) {
        filelist.push(filepath);
      }
    }
  }
  return filelist;
}

let allFiles = [];
walkSync('src', allFiles);
walkSync('public', allFiles);
walkSync('functions', allFiles);
if (fs.existsSync('index.html')) allFiles.push('index.html');
if (fs.existsSync('metadata.json')) allFiles.push('metadata.json');

const uniqueFiles = [...new Set(allFiles)];

const searchStrings = [
  "L Host in Naples",
  "L Host",
  "Il Host in Naples",
  "Il Host",
  "The Host in Naples",
  "The Host"
];

const results = {};
searchStrings.forEach(s => results[s] = []);

for (const file of uniqueFiles) {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        for (const searchStr of searchStrings) {
            if (line.includes(searchStr)) {
                results[searchStr].push({
                    file: file.replace(/\\/g, '/'),
                    line: i + 1,
                    text: line.trim()
                });
            }
        }
    }
  } catch (e) {
      // ignore read errors
  }
}

for (const searchStr of searchStrings) {
  console.log(`\n=== "${searchStr}" - ${results[searchStr].length} found ===`);
  results[searchStr].forEach(res => {
      console.log(`${res.file}:${res.line} : ${res.text}`);
  });
}
