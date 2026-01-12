const chatEl = document.getElementById("chat");
const form = document.getElementById("form");
const input = document.getElementById("input");
const sendBtn = document.getElementById("send");

function addMsg(text, who) {
  const div = document.createElement("div");
  div.className = `msg ${who}`;
  div.textContent = text;
  chatEl.appendChild(div);
  chatEl.scrollTop = chatEl.scrollHeight;
}

addMsg("Hi! Ask me about Philly services like 311, transit, parking basics, and city resources.", "bot");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = input.value.trim();
  if (!message) return;

  addMsg(message, "user");
  input.value = "";
  sendBtn.disabled = true;

  try {
    const resp = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    const data = await resp.json();
    if (!resp.ok) throw new Error(data?.error || "Request failed");

    addMsg(data.text || "(No response text)", "bot");
  } catch (err) {
    addMsg(`Error: ${err.message}`, "bot");
  } finally {
    sendBtn.disabled = false;
    input.focus();
  }
});
