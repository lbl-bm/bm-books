import { defineCollection, z, type CollectionConfig } from 'astro:content'

type PostFrontmatter = {
  title: string
  published: Date
  updated?: Date
  draft: boolean
  description: string
  image: string
  tags: string[]
  category: string
  lang: string
  prevTitle: string
  prevSlug: string
  nextTitle: string
  nextSlug: string
}

const postSchema: z.ZodType<PostFrontmatter, z.ZodTypeDef, unknown> = z.object({
    title: z.string(),
    published: z.date(),
    updated: z.date().optional(),
    draft: z.boolean().optional().default(true),
    description: z.string().optional().default(''),
    image: z.string().optional().default(''),
    tags: z.array(z.string()).optional().default([]),
    category: z.string().optional().default(''),
    lang: z.string().optional().default(''),

    /* For internal use */
    prevTitle: z.string().default(''),
    prevSlug: z.string().default(''),
    nextTitle: z.string().default(''),
    nextSlug: z.string().default(''),
  })

export const collections: { posts: CollectionConfig<typeof postSchema> } = {
  posts: defineCollection({ type: 'content', schema: postSchema }),
}
