const express = require('express');
const router = express.Router();

// Simple in-memory cache to handle production load & limit Delhivery API requests
const trackingCache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes (in milliseconds)

/**
 * @route   GET /api/tracking/:waybill
 * @desc    Proxy the Delhivery tracking API call (avoids CORS on frontend)
 * @access  Public
 */
router.get('/:waybill', async (req, res) => {
  const { waybill } = req.params;
  const cleanWaybill = waybill ? waybill.trim() : '';

  if (!cleanWaybill) {
    return res.status(400).json({
      status: 'error',
      message: 'Please provide a waybill/AWB number.',
    });
  }

  // 1. Check cache first to optimize load
  const cached = trackingCache.get(cleanWaybill);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
    return res.status(200).json(cached.data);
  }

  const token = process.env.DELHIVERY_API_TOKEN;
  if (!token) {
    return res.status(500).json({
      status: 'error',
      message: 'Tracking service is not configured on the server.',
    });
  }

  try {
    const delhiveryUrl = `https://track.delhivery.com/api/v1/packages/json/?waybill=${encodeURIComponent(cleanWaybill)}&ref_ids=order_id`;

    const response = await fetch(delhiveryUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({
        status: 'error',
        message: `Delhivery API responded with status ${response.status}`,
      });
    }

    const data = await response.json();

    // Check if the waybill exists in the response
    if (!data.ShipmentData || data.ShipmentData.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No shipment found for this tracking number.',
      });
    }

    const responseData = {
      status: 'success',
      data,
    };

    // 2. Store success response in cache
    trackingCache.set(cleanWaybill, {
      timestamp: Date.now(),
      data: responseData
    });

    return res.status(200).json(responseData);
  } catch (error) {
    console.error('Tracking proxy error:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to connect to tracking service. Please try again later.',
    });
  }
});

module.exports = router;
