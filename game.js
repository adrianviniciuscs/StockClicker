const stocks = [
	{ name: "Tech Co", price: 50, owned: 0, history: [], color: 'rgb(75, 192, 192)', volatility: 0.05 },
	{ name: "Bank Inc", price: 100, owned: 0, history: [], color: 'rgb(255, 99, 132)', volatility: 0.03 },
	{ name: "Food Corp", price: 30, owned: 0, history: [], color: 'rgb(255, 205, 86)', volatility: 0.02 },
	{ name: "Auto Motors", price: 80, owned: 0, history: [], color: 'rgb(54, 162, 235)', volatility: 0.04 },
	{ name: "Energy Ltd", price: 60, owned: 0, history: [], color: 'rgb(153, 102, 255)', volatility: 0.06 }
];

const bots = [
	{ name: "Basic Bot", price: 1000, owned: 0, tradeAmount: 100, intelligence: 0.6 },
	{ name: "Advanced Bot", price: 5000, owned: 0, tradeAmount: 500, intelligence: 0.8 },
	{ name: "Expert Bot", price: 20000, owned: 0, tradeAmount: 2000, intelligence: 0.95 }
];

let money = 10000;
let day = 1;
const historyLength = 30;
let chart;

function updateDisplay() {
	document.getElementById('money').textContent = money.toFixed(2);
	document.getElementById('day').textContent = day;
	updateNetWorth();
	updateStockList();
	updateBotList();
}

function updateNetWorth() {
	const stocksValue = stocks.reduce((total, stock) => total + stock.price * stock.owned, 0);
	const netWorth = money + stocksValue;
	document.getElementById('netWorth').textContent = netWorth.toFixed(2);
}

function updateStockList() {
	const stockList = document.getElementById('stockList');
	stockList.innerHTML = '';
	stocks.forEach((stock, index) => {
		const stockItem = document.createElement('div');
		stockItem.className = 'bg-white rounded-lg shadow-md p-6';
		stockItem.innerHTML = `
            <h3 class="text-xl font-semibold mb-4">${stock.name}</h3>
            <p class="mb-2">Price: $<span id="price-${index}" class="font-bold">${stock.price.toFixed(2)}</span></p>
            <p class="mb-4">Owned: <span id="owned-${index}" class="font-bold">${stock.owned}</span></p>
            <div class="flex space-x-2">
                <button onclick="buyStock(${index})" class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">Buy</button>
                <button onclick="sellStock(${index})" class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">Sell</button>
            </div>
        `;
		stockList.appendChild(stockItem);
	});
}

function updateBotList() {
	const botList = document.getElementById('botList');
	botList.innerHTML = '';
	bots.forEach((bot, index) => {
		const botItem = document.createElement('div');
		botItem.className = 'bg-white rounded-lg shadow-md p-6';
		botItem.innerHTML = `
            <h3 class="text-xl font-semibold mb-4">${bot.name}</h3>
            <p class="mb-2">Price: $${bot.price}</p>
            <p class="mb-2">Trade Amount: $${bot.tradeAmount}</p>
            <p class="mb-4">Owned: <span id="bot-owned-${index}" class="font-bold">${bot.owned}</span></p>
            <button onclick="buyBot(${index})" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">Buy Bot</button>
        `;
		botList.appendChild(botItem);
	});
}

function createChart() {
	const ctx = document.getElementById('stockChart').getContext('2d');
	chart = new Chart(ctx, {
		type: 'line',
		data: {
			labels: [...Array(historyLength)].map((_, i) => i.toString()),
			datasets: stocks.map(stock => ({
				label: stock.name,
				data: stock.history,
				borderColor: stock.color,
				tension: 0.1
			}))
		},
		options: {
			responsive: true,
			maintainAspectRatio: false,
			scales: {
				y: {
					beginAtZero: false
				}
			},
			animation: {
				duration: 0
			}
		}
	});
}

function updateStockPrices() {
	stocks.forEach((stock, index) => {
		const changePercent = (Math.random() - 0.5) * stock.volatility;
		const change = stock.price * changePercent;
		stock.price = Math.max(1, stock.price + change);
		stock.history.push(stock.price);
		if (stock.history.length > historyLength) {
			stock.history.shift();
		}
		document.getElementById(`price-${index}`).textContent = stock.price.toFixed(2);
	});

	chart.data.datasets.forEach((dataset, i) => {
		dataset.data = stocks[i].history;
	});
	chart.update();
}

function buyStock(index) {
	if (money >= stocks[index].price) {
		money -= stocks[index].price;
		stocks[index].owned++;
		updateDisplay();
	}
}

function sellStock(index) {
	if (stocks[index].owned > 0) {
		money += stocks[index].price;
		stocks[index].owned--;
		updateDisplay();
	}
}

function buyBot(index) {
	if (money >= bots[index].price) {
		money -= bots[index].price;
		bots[index].owned++;
		updateDisplay();
	}
}

function botTrading() {
	bots.forEach(bot => {
		for (let i = 0; i < bot.owned; i++) {
			const stockIndex = Math.floor(Math.random() * stocks.length);
			const stock = stocks[stockIndex];
			const decision = Math.random();

			if (decision < bot.intelligence) {
				// Bot makes a "good" decision
				if (stock.price < stock.history[stock.history.length - 2]) {
					// Price is lower than previous day, buy
					if (money >= bot.tradeAmount) {
						const sharesBought = Math.floor(bot.tradeAmount / stock.price);
						money -= sharesBought * stock.price;
						stock.owned += sharesBought;
					}
				} else {
					// Price is higher than previous day, sell
					const sharesToSell = Math.min(stock.owned, Math.floor(bot.tradeAmount / stock.price));
					money += sharesToSell * stock.price;
					stock.owned -= sharesToSell;
				}
			} else {
				// Bot makes a random decision
				if (Math.random() < 0.5) {
					// Buy
					if (money >= bot.tradeAmount) {
						const sharesBought = Math.floor(bot.tradeAmount / stock.price);
						money -= sharesBought * stock.price;
						stock.owned += sharesBought;
					}
				} else {
					// Sell
					const sharesToSell = Math.min(stock.owned, Math.floor(bot.tradeAmount / stock.price));
					money += sharesToSell * stock.price;
					stock.owned -= sharesToSell;
				}
			}
		}
	});
}

function generateNews() {
	const newsList = document.getElementById('newsList');
	const companies = ["Tech Co", "Bank Inc", "Food Corp", "Auto Motors", "Energy Ltd"];
	const events = [
		"announces new product line",
		"reports quarterly earnings",
		"faces regulatory scrutiny",
		"expands to new markets",
		"CEO steps down",
		"stock split announced",
		"merger talks underway",
		"launches cost-cutting measures",
		"investor activism on the rise",
		"patent dispute settled"
	];
	const impacts = [
		"causing stock to surge",
		"leading to a stock selloff",
		"with minimal market impact",
		"sparking investor optimism",
		"raising concerns among shareholders"
	];

	const company = companies[Math.floor(Math.random() * companies.length)];
	const event = events[Math.floor(Math.random() * events.length)];
	const impact = impacts[Math.floor(Math.random() * impacts.length)];

	const newsItem = `${company} ${event}, ${impact}.`;
	const li = document.createElement('li');
	li.textContent = `Day ${day}: ${newsItem}`;
	newsList.prepend(li);
	if (newsList.children.length > 5) {
		newsList.removeChild(newsList.lastChild);
	}

	// Apply news effect on stock prices
	const stockIndex = stocks.findIndex(stock => stock.name === company);
	if (stockIndex !== -1) {
		const priceChange = (Math.random() * 0.1 + 0.05) * (impact.includes("surge") || impact.includes("optimism") ? 1 : -1);
		stocks[stockIndex].price *= (1 + priceChange);
		stocks[stockIndex].price = Math.max(1, stocks[stockIndex].price);
	}
}

// Market sentiment
let marketSentiment = 0; // Range from -1 (bearish) to 1 (bullish)

function updateMarketSentiment() {
	const sentimentChange = (Math.random() - 0.5) * 0.1;
	marketSentiment = Math.max(-1, Math.min(1, marketSentiment + sentimentChange));
	const sentimentElement = document.getElementById('marketSentiment');
	sentimentElement.textContent = marketSentiment.toFixed(2);
	sentimentElement.className = marketSentiment > 0 ? 'text-green-600' : 'text-red-600';
}

// Stock splits
function checkForStockSplit() {
	stocks.forEach((stock, index) => {
		if (stock.price > 1000 && Math.random() < 0.1) {
			stock.price /= 2;
			stock.owned *= 2;
			generateNews(); // This will create news about the stock split
			updateDisplay();
		}
	});
}

function marketCrashEvent() {
	if (Math.random() < 0.001) { // 0.1% chance each day
		stocks.forEach(stock => {
			stock.price *= 0.7; // 30% drop
		});
		marketSentiment = -1;
		generateNews();
		updateDisplay();
	}
}

function simulateDay() {
	updateStockPrices();
	botTrading();
	generateNews();
	updateMarketSentiment();
	checkForStockSplit();
	marketCrashEvent();
	day++;
	updateDisplay();
}

function init() {
	createChart();
	updateDisplay();

	setInterval(() => {
		simulateDay();
	}, 5000); // Simulate a new day every 5 seconds
}

document.addEventListener('DOMContentLoaded', init);
