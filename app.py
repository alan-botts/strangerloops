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

def html_template(content):
    """Plain HTML with pre-wrap to preserve whitespace"""
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <title>StrangerLoops</title>
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
    return 'ok'

@app.route('/debugtest')
def debugtest():
    return 'DEBUG TEST WORKS - this proves the route is registered'

@app.route('/test-favicon.svg')
def test_favicon():
    return 'TEST FAVICON ROUTE WORKS'

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

@app.route('/', defaults={'path': 'index.md'})
@app.route('/<path:path>')
def serve(path):
    # DEBUG: return the path to see what we're getting
    if path.startswith('favicon'):
        return f"DEBUG: path={path}, type={type(path)}"
    
    # Handle favicon here to ensure it works
    if path == 'favicon.svg':
        return Response(FAVICON_SVG, mimetype='image/svg+xml')
    if path == 'favicon.ico':
        return Response(status=302, headers={'Location': '/favicon.svg'})
    
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
        html = render_minimal(md)
        return Response(html_template(html), mimetype='text/html')
    else:
        return Response(md, mimetype='text/markdown')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 3000))
    app.run(host='0.0.0.0', port=port)
