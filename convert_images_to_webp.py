#!/usr/bin/env python3
"""
Image Conversion Script for Pink Pilates Set Landing Page
Converts all images to WebP format and creates responsive sizes with LQIP
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

# Image directories
DIRECTORIES = {
    'product': BASE_DIR / 'images' / 'product',
    'testimonials': BASE_DIR / 'images' / 'testimonials',
    'worn-by-favorites': BASE_DIR / 'images' / 'worn-by-favorites',
    'order-bump': BASE_DIR / 'images' / 'order-bump'
}

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

def process_image(input_path, output_dir, name_without_ext):
    """Process a single image: create WebP versions, responsive JPEGs, and LQIP"""
    results = {
        'original': str(input_path),
        'webp': {},
        'jpeg': {},
        'lqip': None,
        'dimensions': get_image_size_info(input_path)
    }

    # Create output directory if it doesn't exist
    output_dir.mkdir(parents=True, exist_ok=True)

    print(f"\nProcessing: {input_path.name}")

    # Create WebP versions
    for size in IMAGE_SIZES:
        webp_path = output_dir / f"{name_without_ext}-{size}.webp"
        if create_webp_with_cwebp(input_path, webp_path, width=size):
            results['webp'][size] = f"{name_without_ext}-{size}.webp"
            print(f"  ✓ WebP {size}px: {webp_path.name}")

    # Also create original size WebP
    webp_original = output_dir / f"{name_without_ext}.webp"
    if create_webp_with_cwebp(input_path, webp_original):
        results['webp']['original'] = f"{name_without_ext}.webp"
        print(f"  ✓ WebP original: {webp_original.name}")

    # Create responsive JPEG versions (fallback)
    for size in IMAGE_SIZES:
        jpeg_path = output_dir / f"{name_without_ext}-{size}.jpg"
        if create_responsive_jpeg(input_path, jpeg_path, width=size):
            results['jpeg'][size] = f"{name_without_ext}-{size}.jpg"
            print(f"  ✓ JPEG {size}px: {jpeg_path.name}")

    # Create LQIP
    lqip_path = output_dir / f"{name_without_ext}-lqip.jpg"
    if create_lqip(input_path, lqip_path):
        results['lqip'] = f"{name_without_ext}-lqip.jpg"
        print(f"  ✓ LQIP: {lqip_path.name}")

    return results

def process_directory(directory_path, output_base_dir, category):
    """Process all images in a directory"""
    if not directory_path.exists():
        print(f"Directory not found: {directory_path}")
        return {}

    results = {}
    output_dir = output_base_dir / category

    # Supported image formats
    extensions = ['*.jpg', '*.jpeg', '*.png', '*.JPG', '*.JPEG', '*.PNG']

    image_files = []
    for ext in extensions:
        image_files.extend(directory_path.glob(ext))

    if not image_files:
        print(f"No images found in {directory_path}")
        return results

    print(f"\n=== Processing {category.upper()} images ===")

    for image_path in image_files:
        # Skip already processed files (like -lqip, -size)
        if any(skip in image_path.name for skip in ['-lqip-', '-400.', '-600.', '-800.', '-1200.']):
            continue

        name_without_ext = image_path.stem
        if name_without_ext.endswith('-original'):
            name_without_ext = name_without_ext[:-9]  # Remove '-original' suffix

        result = process_image(image_path, output_dir, name_without_ext)
        results[image_path.name] = result

    return results

def generate_manifest(all_results):
    """Generate a manifest file with all image information"""
    manifest = {
        'generated_at': str(Path(__file__).stat().st_mtime),
        'image_sizes': IMAGE_SIZES,
        'webp_quality': WEBP_QUALITY,
        'categories': {}
    }

    for category, results in all_results.items():
        manifest['categories'][category] = {}
        for original_name, data in results.items():
            manifest['categories'][category][original_name] = data

    manifest_path = BASE_DIR / 'images' / 'manifest.json'
    with open(manifest_path, 'w') as f:
        json.dump(manifest, f, indent=2)

    print(f"\n✓ Generated manifest: {manifest_path}")

def main():
    print("=== Pink Pilates Set Image Conversion ===")
    print("Converting images to WebP and creating responsive sizes...\n")

    # Check if cwebp is available
    try:
        subprocess.run(['cwebp', '-version'], capture_output=True, check=True)
        print("✓ cwebp is available")
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("❌ cwebp not found. Please install WebP tools:")
        print("  brew install webp")
        sys.exit(1)

    # Check if PIL is available
    try:
        import PIL
        print(f"✓ PIL {PIL.__version__} is available")
    except ImportError:
        print("❌ PIL not found. Please install Pillow:")
        print("  pip install Pillow")
        sys.exit(1)

    all_results = {}

    # Process each directory
    for category, directory_path in DIRECTORIES.items():
        results = process_directory(directory_path, BASE_DIR / 'images', category)
        if results:
            all_results[category] = results

    # Generate manifest
    if all_results:
        generate_manifest(all_results)

        print(f"\n=== Conversion Complete ===")
        print(f"Total directories processed: {len(all_results)}")

        total_images = sum(len(results) for results in all_results.values())
        print(f"Total images processed: {total_images}")

        print(f"\nWebP and responsive images created in:")
        for category in all_results.keys():
            print(f"  - images/{category}/")

        print(f"\n✓ All images converted successfully!")
        print(f"✓ Ready for responsive picture element implementation")
    else:
        print("No images were processed.")

if __name__ == "__main__":
    main()