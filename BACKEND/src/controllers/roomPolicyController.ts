import { Request, Response } from 'express';
import { listRoomPolicies, replaceRoomPolicies } from '../services/roomPolicyStore.js';

export const getRoomPolicies = (_req: Request, res: Response) => {
  return res.status(200).json(listRoomPolicies());
};

export const updateRoomPolicies = (req: Request, res: Response) => {
  const { policies } = req.body as { policies?: unknown };
  if (!policies) {
    return res.status(400).json({ error: 'Chybí policies payload.' });
  }

  const updated = replaceRoomPolicies(policies);
  return res.status(200).json(updated);
};
