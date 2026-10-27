import Image, { type StaticImageData } from "next/image";

/**
 * A picture in a post. Local pictures arrive imported (lib/mdx/remark-post
 * .mjs), so next/image knows their size; others render as they are.
 * `hero`, the post's first picture, loads straight away; the rest load as
 * they near the screen.
 */
export function PostImage({
  src,
  alt = "",
  hero,
}: {
  src: StaticImageData | string;
  alt?: string;
  hero?: boolean;
}) {
  if (typeof src === "string")
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} loading="lazy" className="post-image" />;
  return (
    <Image
      src={src}
      alt={alt}
      // The text column: 44rem on wide screens, the page width less its
      // margins on phones.
      sizes="(min-width: 48rem) 44rem, calc(100vw - 2.5rem)"
      loading={hero ? "eager" : "lazy"}
      fetchPriority={hero ? "high" : undefined}
      className="post-image"
    />
  );
}
