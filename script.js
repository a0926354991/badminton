let queue = [];
let courts = [];
let sortedQueue = [];
let selectedFromSorted = new Set();

function speak(text) {
  if ('speechSynthesis' in window) {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'zh-TW'; // 中文播報
    speechSynthesis.speak(utter);
  }
}

function initialize() {
  const count = parseInt(document.getElementById("courtCount").value);
  if (isNaN(count) || count <= 0) return alert("請輸入有效的場地數！");
  
  courts = Array.from({ length: count }, () => []);
  document.querySelector(".setup").style.display = "none";
  document.getElementById("main").style.display = "block";
  updateDisplay();
}

function signIn() {
  const name = document.getElementById("nameInput").value.trim();
  if (!name || queue.includes(name)) return;

  queue.push(name);
  document.getElementById("nameInput").value = "";
  updateDisplay();
}

function assignToCourts() {
  courts.forEach((court, index) => {
    if (court.length === 0 && queue.length >= 4) {
      courts[index] = queue.splice(0, 4);
      const players = courts[index].join("、");
      speak(`請 ${players} 至場地 ${index + 1}`);
    }
  });
  updateDisplay();
}

function endGame(index) {
  if (courts[index].length === 0) return;

  sortedQueue.push(...courts[index]);
  courts[index] = [];
  updateDisplay();
}

function toggleSelect(name) {
  if (selectedFromSorted.has(name)) {
    selectedFromSorted.delete(name);
  } else {
    selectedFromSorted.add(name);
  }
  updateDisplay();
}

function confirmSortedToQueue() {
  sortedQueue = sortedQueue.filter(name => {
    if (selectedFromSorted.has(name)) {
      queue.push(name);
      return false;
    }
    return true;
  });
  selectedFromSorted.clear();
  updateDisplay();
}

function updateDisplay() {
  // 更新等候區
  const queueList = document.getElementById("queueList");
  queueList.innerHTML = queue.map(name => `<li>${name}</li>`).join("");

  // 更新排序區
  const sortedList = document.getElementById("sortedList");
  sortedList.innerHTML = sortedQueue.map(name => {
    const isSelected = selectedFromSorted.has(name);
    return `<li class="sortable-name ${isSelected ? 'selected' : ''}" onclick="toggleSelect('${name}')">${name}</li>`;
  }).join("");

  // 更新球場區域
  const courtsArea = document.getElementById("courtsArea");
  courtsArea.innerHTML = "";

  courts.forEach((court, index) => {
    const courtDiv = document.createElement("div");
    courtDiv.className = "court";

    let playersHTML = "";
    court.forEach((name, i) => {
      playersHTML += `<div class="player-box player${i + 1}">${name}</div>`;
    });

    courtDiv.innerHTML = `
      <h3>🏸 場地 ${index + 1}</h3>
      <div class="court-image">
        ${playersHTML}
      </div>
      <button onclick="endGame(${index})">打完了</button>
    `;

    courtsArea.appendChild(courtDiv);
  });

  // 更新空場清單
  const emptyCourtsList = document.getElementById("emptyCourtsList");
  const emptyCourtNames = courts
    .map((court, index) => (court.length === 0 ? `場地 ${index + 1}` : null))
    .filter(name => name !== null);

  if (emptyCourtNames.length === 0) {
    emptyCourtsList.innerHTML = `<li>（目前無空場）</li>`;
  } else {
    emptyCourtsList.innerHTML = emptyCourtNames.map(name => `<li>${name}</li>`).join("");
  }
}
