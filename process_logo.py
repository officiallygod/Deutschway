from PIL import Image, ImageMath, ImageFilter

def process_image(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    
    # 1. Crop out the bottom text. The image is 640x640.
    # The text is at the bottom, so cropping the top 500 pixels should be safe.
    img = img.crop((0, 0, 640, 500))
    
    # 2. Make background transparent. 
    # The background is an off-white color.
    # Let's create a mask by comparing pixels to the top-left pixel.
    bg_color = img.getpixel((10, 10))
    
    data = img.getdata()
    new_data = []
    
    # Tolerance for background
    tol = 30
    
    # Let's find the bounding box of the non-background pixels to crop it tightly
    min_x, min_y = 640, 500
    max_x, max_y = 0, 0
    
    width, height = img.size
    
    # We will use floodfill to create an exact mask
    from PIL import ImageDraw
    # Create a solid black image with white where the bg is
    mask = Image.new('L', img.size, 0)
    
    # Convert image to RGB for floodfill
    rgb_img = img.convert("RGB")
    
    # A simple thresholding approach works better for logos with drop shadow.
    # We'll make anything that is close to bg_color transparent, with some alpha blending
    for y in range(height):
        for x in range(width):
            pixel = data[y * width + x]
            # distance from bg color
            dist = sum(abs(pixel[i] - bg_color[i]) for i in range(3))
            
            if dist < tol:
                # Background
                new_data.append((pixel[0], pixel[1], pixel[2], 0))
            elif dist < tol + 20:
                # Soft edge
                alpha = int(255 * ((dist - tol) / 20.0))
                new_data.append((pixel[0], pixel[1], pixel[2], alpha))
                
                if x < min_x: min_x = x
                if x > max_x: max_x = x
                if y < min_y: min_y = y
                if y > max_y: max_y = y
            else:
                new_data.append((pixel[0], pixel[1], pixel[2], 255))
                
                if x < min_x: min_x = x
                if x > max_x: max_x = x
                if y < min_y: min_y = y
                if y > max_y: max_y = y
                
    img.putdata(new_data)
    
    # Crop to bounding box with 10px padding
    pad = 10
    crop_box = (
        max(0, min_x - pad),
        max(0, min_y - pad),
        min(width, max_x + pad),
        min(height, max_y + pad)
    )
    img = img.crop(crop_box)
    
    # Resize nicely to a standard high-res size, say 512x512
    max_dim = max(img.size)
    if max_dim < 512:
        # Pad to square
        sq_img = Image.new("RGBA", (max_dim, max_dim), (0,0,0,0))
        offset = ((max_dim - img.size[0]) // 2, (max_dim - img.size[1]) // 2)
        sq_img.paste(img, offset)
        sq_img = sq_img.resize((512, 512), Image.LANCZOS)
    else:
        # Pad to square
        sq_img = Image.new("RGBA", (max_dim, max_dim), (0,0,0,0))
        offset = ((max_dim - img.size[0]) // 2, (max_dim - img.size[1]) // 2)
        sq_img.paste(img, offset)

    sq_img.save(output_path, "PNG")
    print("Logo processed and saved to", output_path)

input_img = r"C:\Users\allen\.gemini\antigravity\brain\3fae9912-6242-4fef-8bb6-2b22794ee491\media__1781763398582.jpg"
process_image(input_img, "webapp/public/logo.png")
