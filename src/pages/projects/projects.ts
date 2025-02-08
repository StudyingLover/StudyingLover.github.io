import { getRepositoryDetails } from '../../utils';

export interface Project {
	name: string;
	demoLink: string;
	tags?: string[];
	description?: string;
	postLink?: string;
	demoLinkRel?: string;
	[key: string]: any;
}

export const projects: Project[] = [
	{
		...(await getRepositoryDetails('StudyingLover/ggml-tutorial')),
		name: 'ggml-tutorial',
		description: '推理框架GGML的学习记录和教程',
		demoLink: 'https://github.com/StudyingLover/ggml-tutorial',
		tags: ['项目']
	},
	{
		...(await getRepositoryDetails('JiaHuann/Smart_Fault_Injector_LLM')),
		name: 'Smart_Fault_Injector_LLM',
		description: '基于大模型和eBPF的智能化kernel错误注入、测试工具',
		demoLink: 'https://github.com/JiaHuann/Smart_Fault_Injector_LLM',
		tags: ['项目']
	}
];
