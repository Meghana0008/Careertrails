const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./app');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  // Replace gradient text with slate-900
  content = content.replace(/className="([^"]*)gradient-text([^"]*)"/g, 'className="$1text-slate-900$2"');
  
  // Replace gradient bg with slate-900
  content = content.replace(/className="([^"]*)gradient-bg([^"]*)"/g, 'className="$1bg-slate-900$2"');
  
  // Replace gradient border with standard border
  content = content.replace(/className="([^"]*)gradient-border([^"]*)"/g, 'className="$1border border-slate-200$2"');
  
  // Replace variant="gradient" with standard button styles
  content = content.replace(/variant="gradient"/g, 'className="bg-slate-900 text-white hover:bg-slate-800"');
  
  // Fix lint errors: bg-gradient-to-br / bg-gradient-to-r
  content = content.replace(/bg-gradient-to-br from-[a-z]+-\d+ to-[a-z]+-\d+/g, 'bg-slate-100 ring-1 ring-slate-200 text-slate-700');
  content = content.replace(/bg-gradient-to-r from-[a-z]+-\d+ to-[a-z]+-\d+/g, 'bg-slate-100 ring-1 ring-slate-200 text-slate-700');

  // Specific fix for the drives page h-1 divider
  content = content.replace(/<div className="h-1 bg-linear-to-r from-amber-500 to-orange-500" \/>/g, '<div className="h-1 bg-slate-900" />');
  
  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
