import type { NextApiRequest, NextApiResponse } from "next";
import { sendInviteOrgEmail } from "./mail";

/**
 * Create Invite
 *
 * Creates a new invite from a provided `pageId` query parameter.
 *
 * Once created, the pages new `inviteId` will be returned.
 *
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 */
export async function createInvite(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void | NextApiResponse<{
  inviteId: string;
}>> {
  try {
    // TODO: hash this with server-side secret
    await sendInviteOrgEmail({
      name: "Danny",
      email: "jamesmurdockgraham@gmail.com",
      inviteUrl: `http://localhost:3000/project/6d97e8e6-40e3-48f5-87dc-45eb95977080`,
      organizationName: "SynGlyphx",
    });
    return res.status(201).json({
      ok: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).end(error);
  }
}
