import { validateSession } from '@glyphx/business/src/validation';
import { deleteWorkspace } from '@glyphx/business/src/services/workspace';

const handler = async (req, res) => {
  const { method } = req;

  if (method === 'DELETE') {
    const session = await validateSession(req, res);
    deleteWorkspace(
      session.user.userId,
      session.user.email,
      req.query.workspaceSlug
    )
      .then((slug) => res.status(200).json({ data: { slug } }))
      .catch((error) =>
        res.status(404).json({ errors: { error: { msg: error.message } } })
      );
  } else {
    res
      .status(405)
      .json({ errors: { error: { msg: `${method} method unsupported` } } });
  }
};

export default handler;
