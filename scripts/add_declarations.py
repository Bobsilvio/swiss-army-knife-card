#!/usr/bin/env python3
"""
Auto-insert TypeScript property declarations (: any) for all classes
in files that were migrated from JavaScript.
"""
import re
import os
import sys

# Files from fork that are already properly typed - skip these
SKIP_DIRS = {
    'src/animations',
    'src/components', 
    'src/config',
    'src/integrations',
    'src/layout',
    'src/performance',
    'src/services',
    'src/theme',
    'src/tools/base',
    'src/tools/charts',
    'src/tools/entity',
    'src/tools/interactive',
    'src/tools/shapes',
    'src/tools/text',
    'src/toolsets',
    'src/types',
    'src/utils',
}

SKIP_FILES = {
    'src/tools/ToolRegistry.ts',
}

def should_process(filepath):
    """Check if this file should be processed (was previously JS)."""
    for skip_dir in SKIP_DIRS:
        if filepath.startswith(skip_dir + '/') or filepath.startswith(skip_dir + os.sep):
            return False
    if filepath in SKIP_FILES:
        return False
    return filepath.endswith('.ts')

def find_class_bodies(content):
    """Find all class declarations and their body ranges."""
    results = []
    # Match: class Name ... {
    pattern = re.compile(r'(class\s+\w+[^{]*)\{')
    for m in pattern.finditer(content):
        class_decl = m.group(1).strip()
        class_name_match = re.match(r'class\s+(\w+)', class_decl)
        if not class_name_match:
            continue
        class_name = class_name_match.group(1)
        brace_pos = m.end() - 1  # position of opening {
        
        # Find matching closing brace
        depth = 0
        body_start = brace_pos
        body_end = None
        for i in range(brace_pos, len(content)):
            if content[i] == '{':
                depth += 1
            elif content[i] == '}':
                depth -= 1
                if depth == 0:
                    body_end = i
                    break
        
        if body_end:
            results.append({
                'name': class_name,
                'body_start': brace_pos,
                'body_end': body_end,
                'insert_pos': brace_pos + 1,  # right after {
            })
    
    return results

def extract_this_props(content, body_start, body_end):
    """Extract all this.xxx property accesses in a class body."""
    body = content[body_start:body_end]
    props = set()
    for m in re.finditer(r'this\.(\w+)', body):
        prop = m.group(1)
        if prop not in ('prototype', 'constructor', 'length', 'addEventListener',
                        'removeEventListener', 'dispatchEvent', 'setAttribute',
                        'querySelector', 'querySelectorAll', 'shadowRoot',
                        'requestUpdate', 'updateComplete', 'renderRoot',
                        'getBoundingClientRect', 'closest', 'parentElement',
                        'parentNode', 'childNodes', 'children', 'nextSibling',
                        'previousSibling', 'firstChild', 'lastChild',
                        'appendChild', 'removeChild', 'insertBefore',
                        'replaceChild', 'cloneNode', 'contains', 'focus', 'blur',
                        'click', 'scrollIntoView', 'classList', 'className',
                        'tagName', 'nodeName', 'nodeType', 'innerHTML',
                        'outerHTML', 'textContent', 'style', 'dataset',
                        'offsetWidth', 'offsetHeight', 'offsetTop', 'offsetLeft',
                        'clientWidth', 'clientHeight', 'scrollWidth', 'scrollHeight',
                        'getRootNode', 'getPropertyValue', 'setProperty',
                        'call', 'apply', 'bind', 'toString', 'valueOf',
                        'hasOwnProperty'):
            props.add(prop)
    return sorted(props)

def check_existing_declarations(content, body_start, props):
    """Check which properties are already declared in the class body."""
    # Look at the first ~50 lines after { for existing declarations
    snippet = content[body_start:body_start + 3000]
    already_declared = set()
    for prop in props:
        # Check for patterns like: propName: type; or propName = value; or propName;
        if re.search(rf'^\s+{re.escape(prop)}\s*[;:=]', snippet, re.MULTILINE):
            already_declared.add(prop)
        # Also check for private/protected/public declarations
        if re.search(rf'^\s+(?:private|protected|public|readonly)\s+{re.escape(prop)}\b', snippet, re.MULTILINE):
            already_declared.add(prop)
    return already_declared

def process_file(filepath):
    """Process a single file, adding property declarations."""
    with open(filepath, 'r') as f:
        content = f.read()
    
    classes = find_class_bodies(content)
    if not classes:
        return False
    
    # Process in reverse order so positions don't shift
    modified = False
    for cls in reversed(classes):
        props = extract_this_props(content, cls['body_start'], cls['body_end'])
        if not props:
            continue
        
        already = check_existing_declarations(content, cls['body_start'], props)
        new_props = [p for p in props if p not in already]
        
        if not new_props:
            continue
        
        # Build declaration block
        decl_lines = []
        for prop in new_props:
            decl_lines.append(f'  {prop}: any;')
        
        decl_block = '\n' + '\n'.join(decl_lines) + '\n'
        
        # Insert after opening {
        insert_pos = cls['insert_pos']
        content = content[:insert_pos] + decl_block + content[insert_pos:]
        modified = True
        print(f"  {cls['name']}: added {len(new_props)} declarations")
    
    if modified:
        with open(filepath, 'w') as f:
            f.write(content)
    
    return modified

def main():
    os.chdir('/Users/eleonor/italysat/swiss-army-knife-card')
    
    files_to_process = []
    for root, dirs, files in os.walk('src'):
        for f in sorted(files):
            filepath = os.path.join(root, f)
            if should_process(filepath):
                files_to_process.append(filepath)
    
    files_to_process.sort()
    
    total_modified = 0
    for filepath in files_to_process:
        print(f"Processing: {filepath}")
        if process_file(filepath):
            total_modified += 1
    
    print(f"\nDone! Modified {total_modified} files.")

if __name__ == '__main__':
    main()
