const users = ["Quân", "Tú Anh", "Nam Khánh", "Hậu", "Minh Khánh", "Quang Vinh", "Trí", "Nguyễn Thư", "Phạm Thư", "Kiệt", "Quốc Anh"];
const messages = [
  "Tôi không làm gì sai cả!", "Tôi bị cấm nhầm!", "Cho tôi chơi tiếp đi!",
  "Tôi bị người khác vu khống", "Tôi chỉ nói vui thôi mà!"
];
const toxicWords = ["đồ ngu", "câm mồm", "chết đi"];
const voiceToxic = ["la hét", "nói tục", "đe dọa"];
const behaviors = ["AFK", "spam", "phá game"];

let toxicCount = 0, voiceCount = 0, behaviorCount = 0;
let bannedPlayers = [];
let violationCounts = {};  // Lưu số lần vi phạm của từng người chơi
let intervalId = null;

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function simulateViolations() {
  const name1 = randomFrom(users);
  const name2 = randomFrom(users);
  const name3 = randomFrom(users);

  const chat = Math.random() > 0.5;
  const voice = Math.random() > 0.5;
  const behavior = Math.random() > 0.5;

  if (chat) {
    const word = randomFrom(toxicWords);
    document.getElementById("chatOutput").innerHTML = `<span style='color:red;'>${name1} nói: ${word}</span>`;
    toxicCount++;
    logPenalty("chat", name1, word);
  } else {
    document.getElementById("chatOutput").innerHTML = `<span style='color:lime;'>${name1} đang trò chuyện bình thường</span>`;
  }

  if (voice) {
    const v = randomFrom(voiceToxic);
    document.getElementById("voiceOutput").innerHTML = `<span style='color:red;'>${name2} voice: ${v}</span>`;
    voiceCount++;
    logPenalty("voice", name2, v);
  } else {
    document.getElementById("voiceOutput").innerHTML = `<span style='color:lime;'>${name2} voice an toàn</span>`;
  }

  if (behavior) {
    const b = randomFrom(behaviors);
    document.getElementById("behaviorResult").innerHTML = `<span style='color:red;'>${name3} hành vi: ${b}</span>`;
    behaviorCount++;
    logPenalty("behavior", name3, b);
  } else {
    document.getElementById("behaviorResult").innerHTML = `<span style='color:lime;'>${name3} chơi game bình thường</span>`;
  }

  document.getElementById("toxicCount").textContent = toxicCount;
  document.getElementById("voiceCount").textContent = voiceCount;
  document.getElementById("behaviorCount").textContent = behaviorCount;
}

function logPenalty(type, name, detail) {
  if (!violationCounts[name]) violationCounts[name] = 0;
  violationCounts[name]++;

  let action = "";
  let banTimeSeconds = 0;

  if (violationCounts[name] === 1) {
    action = "Cảnh cáo";
  } else if (violationCounts[name] === 2) {
    action = "Phạt 12 tiếng";
    banTimeSeconds = 12 * 3600;
    autoBan(name, banTimeSeconds);
  } else if (violationCounts[name] >= 3) {
    action = "Phạt 3 ngày";
    banTimeSeconds = 3 * 24 * 3600;
    autoBan(name, banTimeSeconds);
  }

  const log = document.getElementById("penaltyLog");
  const entry = document.createElement("div");
  entry.className = `penalty-log-entry penalty-${type}`;

  let videoButtonHTML = "";
  if (type === "behavior") {
    videoButtonHTML = `<button onclick="showVideo('${name}', '${type}', '${detail}')">Xem video</button>`;
  }

  entry.innerHTML = `<strong>${name}</strong> (${type}): ${detail} — <em>${action}</em> ${videoButtonHTML}`;
  log.appendChild(entry);
}

function autoBan(name, duration) {
  if (!bannedPlayers.includes(name)) {
    bannedPlayers.push(name);
    updateBannedList();
    document.getElementById("playerStatus").innerHTML = `🔴 ${name} bị cấm trong ${duration / 3600} giờ`;
    setTimeout(() => {
      unbanAuto(name);
    }, duration * 1000);
  }
}

function unbanAuto(name) {
  bannedPlayers = bannedPlayers.filter(p => p !== name);
  document.getElementById("playerStatus").innerHTML = `🟢 ${name} đã hết hạn cấm tự động.`;
  updateBannedList();
}

function showVideo(name, type, detail) {
  alert(`Giả lập video vi phạm của ${name} (${type}): ${detail}`);
}

function toggleInbox() {
  const inbox = document.getElementById("inboxContainer");
  if (inbox.style.display === "none") {
    inbox.style.display = "block";
    generateInbox();
  } else {
    inbox.style.display = "none";
    document.getElementById("chatDetail").style.display = "none";
  }
}

function generateInbox() {
  const inboxList = document.getElementById("inboxList");
  inboxList.innerHTML = "";
  for (let i = 0; i < 5; i++) {
    const div = document.createElement("div");
    const name = randomFrom(users);
    const content = randomFrom(messages);
    div.textContent = `${name}: ${content}`;
    div.onclick = () => openChat(name, content);
    inboxList.appendChild(div);
  }
}

function openChat(name, content) {
  document.getElementById("chatPlayerName").textContent = name;
  document.getElementById("chatDetail").style.display = "block";
  const chatMessages = document.getElementById("chatMessages");
  chatMessages.innerHTML = `<div><b>${name}:</b> ${content}</div>`;
}

function sendReply() {
  const reply = document.getElementById("adminReply").value;
  if (reply) {
    document.getElementById("chatMessages").innerHTML += `<div><b>Admin:</b> ${reply}</div>`;
    document.getElementById("adminReply").value = "";
  }
}

function login() {
  document.getElementById("loginContainer").style.display = "none";
  document.getElementById("mainContent").style.display = "block";
  document.getElementById("logoutBtn").style.display = "inline-block";
  document.getElementById("inboxBtn").style.display = "inline-block";
  intervalId = setInterval(simulateViolations, 5000);
}

function logout() {
  clearInterval(intervalId);
  document.getElementById("mainContent").style.display = "none";
  document.getElementById("loginContainer").style.display = "block";
  document.getElementById("logoutBtn").style.display = "none";
  document.getElementById("inboxBtn").style.display = "none";
  document.getElementById("penaltyLog").innerHTML = "";
  document.getElementById("bannedList").innerHTML = "";
  bannedPlayers = [];
  violationCounts = {};
  toxicCount = voiceCount = behaviorCount = 0;
  document.getElementById("toxicCount").textContent = "0";
  document.getElementById("voiceCount").textContent = "0";
  document.getElementById("behaviorCount").textContent = "0";
  document.getElementById("playerStatus").innerHTML = "";
}

function banPlayer() {
  const name = document.getElementById("searchName").value;
  const duration = parseInt(document.getElementById("banDuration").value);
  if (name && duration) {
    if (!bannedPlayers.includes(name)) {
      bannedPlayers.push(name);
      updateBannedList();
      document.getElementById("playerStatus").innerHTML = `🔴 ${name} bị cấm trong ${duration} giây`;
      setTimeout(() => {
        unbanAuto(name);
      }, duration * 1000);
    }
  }
}

function unbanPlayer() {
  const name = document.getElementById("searchName").value;
  bannedPlayers = bannedPlayers.filter(p => p !== name);
  document.getElementById("playerStatus").innerHTML = `🟢 ${name} đã được gỡ cấm.`;
  updateBannedList();
}

function updateBannedList() {
  const ul = document.getElementById("bannedList");
  ul.innerHTML = "";
  bannedPlayers.forEach(p => {
    const li = document.createElement("li");
    li.textContent = p;
    ul.appendChild(li);
  });
}

function searchPlayer() {
  const name = document.getElementById("searchName").value.toLowerCase();
  const logs = document.querySelectorAll("#penaltyLog .penalty-log-entry");
  logs.forEach(log => {
    const text = log.textContent.toLowerCase();
    log.style.display = text.includes(name) ? "block" : "none";
  });
}

function changeLang() {
  const lang = document.getElementById("langSelector").value;
  const vi = {
    inboxLabel: "Hộp thư",
    logoutLabel: "Đăng xuất",
    inboxTitle: "Hộp thư người chơi",
    title: "Bảng điều khiển giám sát Toxic",
    chatTitle: "Lọc chat độc hại",
    toxicLabel: "Tin nhắn độc hại:",
    voiceTitle: "Phân tích voice chat",
    voiceLabel: "Voice cảnh báo:",
    behaviorTitle: "Phân tích hành vi",
    behaviorLabel: "Hành vi nghi vấn:",
    penaltyTitle: "Cảnh cáo & hình phạt",
    bannedListTitle: "Danh sách bị cấm:",
    penaltyLogTitle: "Nhật ký hình phạt:"
  };
  const en = {
    inboxLabel: "Inbox",
    logoutLabel: "Logout",
    inboxTitle: "Player Inbox",
    title: "Toxic Monitoring Dashboard",
    chatTitle: "Toxic Chat Filter",
    toxicLabel: "Toxic Messages:",
    voiceTitle: "Voice Chat Analysis",
    voiceLabel: "Voice Warnings:",
    behaviorTitle: "Behavior Analysis",
    behaviorLabel: "Suspicious Behavior:",
    penaltyTitle: "Warnings & Penalties",
    bannedListTitle: "Banned Players:",
    penaltyLogTitle: "Penalty Log:"
  };
  const dict = lang === "en" ? en : vi;
  for (const key in dict) {
    const el = document.getElementById(key);
    if (el) el.textContent = dict[key];
  }
}
