#!/usr/bin/env python3
"""
Phase 3: Fix {} and unknown type errors by adding type assertions.
Parse tsc output and fix the specific patterns.
"""
import re
import os
import subprocess

def get_tsc_errors():
    """Run tsc and get all errors."""
    result = subprocess.run(
        ['npx', 'tsc', '--noEmit'],
        capture_output=True, text=True, cwd='/Users/eleonor/italysat/swiss-army-knife-card'
    )
    return result.stdout + result.stderr

def parse_errors(output):
    """Parse tsc output into structured errors."""
    errors = []
    for line in output.split('\n'):
        m = re.match(r'(.+?)\((\d+),(\d+)\): error (TS\d+): (.+)', line.strip())
        if m:
            errors.append({
                'file': m.group(1),
                'line': int(m.group(2)),
                'col': int(m.group(3)),
                'code': m.group(4),
                'msg': m.group(5),
            })
    return errors

def fix_empty_object_errors(errors):
    """Fix TS2339 errors on type '{}' by finding the variable declaration and adding type assertion."""
    # Group errors by file
    file_errors = {}
    for err in errors:
        if err['code'] == 'TS2339' and "type '{}'" in err['msg']:
            file_errors.setdefault(err['file'], []).append(err)
    
    for filepath, errs in file_errors.items():
        full_path = os.path.join('/Users/eleonor/italysat/swiss-army-knife-card', filepath)
        if not os.path.exists(full_path):
            continue
        with open(full_path, 'r') as f:
            lines = f.readlines()
        
        # Find all property names that are accessed on {} types
        props_by_line = {}
        for err in errs:
            prop_match = re.search(r"Property '(\w+)' does not exist on type '\{\}'", err['msg'])
            if prop_match:
                props_by_line.setdefault(err['line'], []).append(prop_match.group(1))
        
        # For each error line, trace back to find the variable assignment = {}
        # and change it to = {} as Record<string, any>
        modified = False
        fixes_applied = set()
        
        for err_line, props in props_by_line.items():
            # Look at the error line and surrounding context to find the variable name
            if err_line - 1 >= len(lines):
                continue
            error_src = lines[err_line - 1]
            
            # Extract variable names that are accessed: varName.prop
            for prop in props:
                var_match = re.search(rf'(\w+)\.{re.escape(prop)}', error_src)
                if not var_match:
                    continue
                var_name = var_match.group(1)
                if var_name in ('this', 'self', 'window', 'document', 'console'):
                    continue
                
                # Search backwards for the declaration: let/const/var varName = {} or varName = {}
                for i in range(err_line - 2, max(err_line - 50, -1), -1):
                    if i < 0 or i >= len(lines):
                        continue
                    decl_line = lines[i]
                    
                    # Pattern: varName = {};  or  varName = { };
                    decl_match = re.search(rf'({re.escape(var_name)}\s*=\s*)\{{\s*\}}', decl_line)
                    if decl_match and i not in fixes_applied:
                        old = decl_match.group(0)
                        new = decl_match.group(1) + '{} as Record<string, any>'
                        lines[i] = decl_line.replace(old, new, 1)
                        fixes_applied.add(i)
                        modified = True
                        print(f"  {filepath}:{i+1}: {var_name} = {{}} -> {{}} as Record<string, any>")
                        break
        
        if modified:
            with open(full_path, 'w') as f:
                f.writelines(lines)

def fix_unknown_errors(errors):
    """Fix TS2339 errors on type 'unknown' by adding 'as any' type assertions."""
    file_errors = {}
    for err in errors:
        if err['code'] == 'TS2339' and "type 'unknown'" in err['msg']:
            file_errors.setdefault(err['file'], []).append(err)
    
    for filepath, errs in file_errors.items():
        full_path = os.path.join('/Users/eleonor/italysat/swiss-army-knife-card', filepath)
        if not os.path.exists(full_path):
            continue
        with open(full_path, 'r') as f:
            lines = f.readlines()
        
        modified = False
        fixed_lines = set()
        
        for err in errs:
            line_idx = err['line'] - 1
            if line_idx >= len(lines) or line_idx in fixed_lines:
                continue
            
            prop_match = re.search(r"Property '(\w+)' does not exist on type 'unknown'", err['msg'])
            if not prop_match:
                continue
            prop = prop_match.group(1)
            
            src_line = lines[line_idx]
            # Find variable.prop pattern and add (variable as any).prop
            pattern = re.compile(rf'(\w+)\.{re.escape(prop)}')
            matches = list(pattern.finditer(src_line))
            if not matches:
                continue
            
            # Replace from right to left to preserve positions
            new_line = src_line
            for m in reversed(matches):
                var_name = m.group(1)
                if var_name in ('this', 'self', 'window', 'document'):
                    continue
                old_text = f'{var_name}.{prop}'
                new_text = f'({var_name} as any).{prop}'
                # Only replace this specific occurrence
                start = m.start()
                end = m.end()
                new_line = new_line[:start] + new_text + new_line[end:]
            
            if new_line != src_line:
                lines[line_idx] = new_line
                fixed_lines.add(line_idx)
                modified = True
                print(f"  {filepath}:{err['line']}: added (as any) for .{prop}")
        
        if modified:
            with open(full_path, 'w') as f:
                f.writelines(lines)

def main():
    os.chdir('/Users/eleonor/italysat/swiss-army-knife-card')
    
    print("Running tsc to get errors...")
    output = get_tsc_errors()
    errors = parse_errors(output)
    print(f"Found {len(errors)} errors total")
    
    print("\nFixing {} type errors...")
    fix_empty_object_errors(errors)
    
    print("\nFixing unknown type errors...")
    fix_unknown_errors(errors)
    
    print("\nDone!")

if __name__ == '__main__':
    main()
