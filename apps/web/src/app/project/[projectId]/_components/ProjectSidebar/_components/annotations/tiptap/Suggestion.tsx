'use client';
import {ReactRenderer} from '@tiptap/react';
import tippy from 'tippy.js';
import MentionList from './MentionList';
import {getSuggestedMembers} from 'actions/src/annotation';
import {debounce} from 'lodash';
// passed as an option to mention.configure
export const suggestion = (projectId: string) => {
  return {
    items: async ({query}) => {
      const debouncedCallback = debounce(async (projectId, query) => {
        await getSuggestedMembers(projectId, query);
      }, 500);
      const retval = await debouncedCallback(projectId as string, query);
      return retval;
    },
    render: () => {
      let component;
      let popup;

      return {
        onStart: (props) => {
          component = new ReactRenderer(MentionList, {
            props,
            editor: props.editor,
          });

          if (!props.clientRect) {
            return;
          }

          popup = tippy('body', {
            getReferenceClientRect: props.clientRect,
            appendTo: () => document.body,
            content: component.element,
            showOnCreate: true,
            interactive: true,
            trigger: 'manual',
            placement: 'bottom-start',
          });
        },

        onUpdate(props) {
          component.updateProps(props);

          if (!props.clientRect) {
            return;
          }

          popup[0].setProps({
            getReferenceClientRect: props.clientRect,
          });
        },

        onKeyDown(props) {
          if (props.event.key === 'Escape') {
            popup[0].hide();

            return true;
          }

          return component.ref?.onKeyDown(props);
        },

        onExit() {
          popup[0].destroy();
          component.destroy();
        },
      };
    },
  };
};
