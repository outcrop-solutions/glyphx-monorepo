import { NextApiRequest, NextApiResponse } from "next";
import screenshot from "lib/api/screenshot";

export default async function componentImages(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { projectId, orgId } = req.query || {};
  if (!Array.isArray(projectId) || !Array.isArray(orgId)) {
    const url = `http://app.localhost:3000/app/${orgId}/${projectId}/project-image`;

    const file = await screenshot(url);
    res.setHeader("Content-Type", `image/png`);
    res.setHeader(
      "Cache-Control",
      `public, immutable, no-transform, s-maxage=31536000, max-age=31536000`
    );
    res.statusCode = 200;
    res.end(file);
  } else {
    res.status(404).send("Not Found");
  }
}
