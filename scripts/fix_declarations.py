#!/usr/bin/env python3
"""
Clean up incorrectly added property declarations and replace them with
[key: string]: any; index signature for each class.
"""
import re
import os

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
    'src/types/modules.d.ts',
}

def should_process(filepath):
    for skip_dir in SKIP_DIRS:
        if filepath.startswith(skip_dir + '/') or filepath.startswith(skip_dir + os.sep):
            return False
    if filepath in SKIP_FILES:
        return False
    return filepath.endswith('.ts')

def process_file(filepath):
    with open(filepath, 'r') as f:
        lines = f.readlines()
    
    modified = False
    new_lines = []
    i = 0
    inside_added_block = False
    
    while i < len(lines):
        line = lines[i]
        
        # Detect class opening: "class Name ... {" or "export default class Name ... {"  
        class_match = re.match(r'^(export\s+default\s+)?class\s+\w+.*\{\s*$', line.strip())
        
        if class_match and line.strip().endswith('{'):
            new_lines.append(line)
            i += 1
            
            # Skip any previously added "  prop: any;" declarations
            # (they appear as consecutive lines of "  word: any;")
            removed_count = 0
            has_index_sig = False
            while i < len(lines):
                stripped = lines[i].strip()
                if re.match(r'^[a-zA-Z_]\w*:\s*any;$', stripped):
                    # This is an added declaration - skip it
                    removed_count += 1
                    i += 1
                    modified = True
                elif stripped == '[key: string]: any;':
                    # Already has index signature
                    has_index_sig = True
                    new_lines.append(lines[i])
                    i += 1
                    break
                elif stripped == '':
                    # Empty line between declarations - might be part of the block
                    # Check if next line is also a declaration
                    if i + 1 < len(lines) and re.match(r'^\s+[a-zA-Z_]\w*:\s*any;\s*$', lines[i+1]):
                        i += 1  # skip empty line in block
                        modified = True
                    else:
                        break
                else:
                    break
            
            # Add index signature if not already present
            if not has_index_sig:
                # Determine indentation from next code line
                indent = '  '
                if i < len(lines):
                    next_line = lines[i]
                    indent_match = re.match(r'^(\s+)', next_line)
                    if indent_match:
                        indent = indent_match.group(1)
                
                new_lines.append(f'{indent}[key: string]: any;\n')
                if removed_count > 0:
                    new_lines.append('\n')
                modified = True
                
                if removed_count > 0:
                    print(f"  Removed {removed_count} declarations, added index signature")
                else:
                    print(f"  Added index signature")
        else:
            new_lines.append(line)
            i += 1
    
    if modified:
        with open(filepath, 'w') as f:
            f.writelines(new_lines)
    
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
