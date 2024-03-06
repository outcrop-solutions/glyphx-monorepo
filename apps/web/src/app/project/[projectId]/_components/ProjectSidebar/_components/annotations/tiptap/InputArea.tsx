'use client';
import React from 'react';
import {ReactRenderer} from '@tiptap/react';
import tippy from 'tippy.js';
import MentionList from './MentionList';
import './tiptap.css';
import {ArrowRightIcon} from '@heroicons/react/outline';
import {startTransition, useState} from 'react';
import {createProjectAnnotation, createStateAnnotation, getSuggestedMembers} from 'actions/src/annotation';
import Mention from '@tiptap/extension-mention';
import {EditorContent, useEditor} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
// import {suggestion} from './Suggestion';
import {useParams} from 'next/navigation';
import {suggestion} from './Suggestion';

export const InputArea = ({id, type}) => {
  const [members, setMembers] = useState<{name: string; username: string}[]>([]);
  const params = useParams();
  const projectId = params?.projectId as string;
  const editor = useEditor({
    extensions: [
      StarterKit,
      Mention.configure({
        HTMLAttributes: {
          class: 'mention',
        },
        suggestion: suggestion(projectId),
      }),
    ],
    content: '',
  });

  const value = editor?.getText() ?? '';

  if (!editor) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="relative flex w-full">
        <EditorContent
          className="block w-full pb-8 resize-none placeholder:text-xs text-xs bg-transparent py-1 px-2 text-gray-900 outline-none border border-t-yellow placeholder:text-gray-400 ring-none"
          editor={editor}
        />
        <div className="absolute bottom-0 right-0 flex justify-between py-2 pl-3 pr-2">
          <div className="flex-shrink-0">
            <button
              onClick={() =>
                startTransition(() => {
                  if (type === 'PROJECT') {
                    createProjectAnnotation(id, value);
                    editor.commands.setContent('');
                  } else {
                    createStateAnnotation(id, value);
                    editor.commands.setContent('');
                  }
                })
              }
              className="inline-flex items-center rounded-md bg-gray px-3 py-1 text-sm font-semibold text-white shadow-sm hover:bg-yellow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow"
            >
              <ArrowRightIcon className="shrink-0 h-2 w-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
