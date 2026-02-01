import os
import re

# Configuration
TARGET_DIRS = ["src", "api"]
EXTENSIONS = {".js", ".ts", ".tsx", ".jsx"}
MAX_LINE_LENGTH = 150

def is_comment_block(lines):
    return len(lines) > 1

def merge_comment_block(lines):
    # Extract text content from lines
    content = []
    indent = ""
    
    for i, line in enumerate(lines):
        match = re.match(r"(\s*)//\s?(.*)", line)
        if match:
            if i == 0:
                indent = match.group(1)
            content.append(match.group(2).strip())
    
    merged_text = " ".join(content)
    
    # Heuristic: If it looks like code (lots of symbols), don't merge
    if re.search(r"[;{}=()\[\]]", merged_text) and not re.search(r"\b(function|const|let|var|if|for|while)\b", merged_text):
        # Allow simple code mentions, but avoid complex code blocks
        # Actually, let's just merge if it fits length.
        pass

    new_line = f"{indent}// {merged_text}"
    
    if len(new_line) <= MAX_LINE_LENGTH:
        return [new_line + "\n"]
    else:
        return lines # Keep original if too long

def process_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        original_lines = f.readlines()
    
    new_lines = []
    comment_buffer = []
    
    for line in original_lines:
        # Check if line is a single-line comment (ignore inline comments for now logic)
        # We only care about lines that START with optional whitespace + //
        if re.match(r"^\s*//", line):
            comment_buffer.append(line)
        else:
            # End of a comment block
            if comment_buffer:
                if len(comment_buffer) > 1:
                    new_lines.extend(merge_comment_block(comment_buffer))
                else:
                    new_lines.extend(comment_buffer)
                comment_buffer = []
            
            new_lines.append(line)
    
    # Flush remaining buffer
    if comment_buffer:
        if len(comment_buffer) > 1:
            new_lines.extend(merge_comment_block(comment_buffer))
        else:
            new_lines.extend(comment_buffer)

    # Write back if changed
    if new_lines != original_lines:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
        print(f"Cleaned: {file_path}")

def main():
    print("Starting comment cleanup...")
    cwd = os.getcwd()
    
    for target_dir in TARGET_DIRS:
        dir_path = os.path.join(cwd, target_dir)
        if not os.path.exists(dir_path):
            continue
            
        for root, _, files in os.walk(dir_path):
            for file in files:
                ext = os.path.splitext(file)[1]
                if ext in EXTENSIONS:
                    process_file(os.path.join(root, file))
    
    print("Cleanup complete.")

if __name__ == "__main__":
    main()
