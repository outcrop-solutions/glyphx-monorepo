import { databaseTypes } from "types";

export const openFirstFile = (projData): databaseTypes.IProject => {
    const newFiles = projData?.files.map((file, idx) => (idx === 0 ? { ...file, selected: true, open: true } : file));
    return {
        ...projData,
        files: newFiles,
    };
}