from transformers import pipeline
from flask import Flask,request,jsonify
from flask_cors import CORS
import os

classifier=None
sentiment=None
def init():
    global classifier,sentiment
    classifier=pipeline("text-classification",model="papluca/xlm-roberta-base-language-detection")
    sentiment=pipeline("text-classification",model="finiteautomata/bertweet-base-sentiment-analysis",return_all_scores=True)

init()
app=Flask(__name__)
CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

@app.route('/api/language-detection',methods=['POST'])
def languagedetection():
    data=request.json
    reponseBody=[]
    reqList=[]
    if isinstance(data,list):
        reqList=data
    else:
        reqList.append(data)
    for t in reqList:
        tweet=t['tweet_text']
        detectionResult=classifier(tweet)
        isEnglish=False
        if detectionResult[0]['label']=='en':
            isEnglish=True
        reponseBody.append({
            'tweet_text':tweet,
            'isEnglish':isEnglish
        })
    return jsonify(reponseBody)

@app.route('/api/sentiment-score',methods=['POST'])
def sentimentScore():
    data=request.json
    responseBody=[]
    reqList=[]
    if isinstance(data,list):
        reqList=data
    else:
        reqList.append(data)
    for t in reqList:
        tweet=t['tweet_text']
        sentimentResult=sentiment(tweet)
        maxV=0
        maxI=0
        for i in range(0,3):
            if sentimentResult[0][i]['score']>maxV:
                maxV=sentimentResult[0][i]['score']
                maxI=i
               # print(maxV,"      ",maxI)
        responseBody.append({
            'tweet_text':tweet,
            'sentiment_score':{
                'positive':sentimentResult[0][2]['score'],
                'neutral':sentimentResult[0][1]['score'],
                'negative':sentimentResult[0][0]['score'],
            },
            'detected_mood':sentimentResult[0][maxI]['label']
        })
    return jsonify(responseBody)
if __name__=="__main__":
    app.run(host='0.0.0.0',port=int(os.environ.get("PORT",8080)))
