import { getCollection } from 'astro:content';
import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';
import { getAllPosts, getFluidPosts } from '@src/utils/blog';
import { getFluidPostPath } from '../utils/blog';

export async function GET(context) {
    const posts = await getAllPosts();
    const fluidPosts = await getFluidPosts();
    const site = context.site;

    return new Response(
        `<?xml version="1.0" encoding="utf-8"?>
        <feed xmlns="http://www.w3.org/2005/Atom">
            <id>${site}</id>
            <title>${SITE_TITLE}</title>
            <subtitle>${SITE_DESCRIPTION}</subtitle>
            <updated>${new Date().toISOString()}</updated>
            <link href="${site}" />
            <link href="${site}/atom.xml" rel="self"/>
            <author>
                <name>${SITE_TITLE}</name>
            </author>
            ${posts.map((post) => `
                <entry>
                    <id>${site}blog/${post.slug}/</id>
                    <title>${post.data.title}</title>
                    <link href="${site}blog/${post.slug}/"/>
                    <updated>${new Date(post.data.pubDate).toISOString()}</updated>
                    <content type="html"><![CDATA[${post.data.description || ''}]]></content>
                </entry>
            `).join('')}
            ${fluidPosts.map((post) => {
                const params = getFluidPostPath(post);
                const link = `${site}${params.year}/${params.month}/${params.day}/${params.title}/`;
                return `
                <entry>
                    <id>${link}</id>
                    <title>${post.data.title}</title>
                    <link href="${link}"/>
                    <updated>${new Date(post.data.date).toISOString()}</updated>
                    <content type="html"><![CDATA[${post.data.description || ''}]]></content>
                </entry>
                `;
            }).join('')}
        </feed>`,
        {
            headers: {
                'Content-Type': 'application/atom+xml; charset=utf-8',
            },
        }
    );
}