import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';
import { getAllPosts, getFluidPosts, getFluidPostPath } from '@src/utils/blog';

export async function GET(context) {
	const posts = await getAllPosts();
	const fluidPosts = await getFluidPosts();
	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		customData: `<follow_challenge>
			<feedId>112445349335683072</feedId>
			<userId>55935249401467904</userId>
		</follow_challenge>`,
		items: [
			...posts.map((post) => ({
				...post.data,
				link: `/blog/${post.slug}/`,
			})),
			...fluidPosts.map((post) => {
				const params = getFluidPostPath(post);
				return {
					...post.data,
					link: `/${params.year}/${params.month}/${params.day}/${params.title}/`,
				};
			})
		],
	});
}
