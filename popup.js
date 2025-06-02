document.getElementById('scan-btn').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: () => {
          window.dispatchEvent(new Event('GPT_SCAN_TRIGGERED'));
        }
      });
    });
  });
  