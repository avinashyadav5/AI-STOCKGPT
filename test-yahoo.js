fetch('https://query1.finance.yahoo.com/v6/finance/quote?symbols=AAPL,TSLA')
  .then(res => res.json())
  .then(json => console.log(JSON.stringify(json.quoteResponse, null, 2)))
  .catch(err => console.error(err));
