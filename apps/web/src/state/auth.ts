'use client';
import {atom} from 'recoil';
import {ClientSafeProvider} from 'next-auth/react';

export const authProvidersAtom = atom<ClientSafeProvider[]>({
  key: 'authProvidersAtom',
  default: [],
});

export const authEmailAtom = atom<string>({
  key: 'authEmailAtom',
  default: '',
});
