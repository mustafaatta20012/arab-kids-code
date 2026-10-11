const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');

for (let i = 1; i <= 10; i++) {
  const filePath = path.join(publicDir, `lesson${i}.html`);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace broken image filename
    content = content.replace(/scratch-coding-lessons-for-kids\.png/g, 'images/icon_search_scratch.png');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed image references in lesson${i}.html`);
  }
}
