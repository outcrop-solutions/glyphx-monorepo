import React, { useState } from 'react';
import Button from 'components/Button';
import produce from 'immer';
import { WritableDraft } from 'immer/dist/internal';
import { _createState, _createProjectTemplate, api } from 'lib';
import { web as webTypes } from '@glyphx/types';
import { useSetRecoilState } from 'recoil';
import { modalsAtom } from 'state';
import { LoadingDots } from 'partials/loaders/LoadingDots';
import ColXIcon from 'public/svg/col-x-icon.svg';
import ColYIcon from 'public/svg/col-y-icon.svg';
import ColZIcon from 'public/svg/col-z-icon.svg';

export const CreateProjectTemplateModal = ({ modalContent }: webTypes.CreateProjectTemplateModalProps) => {
  const setModals = useSetRecoilState(modalsAtom);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [properties, setProperties] = useState(modalContent.data.state.properties);
  const validName = name.length > 0 && name.length <= 50;
  const axes = ['X', 'Y', 'Z'];
  // local state
  const handleNameChange = (event) => setName(event.target.value);
  const handleDescChange = (event) => setDesc(event.target.value);

  const handleUpdatePropertyName = (axis, e) => {
    setProperties(
      produce((draft: WritableDraft<Record<string, webTypes.Property>>) => {
        draft[axis].key = e.target.value;
      })
    );
  };

  const handleUpdatePropertyDesc = (axis, e) => {
    setProperties(
      produce((draft: WritableDraft<Record<string, webTypes.Property>>) => {
        draft[axis].description = e.target.value;
      })
    );
  };

  const renderAxisIcon = (axis) => {
    switch (axis) {
      case 'X':
        return <ColXIcon />;
      case 'Y':
        return <ColYIcon />;
      case 'Z':
        return <ColZIcon />;
      default:
        break;
    }
  };

  // mutations
  const createProjectTemplate = (event) => {
    event.preventDefault();
    api({
      ..._createProjectTemplate(modalContent.data._id.toString(), name, desc, properties),
      setLoading: (state) =>
        setModals(
          produce((draft: WritableDraft<webTypes.IModalsAtom>) => {
            draft.modals[0].isSubmitting = state;
          })
        ),
      onError: (_: any) => {
        setModals(
          produce((draft: WritableDraft<webTypes.IModalsAtom>) => {
            draft.modals.splice(0, 1);
          })
        );
      },
      onSuccess: (data: any) => {
        setModals(
          produce((draft: WritableDraft<webTypes.IModalsAtom>) => {
            draft.modals.splice(0, 1);
          })
        );
      },
    });
  };

  return (
    <div className="flex flex-col items-stretch justify-center px-4 py-8 w-[500px] space-y-5 bg-secondary-midnight rounded-md text-white">
      <div className="space-y-0 text-xl text-gray-600">
        <p>Create a Project Template</p>
      </div>
      {!validName && (
        <div className="py-1 px-2 text-white bg-red-500 rounded mb-1">
          Please keep template names under 30 characters
        </div>
      )}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-bold">Template Name</h3>
          <input
            className="w-full px-3 py-2 border rounded bg-transparent text-[12px]"
            disabled={modalContent.isSubmitting}
            onChange={handleNameChange}
            type="text"
            value={name}
          />
        </div>
        <div>
          <h3 className="text-sm font-bold">Template Description</h3>
          <input
            className="w-full px-2 py-1 border rounded bg-transparent text-[12px]"
            disabled={modalContent.isSubmitting}
            onChange={handleDescChange}
            type="text"
            value={desc}
          />
        </div>
        {axes.map((axis) => (
          <>
            <div className="space-y-2">
              <div
                data-type={`${properties[axis]?.dataType}`}
                className={`opacity-100 flex items-center justify-center truncate h-[30px] my-1`}
              >
                <span className="inline-flex align-middle space-x-1">
                  <p className="text-white font-sans font-medium text-[12px] text-center tracking-[.01em] leading-[14px] uppercase truncate">
                    {properties[axis]?.key}
                  </p>
                  {renderAxisIcon(axis)}
                </span>
              </div>
              <input
                className="w-full px-2 py-1 border border-gray rounded bg-transparent text-[12px]"
                disabled={modalContent.isSubmitting}
                onChange={(e) => handleUpdatePropertyName(axis, e)}
                type="text"
                value={properties[axis]?.key}
              />
              <textarea
                className="w-full px-2 py-1 border border-gray rounded bg-transparent text-[12px]"
                disabled={modalContent.isSubmitting}
                onChange={(e) => handleUpdatePropertyDesc(axis, e)}
                placeholder="Give axis a description"
                value={properties[axis]?.description}
              />
            </div>
          </>
        ))}
      </div>
      <div className="flex flex-col items-stretch">
        <Button className="" disabled={!validName || modalContent.isSubmitting} onClick={createProjectTemplate}>
          {modalContent.isSubmitting ? <LoadingDots /> : <span>Save as template</span>}
        </Button>
      </div>
    </div>
  );
};
