//建立撲克牌
const suits = ["♣️", "♦️", "♥️", "♠️"];
const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const suitOrder = { "♣️": 1, "♦️": 2, "♥️": 3, "♠️": 4 };

const valuesNum = {
	'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, 
	'8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13
};
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
//觀看規則
function checkRule() {
	var checkRule = document.getElementById('checkRule');
	var checkRuleBtn = document.getElementById('checkRuleBtn');
	if(checkRule.style.display == 'none'){
		checkRule.style.display = 'inline';
		checkRuleBtn.innerHTML = '隱藏規則'
	}else{
		checkRule.style.display = 'none';
		checkRuleBtn.innerHTML = '觀看規則'
	}
	
}
//抽排
function draw() {
	generateDeck(); // 重新生成牌組
	let hand = drawCards(2); // 抽出兩張
	hand = hand.sort(sortCards);
	
	let firstValue = getCardValue(hand[0]);
	let secondValue = getCardValue(hand[1]);
	var compare = "";
	
	let retDisable = [];//可否編輯
	if (firstValue === secondValue) {
		compare = big;
		retDisable = [
			["no" , true]
			,["big" , false]
			,["small" , false]
		];
		
	}else{
		compare = no;
		retDisable = [
			["no" , false]
			,["big" , true]
			,["small" , true]
		];
	}
	document.querySelector('input[name="compare"][id="'+compare+'"]').checked = true;
	for (let rowDisable of retDisable) {
		document.getElementById(rowDisable[0]).disabled = rowDisable[1];
	}
	
	
	document.getElementById('card3').value = '';
	displayCards(hand, ["card1", "card2"]);

	////清空計算的機率
	//let arrTb = [
	//	["resultShot" , "結果："]
	//	,["resultTableBody" , ""]
	//	,["rateTableBody" , ""]
	//];
	//for (let rowTb of arrTb) {
	//	let tb = document.getElementById(rowTb[0]);
	//	tb.innerHTML = rowTb[1];
	//}
	showRate();
	
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
	return valuesNum[card.value];
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
	var winCount = 0, loseCount = 0, tieCount = 0, totalCount = 0;

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
			state = result;
			result = "無";
		}else if(result === "第二張牌"){
			state = result;
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
	var winRate = totalCount > 0 ? (winCount / totalCount * 100) : 0;
	var lostRate = totalCount > 0 ? (loseCount / totalCount * 100) : 0;
	//var tieRate = ((100 - (winRate + lostRate)));
	var tieRate = totalCount > 0 ? (tieCount / totalCount * 100) : 0;
	
	var strWinRate = winCount.toString() + "/" + totalCount.toString();
	var strLostRate = loseCount.toString() + "/" + totalCount.toString();
	var strTieRate = tieCount.toString() + "/" + totalCount.toString();
	
	var showWinRate = winRate.toFixed(2) + "%";
	var showLostRate = lostRate.toFixed(2) + "%";
	var showTieRate = tieRate.toFixed(2) + "%";
	
	// 顯示勝率
	// 清空舊表格
	let rateTableBody = document.getElementById("rateTableBody");
	rateTableBody.innerHTML = "";
	
	let arrRate = [
		//狀態,勝率,計算方式
		["贏" , showWinRate,strWinRate]
		,["輸" , showLostRate,strLostRate]
		,["撞柱" , showTieRate,strTieRate]
	];
	
	for (let rowRate of arrRate) {
		let row = rateTableBody.insertRow();
		//console.log("===="+rowRate.length);
		for (let i = 0; i < rowRate.length; i++) {
			let cell = row.insertCell(i);
			cell.innerText = rowRate[i];
			//console.log("===="+rowRate[i]);
			if(i == 2){//計算方式
				cell.classList.add("text-right");// 讓「計算方式」靠右，增加CSS
			}
		}
	}
	return;
}
