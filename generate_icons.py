import zlib
import struct
import math

def create_png(width, height, render_func, output_path):
    raw_data = bytearray()
    for y in range(height):
        raw_data.append(0)  # filter type 0 (None)
        for x in range(width):
            r, g, b, a = render_func(x, y, width, height)
            raw_data.extend([r, g, b, a])
            
    compressed = zlib.compress(bytes(raw_data), level=9)
    
    png = bytearray()
    png.extend(b'\x89PNG\r\n\x1a\n')
    
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    ihdr_crc = zlib.crc32(b'IHDR' + ihdr_data)
    png.extend(struct.pack('>I', 13) + b'IHDR' + ihdr_data + struct.pack('>I', ihdr_crc))
    
    idat_len = len(compressed)
    idat_crc = zlib.crc32(b'IDAT' + compressed)
    png.extend(struct.pack('>I', idat_len) + b'IDAT' + compressed + struct.pack('>I', idat_crc))
    
    iend_crc = zlib.crc32(b'IEND')
    png.extend(struct.pack('>I', 0) + b'IEND' + struct.pack('>I', iend_crc))
    
    with open(output_path, 'wb') as f:
        f.write(png)
    print(f"Generated {output_path}")

def render_vibrant_flame(x, y, w, h):
    # Normalized coords 0 to 1
    nx = x / w
    ny = y / h

    # Flame coordinates:
    # Tip at (0.5, 0.08), Base at (0.5, 0.88)
    fy = (ny - 0.08) / 0.80 # 0.0 at tip, 1.0 at base
    fx = (nx - 0.5)

    if 0.0 <= fy <= 1.0:
        # Beautiful tear-drop flame profile
        # Width expands downwards with a rounded base
        profile = math.sin(fy * math.pi * 0.75) * (fy ** 0.45) * 0.32
        
        dist_x = abs(fx)

        # Inside main flame
        if dist_x <= profile:
            rel_x = dist_x / max(1e-5, profile) # 0 (center) to 1 (outer edge)

            # White hot heart
            if rel_x < 0.25 and 0.35 <= fy <= 0.82:
                core_val = 1.0 - (rel_x / 0.25)
                return 255, 255, int(200 + 55 * core_val), 255

            # Inner bright yellow
            if rel_x < 0.55 and 0.20 <= fy <= 0.90:
                return 254, int(240 - rel_x * 60), int(130 - rel_x * 100), 255

            # Blue base at bottom center
            if fy > 0.88 and rel_x < 0.65:
                return 2, 132, 199, 255

            # Mid / Outer flame (Vibrant amber-orange to reddish edge)
            r = int(245 - rel_x * 20)
            g = int(140 * (1.0 - rel_x * 0.6))
            b = int(11 * (1.0 - rel_x))
            return r, g, b, 255

    # Ambient candlelight glow around flame
    dist_flame = math.sqrt((nx - 0.5)**2 + ((ny - 0.55) / 1.1)**2)
    if dist_flame < 0.48:
        glow = (1.0 - dist_flame / 0.48) ** 2.0
        r = int(245 * glow * 0.4)
        g = int(140 * glow * 0.2)
        b = int(11 * glow * 0.03)
        return r, g, b, 255

    # Pure OLED Black background
    return 0, 0, 0, 255

# Generate 192 and 512 PNGs
create_png(192, 192, render_vibrant_flame, "public/icons/icon-192.png")
create_png(512, 512, render_vibrant_flame, "public/icons/icon-512.png")

# Generate multi-resolution ICO (16x16 and 32x32) for crisp browser favicon display
def create_ico(sizes, output_path):
    images_data = []
    headers = []
    offset = 6 + len(sizes) * 16

    for sz in sizes:
        raw_bmp = bytearray()
        for y in range(sz):
            by = (sz - 1) - y # bottom up
            for x in range(sz):
                r, g, b, a = render_vibrant_flame(x, by, sz, sz)
                raw_bmp.extend([b, g, r, a])
        
        bih = struct.pack('<IIIHHIIIIII', 40, sz, sz * 2, 1, 32, 0, len(raw_bmp), 0, 0, 0, 0)
        img_bytes = bih + raw_bmp
        images_data.append(img_bytes)

        # Dir entry
        entry = struct.pack('<BBBBHHII', sz, sz, 0, 0, 1, 32, len(img_bytes), offset)
        headers.append(entry)
        offset += len(img_bytes)

    ico_header = struct.pack('<HHH', 0, 1, len(sizes))
    with open(output_path, 'wb') as f:
        f.write(ico_header)
        for h in headers:
            f.write(h)
        for d in images_data:
            f.write(d)
    print(f"Generated multi-res {output_path} with sizes {sizes}")

create_ico([16, 32, 48], "public/favicon.ico")
