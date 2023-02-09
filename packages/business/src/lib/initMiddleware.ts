// eslint-disable-next-line @typescript-eslint/naming-convention
const initMiddleware = middleware => {
  return (req, res) =>
    new Promise((resolve, reject) => {
      middleware(req, res, result =>
        result instanceof Error ? reject(result) : resolve(result)
      );
    });
};

export default initMiddleware;
