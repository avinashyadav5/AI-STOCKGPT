fetch('https://query1.finance.yahoo.com/v7/finance/quote?symbols=TATAMOTORS.NS,AAPL')
  .then(res => res.json())
  .then(json => console.log("Result:", JSON.stringify(json, null, 2)))
  .catch(err => console.error(err));
