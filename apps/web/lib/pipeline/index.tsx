import { IngestionType, ProcessInput } from './types';

/**
 * Takes acceptedFiles from Client input and turns a renderable grid
 *
 * Fetches & returns either a single or all files available depending on
 * whether a `fileId` query parameter is provided. If not all files are
 * returned in descending order.
 *
 * @param type
 * @returns Grid
 */
export async function processFiles(input: ProcessInput) {
  convert2state(input);
}

const convert2state = async (input) => {
  if (input.ingestionType == 'BROWSER') {
    browser2state(input.files);
  } else if (input.ingestionType == 'S3') {
    s32state(input.files);
  }
};

// TAKES ARRAY OF FILE BLOBS, RETURNS READABLE STREAM OF APP STATE
const browser2state = (files: Blob[]) => {

}

// TAKES S3 LOCATION, STREAMS RENDERABLE APP STATE IN JSON FORMAT
const s32state = (files: string) => {

    
}