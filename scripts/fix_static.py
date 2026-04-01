#!/usr/bin/env python3
"""
Phase 2 fix: Add static index signatures to all classes with static property access.
Also identify files that need {} fixes.
"""
import re
import os

SKIP_DIRS = {
    'src/animations', 'src/components', 'src/config', 'src/integrations',
    'src/layout', 'src/performance', 'src/services', 'src/theme',
    'src/tools/base', 'src/tools/charts', 'src/tools/entity',
    'src/tools/interactive', 'src/tools/shapes', 'src/tools/text',
    'src/toolsets', 'src/types', 'src/utils',
}

SKIP_FILES = {'src/tools/ToolRegistry.ts', 'src/types/modules.d.ts'}

def should_process(filepath):
    for skip_dir in SKIP_DIRS:
        if filepath.startswith(skip_dir + '/'):
            return False
    return filepath not in SKIP_FILES and filepath.endswith('.ts')

def add_static_index_sig(filepath):
    """Add static [key: string]: any; to classes that need it."""
    with open(filepath, 'r') as f:
        content = f.read()
    
    modified = False
    # Find class declarations
    pattern = re.compile(r'((?:export\s+(?:default\s+)?)?class\s+\w+[^{]*\{)')
    
    offset = 0
    for m in pattern.finditer(content):
        pos = m.end() + offset
        # Check if next line already has static index sig
        next_chunk = content[pos:pos+200]
        if 'static [key: string]: any;' in next_chunk:
            continue
        # Check if this class uses static properties (ClassName.xxx pattern)
        class_name = re.search(r'class\s+(\w+)', m.group(1)).group(1)
        # Search for ClassName.property patterns
        if re.search(rf'{class_name}\.\w+', content):
            insert = '\n  static [key: string]: any;\n'
            content = content[:pos] + insert + content[pos:]
            offset += len(insert)
            modified = True
            print(f"  Added static index sig to {class_name}")
    
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
    
    total = 0
    for fp in files_to_process:
        if add_static_index_sig(fp):
            total += 1
    
    print(f"\nDone! Modified {total} files with static index signatures.")

if __name__ == '__main__':
    main()
