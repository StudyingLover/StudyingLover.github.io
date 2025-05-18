export interface Friend {
	name: string; // 友链名称
	avatar: string; // 头像链接
	description: string; // 描述
	link: string; // 友链链接
	github?: string; // GitHub 链接（可选）
	tags?: string[]; // 标签（可选）
}

export const friends: Friend[] = [
	{
		name: "Pluto's Blog",
		avatar: 'https://avatars.githubusercontent.com/u/86001674',
		description: '记录我的生活，分享一些经历与心得。',
		link: 'https://blog.aoaostar.com'
	},
	{
		name: '瑞奇',
		avatar: 'https://proxy.thisis.plus/pearl.jpg',
		description: '一个心怀浪漫的少年',
		link: 'https://rich-blog.cn'
	},
	{
		name: '佳欢的博客',
		avatar: 'https://wsrv.nl/?url=github.com/JiaHuann.png%3fsize=92 1x, https://wsrv.nl/?url=github.com/JiaHuann.png%3fsize=92 2x',
		description: "Jiahuan's blog",
		link: 'https://www.jiahuan.top'
	},
	{
		name: '纸鹿摸鱼处',
		avatar: 'https://cravatar.cn/avatar/13aa912754e6bb5e671f3e6654e4712d?s=640',
		description: '纸鹿至麓不知路，支炉制露不止漉',
		link: 'https://blog.zhilu.cyou'
	},
	{
		name: 'MisakaNo の 小破站',
		avatar: 'https://imgs.misaka.cloudns.biz/20230115115530.png',
		description: '这只是一个小破站而已！',
		link: 'https://www.misaka.rest/'
	},
	{
		name: 'Katelya',
		avatar: 'https://katelya.link/favicon.ico',
		description: '一名平平无奇的网络打工人，这是我在网络上留下过痕迹的一个证明，为别人更为了自己。',
		link: 'https://katelya.link/'
	},
	{
		name: "G.B.S.A.T.'s Official Blog",
		avatar: 'https://www.gbsat.org/logo.png',
		description: 'G.B.S.A.T. 的官方公开博客，我们将在此发布很多有用资讯或教程，亦或是分享实用的软件资源，欢迎关注我们！',
		link: 'https://blog.gbsat.org/'
	},
	{
		name: 'LINUX DO',
		avatar: 'https://cdn.studyinglover.com/pic/2024/11/861d4697655464863db52b25ea34d91b.png',
		description: '新的理想型社区',
		link: 'https://linux.do/?source=studyinglover_com'
	},
	{
		name: 'Deep Router',
		avatar: 'https://deeprouter.org/favicon.ico',
		description: '',
		link: 'https://deeprouter.org'
	},
	{
		name: 'Alive~o.0の观猹录',
		avatar: 'https://pic1.imgdb.cn/item/66a088b2d9c307b7e9f0e792.jpg',
		description: 'AI应用开发优质创作者',
		link: 'https://alive0103.github.io/'
	}
];
