chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'generate_text') {
      const prompt = message.prompt;
  
      fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer OPEN_AI_API_KEY' // 🔐 Replace safely in production
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 100
        })
      })
        .then(res => res.json())
        .then(data => {
          const reply = data.choices?.[0]?.message?.content || "No response generated.";
          sendResponse({ reply });
        })
        .catch(error => {
          console.error('OpenAI API error:', error);
          sendResponse({ reply: "Error generating text." });
        });
  
      return true;
    }
  });
  