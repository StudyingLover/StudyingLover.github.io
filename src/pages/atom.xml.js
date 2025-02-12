import { getCollection } from 'astro:content';
import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';
import { getAllPosts } from '@src/utils';
import { getFluidPostPath } from '../utils';

export async function GET(context) {
    const posts = await getAllPosts();
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
            ${posts.map((post) => {
                const link = post.postType == "blog" 
                    ? `${site}blog/${post.slug}/`
                    : `${site}${getFluidPostPath(post).year}/${getFluidPostPath(post).month}/${getFluidPostPath(post).day}/${getFluidPostPath(post).title}`;
                return `
                <entry>
                    <id>${link}</id>
                    <title>${post.data.title}</title>
                    <link href="${link}"/>
                    <updated>${new Date(post.data.pubDate).toISOString()}</updated>
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