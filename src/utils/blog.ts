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

export const getAllTags = async () => {
	const blogPosts = await getCollection('blog');
	const fluidPosts = await getCollection('posts');

	const tagMap = new Map<string, { count: number, posts: Array<BlogPost | FluidPost> }>();

	// Process blog posts
	blogPosts.forEach(post => {
		const tags = post.data.tags || [];
		tags.forEach(tag => {
			if (!tagMap.has(tag)) {
				tagMap.set(tag, { count: 0, posts: [] });
			}
			const entry = tagMap.get(tag)!;
			entry.count++;
			entry.posts.push(post);
		});
	});

	// Process fluid posts
	fluidPosts.forEach(post => {
		const tags = post.data.tags || [];
		tags.forEach(tag => {
			if (!tagMap.has(tag)) {
				tagMap.set(tag, { count: 0, posts: [] });
			}
			const entry = tagMap.get(tag)!;
			entry.count++;
			entry.posts.push(post);
		});
	});

	// Convert to array and sort by count descending, then alphabetically
	const tagsArray = Array.from(tagMap.entries())
		.map(([tag, data]) => ({
			tag,
			count: data.count,
			posts: data.posts
		}))
		.sort((a, b) => {
			if (b.count !== a.count) {
				return b.count - a.count;
			}
			return a.tag.localeCompare(b.tag);
		});

	return tagsArray;
};

export const getPostsByTag = async (tag: string) => {
	const blogPosts = await getCollection('blog');
	const fluidPosts = await getCollection('posts');

	const allPosts: Array<BlogPost | FluidPost> = [...blogPosts, ...fluidPosts];

	const filteredPosts = allPosts.filter(post => {
		const tags = post.data.tags || [];
		return tags.includes(tag);
	});

	// Sort by date (newest first)
	filteredPosts.sort((a, b) => {
		const dateA = 'pubDate' in a.data ? a.data.pubDate : a.data.date;
		const dateB = 'pubDate' in b.data ? b.data.pubDate : b.data.date;
		return new Date(dateB).valueOf() - new Date(dateA).valueOf();
	});

	return filteredPosts;
};
