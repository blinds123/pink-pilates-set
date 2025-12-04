#!/usr/bin/env python3
from PIL import Image, ImageDraw, ImageFont
import os

# Create directory if it doesn't exist
os.makedirs('images/order-bump', exist_ok=True)

def create_adhesive_bra_image():
    """Create professional adhesive bra cups image"""
    bra = Image.new('RGB', (400, 400), color='#FFF5F7')
    draw = ImageDraw.Draw(bra)

    # Draw adhesive bra cups (petal/dome shape)
    # Left cup
    draw.ellipse([120, 140, 180, 220], fill='#F8C4D1', outline='#E8A4B8', width=2)
    # Right cup
    draw.ellipse([220, 140, 280, 220], fill='#F8C4D1', outline='#E8A4B8', width=2)

    # Adhesive edge indication
    draw.ellipse([125, 145, 175, 215], fill='#FFE4EC', outline='#E8A4B8', width=1)
    draw.ellipse([225, 145, 275, 215], fill='#FFE4EC', outline='#E8A4B8', width=1)

    # Center connection
    draw.rectangle([190, 170, 210, 180], fill='#F8C4D1', outline='#E8A4B8', width=1)

    # Load fonts
    try:
        title_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 28)
        desc_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 18)
        badge_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 14)
    except:
        title_font = ImageFont.load_default()
        desc_font = ImageFont.load_default()
        badge_font = ImageFont.load_default()

    # Add text
    draw.text((200, 260), "Adhesive Bra Cups", fill='#2C2C2C', anchor='mm', font=title_font)
    draw.text((200, 290), "Invisible Support", fill='#666666', anchor='mm', font=desc_font)

    # Add benefit badges
    draw.rectangle([50, 320, 150, 345], fill='#E8B4B8', outline='#D8A4A8')
    draw.text((100, 332), "No Straps", fill='white', anchor='mm', font=badge_font)

    draw.rectangle([160, 320, 260, 345], fill='#E8B4B8', outline='#D8A4A8')
    draw.text((210, 332), "Seamless", fill='white', anchor='mm', font=badge_font)

    draw.rectangle([270, 320, 350, 345], fill='#E8B4B8', outline='#D8A4A8')
    draw.text((310, 332), "Secure", fill='white', anchor='mm', font=badge_font)

    # Add header
    draw.rectangle([10, 10, 390, 35], fill='#E8B4B8')
    draw.text((200, 22), "👙 ESSENTIAL #1", fill='white', anchor='mm', font=title_font)

    bra.save('images/order-bump/adhesive-bra-cups.jpg', 'JPEG', quality=95)
    print("✅ Created adhesive-bra-cups.jpg")

def create_seamless_thong_image():
    """Create professional seamless thong underwear image"""
    thong = Image.new('RGB', (400, 400), color='#F8F8F8')
    draw = ImageDraw.Draw(thong)

    # Draw thong shape (simplified representation)
    # Waistband
    draw.rectangle([100, 180, 300, 195], fill='#F5F5F5', outline='#D0D0D0', width=2)
    # Front panel
    draw.ellipse([150, 185, 250, 240], fill='#F5F5F5', outline='#D0D0D0', width=2)
    # Back string (thin line)
    draw.rectangle([195, 241, 205, 280], fill='#F5F5F5', outline='#D0D0D0')

    # Seamless texture indication
    for i in range(5):
        y_pos = 200 + (i * 8)
        draw.ellipse([160 + i, y_pos, 180 + i, y_pos + 3], fill='#E8E8E8')
        draw.ellipse([220 + i, y_pos, 240 + i, y_pos + 3], fill='#E8E8E8')

    # Load fonts
    try:
        title_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 28)
        desc_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 18)
        badge_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 14)
    except:
        title_font = ImageFont.load_default()
        desc_font = ImageFont.load_default()
        badge_font = ImageFont.load_default()

    # Add text
    draw.text((200, 260), "Seamless Thong", fill='#2C2C2C', anchor='mm', font=title_font)
    draw.text((200, 290), "No Panty Lines", fill='#666666', anchor='mm', font=desc_font)

    # Add benefit badges
    draw.rectangle([50, 320, 150, 345], fill='#B8B8E8', outline='#A8A8D8')
    draw.text((100, 332), "Invisible", fill='white', anchor='mm', font=badge_font)

    draw.rectangle([160, 320, 260, 345], fill='#B8B8E8', outline='#A8A8D8')
    draw.text((210, 332), "Comfort", fill='white', anchor='mm', font=badge_font)

    draw.rectangle([270, 320, 350, 345], fill='#B8B8E8', outline='#A8A8D8')
    draw.text((310, 332), "Breathable", fill='white', anchor='mm', font=badge_font)

    # Add header
    draw.rectangle([10, 10, 390, 35], fill='#B8B8E8')
    draw.text((200, 22), "🩲 ESSENTIAL #2", fill='white', anchor='mm', font=title_font)

    thong.save('images/order-bump/seamless-thong.jpg', 'JPEG', quality=95)
    print("✅ Created seamless-thong.jpg")

def create_pilates_socks_image():
    """Create professional non-slip pilates socks image"""
    socks = Image.new('RGB', (400, 400), color='#F0F8FF')
    draw = ImageDraw.Draw(socks)

    # Draw sock shapes
    # Left sock
    draw.ellipse([100, 200, 160, 280], fill='#FFE4E1', outline='#FFB6C1', width=2)  # Foot part
    draw.rectangle([100, 180, 160, 200], fill='#FFE4E1', outline='#FFB6C1', width=2)  # Ankle part

    # Right sock
    draw.ellipse([240, 200, 300, 280], fill='#FFE4E1', outline='#FFB6C1', width=2)  # Foot part
    draw.rectangle([240, 180, 300, 200], fill='#FFE4E1', outline='#FFB6C1', width=2)  # Ankle part

    # Non-slip grips on bottom
    grip_positions = [
        (110, 240), (125, 235), (140, 235), (155, 240),  # Left sock grips
        (250, 240), (265, 235), (280, 235), (295, 240)   # Right sock grips
    ]

    for x, y in grip_positions:
        draw.ellipse([x-5, y-5, x+5, y+5], fill='#FF69B4', outline='#FF1493')

    # Toe separation indication
    draw.line([115, 210, 125, 210], fill='#FFB6C1', width=2)  # Left sock toes
    draw.line([255, 210, 265, 210], fill='#FFB6C1', width=2)  # Right sock toes

    # Load fonts
    try:
        title_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 28)
        desc_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 18)
        badge_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 14)
    except:
        title_font = ImageFont.load_default()
        desc_font = ImageFont.load_default()
        badge_font = ImageFont.load_default()

    # Add text
    draw.text((200, 260), "Non-Slip Pilates Socks", fill='#2C2C2C', anchor='mm', font=title_font)
    draw.text((200, 290), "Studio Essential", fill='#666666', anchor='mm', font=desc_font)

    # Add benefit badges
    draw.rectangle([40, 320, 120, 345], fill='#98FB98', outline='#7FDD7F')
    draw.text((80, 332), "Grip", fill='white', anchor='mm', font=badge_font)

    draw.rectangle([130, 320, 210, 345], fill='#98FB98', outline='#7FDD7F')
    draw.text((170, 332), "Hygienic", fill='white', anchor='mm', font=badge_font)

    draw.rectangle([220, 320, 300, 345], fill='#98FB98', outline='#7FDD7F')
    draw.text((260, 332), "Stable", fill='white', anchor='mm', font=badge_font)

    draw.rectangle([310, 320, 360, 345], fill='#98FB98', outline='#7FDD7F')
    draw.text((335, 332), "Safe", fill='white', anchor='mm', font=badge_font)

    # Add header
    draw.rectangle([10, 10, 390, 35], fill='#98FB98')
    draw.text((200, 22), "🧘 ESSENTIAL #3", fill='white', anchor='mm', font=title_font)

    socks.save('images/order-bump/pilates-socks.jpg', 'JPEG', quality=95)
    print("✅ Created pilates-socks.jpg")

def create_bundle_banner():
    """Create a bundle banner showing all 3 products"""
    banner = Image.new('RGB', (800, 200), color='white')
    draw = ImageDraw.Draw(banner)

    # Load fonts
    try:
        title_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 36)
        price_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 48)
        small_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 24)
    except:
        title_font = ImageFont.load_default()
        price_font = ImageFont.load_default()
        small_font = ImageFont.load_default()

    # Background gradient effect
    for i in range(200):
        color_val = 255 - (i * 20 // 100)
        if color_val < 235:
            color_val = 235
        draw.rectangle([0, i, 800, i+1], fill=(color_val, color_val, 255))

    # Main text
    draw.text((400, 40), "COMPLETE YOUR OUTFIT BUNDLE", fill='#2C2C2C', anchor='mm', font=title_font)
    draw.text((400, 90), "3 Essential Items - Only $10", fill='#28a745', anchor='mm', font=price_font)
    draw.text((400, 130), "$95+ Value - Save 90%", fill='#666666', anchor='mm', font=small_font)

    # Save 90% badge
    draw.rectangle([650, 60, 750, 110], fill='#FF4444', outline='#CC0000')
    draw.text((700, 85), "SAVE\n90%", fill='white', anchor='mm', font=title_font)

    banner.save('images/order-bump/bundle-banner.jpg', 'JPEG', quality=95)
    print("✅ Created bundle-banner.jpg")

# Generate all images
print("🎨 Generating 3-Product Bundle Images...")
print()

create_adhesive_bra_image()
print()
create_seamless_thong_image()
print()
create_pilates_socks_image()
print()
create_bundle_banner()

print()
print("📁 All images saved to: images/order-bump/")
print("   - adhesive-bra-cups.jpg (Essential #1)")
print("   - seamless-thong.jpg (Essential #2)")
print("   - pilates-socks.jpg (Essential #3)")
print("   - bundle-banner.jpg (Complete bundle banner)")
print()
print("🎯 Steve Larsen Value Stack Bundle Complete!")
print("   Each item solves a specific customer problem")