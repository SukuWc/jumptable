// background.js
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'open-popup') {
      browser.action.openPopup(); // Opens the popup
    }
  });
  

browser.commands.onCommand.addListener((command) => {
    console.log("Command", command);

    if (command === "open-popup") {
        browser.action.openPopup(); // user gesture satisfied
    }
});

// Listen for messages to switch tabs
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'switchTab') {
    // Get the current active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      const currentIndex = currentTab.index;

      // Get all tabs in the current window
      chrome.tabs.query({ currentWindow: true }, (allTabs) => {
        let newIndex;

        if (message.direction === 'left') {
          // Move to the left (previous tab)
          newIndex = currentIndex > 0 ? currentIndex - 1 : allTabs.length - 1;
        } else if (message.direction === 'right') {
          // Move to the right (next tab)
          newIndex = currentIndex < allTabs.length - 1 ? currentIndex + 1 : 0;
        }

        // Activate the new tab
        chrome.tabs.update(allTabs[newIndex].id, { active: true });
      });
    });
  }
});
