import express from 'express';
import { apiService } from '../services/apiService';
import { csvLogger } from '../utils/csvLogger';

const router = express.Router();

router.post('/webhook', async (req, res) => {
  try {
    const webhookSecret = req.headers['x-webhook-secret'];
    
    if (!webhookSecret || !(await apiService.validateWebhookSecret(webhookSecret as string))) {
      return res.status(401).json({ error: 'Invalid webhook secret' });
    }

    const data = req.body;
    const properties = await apiService.processWebhookData(data);

    res.json({
      success: true,
      processed: properties.length
    });

  } catch (error) {
    csvLogger.log('error', 'Webhook processing error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;
