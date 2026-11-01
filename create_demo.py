import os
import shutil
import re

def build_demo():
    demo_dir = "demo"
    if os.path.exists(demo_dir):
        shutil.rmtree(demo_dir)
    
    os.makedirs(demo_dir, exist_ok=True)
    
    # Copy assets
    if os.path.exists("assets"):
        shutil.copytree("assets", os.path.join(demo_dir, "assets"))
        print("Assets folder copied successfully.")
    
    # Read HTML
    with open("index.html", "r", encoding="utf-8") as f:
        html_content = f.read()
        
    # Read CSS
    with open("css/styles.css", "r", encoding="utf-8") as f:
        css_content = f.read()
        
    # Fix relative asset paths in CSS because now it will be in index.html (root of demo)
    # url("../assets/...") -> url("assets/...")
    css_content = css_content.replace('url("../assets/', 'url("assets/')
    css_content = css_content.replace("url('../assets/", "url('assets/")
    
    # Read JS
    with open("js/main.js", "r", encoding="utf-8") as f:
        js_content = f.read()
        
    # Replace external css link with inlined style
    css_tag_pattern = r'<link\s+rel="stylesheet"\s+href="css/styles\.css[^"]*"\s*/?>'
    inlined_style = f"<style>\n{css_content}\n</style>"
    html_content = re.sub(css_tag_pattern, lambda m: inlined_style, html_content)
    
    # Replace external js script tag with inlined script
    js_tag_pattern = r'<script\s+src="js/main\.js"></script>'
    inlined_script = f"<script>\n{js_content}\n</script>"
    html_content = re.sub(js_tag_pattern, lambda m: inlined_script, html_content)
    
    # Write optimized demo index.html
    demo_index_path = os.path.join(demo_dir, "index.html")
    with open(demo_index_path, "w", encoding="utf-8") as f:
        f.write(html_content)
        
    print(f"Created {demo_index_path} with integrated CSS and JS.")

if __name__ == "__main__":
    build_demo()
