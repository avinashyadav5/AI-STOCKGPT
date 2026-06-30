const https = require('https');

https.get('https://query1.finance.yahoo.com/v8/finance/chart/AAPL?interval=1d&range=3mo', (resp) => {
  let data = '';
  resp.on('data', (chunk) => { data += chunk; });
  resp.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log("Success! Close price array length: " + parsed.chart.result[0].indicators.quote[0].close.length);
      console.log("Meta: ", parsed.chart.result[0].meta);
    } catch (e) {
      console.error(e.message);
    }
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});
