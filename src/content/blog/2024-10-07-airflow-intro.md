---
title: '우당탕탕 Airflow 도입 과정'
description: 'docker-compose로 Airflow를 처음 띄워본 도입기. (2년 뒤 DAG 117개가 됐다.)'
pubDate: 2024-10-07
tags: ['data', 'Airflow', 'Docker']
---

Airflow를 도입한 지는 꽤 됐는데 이제야 설치 과정을 정리한다.

### Airflow란?
Airflow는 초기 에어비엔비(Airfbnb) 엔지니어링 팀에서 개발한 워크플로우 오픈 소스 플랫폼이다.<br/>
정해진 스케줄에 작업을 실행하고, 실행 상태를 확인할 수 있는 웹 화면을 제공한다. 데이터 워크플로우 관리나 ETL 자동화에 많이 쓴다.
<br/>
<br/>

### 도입 과정
Airflow를 운영하는 방법에는 여러가지가 있지만 나는 공식 홈페이지에도 나와있는 가장 간단한 방법으로 우선 진행했다. 이는 docker-compose를 활용하여 웹서버를 띄우는 방식인데, docker가 처음이어서 생소하긴 했지만 공식 문서로도 잘 설명되어 있어서 차근차근 따라해보았다.

## Airflow 설치
docker-compose로 Airflow를 실행하기 위한 설치 명령이다.

```
//airflow docker-compose 생성
curl -LfO 'https://airflow.apache.org/docs/apache-airflow/2.9.3/docker-compose.yaml'

//디렉토리 생성 및 airflow UID 확인
mkdir -p ./dags ./logs ./plugins ./config
echo -e "AIRFLOW_UID=$(id -u)" > .env

//docker-compose 실행 
docker compose up airflow-init
docker compose up
```

<br/>

## 빌드 이미지 확인

docker compose up을 실행하면 여러 도커 이미지들이 한 번에 실행된다. 실행 상태를 확인한다.

```
docker ps 
```

실행되는 이미지들은 다음과 같다.

- airflow-scheduler
- airflow-webserver
- airflow-worker
- airflow-trigger
- postgres
- redis

<br/>

localhost:8080 을 접속하면 airflow admin 로그인 화면을 볼 수 있다! <br/>
기본적으로 username과 패스워드는 airflow !!

<br/>
여기까지 하면 Airflow 기본 설정은 끝난다. 이제 필요한 프로그램들을 dag 작성을 통해 제작하면 된다. dag 작성이나 docker-compose가 docker 이미지로 airflow 실행하는 방법 등은 이후 포스트에 올리겠다.

