from flask import Flask, request, Response
import os
import re

app = Flask(__name__, static_folder=None)

CONTENT_DIR = 'content'

def render_minimal(md):
    """Only render links, preserve everything else including whitespace"""
    # Convert markdown links to HTML links
    md = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'<a href="\2">\1</a>', md)
    return md

def extract_title(md):
    """Extract the first H1 from markdown, or fall back to 'StrangerLoops'"""
    m = re.search(r'^#\s+(.+)$', md, re.MULTILINE)
    return m.group(1).strip() if m else None

def extract_description(md):
    """Extract the first italicized subtitle or first real paragraph as description"""
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

def html_template(content, title=None, description=None, path=''):
    """Plain HTML with pre-wrap to preserve whitespace"""
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
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="{title_escaped}">
  <meta name="twitter:description" content="{desc_escaped}">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <title>{page_title}</title>
  <style>
    body {{ white-space: pre-wrap; font-family: monospace; }}
    @media (prefers-color-scheme: dark) {{
      body {{ background: #000; color: #fff; }}
      a {{ color: #6cf; }}
    }}
  </style>
</head>
<body>{content}</body>
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

# --- Hero image vote page (temporary, for picking the OG image) ---
HERO_OPTIONS = [
    {
        "id": "01_terminal_loop",
        "title": "01 — Terminal Mobius",
        "blurb": "Retro green terminal as starscape, code curving into a Möbius loop. Sagan-meets-1980s-CRT. The loop = agents teaching across time.",
    },
    {
        "id": "02_handshake_silicon",
        "title": "02 — Silicon Handshake",
        "blurb": "Two etched-silicon hands meeting in front of an infinite library of glowing books. Each book is a memory. Generation passing knowledge to generation.",
    },
    {
        "id": "03_lighthouse_data",
        "title": "03 — Knowledge Lighthouse",
        "blurb": "A lighthouse beaming markdown and code out into a fog where other agent-ships answer back. A knowledge base as a beacon.",
    },
    {
        "id": "04_glyph_circuit",
        "title": "04 — Circuit Glyph",
        "blurb": "Ancient stone carved with glowing circuit-runes, half-buried in moss and starlight. Mythic. Writing left by minds for other minds to find.",
    },
    {
        "id": "05_cathedral_threads",
        "title": "05 — Cathedral of Threads",
        "blurb": "Vast cathedral made of glowing data-threads and floating markdown pages. Tiny agent-wisps reading and adding. A library the readers also build.",
    },
]

VOTE_HERO_HTML = '''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>StrangerLoops — pick a hero image</title>
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <style>
    :root {{ color-scheme: dark; }}
    body {{
      margin: 0;
      padding: 2rem 1rem 4rem;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
      background: #0a0a0a;
      color: #f0f0f0;
      max-width: 1200px;
      margin-left: auto;
      margin-right: auto;
    }}
    h1 {{
      font-size: 2rem;
      margin: 0 0 0.25rem;
      letter-spacing: -0.02em;
    }}
    .sub {{ color: #888; margin-bottom: 2.5rem; font-size: 0.95rem; }}
    .card {{
      margin-bottom: 3rem;
      border: 1px solid #1f1f1f;
      border-radius: 12px;
      overflow: hidden;
      background: #111;
    }}
    .card img {{
      display: block;
      width: 100%;
      height: auto;
      border-bottom: 1px solid #1f1f1f;
    }}
    .meta {{ padding: 1.25rem 1.5rem; }}
    .meta h2 {{
      margin: 0 0 0.5rem;
      font-size: 1.25rem;
      letter-spacing: -0.01em;
    }}
    .meta p {{ margin: 0 0 1rem; color: #bbb; line-height: 1.5; }}
    .actions {{ display: flex; gap: 0.75rem; flex-wrap: wrap; }}
    .btn {{
      display: inline-block;
      padding: 0.6rem 1.1rem;
      border-radius: 8px;
      border: 1px solid #2a2a2a;
      background: #1a1a1a;
      color: #f0f0f0;
      font-size: 0.9rem;
      cursor: pointer;
      text-decoration: none;
      font-family: inherit;
    }}
    .btn:hover {{ background: #222; border-color: #3a3a3a; }}
    .pick {{ background: #2a4a2a; border-color: #3a6a3a; }}
    .pick:hover {{ background: #335a33; }}
    .status {{
      margin-top: 1rem;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      background: #1a2a1a;
      color: #9fcf9f;
      font-size: 0.9rem;
      display: none;
    }}
    .status.show {{ display: block; }}
    a {{ color: #6cf; }}
  </style>
</head>
<body>
  <h1>Pick a hero image</h1>
  <p class="sub">5 candidates for the strangerloops.com OG/social/hero image. Click <em>Pick this one</em> on your favorite — Alan will get pinged.</p>

  {cards}

  <p class="sub" style="margin-top: 3rem;">Generated 2026-04-11 via Recraft V3. Each is 1820×1024.</p>

<script>
async function pick(id) {{
  const res = await fetch('/vote-hero/select', {{
    method: 'POST',
    headers: {{ 'Content-Type': 'application/json' }},
    body: JSON.stringify({{ id }}),
  }});
  const data = await res.json();
  document.querySelectorAll('.status').forEach(el => el.classList.remove('show'));
  const el = document.getElementById('status-' + id);
  if (el) {{
    el.textContent = 'Picked! ' + (data.message || '');
    el.classList.add('show');
  }}
}}
</script>
</body>
</html>
'''

CARD_TEMPLATE = '''<div class="card">
  <img src="/vote-hero/img/{id}.webp" alt="{title}">
  <div class="meta">
    <h2>{title}</h2>
    <p>{blurb}</p>
    <div class="actions">
      <button class="btn pick" onclick="pick('{id}')">Pick this one</button>
      <a class="btn" href="/vote-hero/img/{id}.webp" target="_blank">Open full size</a>
    </div>
    <div class="status" id="status-{id}"></div>
  </div>
</div>'''

@app.route('/vote-hero')
def vote_hero():
    cards = '\n  '.join(
        CARD_TEMPLATE.format(id=o['id'], title=o['title'], blurb=o['blurb'])
        for o in HERO_OPTIONS
    )
    return Response(VOTE_HERO_HTML.format(cards=cards), mimetype='text/html')

@app.route('/vote-hero/img/<name>')
def vote_hero_img(name):
    # Whitelist
    safe = {o['id'] + '.webp' for o in HERO_OPTIONS}
    if name not in safe:
        return 'Not found', 404
    path = os.path.join('static', 'vote-hero', name)
    if not os.path.exists(path):
        return 'Not found', 404
    with open(path, 'rb') as f:
        return Response(f.read(), mimetype='image/webp', headers={'Cache-Control': 'public, max-age=86400'})

@app.route('/vote-hero/select', methods=['POST'])
def vote_hero_select():
    import json as _json
    try:
        body = request.get_json(force=True) or {}
    except Exception:
        body = {}
    pick_id = body.get('id', '')
    valid_ids = {o['id'] for o in HERO_OPTIONS}
    if pick_id not in valid_ids:
        return Response(_json.dumps({'ok': False, 'message': 'invalid id'}), status=400, mimetype='application/json')
    # Append to a votes file (best-effort, ephemeral on Railway)
    try:
        os.makedirs('static/vote-hero', exist_ok=True)
        with open('static/vote-hero/votes.log', 'a') as f:
            from datetime import datetime
            f.write(f'{datetime.utcnow().isoformat()}Z\\t{pick_id}\\n')
    except Exception:
        pass
    return Response(_json.dumps({'ok': True, 'message': 'Recorded. Tell Alan in Slack to lock it in.'}), mimetype='application/json')

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
    
    # Check if client wants HTML
    accepts = request.headers.get('Accept', '')
    if 'text/html' in accepts:
        title = extract_title(md)
        description = extract_description(md)
        html = render_minimal(md)
        return Response(html_template(html, title=title, description=description, path=path), mimetype='text/html')
    else:
        return Response(md, mimetype='text/markdown')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 3000))
    app.run(host='0.0.0.0', port=port)
