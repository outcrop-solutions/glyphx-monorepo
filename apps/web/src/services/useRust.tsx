import {useCallback, useRef} from 'react';
import {fileIngestionTypes, webTypes} from 'types';
import {useRecoilState, useRecoilValue, useSetRecoilState} from 'recoil';
import {
  drawerOpenAtom,
  geLoadingAtom,
  modelRunnerAtom,
  projectAtom,
  activeStateAtom,
  showLoadingAtom,
  stateSnapshotsSelector,
  statsCountSelector,
  glyphCountSelector,
  xVecCountSelector,
  yVecCountSelector,
  sceneRenderedAtom,
} from 'state';
import {runGlyphEngineAction, updateProjectState} from 'actions';
import produce from 'immer';

export const useRust = () => {
  const [modelRunner, setModelRunner] = useRecoilState(modelRunnerAtom);
  const setGELoading = useSetRecoilState(geLoadingAtom);
  const setSceneRendered = useSetRecoilState(sceneRenderedAtom);
  const glyphCount = useRecoilValue(glyphCountSelector);
  const statsCount = useRecoilValue(statsCountSelector);
  const xVecCount = useRecoilValue(xVecCountSelector);
  const yVecCount = useRecoilValue(yVecCountSelector);
  const urlRef = useRef('');
  const loading = useRecoilValue(showLoadingAtom);

  const [project, setProject] = useRecoilState(projectAtom);
  const [activeState, setActiveState] = useRecoilState(activeStateAtom);
  const activeStates = useRecoilValue(stateSnapshotsSelector);
  const setDrawer = useSetRecoilState(drawerOpenAtom);

  const shouldReset = useCallback(() => {
    console.log({glyphCount, statsCount, xVecCount, yVecCount});
    if (glyphCount && statsCount && xVecCount && yVecCount) {
      return true;
    } else {
      return false;
    }
  }, [glyphCount, statsCount, xVecCount, yVecCount]);

  /**
   * Generic stream handler.
   * Provides continuity across chunks for data processData
   * @param url
   * @param processData
   */
  const handleStream = useCallback(async (url: string, processData: (arg: any) => Promise<Buffer>) => {
    const response = await fetch(url);
    if (response.body) {
      const reader = response.body.getReader();
      let buffer = new Uint8Array();
      while (true) {
        const {done, value} = await reader.read();
        if (done && buffer.length === 0) break;
        if (value) {
          buffer = new Uint8Array([...buffer, ...value]);
        }
        // Call processData which is expected to process and modify buffer
        buffer = (await processData(buffer)) as any;
      }
      // Handle any remaining buffer data
      if (buffer.length > 0) {
        console.error('Unhandled remaining data:', buffer);
      }
    }
  }, []);

  /**
   * Specialized buffer processor for vector stream
   * @param buffer
   * @returns
   */
  const processData = useCallback(
    (axis: webTypes.constants.AXIS, processor: string) => async (buffer: Buffer) => {
      try {
        let offset = 0;
        while (offset < buffer.length) {
          // Ensure the buffer is long enough to read the initial length value
          if (buffer.length < 8) {
            return buffer; // Return the original buffer if it's too short
          }
          // Read the total length of the data from the first 8 bytes
          const totalDataLength = new DataView(buffer.buffer, buffer.byteOffset + offset, 8).getBigUint64(0, true);
          offset += 8;
          // Check if the full data specified by totalDataLength is available in the buffer
          if (offset + Number(totalDataLength) > buffer.length) {
            // using subarray to avoid copying the buffer
            return buffer.subarray(offset); // Return the buffer starting from the length value for reprocessing
          }
          // Extract the relevant data for processing
          const dataToProcess = buffer.subarray(offset, offset + Number(totalDataLength));
          switch (processor) {
            case 'vector':
              console.log(`Processing ${axis} vector data`, {dataToProcess});
              if (modelRunner) {
                modelRunner.add_vector(axis.toLowerCase(), dataToProcess);
              }
              break;
            case 'stats':
              console.log('Processing stats data', {dataToProcess});
              if (modelRunner) {
                const retval = modelRunner.add_statistics(dataToProcess);
                console.log('stats', retval);
              }
              break;
            case 'glyph':
              console.log('Processing glyph data', {dataToProcess});
              if (modelRunner) {
                modelRunner.add_glyph(dataToProcess);
              }
              break;
            default:
              console.error('Unknown data type');
              break;
          }
          // Update the offset to move past the processed data
          offset += Number(totalDataLength);
          return buffer.subarray(offset); // Return the unprocessed remainder
        }
      } catch (error) {
        console.log({error});
      }
    },
    [modelRunner]
  );

  /**
   * Sets up the streams and processes the data
   * Runs the modelRunner.run() call
   */
  const downloadModel = useCallback(
    async (modelData: {GLY_URL: string; STS_URL: string; X_VEC: string; Y_VEC: string}) => {
      try {
        console.log('downloading model');
        // Load the WASM module and create a new ModelRunner instance.
        // We can't re-use the model runner because there is no way to clear the stats and glyphs and reuse the event loop
        const {GLY_URL, STS_URL, X_VEC, Y_VEC} = modelData;
        // First, handle statistics and vectors concurrently
        urlRef.current = GLY_URL;
        // @ts-ignore
        await handleStream(STS_URL, processData(undefined, 'stats'));
        // @ts-ignore
        await handleStream(X_VEC, processData('x', 'vector'));
        // @ts-ignore
        await handleStream(Y_VEC, processData('y', 'vector'));
        // @ts-ignore
        await handleStream(GLY_URL, processData(undefined, 'glyph'));

        setDrawer(true);
        const canvas = document.getElementById('glyphx-cube-model');
        if (!canvas) {
          console.log('Canvas not found');
          return;
        }
        const width = canvas!.clientWidth;
        const height = canvas!.clientHeight;
        setGELoading(false);
        setSceneRendered(true);
        if (modelRunner) {
          if (shouldReset()) {
            await modelRunner.reset_state();
          } else {
            console.log('called modelRunner.run()');
            await modelRunner.run(width, height);
          }
        }
      } catch (error) {
        console.log('swallowedError', {error});
      }
    },
    [handleStream, modelRunner, processData, setDrawer, setGELoading]
  );

  /* Initializes and manages the WebGL model on the canvas.
   * - Loads the WASM module and creates an instance of ModelRunner.
   * - Sets the modelRunner into the Recoil state for global access.
   */
  const runRustGlyphEngine = useCallback(
    async (event) => {
      event?.stopPropagation();
      console.log('calling rust glyph engine');
      try {
        // set loading
        setGELoading(true);
        // if model is already loaded
        if (shouldReset()) {
          console.log('clearing data');
          modelRunner.clear_data();
          return;
        }
        // run the action
        if (project) {
          // update DB
          await updateProjectState(project.id, project.state);
          // run GE
          const retval = await runGlyphEngineAction(project);
          // @ts-ignore
          if (retval && !retval?.error) {
            // @ts-ignore
            await downloadModel(retval);
          }
        }
      } catch (error) {
        setGELoading(false);
        console.log({error});
      }
    },
    [downloadModel, modelRunner, project, setGELoading, shouldReset]
  );

  /**
   * Same as runRustGLyphEngine
   */
  const downloadState = useCallback(
    async (stateId: string) => {
      console.log('calling download state');
      try {
        // set loading
        setGELoading(true);
        if (shouldReset()) {
          console.log('clearing data');
          modelRunner.clear_data();
          return;
        }
        if (project) {
          await updateProjectState(project.id, project.state);
          const retval = await runGlyphEngineAction(project, stateId);
          console.log({retval});
          // @ts-ignore
          if (retval && !retval?.error) {
            // @ts-ignore
            await downloadModel(retval);
          }
        }
        setGELoading(false);
      } catch (error) {
        setGELoading(false);
        console.log({error});
      }
    },
    [downloadModel, modelRunner, project, setGELoading, shouldReset]
  );

  const applyState = useCallback(
    async (state) => {
      const stateId = state.id;
      if (activeState === stateId) {
        setActiveState('');
        return;
      }
      setActiveState(stateId);
      setDrawer(true);
      const isLoading = Object.keys(loading).length > 0;
      // only apply state if not loading
      if (!isLoading && project) {
        // extract values
        const stateValue = activeStates?.find((s) => s.id === stateId);
        if (stateValue) {
          // get the data files
          await downloadState(stateId);
          // pass values to rust side of the house
          const camera = state.camera;
          const aspect = state.aspectRatio.width / state.aspectRatio.height;
          modelRunner?.set_camera_data(JSON.stringify(camera), aspect);

          // format rowIds from string in mongo to Uint32Array for modelRunner
          const ids = (state.rowIds as any[])?.map((id) => Number(id)) as number[];
          const selectedIds = new Uint32Array(ids) ?? new Uint32Array();
          modelRunner?.set_selected_glyphs(selectedIds);

          /**
           * replace project state
           * rectify mongo scalar array
           */
          setProject(
            produce((draft: any) => {
              Object.entries(draft.state.properties).forEach(
                ([type, prop]: [webTypes.Property['axis'], webTypes.Property]) => {
                  const filter = prop.filter;
                  // Remove the 'id' property inside 'filter' if it exists.
                  if (filter && filter.id) {
                    delete filter.id;
                  }
                  if (
                    prop.dataType &&
                    (prop.dataType === fileIngestionTypes.constants.FIELD_TYPE.STRING ||
                      prop.dataType === fileIngestionTypes.constants.FIELD_TYPE.DATE) &&
                    prop.filter &&
                    (prop.filter as webTypes.IStringFilter)?.keywords &&
                    (prop.filter as webTypes.IStringFilter)?.keywords?.length > 0
                  ) {
                    const keywords =
                      (prop.filter as webTypes.IStringFilter).keywords ?? ([] as unknown as webTypes.IStringFilter);
                    if (keywords && keywords.length > 0) {
                      draft.properties[prop.axis] = {
                        ...draft.properties[prop.axis],
                        filter: {
                          keywords: [
                            ...keywords.map((word) => {
                              return Object.values(word).join('');
                            }),
                          ],
                        },
                      };
                    }
                  }
                }
              );
            })
          );
        }
      } else {
        setActiveState('');
      }
    },
    [activeState, setActiveState, setDrawer, loading, project, activeStates, downloadState, modelRunner, setProject]
  );

  return {
    applyState,
    downloadState,
    runRustGlyphEngine,
  };
};
