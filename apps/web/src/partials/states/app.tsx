import { atom } from 'recoil';

// INITIAL DASHBOARD DATA FETCH RESULT
export const dashboardDataAtom = atom({
  key: "overviewData",
  default: null,
});

// FULLSCREEN SEARCH QUERY
export const userSearchDataAtom = atom({
  key: "userSearchData",
  default: null,
});

// FIRES ERROR TOAST WHEN SET
export const errorMessageAtom = atom({
  key: 'errorMessageAtom',
  default: false,
});

// FIRES UPDATE (SUCCESS) TOAST WHEN SET
export const updateMessageAtom = atom({
  key: 'updateMessageAtom',
  default: false,
});


