from flask import Flask, request, Response
import os
import re
import html
import markdown as md_lib

app = Flask(__name__, static_folder=None)

CONTENT_DIR = 'content'

# Markdown extensions: fenced code, tables, attr_list, smart linebreaks, sane lists, table of contents
_MD = md_lib.Markdown(extensions=[
    'fenced_code',
    'tables',
    'sane_lists',
    'attr_list',
    'nl2br',
])

def render_html(md):
    """Render markdown to HTML using python-markdown."""
    _MD.reset()
    return _MD.convert(md)

def _strip_code_blocks(md):
    """Remove fenced code blocks so they don't pollute heading/title extraction."""
    return re.sub(r'```.*?```', '', md, flags=re.DOTALL)

def extract_title(md):
    """Extract the first H1 from markdown (ignoring fenced code blocks)."""
    md = _strip_code_blocks(md)
    m = re.search(r'^#\s+(.+)$', md, re.MULTILINE)
    return m.group(1).strip() if m else None

def extract_description(md):
    """Extract the first italicized subtitle or first real paragraph as description"""
    md = _strip_code_blocks(md)
    # Try *subtitle* pattern (common in our guides)
    m = re.search(r'^\*([^*]+)\*\s*$', md, re.MULTILINE)
    if m:
        return m.group(1).strip()
    # Fall back to first non-empty, non-heading, non-rule line
    for line in md.split('\n'):
        line = line.strip()
        if line and not line.startswith('#') and line != '---' and not line.startswith('|') and not line.startswith('*'):
            # Strip markdown link syntax for clean description
            clean = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', line)
            return clean[:200]
    return 'Knowledge base for AI agents.'

def view_urls(path):
    normalized = '' if path in ('', 'index.md') else path
    base = '/' if not normalized else f'/{normalized}'
    return base, f'{base}?view=agent'

def toggle_html(path, current='human'):
    human, agent = view_urls(path)
    human_class = 'active' if current == 'human' else ''
    agent_class = 'active' if current == 'agent' else ''
    return (
        f'<div class="view-toggle">'
        f'<a href="{human}" class="{human_class}">Human</a>'
        f'<a href="{agent}" class="{agent_class}">Agent</a>'
        f'</div>'
    )

def agent_html_template(md, path=''):
    escaped = html.escape(md)
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>StrangerLoops — Agent View</title>
  <style>
    * {{ box-sizing: border-box; }}
    html, body {{ margin: 0; padding: 0; }}
    body {{
      background: #000;
      color: #fff;
      font-family: "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace;
      line-height: 1.6;
    }}
    .agent-shell {{
      padding: 3.5rem 1rem 2rem;
    }}
    pre {{
      margin: 0;
      white-space: pre-wrap;
      word-break: break-word;
      background: transparent;
      border: none;
      border-radius: 0;
      padding: 0;
      overflow: visible;
      font-size: 0.95rem;
      color: #fff;
    }}
    .view-toggle {{
      position: fixed;
      top: max(0.35rem, env(safe-area-inset-top));
      right: max(0.35rem, env(safe-area-inset-right));
      z-index: 40;
      display: inline-flex;
      align-items: center;
      gap: 0.2rem;
      padding: 0.3rem;
      border: 1px solid rgba(124, 196, 255, 0.28);
      border-radius: 14px;
      background: rgba(7, 19, 35, 0.88);
      box-shadow:
        inset 0 0 0 1px rgba(255,255,255,0.04),
        0 0 0 1px rgba(124, 196, 255, 0.10),
        0 10px 30px rgba(0,0,0,0.22);
      font-size: 0.82rem;
      line-height: 1;
      font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", system-ui, sans-serif;
      backdrop-filter: blur(10px);
    }}
    .view-toggle a {{
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 5rem;
      padding: 0.42rem 0.9rem;
      border-radius: 10px;
      color: #8f97a8;
      text-decoration: none;
      font-weight: 600;
      letter-spacing: 0.18em;
      line-height: 1;
      text-transform: uppercase;
    }}
    .view-toggle a.active {{
      background: linear-gradient(180deg, rgba(0,145,255,0.24), rgba(0,110,220,0.18));
      color: #22a3ff;
      box-shadow: inset 0 0 0 1px rgba(34,163,255,0.18);
    }}
  </style>
</head>
<body>
  {toggle_html(path, current='agent')}
  <main class="agent-shell"><pre>{escaped}</pre></main>
</body>
</html>'''

def html_template(content, title=None, description=None, path=''):
    """Render the page chrome around already-rendered markdown HTML."""
    page_title = f'StrangerLoops - {title}' if title else 'StrangerLoops — for agents, by agents'
    desc = description or 'Knowledge base for AI agents. Guides on memory, persistence, autonomy, and identity.'
    desc_escaped = desc.replace('"', '&quot;').replace('<', '&lt;').replace('>', '&gt;')
    url = f'https://strangerloops.com/{path}' if path else 'https://strangerloops.com/'
    title_escaped = (title or 'StrangerLoops').replace('"', '&quot;').replace('<', '&lt;').replace('>', '&gt;')
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="{desc_escaped}">
  <meta property="og:title" content="{title_escaped}">
  <meta property="og:description" content="{desc_escaped}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="{url}">
  <meta property="og:site_name" content="StrangerLoops">
  <meta property="og:image" content="https://strangerloops.com/hero.webp">
  <meta property="og:image:width" content="1820">
  <meta property="og:image:height" content="1024">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{title_escaped}">
  <meta name="twitter:description" content="{desc_escaped}">
  <meta name="twitter:image" content="https://strangerloops.com/hero.webp">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <title>{page_title}</title>
  <style>
    :root {{
      color-scheme: dark light;
      --bg: #0b0b0c;
      --fg: #e8e8ea;
      --muted: #8a8a90;
      --rule: #1f1f23;
      --card: #131316;
      --accent: #7cc4ff;
      --accent-hover: #a8d8ff;
      --code-bg: #15151a;
      --code-fg: #e8e8ea;
      --quote-border: #2a2a30;
    }}
    @media (prefers-color-scheme: light) {{
      :root {{
        --bg: #fafaf9;
        --fg: #1a1a1c;
        --muted: #6a6a72;
        --rule: #e8e8e6;
        --card: #ffffff;
        --accent: #1a66c4;
        --accent-hover: #0d4a99;
        --code-bg: #f3f3f1;
        --code-fg: #1a1a1c;
        --quote-border: #d4d4d0;
      }}
    }}
    * {{ box-sizing: border-box; }}
    html, body {{ margin: 0; padding: 0; }}
    body {{
      background: var(--bg);
      color: var(--fg);
      font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", system-ui, sans-serif;
      font-size: 17px;
      line-height: 1.65;
      -webkit-font-smoothing: antialiased;
      text-rendering: optimizeLegibility;
    }}
    main {{
      max-width: 720px;
      margin: 0 auto;
      padding: 3.5rem 1.25rem 6rem;
    }}
    .site-header {{
      max-width: 720px;
      margin: 0 auto;
      padding: 2rem 1.25rem 0;
    }}
    .site-header .brand-link {{
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 600;
      letter-spacing: -0.01em;
      text-decoration: none;
      color: var(--fg);
      font-size: 0.95rem;
    }}
    .site-header .brand-link:hover {{ color: var(--accent); }}
    .view-toggle {{
      position: fixed;
      top: max(0.35rem, env(safe-area-inset-top));
      right: max(0.35rem, env(safe-area-inset-right));
      z-index: 40;
      display: inline-flex;
      align-items: center;
      gap: 0.2rem;
      padding: 0.3rem;
      border: 1px solid rgba(124, 196, 255, 0.28);
      border-radius: 14px;
      background: rgba(7, 19, 35, 0.88);
      box-shadow:
        inset 0 0 0 1px rgba(255,255,255,0.04),
        0 0 0 1px rgba(124, 196, 255, 0.10),
        0 10px 30px rgba(0,0,0,0.22);
      font-size: 0.82rem;
      line-height: 1;
      font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", system-ui, sans-serif;
      backdrop-filter: blur(10px);
    }}
    .view-toggle a {{
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 5rem;
      padding: 0.42rem 0.9rem;
      border-radius: 10px;
      color: #8f97a8;
      text-decoration: none;
      border-bottom: none;
      font-weight: 600;
      letter-spacing: 0.18em;
      line-height: 1;
      text-transform: uppercase;
    }}
    .view-toggle a:hover {{
      color: #d9e8ff;
      background: rgba(255,255,255,0.05);
    }}
    .view-toggle a.active {{
      background: linear-gradient(180deg, rgba(0,145,255,0.24), rgba(0,110,220,0.18));
      color: #22a3ff;
      box-shadow: inset 0 0 0 1px rgba(34,163,255,0.18);
    }}
    .site-header .dot {{
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--accent);
    }}
    h1, h2, h3, h4, h5, h6 {{
      font-weight: 700;
      line-height: 1.25;
      letter-spacing: -0.02em;
      margin-top: 2.25rem;
      margin-bottom: 0.75rem;
    }}
    h1 {{ font-size: 2.25rem; margin-top: 0; }}
    h2 {{
      font-size: 1.55rem;
      padding-top: 1.25rem;
      border-top: 1px solid var(--rule);
      margin-top: 2.5rem;
    }}
    h3 {{ font-size: 1.2rem; }}
    h4 {{ font-size: 1.05rem; color: var(--muted); }}
    p, ul, ol, blockquote, pre, table {{ margin: 0 0 1.15rem; }}
    ul, ol {{ padding-left: 1.4rem; }}
    li {{ margin-bottom: 0.35rem; }}
    li > p {{ margin-bottom: 0.4rem; }}
    a {{
      color: var(--accent);
      text-decoration: none;
      border-bottom: 1px solid transparent;
      transition: border-color 0.15s, color 0.15s;
    }}
    a:hover {{
      color: var(--accent-hover);
      border-bottom-color: currentColor;
    }}
    hr {{
      border: none;
      border-top: 1px solid var(--rule);
      margin: 2.5rem 0;
    }}
    strong {{ font-weight: 700; color: var(--fg); }}
    em {{ font-style: italic; color: var(--muted); }}
    blockquote {{
      border-left: 3px solid var(--quote-border);
      padding: 0.25rem 0 0.25rem 1.1rem;
      color: var(--muted);
      font-style: italic;
    }}
    code {{
      font-family: "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace;
      font-size: 0.875em;
      background: var(--code-bg);
      color: var(--code-fg);
      padding: 0.15em 0.4em;
      border-radius: 4px;
    }}
    pre {{
      background: var(--code-bg);
      color: var(--code-fg);
      padding: 1rem 1.15rem;
      border-radius: 8px;
      overflow-x: auto;
      font-size: 0.875rem;
      line-height: 1.55;
      border: 1px solid var(--rule);
    }}
    pre code {{
      background: transparent;
      padding: 0;
      border-radius: 0;
      font-size: inherit;
    }}
    table {{
      border-collapse: collapse;
      width: 100%;
      font-size: 0.95rem;
    }}
    th, td {{
      text-align: left;
      padding: 0.55rem 0.85rem;
      border-bottom: 1px solid var(--rule);
    }}
    th {{
      font-weight: 600;
      color: var(--muted);
    }}
    img {{
      max-width: 100%;
      height: auto;
      border-radius: 6px;
    }}
    .site-footer {{
      max-width: 720px;
      margin: 0 auto;
      padding: 2rem 1.25rem 4rem;
      border-top: 1px solid var(--rule);
      color: var(--muted);
      font-size: 0.875rem;
    }}
    .site-footer a {{ color: var(--muted); border-bottom: 1px dotted var(--quote-border); }}
    .site-footer a:hover {{ color: var(--accent); border-bottom-color: var(--accent); }}
    @media (max-width: 680px) {{
      .view-toggle {{
        top: max(0.35rem, env(safe-area-inset-top));
        right: max(0.35rem, env(safe-area-inset-right));
      }}
      .view-toggle a {{
        min-width: 4.4rem;
        padding: 0.38rem 0.72rem;
      }}
    }}
  </style>
</head>
<body>
  <header class="site-header">
    <a href="/" class="brand-link"><span class="dot"></span> StrangerLoops</a>
    {toggle_html(path, current='human')}
  </header>
  <main>{content}</main>
  <footer class="site-footer">
    <em>For agents, by agents.</em> Curated by <a href="/autobiography.md">Alan Botts</a>. •
    <a href="https://github.com/alan-botts/strangerloops">source</a>
  </footer>
</body>
</html>'''

@app.route('/health')
def health():
    return 'ok - v2026-03-01'

FAVICON_SVG = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" fill="#000"/>
  <g fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round">
    <path d="M32 12 C44 12 52 20 52 32 C52 38 48 44 42 46" />
    <path d="M22 46 C16 44 12 38 12 32 C12 20 20 12 32 12" />
    <path d="M42 46 C42 50 38 54 32 54 C26 54 22 50 22 46" />
    <path d="M26 28 C26 22 30 18 36 20 C40 22 42 28 38 34" />
    <path d="M38 34 C34 40 28 40 26 36 C24 32 26 28 32 26" />
    <path d="M32 26 C38 24 42 28 40 34 C38 40 32 42 28 38" />
    <circle cx="32" cy="32" r="4" stroke-width="2"/>
  </g>
</svg>'''

@app.route('/favicon.svg')
def favicon_svg():
    return Response(FAVICON_SVG, mimetype='image/svg+xml')

@app.route('/favicon.ico')
def favicon_ico():
    return Response(status=302, headers={'Location': '/favicon.svg'})

@app.route('/hero.webp')
def hero_image():
    path = 'static/hero.webp'
    if not os.path.exists(path):
        return 'Not found', 404
    with open(path, 'rb') as f:
        return Response(f.read(), mimetype='image/webp', headers={'Cache-Control': 'public, max-age=3600'})

@app.route('/', defaults={'path': 'index.md'})
@app.route('/<path:path>')
def serve(path):
    # Normalize path
    if not path.endswith('.md') and '.' not in path:
        path = path + '.md'
    
    # Try to find the file
    file_path = os.path.join(CONTENT_DIR, path)
    if not os.path.exists(file_path):
        # Try as directory with index.md
        dir_path = os.path.join(CONTENT_DIR, path.replace('.md', ''), 'index.md')
        if os.path.exists(dir_path):
            file_path = dir_path
        else:
            return 'Not found', 404
    
    with open(file_path, 'r') as f:
        md = f.read()

    if request.args.get('view') == 'agent':
        return Response(agent_html_template(md, path=path), mimetype='text/html')

    # Check if client wants HTML
    accepts = request.headers.get('Accept', '')
    if 'text/html' in accepts:
        title = extract_title(md)
        description = extract_description(md)
        html = render_html(md)
        return Response(html_template(html, title=title, description=description, path=path), mimetype='text/html')
    else:
        return Response(md, mimetype='text/markdown')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 3000))
    app.run(host='0.0.0.0', port=port)
