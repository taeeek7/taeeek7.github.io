---
title: 'slack_bolt로 슬랙봇 만들기'
description: 'Slack Bolt 라이브러리로 실제 동작하는 슬랙봇을 만들어본 기록.'
pubDate: 2024-06-11
tags: ['Slack', 'Python', '슬랙봇']
---

업무 요청을 한 채널에서 받고 답변할 수 있도록 슬랙봇을 만들기로 했다.

모달창을 띄우고 이모지 반응도 처리해야 해서 슬랙에서 제공하는 Python 라이브러리 `slack_bolt`를 골랐다.

### slack_bolt란?

>slack_bolt는 Slack의 Python용 봇 개발 프레임워크다.<br/>
>메시지 응답, 명령 실행, 이벤트 처리를 지원한다.<br/>
>이벤트별로 함수를 연결해 봇의 동작을 정의할 수 있다.


### 패키지 다운로드

```pip3 install slack_bolt```

### app.py 예시

```
from slack_bolt import App
from slack_bolt.adapter.socket_mode import SocketModeHandler

# 앱 호출
app = App(token= slack_bot_token) ## 슬랙 API 페이지에서 생성한 슬랙앱의 bot token이 필요합니다.

# 안녕이라는 메시지에 답변하는 함수 제작  
@app.message("안녕")
def message_hello(message, say) :
    if message["text"] == "안녕" :
        say("어쩌라고?!👻")
    else :
        pass


# main 함수
if __name__ == "__main__" :
    SocketModeHandler(app, slack_app_token).start() ## 슬랙 API 페이지에서 생성한 슬랙앱의 app token이 필요합니다.

```


다른 기능 구현이 필요한 경우 `@app.~~~` 을 위에 붙이고 함수를 정의하면 된다.

다른 이벤트 메서드는 공식 문서에서 확인할 수 있다.

https://slack.dev/bolt-python/tutorial/getting-started