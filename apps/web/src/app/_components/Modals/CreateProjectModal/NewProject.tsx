import React, {useCallback, useState} from 'react';
import {useRouter, useParams} from 'next/navigation';
import TextareaAutosize from 'react-textarea-autosize';
import {_createProject, api} from 'lib/client';
import ExitModalIcon from 'public/svg/exit-project-modal-icon.svg';
import {LoadingDots} from 'app/_components/Loaders/LoadingDots';
import {Route} from 'next';
import {ClientDocumentManager} from 'collab/lib/client/ClientDocumentManager';
import {useSession} from 'next-auth/react';

export const NewProject = ({exit}) => {
  const router = useRouter();
  const params = useParams();
  const session = useSession();
  const {workspaceId} = params as {workspaceId: string};
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateProject = useCallback(async () => {
    setLoading(true);
    const clientDoc = new ClientDocumentManager();
    const {data, error} = await clientDoc.createDocument({
      name: name,
      type: 'text',
      userId: session.data?.user.id as string,
      draft: false,
      projectIds: undefined,
    });

    if (error || !data) {
      return;
    }

    api({
      ..._createProject(data?.id, workspaceId, name, description),
      onSuccess: (data) => {
        setLoading(false);
        exit();
        router.push(`/project/${data.id}` as Route);
      },
    });
  }, [description, exit, name, router, session, workspaceId]);

  return (
    <div className="p-4 w-full">
      <div className="flex flex-row items-center justify-between pb-1">
        <p className="font-rubik font-normal text-[22px] leading-[26px] tracking-[0.01em] text-white">New Project</p>
        <ExitModalIcon onClick={exit} />
      </div>
      <hr className="mx-2 text-light-gray mt-2 mb-4" />
      <p className="mb-2 font-rubik font-light text-[18px] leading-[21px] tracking-[0.01em] text-white">
        Project Details
      </p>
      <div className="flex flex-col space-y-2 mb-4">
        <input
          className="h-8 w-full pl-2 py-2 rounded border border-gray bg-transparent font-roboto font-normal text-[12px] leading-[14px] placeholder:text-light-gray text-light-gray"
          placeholder="Project Name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
          type="text"
        />
        <TextareaAutosize
          className="h-8 pl-2 py-2 w-full rounded border border-gray bg-transparent font-roboto font-normal text-[12px] leading-[14px] placeholder:text-light-gray text-light-gray"
          placeholder="Project Description"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
          }}
        />
      </div>
      <div className="mb-4 mt-4 flex flex-row justify-end items-center">
        <button
          onClick={handleCreateProject}
          className="bg-primary-yellow py-2 px-2 font-roboto font-medium text-[14px] leading-[16px] text-secondary-space-blue"
        >
          {loading ? <LoadingDots /> : <span>Create</span>}
        </button>
      </div>
    </div>
  );
};
