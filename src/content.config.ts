import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const postsCollection = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/posts" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      tags: z.array(z.string()).default([]),
      coverImage: image().optional(),
    }),
});

const productsCollection = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/products" }),
  schema: ({ image }) =>
    z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      price: z.string().optional(),
      images: z.array(image()).default([]),
      category: z.string(),
      specs: z.record(z.string()).optional(),
      featured: z.boolean().default(false),
    }),
});

export const collections = {
  posts: postsCollection,
  products: productsCollection,
};
