const apiKey = 'WQTRTFRA2GUR4WCZ';
const stockInput = document.getElementById('stockInput');
const findButton = document.getElementById('findButton');
const detailsContainer = document.getElementById('detailsContainer');
const comparisonTable = document.getElementById('comparisonTable').getElementsByTagName('tbody')[0];
const chartContext = document.getElementById('priceChart').getContext('2d');
let priceChart;

const stockSelect = document.getElementById('stockSelect');
const fetchStockButton = document.getElementById('fetchStockButton');

async function fetchStockInfo(symbol) {
    const response = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${apiKey}`);
    const data = await response.json();
    return data['Time Series (Daily)'];
}
async function fetchTrendingStocks() {
    const response = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=IBM&interval=5min&apikey=${apiKey}`);
    const data = await response.json();
    const trendingStocks = ['select','AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'FB', 'NFLX', 'NVDA', 'BABA', 'INTC'];
    return trendingStocks;
}

async function populateStockSelect() {
    const trendingStocks = await fetchTrendingStocks();
    trendingStocks.forEach(stock => {
        const option = document.createElement('option');
        option.value = stock;
        option.textContent = stock;
        stockSelect.appendChild(option);
    });
}

function showStockDetails(stockData, symbol) {
    const latestDate = Object.keys(stockData)[0];
    const latestData = stockData[latestDate];
    const currentPrice = latestData['4. close'];
    const tradeVolume = latestData['5. volume'];
    const previousPrice = stockData[Object.keys(stockData)[1]]['4. close'];
    const priceChange = (currentPrice - previousPrice).toFixed(2);
    
    detailsContainer.innerHTML = `
        <h3>${symbol}</h3>
        <p>Current Price: $${currentPrice}</p>
        <p>Price Change: $${priceChange}</p>
        <p>Trade Volume: ${tradeVolume}</p>
    `;

    updateComparisonTable(symbol, currentPrice, priceChange, tradeVolume);
}

function updateComparisonTable(symbol, currentPrice, priceChange, tradeVolume) {
    const newRow = comparisonTable.insertRow();
    newRow.innerHTML = `
        <td>${symbol}</td>
        <td>$${currentPrice}</td>
        <td>${priceChange}</td>
        <td>${tradeVolume}</td>
    `;
}

function renderStockChart(stockData) {
    const labels = Object.keys(stockData).slice(0, 30).reverse();
    const prices = labels.map(date => stockData[date]['4. close']);

    if (priceChart) {
        priceChart.destroy();
    }

    priceChart = new Chart(chartContext, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Stock Price',
                data: prices,
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                fill: false
            }]
        },
        options: {
            scales: {
                x: {
                    beginAtZero: true
                },
                y: {
                    beginAtZero: false
                }
            }
        }
    });
}

findButton.addEventListener('click', async () => {
    const stockSymbol = stockInput.value.toUpperCase();
    const stockData = await fetchStockInfo(stockSymbol);
    
    if (stockData) {
        showStockDetails(stockData, stockSymbol);
        renderStockChart(stockData);
    } else {
        detailsContainer.innerHTML = `<p>Stock symbol not found.</p>`;
    }
});

fetchStockButton.addEventListener('click', async () => {
    const selectedStock = stockSelect.value;
    const stockData = await fetchStockInfo(selectedStock);
    if (stockData) {
        showStockDetails(stockData, selectedStock);
        renderStockChart(stockData);
    } else {
        detailsContainer.innerHTML = `<p>Stock data not available for ${selectedStock}.</p>`;
    }
});


populateStockSelect();