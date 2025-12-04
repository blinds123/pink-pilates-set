#!/usr/bin/env python3
"""
Process existing WebP files and create responsive sizes
"""

import os
import subprocess
import sys
from pathlib import Path
from PIL import Image, ImageFilter
import json

# Configuration
IMAGE_SIZES = [400, 600, 800, 1200]
WEBP_QUALITY = 85
LQIP_SIZE = 20
BASE_DIR = Path(__file__).parent

def run_command(cmd):
    """Run a command and return output"""
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, check=True)
        return result.stdout.strip(), result.stderr.strip()
    except subprocess.CalledProcessError as e:
        print(f"Error running command: {cmd}")
        print(f"Error: {e.stderr}")
        return None, e.stderr

def create_webp_with_cwebp(input_path, output_path, width=None, quality=WEBP_QUALITY):
    """Convert image to WebP using cwebp for better compression"""
    cmd = f'cwebp -q {quality}'
    if width:
        cmd += f' -resize {width} 0'
    cmd += f' "{input_path}" -o "{output_path}"'

    stdout, stderr = run_command(cmd)
    if stderr:
        print(f"Warning: {stderr}")
    return os.path.exists(output_path)

def create_responsive_jpeg(input_path, output_path, width=None, quality=85):
    """Create responsive JPEG using macOS sips"""
    cmd = f'sips -Z {width if width else 1200} "{input_path}" -s format jpeg -s formatOptions {quality} --out "{output_path}"'
    stdout, stderr = run_command(cmd)
    if stderr and "Error" not in stderr:
        print(f"Warning: {stderr}")
    return os.path.exists(output_path)

def create_lqip(input_path, output_path):
    """Create low quality image placeholder"""
    try:
        with Image.open(input_path) as img:
            # Convert to RGB if necessary
            if img.mode in ('RGBA', 'LA', 'P'):
                img = img.convert('RGB')

            # Resize to very small
            img_resized = img.resize((LQIP_SIZE, LQIP_SIZE), Image.Resampling.LANCZOS)

            # Apply heavy blur for smooth placeholder
            img_blurred = img_resized.filter(ImageFilter.GaussianBlur(radius=2))

            # Save as low quality JPEG
            img_blurred.save(output_path, 'JPEG', quality=30, optimize=True)
            return True
    except Exception as e:
        print(f"Error creating LQIP for {input_path}: {e}")
        return False

def get_image_size_info(input_path):
    """Get original image dimensions"""
    try:
        with Image.open(input_path) as img:
            return img.width, img.height
    except Exception as e:
        print(f"Error getting image size for {input_path}: {e}")
        return None, None

def process_existing_webp(webp_path, output_dir, name_without_ext):
    """Process existing WebP file: create responsive sizes and LQIP"""
    results = {
        'original': str(webp_path),
        'webp': {},
        'jpeg': {},
        'lqip': None,
        'dimensions': get_image_size_info(webp_path)
    }

    # Create output directory if it doesn't exist
    output_dir.mkdir(parents=True, exist_ok=True)

    print(f"\nProcessing existing WebP: {webp_path.name}")

    # Create WebP responsive sizes
    for size in IMAGE_SIZES:
        webp_resized = output_dir / f"{name_without_ext}-{size}.webp"
        if create_webp_with_cwebp(webp_path, webp_resized, width=size):
            results['webp'][size] = f"{name_without_ext}-{size}.webp"
            print(f"  ✓ WebP {size}px: {webp_resized.name}")

    # Copy original WebP
    original_webp = output_dir / f"{name_without_ext}.webp"
    if not original_webp.exists():
        import shutil
        shutil.copy2(webp_path, original_webp)
        results['webp']['original'] = f"{name_without_ext}.webp"
        print(f"  ✓ WebP original: {original_webp.name}")

    # Create JPEG fallback versions
    for size in IMAGE_SIZES:
        jpeg_path = output_dir / f"{name_without_ext}-{size}.jpg"
        if create_responsive_jpeg(webp_path, jpeg_path, width=size):
            results['jpeg'][size] = f"{name_without_ext}-{size}.jpg"
            print(f"  ✓ JPEG {size}px: {jpeg_path.name}")

    # Create LQIP
    lqip_path = output_dir / f"{name_without_ext}-lqip.jpg"
    if create_lqip(webp_path, lqip_path):
        results['lqip'] = f"{name_without_ext}-lqip.jpg"
        print(f"  ✓ LQIP: {lqip_path.name}")

    return results

def main():
    print("=== Processing Existing WebP Files ===")

    # Process worn-by-favorites directory
    worn_by_dir = BASE_DIR / 'images' / 'worn-by-favorites'
    if not worn_by_dir.exists():
        print("worn-by-favorites directory not found")
        return

    # Find all WebP files
    webp_files = list(worn_by_dir.glob('*.webp'))
    if not webp_files:
        print("No WebP files found in worn-by-favorites")
        return

    print(f"Found {len(webp_files)} WebP files to process")

    all_results = {'worn-by-favorites': {}}
    output_dir = BASE_DIR / 'images' / 'worn-by-favorites'

    for webp_path in webp_files:
        name_without_ext = webp_path.stem
        result = process_existing_webp(webp_path, output_dir, name_without_ext)
        all_results['worn-by-favorites'][webp_path.name] = result

    # Load existing manifest and update it
    manifest_path = BASE_DIR / 'images' / 'manifest.json'
    if manifest_path.exists():
        with open(manifest_path, 'r') as f:
            manifest = json.load(f)
    else:
        manifest = {'categories': {}}

    # Update manifest with new data
    if 'worn-by-favorites' not in manifest['categories']:
        manifest['categories']['worn-by-favorites'] = {}

    manifest['categories']['worn-by-favorites'].update(all_results['worn-by-favorites'])

    # Save updated manifest
    with open(manifest_path, 'w') as f:
        json.dump(manifest, f, indent=2)

    print(f"\n✓ Updated manifest: {manifest_path}")
    print("✓ All existing WebP files processed successfully!")

if __name__ == "__main__":
    main()