import { defineCollection, z } from 'astro:content';

const postsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    coverImage: z.string().optional(),
  }),
});

const productsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    price: z.string().optional(),
    images: z.array(z.string()).default([]),
    category: z.string(),
    specs: z.record(z.string()).optional(),
    featured: z.boolean().default(false),
  }),
});

export const collections = {
  posts: postsCollection,
  products: productsCollection,
};
