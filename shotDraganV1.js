//建立撲克牌
const suits = ["♣️", "♦️", "♥️", "♠️"];
const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const suitOrder = { "♣️": 1, "♦️": 2, "♥️": 3, "♠️": 4 };
let deck = [];
const big = "big";
const small = "small";
const no = "no";
// 產生52張牌
function generateDeck() {
	deck = [];
	for (let suit of suits) {
		for (let value of values) {
			deck.push({ suit, value });
		}
	}
}
function drawCards(num, excludeCards = []) {
	let hand = [];
	let tempDeck = deck.filter(
		card => 
		!excludeCards.some(
			exclude => exclude.value === card.value && exclude.suit === card.suit
		)
	);

	for (let i = 0; i < num; i++) {
		let randomIndex = Math.floor(Math.random() * tempDeck.length);
		hand.push(tempDeck[randomIndex]);
		tempDeck.splice(randomIndex, 1); // 移除已抽出的牌
	}
	
	return hand;
}

function parseCard(cardText) {
	//let parts = cardText.split(" ");
	//return { suit: parts[0], value: parts[1] };
	let [suit, value] = cardText.split(" ");
	return { suit, value };
}


// 依據數字大小排序（若數字相同，依照花色順序）
function sortCards(cardA, cardB) {
	let valueA = getCardValue(cardA);
	let valueB = getCardValue(cardB);

	if (valueA !== valueB) {
		return valueA - valueB; // 數字小的排前面
	}
	return suitOrder[cardA.suit] - suitOrder[cardB.suit]; // 數字相同，花色小的排前面
}
// 顯示抽出的牌
function displayCards(cards, ids) {
	cards.forEach((card, index) => {
		//document.getElementById(ids[index]).value = `${card.suit}${card.value} `;//模組
		document.getElementById(ids[index]).value = card.suit + " " + card.value;
	});
}


//抽排
function draw() {
	generateDeck(); // 重新生成牌組
	let hand = drawCards(2); // 抽出兩張
	hand = hand.sort(sortCards);
	
	let firstValue = getCardValue(hand[0]);
	let secondValue = getCardValue(hand[1]);
	var compare = "";
	if (firstValue === secondValue) {
		compare = big;
	}else{
		compare = no;
	}
	document.querySelector('input[name="compare"][value="'+compare+'"]').checked = true;
	document.getElementById('card3').value = '';
	displayCards(hand, ["card1", "card2"]);

	//清空計算的機率
	let arrTb = [
		["resultShot" , "結果"]
		,["resultTableBody" , ""]
		,["rateTableBody" , ""]
	];
	for (let rowTb of arrRate) {
		let tb = document.getElementById(rowTb[0]);
		tb.innerHTML = rowTb[1];
	}
	return;
}

function getCompareType(firstCard , secondCard){
	let firstValue = getCardValue(firstCard);
	let secondValue = getCardValue(secondCard);
	
	let compareType = document.querySelector('input[name="compare"]:checked')?.value;
	
	if (firstValue === secondValue && compareType === no) {
		// 兩個數字一樣，沒有選擇「比大」或「比小」，則跳出警告
		alert("請選擇「比大」或「比小」");
		return null; // 直接 return null，讓主程式判斷是否要繼續執行
	}
	if (firstValue !== secondValue && compareType !== no) {
		// 兩個數字不一樣，沒有選擇「無」，則跳出警告
		alert("請選擇「無」");
		return null;
	}

	return compareType;
}
//射門
function shot() {
	let firstCardText = document.getElementById("card1").value;
	let secondCardText = document.getElementById("card2").value;
	
	
	if (!firstCardText || !secondCardText) {
		alert("請先按『抽牌』再射門！");
		return;
	}

	let firstCard = parseCard(firstCardText);
	let secondCard = parseCard(secondCardText);
	
	let compareType = getCompareType(firstCard , secondCard); 
	if(compareType === null){
		return;
	}
	
	let currentCards = [
		firstCard
		,secondCard
	];

	let hand = drawCards(1, currentCards);
	displayCards(hand, ["card3"]);
	
	var thirdCard = hand[0];
	var result = getWinLost(firstCard , secondCard , thirdCard , compareType);
	
	let resultShot = document.getElementById("resultShot");
	resultShot.innerText = "結果："+result;
	return;
}

// 轉換數字大小（A=1, 2~10, J=11, Q=12, K=13）
function getCardValue(card) {
	if (card.value === "A") return 1;
	if (card.value === "J") return 11;
	if (card.value === "Q") return 12;
	if (card.value === "K") return 13;
	return parseInt(card.value);
}

function compareCard(card1 , card2) {
	return card1.suit === card2.suit && card1.value === card2.value;
}

function  getWinLost(firstCard , secondCard , thirdCard , compareType){
	let firstValue = getCardValue(firstCard);
	let secondValue = getCardValue(secondCard);
	let cardValue = getCardValue(thirdCard);
	var result = "贏";
	if (cardValue === firstValue || cardValue === secondValue) {
		if(compareCard(firstCard , thirdCard )){
			result = "第一張牌";
		}else if(compareCard(secondCard , thirdCard )){
			result = "第二張牌";
		}else{
			result = "撞柱";
		}
	}else if (firstValue < secondValue) {
		if (cardValue > firstValue && cardValue < secondValue) {
			result = "贏";
		} else {
			result = "輸";
		}
	} else if (firstValue > secondValue) {
		if (cardValue < firstValue && cardValue > secondValue) {
			result = "贏";
		} else {
			result = "輸";
		}
	} else if (firstValue === secondValue) {
		if (compareType === big && cardValue > firstValue) {
			result = "贏";
		} else if (compareType === small && cardValue < firstValue) {
			result = "贏";
		} else {
			result = "輸";
		}
	}
	return result;
}
// 計算勝負並顯示表格
function showRate() {
	let firstCardText = document.getElementById("card1").value;
	let secondCardText = document.getElementById("card2").value;

	if (!firstCardText || !secondCardText) {
		alert("請先按『抽牌』再按「顯示勝率」！");
		return;
	}

	// 解析卡牌數據
	let firstCard = parseCard(firstCardText);
	let secondCard = parseCard(secondCardText);

	// 取得使用者選擇（比大 or 比小）
	let compareType = getCompareType(firstCard , secondCard); 
	if(compareType === null){
		return;
	}
	
	// 統計變數
	let winCount = 0, loseCount = 0, tieCount = 0, totalCount = 0;

	// 清空舊表格
	let resultTableBody = document.getElementById("resultTableBody");
	resultTableBody.innerHTML = "";

	// 遍歷 52 張牌，計算勝負
	
	for (let card of deck) {
		let state = "牌池";
		let result = "無";
		// 判斷勝負
		result = getWinLost(firstCard , secondCard , card , compareType);
		if(result === "贏"){
			winCount++;
		}else if(result === "輸"){
			loseCount++;
		}else if(result === "撞柱"){
			tieCount++;
		}else if(result === "第一張牌"){
			result = "無";
		}else if(result === "第二張牌"){
			result = "無";
		}
		// 新增一列到表格
		let row = resultTableBody.insertRow();
		row.insertCell(0).innerText = `${card.suit} ${card.value}`;
		row.insertCell(1).innerText = state;
		row.insertCell(2).innerText = result;
	}

	// 計算勝率
	totalCount = winCount + loseCount + tieCount;
	let winRate = totalCount > 0 ? (winCount / totalCount * 100) : 0;
	let lostRate = totalCount > 0 ? (loseCount / totalCount * 100) : 0;
	let tieRate = ((100 - (winRate + lostRate)));
	
	let showWinRate = winRate.toFixed(2) + "%";
	let showLostRate = lostRate.toFixed(2) + "%";
	let showTieRate = tieRate.toFixed(2) + "%";
	
	// 顯示勝率
	// 清空舊表格
	let rateTableBody = document.getElementById("rateTableBody");
	rateTableBody.innerHTML = "";
	
	let arrRate = [
		["贏" , showWinRate]
		,["輸" , showLostRate]
		,["撞住" , showTieRate]
	];
	
	for (let rowRate of arrRate) {
		let row = rateTableBody.insertRow();
		row.insertCell(0).innerText = rowRate[0];
		row.insertCell(1).innerText = rowRate[1];
	}
	return;
}

