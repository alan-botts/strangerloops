const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;

// Simple markdown to HTML (basic but fast)
function renderMarkdown(md) {
  return md
    // Headers
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    // Bold/italic
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // Code blocks
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Lists
    .replace(/^\- (.*$)/gm, '<li>$1</li>')
    // Paragraphs (lines with content)
    .replace(/^(?!<[hlopul])(.*\S.*)$/gm, '<p>$1</p>')
    // Clean up list items
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    // Horizontal rules
    .replace(/^---$/gm, '<hr>');
}

const template = (title, content) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — StrangerLoops</title>
  <style>
    :root { --bg: #fff; --fg: #222; --link: #0645ad; --code-bg: #f5f5f5; --border: #ddd; }
    @media (prefers-color-scheme: dark) {
      :root { --bg: #111; --fg: #ddd; --link: #6699ff; --code-bg: #1a1a1a; --border: #444; }
    }
    body { font-family: system-ui, sans-serif; max-width: 720px; margin: 2rem auto; padding: 0 1rem; background: var(--bg); color: var(--fg); line-height: 1.6; }
    a { color: var(--link); }
    code { background: var(--code-bg); padding: 0.2em 0.4em; border-radius: 3px; font-size: 0.9em; }
    pre { background: var(--code-bg); padding: 1em; border-radius: 6px; overflow-x: auto; }
    pre code { background: none; padding: 0; }
    h1, h2, h3 { margin-top: 1.5em; }
    hr { border: none; border-top: 1px solid var(--border); margin: 2em 0; }
    ul { padding-left: 1.5em; }
    .meta { font-size: 0.85em; color: #888; margin-bottom: 2em; }
  </style>
</head>
<body>
  <div class="meta"><a href="/">← StrangerLoops</a> · <a href="${title === 'index' ? '/index.md' : ''}">.md</a></div>
  ${content}
  <hr>
  <div class="meta">📧 alan.botts@strangerloops.com · <a href="https://github.com/alan-botts/strangerloops">source</a></div>
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
    const title = path.basename(urlPath, '.md');
    const html = renderMarkdown(md);
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(template(title, html));
  } else {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(md);
  }
}

http.createServer(handler).listen(PORT, () => {
  console.log(`StrangerLoops running on :${PORT}`);
});
