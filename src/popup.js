
let storedPreviousKeys = [];
let predictDefaultKeys = false;

document.addEventListener("keydown", (event) => {


    if (event.key === "Escape") {
        this.closeDialog();
    }



    if (["0","1","2","3","4","5","6","7","8","9"].includes(event.key)) {
        console.log("Pressed " + event.key);

        storedPreviousKeys.push(Number(event.key));

        document.getElementById("search").innerText = JSON.stringify(storedPreviousKeys);

        const root = document.getElementById("root")
        tryOpenLink(root, storedPreviousKeys);

    }

    const links = Array.from(document.querySelectorAll('a')); // Get all links
    const activeElement = document.activeElement;
    const currentIndex = links.indexOf(activeElement); // Find currently focused link

    if (event.key === 'ArrowDown') {
      event.preventDefault(); // Prevent default scrolling behavior
      const nextIndex = (currentIndex + 1) % links.length; // Circular navigation
      links[nextIndex].focus(); // Focus the next link
    } else if (event.key === 'ArrowUp') {
      event.preventDefault(); // Prevent default scrolling behavior
      const prevIndex = (currentIndex - 1 + links.length) % links.length; // Circular navigation
      links[prevIndex].focus(); // Focus the previous link
    }

    if (event.key === "Enter") {
        setTimeout(() => {
            window.close();
        }, 10);
    }

    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        browser.runtime.sendMessage({
            action: 'switchTab',
            direction: event.key === 'ArrowLeft' ? 'right' : 'left',
          });
      }

});





function tryOpenLink(rootElement, previousKeys){

    try {
        const allListItems = document.querySelectorAll("li");
        for (let i = 0; i < allListItems.length; i++) {
            console.log("grey")
            allListItems[i].style.color = "grey";
        }
        const allLinkItems = document.querySelectorAll("a");
        for (let i = 0; i < allLinkItems.length; i++) {
            console.log("grey")
            allLinkItems[i].style.color = "grey";
        }

        const childElements = rootElement.querySelectorAll("a");
        for (let i = 0; i < childElements.length; i++) {
            childElements[i].style.color = "";
        }

        const childElementsLi = rootElement.querySelectorAll("li");
        for (let i = 0; i < childElementsLi.length; i++) {
            childElementsLi[i].style.color = "black";
        }
        
    } catch (error) {
        console.log("FAIL")
    }




    console.log("Try Open Link", rootElement, previousKeys)

    if (previousKeys.length === 0){

        if (rootElement == null){
            console.log("RESET")
            const childElements = document.querySelectorAll("a");
            for (let i = 0; i < childElements.length; i++) {
                childElements[i].style.color = "";
            }
    
            const childElementsLi = document.querySelectorAll("li");
            for (let i = 0; i < childElementsLi.length; i++) {
                childElementsLi[i].style.color = "black";
            }
            
            if (predictDefaultKeys){
                storedPreviousKeys = [1];
            }
            else{
                storedPreviousKeys = [];
            }
            document.getElementById("search").innerText = JSON.stringify(storedPreviousKeys);
        }
    
        console.log("Open root", rootElement.childNodes[0])
        rootElement.childNodes[0].click();
    
        setTimeout(() => {
            window.close();
        }, 10);
    
        return;
    }
  

    let root = rootElement;

    console.log("ROOT", rootElement)

    const nextItem = root.querySelector('ol > li:nth-child('+previousKeys[0]+')');
    console.log("Next", nextItem)


    tryOpenLink(nextItem, previousKeys.slice(1));



}

document.addEventListener('DOMContentLoaded', () => {
    browser.bookmarks.getTree((bookmarkTreeNodes) => {

        function findFolder(node, targetTitle) {
            if (node.title === targetTitle) {
                console.log('Found folder:', node);
                return node; // Return the folder object
            }
    
            // If the node has children, search recursively
            if (node.children) {
                for (let child of node.children) {
                    let result = findFolder(child, targetTitle);
                    if (result) {
                        return result;
                    }
                }
            }
    
            return null; // Folder not found at this node
        }
    
        // Start searching for "Other Bookmarks" or "Jumpable"
        const rootNode = bookmarkTreeNodes[0];
        const targetFolder = findFolder(rootNode, 'Other Bookmarks'); // Replace with "Jumpable" if needed
    
        if (targetFolder) {
            console.log('Target folder details:', targetFolder);

            const jumptable_folder = findFolder(targetFolder, 'Jumptable')

            if (jumptable_folder){

            const bookmarkList = document.getElementById('bookmarks');
            bookmarkList.id = "root";
            
      
                browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    const locationElement = document.getElementById('location');
                    const url = tabs[0].url;
                    displayBookmarkLinks(filterBookmarks(jumptable_folder, url), bookmarkList);
                    
                    
                    
                  
                });

              
                    
            }
            
        } else {
            console.log('Folder not found');
        }



    });

  });


  function filterBookmarks(bookmarks, url) {

    let newchildren = bookmarks.children.filter((bookmark) => {
        console.log("Bookmark", bookmark)
      return url.includes(bookmark.title);
    });

    if (newchildren.length == 1) {
        predictDefaultKeys = true;
        storedPreviousKeys = [1];
        document.getElementById("search").innerText = JSON.stringify(storedPreviousKeys);
    }
    else{
        predictDefaultKeys = false;        
        storedPreviousKeys = [];
        document.getElementById("search").innerText = JSON.stringify(storedPreviousKeys);
    }

    return {children: newchildren}
  }
  
  function displayBookmarkLinks(node, parentElement) {

    console.log("Display Bookmark Links", node)

    let linkListItem;
   
    if (node.children) {
        linkListItem = document.createElement("li");
        if (node.title){
            linkListItem.innerHTML = node.title;
        }
    }
    else{ 
        
        linkListItem = document.createElement("li");
        const linkListItemAnchor = document.createElement("a");
        linkListItemAnchor.href = node.url;
        if (node.url.startsWith("javascript:")){
           
            const script = decodeURIComponent(node.url.substring("javascript:".length))
            linkListItemAnchor.addEventListener("click", (event) => {
                event.preventDefault();
                browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                    if (tabs.length > 0) {
                      const activeTabId = tabs[0].id;
                      browser.tabs.sendMessage(activeTabId, { greeting: "Hello from background!", script: script}, function (response) {
                        console.log(response?.reply);
                      });
                    }
                  });
            });
        }else{
            linkListItemAnchor.target = "_blank";
        }


        linkListItemAnchor.innerHTML = node.title || 'No title';
        linkListItem.appendChild(linkListItemAnchor);

    }



    parentElement.appendChild(linkListItem);
  
        if (node.children) {
            
          const childList = document.createElement('ol');
          linkListItem.appendChild(childList);

          node.children.forEach((child) => {
                displayBookmarkLinks(child, childList)
        });
        }

  }