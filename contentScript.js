let languageDetectUrlForTest="localhost:5000/api/language-detection"
let sentimentScoreUrlForTest="localhost:5000/api/sentiment-score"
let languageDetectUrl = "https://mola-2hy6h5prjq-uw.a.run.app/api/language-detection";
let sentimentScoreUrl = "https://mola-2hy6h5prjq-uw.a.run.app/api/sentiment-score";

async function getMood(tweetText) {
  let langDetectResJson
  try{
    let langDetectRes = await fetch(languageDetectUrl, {
      method: "POST",
      body: JSON.stringify({ tweet_text: tweetText }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    langDetectResJson = await langDetectRes.json();
  }catch(error){
    console.log("Error:",error)
    return null
  }
  for (const oneTweet of langDetectResJson) {
    if (oneTweet.isEnglish == true) {
      try{
        let sentiRes = await fetch(sentimentScoreUrl, {
          method: "POST",
          body: JSON.stringify({ tweet_text: oneTweet.tweet_text }),
          headers: {
            "Content-Type": "application/json",
          },
        });
        let sentiResJson = await sentiRes.json();
        console.log(sentiResJson);
        return sentiResJson
      }catch(error){
        console.log('Error',error)
      }
    }
  }
  return null
}
function appendMoodAndEmoji(tweet,sentiRes){
    let targetEle=tweet.querySelector('time').parentElement.parentElement
    let moodEle=targetEle.cloneNode(true)
    let oldChild=moodEle.firstChild
    let newChild=document.createElement('div')
    newChild.innerHTML="&nbsp;·&nbsp;Detected Mood:&nbsp;"
    console.log(sentiRes.detected_mood)
    if (sentiRes.detected_mood=='POS'){
        console.log('I am happy')
        newChild.innerHTML+="😊"
    }else if(sentiRes.detected_mood=='NEG'){
        console.log('I am sad')
        newChild.innerHTML+="☹️ "
    }else if(sentiRes.detected_mood=='NEU'){
        console.log('I am natural')
        newChild.innerHTML+="😐"
    }
    newChild.classList=oldChild.classList
    moodEle.replaceChild(newChild,oldChild)
    moodEle.setAttribute("mola-extension","ext")
    targetEle.append(moodEle)
}
async function solve(oneTweet){
    let tweetText = oneTweet.querySelector("[data-testid=tweetText]").innerText;
    console.log(tweetText);
    let sentiRes=await getMood(tweetText)
    if(sentiRes!=null){
        appendMoodAndEmoji(oneTweet,sentiRes[0])
    }else{
      chrome.runtime.sendMessage({type:"error"})
    }
}
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log(request.type)
  if(request.type=="execute"){
    let allTweets = document.querySelectorAll("[data-testid=tweet]");
    for (const oneTweet of allTweets) {
      if(oneTweet.querySelector("[mola-extension=ext]")==null){
        solve(oneTweet)
      }
    }
  }  
});
