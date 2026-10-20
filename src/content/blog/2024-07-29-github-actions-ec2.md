---
title: 'GitHub Actions로 AWS EC2 배포 자동화하기'
description: '푸시하면 알아서 EC2에 배포되게. GitHub Actions로 배포 파이프라인을 짠 기록.'
pubDate: 2024-07-29
tags: ['CI/CD', 'AWS', 'GitHub Actions']
---

현재 회사에서 사용 중인 파이썬 기반의 업무자동화 기능은 AWS EC2 인스턴스에 배포하고 있다.

배포할 때마다 EC2에 접속해 Github에 push한 소스코드를 직접 pull했다. 이 작업을 자동화하려고 Github Actions를 적용해봤다.

지금 배포하는 건 규모가 작은 업무자동화 기능이다. 도커나 쿠버네티스로 옮기기 전에, 기존 배포 방식을 유지하면서 Github Actions부터 익혀보기로 했다.

### Github Actions란?
 >GitHub Actions는 GitHub에서 제공하는 CI/CD(Continuous Integration/Continuous Deployment) 서비스<br/>
 >이를 통해 코드베이스의 빌드, 테스트, 배포 등의 작업을 자동화할 수 있음 <br/>
 >GitHub Actions는 워크플로우를 통해 다양한 작업을 정의하고 실행할 수 있음 <br/>


### 1. 사전 준비

    - 배포하려는 AWS EC2 정보
        - host (DNS)
        - username
        - 접속 인증 private key (.pem 등)
    - 소스코드를 관리하는 Github Repository

### 2. Github Actions yml 파일 생성

    - Github repo. Actions --> set up workflow yourself 클릭
    - 자동화하려는 branch내에 .github/workflows/ 경로에 yml파일 생성

```
// main.yml

name: Release to EC2  # Actions 이름

# Actions를 run할 트리거 설정
on:
  push:
    branches:
      - release       # push 하는 branch name  
  workflow_dispatch:  # 수동 실행 옵션 추가


jobs:
  SSH:
    runs-on: ubuntu-latest  # 배포 서버 버전 

    steps:                               # 이벤트가 발생했을 때 Actions 하는 단계를 정의
      - uses: actions/checkout@v4
      - name: SSH and Pull
        uses: appleboy/ssh-action@master 
        with:
          host: ${ secrets.EC2_HOST }   
          username: ${ secrets.EC2_USER }
          key: ${ secrets.EC2_SSH_PRIVATE_KEY }
          port: ${ secrets.EC2_PORT }  # EC2 인버운드 포트 (보통 22번)
          script_stop: true
          debug: true
          script: |                      # 서버에 접속 후 실제 진행하는 스크립트
            cd live_deploy
            git pull origin release

```

<center><img src="https://github.com/user-attachments/assets/b6c6d1f4-9bc0-4358-b630-19b94b770c99" width= "800" height= "300"/></center>


### 3. Actions secrets and variables 정의

    - Github repo. Actions --> settings --> secrets and variables --> Actions 클릭
    - Secrets 항목에서 yml 파일에 작성한 변수를 정의


### 4. Actions에서 workflow runs 이벤트 확인

    - release branch에 push했을 때 제대로 이벤트가 동작하는지 확인




### 5. SSH 접속에 실패할 경우 확인할 사항

- SSH 키 형식
```
GitHub Secrets에 저장된 private key가 올바른 형식인지 확인. 키는 -----BEGIN RSA PRIVATE KEY-----로 시작하고 -----END RSA PRIVATE KEY-----로 끝나야 함.
```

- EC2 ssh 파일 권한 확인

```
chmod 600 authorized_keys (-rw-------) 
chmod 700 ~/.ssh          (drwx------)
``` 

- SSH 설정 확인

```
//PubkeyAuthentication yes로 설정되어 있는지 확인
sudo cat /etc/ssh/sshd_config | grep PubkeyAuthentication
```


- SSH 서비스 재시작

```
sudo service ssh restart
```


ssh 접근에 계속 실패해서 고전했었는데 알고보니 private key를 다른걸로 넣어서였다... EC2 인스턴스 생성 시 적용한 보안 키페어의 내용을 secrets에 정확히 붙여넣어야 함!

키를 수정한 뒤에는 자동으로 pull되는 것을 확인했다.







