import { dataService, Initializer } from '@glyphx/business';
import { Session } from 'next-auth';

const handler = async (req, res) => {
  await Initializer.init();

  const { method } = req;

  if (method === 'POST') {
    //TODO: we need to validate the session here
    //Once we get things sorted on the QT side.
    const { rowIds, tableName } = req.body;
    const data = await dataService.getDataByGlyphxIds(tableName, rowIds);
    if (!data.length) {
      res.status(404).json({ errors: { error: { msg: `No data found` } } });
    } else {
      res.status(200).json(data);
    }
  } else {
    res.status(405).json({ errors: { error: { msg: `${method} method unsupported` } } });
  }
};

export default handler;
