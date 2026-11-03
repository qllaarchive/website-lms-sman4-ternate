#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'public', 'data');
const ASSETS_DIR = path.join(ROOT, 'public', 'assets');

const FILES = ['registry.js', 'matematika.js', 'fisika.js', 'sejarah.js', 'pendais.js'];

function minifyJs(content) {
  let out = content.replace(/\/\/.*$/gm, '');
  out = out.replace(/\/\*[\s\S]*?\*\//g, '');
  out = out.replace(/\s+/g, ' ');
  out = out.replace(/\s*([{}\[\]])\s*/g, '$1');
  out = out.replace(/\s*,\s*/g, ',');
  out = out.replace(/\s*;/g, ';');
  out = out.replace(/\b(if|for|function|var|const|let|return|throw|try|catch|finally|else|switch|case|break|while|do|new|delete|typeof|instanceof|in|of)\s+/g, '$1 ');
  out = out.replace(/\s+(?=\()/g, '');
  return out;
}

function processFile(filePath, outputPath) {
  const original = fs.readFileSync(filePath, 'utf8');
  const minified = minifyJs(original);
  const ratio = ((1 - minified.length / original.length) * 100).toFixed(1) + '%';
  if (outputPath) {
    fs.writeFileSync(outputPath, minified, 'utf8');
    console.log('\n' + path.relative(ROOT, outputPath));
    console.log('  Asli: ' + original.length + ' chars -> Minified: ' + minified.length + ' chars (' + ratio + ')');
    const bakPath = outputPath + '.bak';
    fs.writeFileSync(bakPath, original, 'utf8');
    console.log('  Backup: ' + path.relative(ROOT, bakPath));
  }
  return { original: original.length, minified: minified.length, ratio, lines: minified.split('\n').length };
}

console.log('LMS Minifier\n');
const results = [];
for (const file of FILES) {
  const inputPath = path.join(DATA_DIR, file);
  const outputPath = path.join(DATA_DIR, file.replace(/\.js$/, '.min.js'));
  if (fs.existsSync(inputPath)) {
    const stats = processFile(inputPath, outputPath);
    results.push({ file, ...stats });
  } else {
    console.log('File not found: ' + inputPath);
  }
}
const lmsInput = path.join(ASSETS_DIR, 'lms.js');
const lmsOutput = path.join(ASSETS_DIR, 'lms.min.js');
if (fs.existsSync(lmsInput)) {
  const stats = processFile(lmsInput, lmsOutput);
  results.push({ file: 'lms.js', ...stats });
} else {
  console.log('File not found: ' + lmsInput);
}

console.log('\n=== Results ===');
results.forEach(r => {
  console.log(r.file.padEnd(20) + r.original.toString().padStart(6) + ' -> ' + r.minified.toString().padStart(6) + ' chars (' + r.ratio + ')');
});

// Update HTML
const mapelDir = path.join(ROOT, 'public', 'mapel');
const htmlFiles = [];
if (fs.existsSync(mapelDir)) {
  for (const f of fs.readdirSync(mapelDir)) {
    if (f.endsWith('.html')) htmlFiles.push(path.join(mapelDir, f));
  }
}
htmlFiles.push(path.join(ASSETS_DIR, 'lms.js'));
for (const htmlFile of htmlFiles) {
  if (!fs.existsSync(htmlFile)) continue;
  let content = fs.readFileSync(htmlFile, 'utf8');
  if (content.includes('src="../assets/lms.js"')) {
    content = content.replace(/src="\.\.\/assets\/lms\.js"/g, 'src="../assets/lms.min.js"');
    fs.writeFileSync(htmlFile, content, 'utf8');
    console.log('Update: ' + path.relative(ROOT, htmlFile));
  }
}
