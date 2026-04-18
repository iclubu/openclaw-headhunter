require('dotenv').config();

const TeleBot = require('telebot');
const axios = require('axios');
const fs = require('fs');

// 🔐 TOKENS (loaded securely from .env)
const bot = new TeleBot(process.env.TELEGRAM_TOKEN);
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// 🔎 Local SearXNG
const SEARXNG_URL = 'http://127.0.0.1:8080/search';

// ==========================
// 🔍 SEARCH FUNCTION
// ==========================
async function getSearchData(query) {
    try {
        // 🔥 Target real job boards
        const enhancedQuery = `${query} ("SOC Analyst" OR "Security Operations Center" OR "SOC Engineer") remote (jobs OR careers) site:lever.co OR site:greenhouse.io OR site:ashbyhq.com OR site:workdayjobs.com`;

        const res = await axios.get(SEARXNG_URL, {
            params: { q: enhancedQuery, format: 'json' },
            timeout: 5000
        });

        if (!res.data.results || res.data.results.length === 0) {
            return "No relevant job results found.";
        }

        // 🔥 Use more results + include URLs
        return res.data.results
            .slice(0, 8)
            .map(r => `TITLE: ${r.title}\nURL: ${r.url}\nSNIPPET: ${r.content}`)
            .join('\n\n');

    } catch (err) {
        console.error('[SearXNG Error]', err.message);
        return "No real-time data available. Use general knowledge of SOC and Detection Engineer roles.";
    }
}

// ==========================
// 🤖 TELEGRAM HANDLER
// ==========================
bot.on('text', async (msg) => {

    // ==========================
    // 🔄 AGENT SWITCH COMMAND
    // ==========================
    if (msg.text && msg.text.startsWith("/agent")) {
        const parts = msg.text.split(" ");
        const selectedAgent = parts[1] || "main";

        const stateFile = "/home/iclubu/.openclaw/state/active_agent.json";

        let state = {};
        try {
            state = JSON.parse(fs.readFileSync(stateFile));
        } catch (e) {
            state = { telegram: {} };
        }

        state.telegram[msg.from.id] = selectedAgent;

        fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));

        bot.sendMessage(msg.chat.id, `✅ Switched agent to: ${selectedAgent}`);
        return;
    }

    console.log(`[Query] ${msg.text}`);
    msg.reply.action('typing');

    // ==========================
    // 🔍 GET SEARCH DATA
    // ==========================
    const searchContext = await getSearchData(msg.text);

    // ==========================
    // 👤 LOAD PROFILE
    // ==========================
    let profile = "";
    try {
        profile = fs.readFileSync('/home/iclubu/.openclaw/headhunter_profile.json', 'utf8');
    } catch (e) {
        console.log("No profile loaded");
    }

    // ==========================
    // 🔥 LOAD ACTIVE AGENT
    // ==========================
    let activeAgent = "main";
    try {
        const state = JSON.parse(fs.readFileSync('/home/iclubu/.openclaw/state/active_agent.json'));
        activeAgent = state.telegram?.[msg.from.id] || "main";
    } catch (e) {
        console.log("No agent state found");
    }

    // ==========================
    // 🧠 AI REQUEST
    // ==========================
    try {
        const response = await axios.post(
            'https://models.inference.ai.azure.com/chat/completions',
            {
                model: 'gpt-4o',
                messages: [
                    {
                        role: "system",
                        content: `You are a ${activeAgent === "headhunter" ? "professional cybersecurity headhunter" : "SOC assistant"}.

STRICT RULES:
- ONLY use jobs from SEARCH RESULTS
- DO NOT invent companies or roles
- ONLY include jobs that clearly match the user's request
- EXCLUDE GRC, compliance, or unrelated roles unless requested
- If fewer than 5 valid matches exist, return fewer

Return EXACT format:

Job Title:
Company:
Match Score:
Why it matches:
Missing skills:
URL:

CANDIDATE PROFILE:
${profile}

SEARCH RESULTS:
${searchContext}
`
                    },
                    {
                        role: "user",
                        content: msg.text
                    }
                ],
                max_tokens: 1000
            },
            {
                headers: {
                    'Authorization': `Bearer ${GITHUB_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        // ==========================
        // 📤 SAFE RESPONSE HANDLING
        // ==========================
        if (!response.data.choices || !response.data.choices.length) {
            msg.reply.text("⚠️ No response from AI.");
            return;
        }

        const reply = response.data.choices[0].message.content;
        msg.reply.text(reply);

    } catch (err) {
        console.error('[AI Error]', err.response ? err.response.data : err.message);
        msg.reply.text("⚠️ Error connecting to AI. Check logs.");
    }
});

// ==========================
// 🚀 START BOT
// ==========================
console.log('🚀 Upgraded SOC Bot with Search + Agents is starting...');
bot.start();
