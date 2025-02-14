import React from 'react';
import { Card, CardContent } from '@src/components/ui/card';

interface Message {
	role: string;
	content: string;
}

interface ChatHistoryProps {
	messages: Message[];
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ messages }) => {
	return (
		<div className='space-y-4 p-4 border rounded-lg'>
			{' '}
			{/* 外框 */}
			{messages.map((message, index) => (
				<div key={index} className={`flex flex-col gap-2 ${message.role === 'me' ? 'items-end' : 'items-start'}`}>
					{/* 显示 role */}
					<div className='text-xs font-medium'>{message.role === 'me' ? '我' : message.role}</div>
					{/* 消息框 */}
					<div
						className={`w-max max-w-[75%] rounded-lg px-3 py-2 text-sm ${
							message.role === 'me' ? 'ml-auto bg-primary text-primary-foreground' : 'bg-muted'
						}`}>
						{message.content}
					</div>
				</div>
			))}
		</div>
	);
};

export default ChatHistory;
