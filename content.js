function logToUI(message) {
    const logBox = document.getElementById('gpt-ui-log');
    if (logBox) {
      const entry = document.createElement('div');
      entry.textContent = message;
      logBox.appendChild(entry);
    }
  }
  
  function generateWithGPT(promptText, callback) {
    chrome.runtime.sendMessage(
      { type: 'generate_text', prompt: `Write a helpful response to: "${promptText}"` },
      response => callback(response.reply)
    );
  }
  
  function scanAndFillFields() {
    const fields = document.querySelectorAll('textarea, input[type="text"]');
  
    fields.forEach(field => {
      const labelEl = field.closest('div')?.querySelector('label, .text-sm.font-medium');
      const labelText = labelEl?.innerText?.trim();
  
      if (labelText) {
        logToUI(`⏳ Generating for: "${labelText}"`);
        generateWithGPT(labelText, generatedText => {
          field.value = generatedText;
          field.dispatchEvent(new Event('input', { bubbles: true }));
          logToUI(`✅ Filled: "${generatedText}"`);
        });
      } else {
        logToUI('⚠️ Skipped field (no label)');
      }
    });
  }
  
  function createFloatingUI() {
    const container = document.createElement('div');
    container.id = 'gpt-ui-log';
    container.style.position = 'fixed';
    container.style.bottom = '10px';
    container.style.right = '10px';
    container.style.width = '300px';
    container.style.maxHeight = '300px';
    container.style.overflowY = 'auto';
    container.style.backgroundColor = '#fff';
    container.style.border = '1px solid #ccc';
    container.style.padding = '10px';
    container.style.zIndex = 99999;
    container.style.fontSize = '12px';
    container.style.fontFamily = 'monospace';
    container.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    container.innerHTML = '<strong>GPT Form Filler Log</strong><hr />';
    document.body.appendChild(container);
  }
  
  window.addEventListener('GPT_SCAN_TRIGGERED', () => {
    createFloatingUI();
    scanAndFillFields();
  });
  