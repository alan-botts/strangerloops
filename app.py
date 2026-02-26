from flask import Flask, request, Response
import os
import re

app = Flask(__name__)

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
  <title>StrangerLoops</title>
  <style>
    body {{ white-space: pre-wrap; font-family: monospace; }}
  </style>
</head>
<body>{content}</body>
</html>'''

@app.route('/health')
def health():
    return 'ok'

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
        html = render_minimal(md)
        return Response(html_template(html), mimetype='text/html')
    else:
        return Response(md, mimetype='text/plain')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 3000))
    app.run(host='0.0.0.0', port=port)
