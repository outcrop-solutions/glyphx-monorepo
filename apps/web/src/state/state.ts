import {atom} from 'recoil';

export const stateQueryAtom = atom({
  key: 'stateQueryAtom',
  default: null,
});

export const channelAtom = atom({
  key: 'webChannelAtom',
  default: false,
});
