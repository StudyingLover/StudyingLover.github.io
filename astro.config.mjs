import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from "@astrojs/tailwind";
import { autoNewTabExternalLinks } from './src/autoNewTabExternalLinks';

import partytown from "@astrojs/partytown";
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.studyinglover.com',
  integrations: [mdx(), sitemap(), tailwind(), partytown()],
  markdown: {
    extendDefaultPlugins: true,
    rehypePlugins: [
      [autoNewTabExternalLinks, {
        domain: 'localhost:4321'
      }],
      rehypeKatex // 修改为单独的插件项
    ],
    remarkPlugins: [remarkMath],
  }
});