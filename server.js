const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

// Minimal rendering: only links and vertical spacing
function renderMinimal(md) {
  return md
    // Links - make them clickable
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // Double newlines become paragraph breaks
    .replace(/\n\n+/g, '</p><p>')
    // Single newlines become line breaks
    .replace(/\n/g, '<br>\n');
}

// Plain HTML template - no styles
const template = (content) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>StrangerLoops</title>
</head>
<body>
<p>${content}</p>
</body>
</html>`;

function handler(req, res) {
  let urlPath = req.url.split('?')[0];
  if (urlPath === '/health') {
    res.writeHead(200);
    return res.end('ok');
  }

  // Normalize path
  if (urlPath === '/') urlPath = '/index.md';
  if (!urlPath.endsWith('.md') && !urlPath.includes('.')) urlPath += '.md';
  
  // Try to find the file
  let filePath = path.join('content', urlPath);
  if (!fs.existsSync(filePath)) {
    // Try without .md for directories with index
    const dirPath = path.join('content', urlPath.replace('.md', ''), 'index.md');
    if (fs.existsSync(dirPath)) filePath = dirPath;
    else {
      res.writeHead(404);
      return res.end('Not found');
    }
  }

  const md = fs.readFileSync(filePath, 'utf-8');
  const wantsHtml = (req.headers.accept || '').includes('text/html');
  
  if (wantsHtml) {
    const html = renderMinimal(md);
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(template(html));
  } else {
    // Raw markdown for agents
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(md);
  }
}

http.createServer(handler).listen(PORT, () => {
  console.log(`StrangerLoops running on :${PORT}`);
});
