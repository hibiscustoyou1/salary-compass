import { createVNode, render } from 'vue';
import MessageComponent from './Message.vue';

type MessageType = 'success' | 'error' | 'warning' | 'info';

const showMessage = (type: MessageType, content: string, duration = 3000) => {
  const container = document.createElement('div');
  document.body.appendChild(container);

  const vnode = createVNode(MessageComponent, {
    type,
    content,
    duration,
    onDestroy: () => {
      render(null, container);
      container.remove();
    }
  });

  render(vnode, container);
};

export const Message = {
  success: (content: string, duration?: number) => showMessage('success', content, duration),
  error: (content: string, duration?: number) => showMessage('error', content, duration),
  warning: (content: string, duration?: number) => showMessage('warning', content, duration),
  info: (content: string, duration?: number) => showMessage('info', content, duration),
};