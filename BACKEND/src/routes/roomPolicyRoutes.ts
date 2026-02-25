import express from 'express';
import { getRoomPolicies, updateRoomPolicies } from '../controllers/roomPolicyController.js';

const router = express.Router();

router.get('/', getRoomPolicies);
router.put('/', updateRoomPolicies);

export default router;
