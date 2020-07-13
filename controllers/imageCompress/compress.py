from PIL import Image
import os, sys

def get_size (file):
	# get file size: KB
	size = os.path.getsize(file)
	return size / 1024

def get_outfile(infile, outfile):
    if outfile:
        return outfile
    dir, suffix = os.path.splitext(infile)
    print (dir, suffix)
    outfile = '{}-{}{}'.format(dir, sys.argv[6], suffix)
    return outfile

def compress_image(infile, mb, step, quality, outfile=''):
    o_size = get_size(infile)
    if o_size <= mb:
        return infile
    outfile = get_outfile(infile, outfile)
    while o_size > mb:
        im = Image.open(infile)
        im.save(outfile, quality=quality)
        if quality - step < 0:
            break
        quality -= step
        o_size = get_size(outfile)
        print (quality)
    return outfile, get_size(outfile)

def resize_image(infile, x_s, outfile=''):
    im = Image.open(infile)
    x, y = im.size
    y_s = int(y * x_s / x)
    out = im.resize((x_s, y_s), Image.ANTIALIAS)
    outfile = get_outfile(infile, outfile)
    out.save(outfile)

def main(infilepath, mb, step, quality, x_s):
    compress_image(infilepath, mb, step, quality)
    resize_image(infilepath, x_s)

if __name__ == '__main__':
    main(sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), int(sys.argv[4]), int(sys.argv[5]))