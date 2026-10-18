import type { ImageMetadata } from 'astro';

/**
 * 在候选宽度里挑出不超过原图的几档，避免 astro:assets 把原图放大后再压缩。
 */
export function imageWidths(image: ImageMetadata, candidates: number[]): number[] {
  const widths = candidates.filter((width) => width <= image.width);
  return widths.length > 0 ? widths : [image.width];
}
