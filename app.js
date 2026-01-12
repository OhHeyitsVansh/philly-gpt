const chatEl = document.getElementById("chat");
const inputEl = document.getElementById("input");
const sendBtn = document.getElementById("send");
const clearBtn = document.getElementById("clear");

function addBot(text) {
  const row = document.createElement("div");
  row.className = "msg bot";

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = "PG";

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = text;

  row.appendChild(avatar);
  row.appendChild(bubble);
  chatEl.appendChild(row);
  chatEl.scrollTop = chatEl.scrollHeight;
  return row;
}

function addUser(text) {
  const row = document.createElement("div");
  row.className = "msg user";

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = text;

  row.appendChild(bubble);
  chatEl.appendChild(row);
  chatEl.scrollTop = chatEl.scrollHeight;
  return row;
}

function addTyping() {
  const row = document.createElement("div");
  row.className = "msg bot";

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = "PG";

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.innerHTML = `<span class="typing"><span class="dot"></span><span class="dot"></span><span class="dot"></span></span>`;

  row.appendChild(avatar);
  row.appendChild(bubble);
  chatEl.appendChild(row);
  chatEl.scrollTop = chatEl.scrollHeight;
  return row;
}

function setDisabled(disabled) {
  sendBtn.disabled = disabled;
  inputEl.disabled = disabled;
}

async function sendMessage() {
  const message = (inputEl.value || "").trim();
  if (!message) return;

  addUser(message);
  inputEl.value = "";
  setDisabled(true);

  const typingNode = addTyping();

  try {
    const resp = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    const data = await resp.json();
    if (!resp.ok) throw new Error(data?.error || "Request failed");

    typingNode.remove();
    addBot(data.text || "(No response)");
  } catch (err) {
    typingNode.remove();
    addBot(`Error: ${err.message}`);
  } finally {
    setDisabled(false);
    inputEl.focus();
  }
}

// Greeting (proves app.js is running)
addBot("Hi! I’m Philly GPT. Ask me about 311-type issues, parking basics, and SEPTA tips.");

// Click send
sendBtn.addEventListener("click", () => sendMessage());

// Enter to send; Shift+Enter for new line
inputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// Clear button
clearBtn.addEventListener("click", () => {
  chatEl.innerHTML = "";
  addBot("Chat cleared. Ask a new Philly question whenever you’re ready.");
});

// Quick question buttons
document.querySelectorAll(".chip").forEach((btn) => {
  btn.addEventListener("click", () => {
    inputEl.value = btn.getAttribute("data-q") || "";
    inputEl.focus();
  });
});
