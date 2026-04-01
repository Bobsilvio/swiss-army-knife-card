#!/usr/bin/env python3
"""Generate TypeScript property declarations for all classes in src/."""
import re
import os

def extract_class_properties(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    class_pattern = re.compile(r'class\s+(\w+)')
    classes = []
    for m in class_pattern.finditer(content):
        classes.append((m.start(), m.group(1)))
    
    if not classes:
        return {}
    
    prop_pattern = re.compile(r'this\.(\w+)\s*[=\[]')
    read_pattern = re.compile(r'this\.(\w+)(?=[.\[,;)\s\+\-\*/<>!=&|?:])')
    
    result = {}
    for i, (class_start, class_name) in enumerate(classes):
        if i + 1 < len(classes):
            class_end = classes[i+1][0]
        else:
            class_end = len(content)
        
        class_content = content[class_start:class_end]
        props = set()
        for m in prop_pattern.finditer(class_content):
            prop = m.group(1)
            if prop not in ('prototype', 'constructor', 'length'):
                props.add(prop)
        for m in read_pattern.finditer(class_content):
            prop = m.group(1)
            if prop not in ('prototype', 'constructor', 'length'):
                props.add(prop)
        
        if props:
            result[class_name] = sorted(props)
    
    return result

src_dir = 'src'
files_to_check = []
for root, dirs, files in os.walk(src_dir):
    for f in files:
        if f.endswith('.ts'):
            files_to_check.append(os.path.join(root, f))

files_to_check.sort()

for filepath in files_to_check:
    props = extract_class_properties(filepath)
    if props:
        for class_name, properties in props.items():
            print(f"=== {filepath} :: {class_name} ({len(properties)} props) ===")
            for p in properties:
                print(f"  {p}")
