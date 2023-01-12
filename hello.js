mybtn=document.getElementById("btn1")
mybtn.addEventListener("click",myclick)
function myclick(){
    console.log("click!!!!!!!!!!!!!!")
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { greeting: "Hello from the popup!" });
      });
}