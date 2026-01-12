const chatEl = document.getElementById("chat");
const inputEl = document.getElementById("input");
const sendBtn = document.getElementById("send");
const clearBtn = document.getElementById("clear");

function addMsg(text, who) {
  const wrap = document.createElement("div");
  wrap.className = `msg ${who}`;

  if (who !== "user") {
    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.textContent = "PG";
    wrap.appendChild(avatar);
  }

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = text;

  wrap.appendChild(bubble);
  chatEl.appendChild(wrap);
  chatEl.scrollTop = chatEl.scrollHeight;
  return wrap;
}

function addTyping() {
  const wrap = document.createElement("div");
  wrap.className = "msg bot";

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = "PG";
  wrap.appendChild(avatar);

  const bubble = document.createElement("div");
  bubble.className = "bubble";

  const typing = document.createElement("div");
  typing.className = "typing";
  typing.innerHTML = `<span class="dot"></span><span class="dot"></span><span class="dot"></span>`;
  bubble.appendChild(typing);

  wrap.appendChild(bubble);
  chatEl.appendChild(wrap);
  chatEl.scrollTop = chatEl.scrollHeight;
  return wrap;
}

function setDisabled(disabled) {
  sendBtn.disabled = disabled;
  inputEl.disabled = disabled;
}

async function sendMessage(message) {
  addMsg(message, "user");
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
    addMsg(data.text || "(No response)", "bot");
  } catch (err) {
    typingNode.remove();
    addMsg(`Error: ${err.message}`, "bot");
  } finally {
    setDisabled(false);
    inputEl.focus();
  }
}

// Initial greeting
addMsg(
  "Hi! I’m Philly GPT. Ask me about reporting issues, city services, parking basics, or transit. If something is time-sensitive, I’ll tell you how to verify it.",
  "bot"
);

// Send on button
sendBtn.addEventListener("click", () => {
  const message = inputEl.value.trim();
  if (!message) return;
  sendMessage(message);
});

// Send on Enter (but allow Shift+Enter for new line)
inputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    const message = inputEl.value.trim();
    if (!message) return;
    sendMessage(message);
  }
});

// Clear
clearBtn.addEventListener("click", () => {
  chatEl.innerHTML = "";
  addMsg(
    "Chat cleared. Ask a new Philly question whenever you’re ready.",
    "bot"
  );
});

// Quick question chips
document.querySelectorAll(".chip").forEach((btn) => {
  btn.addEventListener("click", () => {
    const q = btn.getAttribute("data-q");
    inputEl.value = q;
    inputEl.focus();
  });
});
