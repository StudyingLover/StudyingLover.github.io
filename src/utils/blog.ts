import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

export type BlogPost = CollectionEntry<'blog'>;
export type FluidPost = CollectionEntry<'posts'>;

export const getFluidPostPath = (post: FluidPost) => {
	const filename = post.id.split('/').pop()?.replace(/\.md$/, '') || post.slug;

	const params = {
		year: new Date(post.data.date).getUTCFullYear().toString(),
		month: String(new Date(post.data.date).getUTCMonth() + 1).padStart(2, '0'),
		day: String(new Date(post.data.date).getUTCDate()).padStart(2, '0'),
		title: filename
	};
	return params;
};

export const getFluidPosts = async () => {
	const posts: FluidPost[] = (await getCollection('posts')).sort(
		(a, b) => new Date(b.data.date).valueOf() - new Date(a.data.date).valueOf()
	);
	return posts;
};

export const getAllPosts = async () => {
	const blogs: BlogPost[] = (await getCollection('blog')).sort(
		(a, b) => new Date(b.data.pubDate).valueOf() - new Date(a.data.pubDate).valueOf()
	);
	return blogs;
};
