const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');
const files = fs.readdirSync(publicDir);

const replacements = [
  { from: /في الخليج ومصر/g, to: 'لجميع الأطفال باللغة العربية' },
  { from: /في السعودية والخليج ومصر/g, to: 'لجميع الأطفال والناشئين' },
  { from: /في السعودية، الإمارات، الكويت، قطر، عمان، البحرين ومصر/g, to: 'لجميع الأطفال والناشئين باللغة العربية' },
  { from: /دول الخليج العربي ومصر/g, to: 'الوطن العربي وكافة أنحاء العالم' },
  { from: /دول الخليج ومصر/g, to: 'كافة أنحاء العالم العربي' },
  { from: /الخليج العربي ومصر/g, to: 'العالم العربي' },
  { from: /لأبنائنا في الخليج ومصر/g, to: 'لأبنائنا في كل مكان' },
  { from: /كورس برمجة الخليج/g, to: 'كورس برمجة للأطفال' },
  { from: /المملكة العربية السعودية ودول الخليج ومصر/g, to: 'جميع الدول العربية' }
];

files.forEach(file => {
  const filePath = path.join(publicDir, file);
  if (fs.statSync(filePath).isFile() && (file.endsWith('.html') || file.endsWith('.xml'))) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    replacements.forEach(r => {
      if (r.from.test(content)) {
        content = content.replace(r.from, r.to);
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Cleaned country mentions in: ${file}`);
    }
  }
});
