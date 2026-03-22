import sharp from 'sharp';

/**
 * Difference matting: extract alpha by comparing an image rendered on
 * pure white vs pure black backgrounds.
 *
 * For each pixel the colour distance between the two renders tells us
 * how much background bled through — i.e. how transparent that pixel is.
 */
export async function extractAlpha(whitePath, blackPath, outputPath) {
  const { data: dataWhite, info } = await sharp(whitePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data: dataBlack } = await sharp(blackPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  if (dataWhite.length !== dataBlack.length) {
    throw new Error('Dimension mismatch: white and black images must be identical size');
  }

  const bgDist = Math.sqrt(3 * 255 * 255); // ~441.67
  const out = Buffer.alloc(dataWhite.length);

  for (let i = 0; i < info.width * info.height; i++) {
    const o = i * 4;
    const rW = dataWhite[o],   gW = dataWhite[o + 1], bW = dataWhite[o + 2];
    const rB = dataBlack[o],   gB = dataBlack[o + 1], bB = dataBlack[o + 2];

    const pixelDist = Math.sqrt((rW - rB) ** 2 + (gW - gB) ** 2 + (bW - bB) ** 2);
    let alpha = Math.max(0, Math.min(1, 1 - pixelDist / bgDist));

    if (alpha > 0.01) {
      out[o]     = Math.round(Math.min(255, rB / alpha));
      out[o + 1] = Math.round(Math.min(255, gB / alpha));
      out[o + 2] = Math.round(Math.min(255, bB / alpha));
      out[o + 3] = Math.round(alpha * 255);
    }
    // Sub-threshold pixels: fully transparent (RGBA stays 0,0,0,0 from Buffer.alloc)
  }

  await sharp(out, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toFile(outputPath);
}
