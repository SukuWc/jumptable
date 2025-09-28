/*
Just draw a border round the document.body.
*/
document.body.style.border = "5px solid red";

let controlPressTimer;
let controlPressCount = 0;


document.addEventListener("keydown", (event) => {
    if (event.key === "Control") {
        controlPressCount++;

        if (controlPressCount === 2) {

            
            browser.runtime.sendMessage({ action: 'open-popup' });
        }

        // Reset count after 1 second of inactivity
        clearTimeout(controlPressTimer);
        controlPressTimer = setTimeout(() => {
            controlPressCount = 0;
        }, 500);
    }
    else{
        controlPressCount = 0;
    }
});


browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Message received:", message);
    
    // Respond back to the background script
    if (message.greeting) {
      sendResponse({ reply: "Hello from content script!" });
    }

    if (message.script){
      const script = document.createElement('script');
      script.textContent = message.script;
      (document.head || document.documentElement).appendChild(script);
      script.remove(); // Clean up after execution
    }

  });