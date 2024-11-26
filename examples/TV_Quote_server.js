const express = require('express');
const TradingView = require('../main'); // Your TradingView client

// Step 1: Initialize WebSocket Client
const client = new TradingView.Client(); // TradingView WebSocket client
const chart = new client.Session.Chart(); // Chart session

// To store the latest data
let latestData = null;

// Step 2: Set up WebSocket subscription
chart.setMarket('CADCNY', { timeframe: 'D' }); // Set market and timeframe

chart.onError((...err) => {
  console.error('WebSocket Chart Error:', ...err);
});

chart.onSymbolLoaded(() => {
  console.log(`Market "${chart.infos.description}" loaded!`);
});

chart.onUpdate(() => {
  if (chart.periods[0]) {
    latestData = {
      description: chart.infos.description,
      close: chart.periods[0].close,
      currency: chart.infos.currency_id,
      timestamp: new Date(),
    };
    console.log(`[${latestData.description}]: ${latestData.close} ${latestData.currency}`);
  }
});

// Step 3: HTTP Server to serve data
const app = express();
app.get('/realtime', (req, res) => {
  if (latestData) {
    res.json({
      success: true,
      data: latestData,
    });
  } else {
    res.json({
      success: false,
      message: 'No data available yet.',
    });
  }
});

// Step 4: Listen on port 4011
const PORT = 4011;
app.listen(PORT, () => {
  console.log(`HTTP Server listening on port ${PORT}`);
});