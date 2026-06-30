fetch('https://query1.finance.yahoo.com/v1/finance/search?q=tata%20motors')
  .then(res => res.json())
  .then(json => console.log(json.quotes.map(q => q.symbol)))
  .catch(err => console.error(err));
