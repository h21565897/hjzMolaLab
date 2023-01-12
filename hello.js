mybtn=document.getElementById("btn1")
mybtn.addEventListener("click",myclick)
messageb=document.getElementById("messageb")
function myclick(){
    messageb.innerText=""
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { type:"execute" });
      });
}
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if(request.type=="error"){
    //Todo: proceed different kinds of errors
    messageb.innerText="Something tweets may be wrong and do not proceeed successfully"
  }
});
