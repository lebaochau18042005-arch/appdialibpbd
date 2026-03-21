document.getElementById('collectBtn').addEventListener('click', async () => {
  const errorMsg = document.getElementById('errorMsg');
  errorMsg.style.display = 'none';

  // Get current active tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length === 0) return;
    const tab = tabs[0];

    // Inject script to get selected text
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: () => window.getSelection().toString()
    }, (results) => {
      if (!results || results.length === 0) return;
      
      const selectedText = results[0].result;
      if (selectedText && selectedText.trim().length > 0) {
        // Text found -> encode it and open the Teacher app page
        const encodedText = encodeURIComponent(selectedText.trim());
        // For development, you can use localhost:5173 or the deployed Vercel URL
        const targetUrl = `https://appdialibpbd.vercel.app/teacher?autoContext=${encodedText}`;
        chrome.tabs.create({ url: targetUrl });
      } else {
        // No text highlighted
        errorMsg.style.display = 'block';
      }
    });
  });
});
