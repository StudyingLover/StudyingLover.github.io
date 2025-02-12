import { loadEnv } from 'vite';
import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

const { GITHUB_PERSONAL_ACCESS_TOKEN } = loadEnv(process.env.NODE_ENV || 'production', process.cwd(), '');
export type BlogPost = CollectionEntry<'blog'>;
export type FluidPost = CollectionEntry<'posts'>;
export const slugify = (input: string) => {
	if (!input) return '';

	// make lower case and trim
	var slug = input.toLowerCase().trim();

	// remove accents from charaters
	slug = slug.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

	// replace invalid chars with spaces
	slug = slug.replace(/[^a-z0-9\s-]/g, ' ').trim();

	// replace multiple spaces or hyphens with a single hyphen
	slug = slug.replace(/[\s-]+/g, '-');

	return slug;
};

export const unslugify = (slug: string) =>
	slug.replace(/\-/g, ' ').replace(/\w\S*/g, (text) => text.charAt(0).toUpperCase() + text.slice(1).toLowerCase());

export const kFormatter = (num: number) => {
	return Math.abs(num) > 999 ? (Math.sign(num) * (Math.abs(num) / 1000)).toFixed(1) + 'k' : Math.sign(num) * Math.abs(num);
};

export const getRepositoryDetails = async (repositoryFullname: string) => {
	const repoDetails = await fetch('https://api.github.com/repos/' + repositoryFullname, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${GITHUB_PERSONAL_ACCESS_TOKEN}`,
			'X-GitHub-Api-Version': '2022-11-28'
		}
	});
	const response = await repoDetails.json();
	return response;
};

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

export const getAllPosts = async () => {
	const blogs: BlogPost[] = await getCollection('blog');
	const fluid_posts = await getCollection('posts');

	// 为 blogs 添加标识
	const blogsWithType = blogs.map((post) => ({
		...post,
		postType: 'blog'
	}));

	// 将 fluid_posts 转成可以和 blogs 拼接在一起的格式，并添加标识
	const transformedFluidPosts = fluid_posts.map((post) => ({
		...post,
		data: {
			...post.data,
			title: post.data.title,
			description: post.data.description || '',
			pubDate: post.data.date,
			tags: post.data.tags || []
		},
		postType: 'fluid'
	}));

	// 合并数据，并根据不同数据来源生成 path 属性
	const allPosts = [...blogsWithType, ...transformedFluidPosts].sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
	// console.log(allPosts);
	return allPosts;
};
