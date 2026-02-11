import { createVNode, render } from 'vue';
import ConfirmBoxComponent, { type ConfirmOptions } from './ConfirmBox.vue';

export const ConfirmBox = (options: ConfirmOptions): Promise<void> => {
  return new Promise((resolve, reject) => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const destroy = () => {
      render(null, container);
      container.remove();
    };

    const vnode = createVNode(ConfirmBoxComponent, {
      options,
      onConfirm: () => {
        resolve();
      },
      onCancel: () => {
        reject('cancel');
      },
      onDestroy: destroy
    });

    render(vnode, container);
  });
};