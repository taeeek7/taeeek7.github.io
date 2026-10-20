---
title: '안 죽는 잡일 API 만들기 (presigned URL & 세탁 수량)'
description: '화려하진 않지만 운영엔 꼭 필요한 API들. NCloud Object Storage presigned URL 발급과 세탁 수량 입력. 잡일일수록 부분 실패·입력 검증·멱등성 같은 기본기가 티가 난다.'
pubDate: 2025-09-01
tags: ['Backend', 'NCloud', 'FastAPI', 'Architecture']
---

이번에는 앞의 서버 부트스트랩과 LLM 배정 글에 이어 운영 API 두 가지를 정리한다. 청소·세탁 사진을 올리고 내려받는 URL 발급 API와 세탁 업체가 보낸 린넨 수량을 입력하는 API다.

## presigned URL: 서버를 트래픽에서 빼낸다

현장 키퍼가 청소 전/후 사진을, CS팀이 세탁 클레임 사진을 올린다. 이 이미지들을 서버가 중계하면 어떻게 될까. 사진 수백 장이 전부 서버를 거쳐 스토리지로 간다. 서버가 아무 부가가치 없이 트래픽만 뒤집어쓴다. 낭비다.

그래서 서버는 URL만 발급하고, 실제 업로드·다운로드는 클라이언트와 스토리지가 직접 하게 했다. 이게 presigned URL이다. 서버는 "이 주소로 직접 올리세요/받으세요"라는 서명된 URL 한 장만 내주고 빠진다. 서버 부하도 없고, URL엔 만료 시간이 박혀 있어서 아무나 못 쓴다.

## S3 호환이라 boto3를 그대로 썼다

우리는 NCloud Object Storage를 쓰는데, 이게 S3 호환 API를 제공한다. 그래서 별도 SDK를 찾을 필요 없이, AWS용 `boto3`를 그대로 쓰되 엔드포인트만 NCloud로 바꿔주면 된다.

```python
import boto3

client = boto3.client(
    "s3",
    endpoint_url="https://kr.object.ncloudstorage.com",  # 여기만 NCloud로
    region_name="kr-standard",
    aws_access_key_id=ACCESS_KEY,
    aws_secret_access_key=SECRET_KEY,
)

url = client.generate_presigned_url(
    "get_object",
    Params={"Bucket": bucket, "Key": key},
    ExpiresIn=expires,
)
```

"S3 호환이면 boto3 그대로"라는 이 트릭 하나로, 새 SDK 학습이나 자체 서명 구현을 통째로 건너뛰었다. 조회용은 `get_object`, 업로드용은 `put_object`로 발급하고, 공개해도 되는 이미지는 `ACL: public-read`를 붙여 공개 URL까지 만들어줬다.

## 하나 실패해도 배치가 안 죽게

이미지 URL을 여러 개 한꺼번에 달라는 요청이 많았다. 여기서 제일 신경 쓴 게 부분 실패다. 키 하나가 잘못됐다고 전체 요청을 500으로 날려버리면, 나머지 멀쩡한 사진들까지 다 같이 죽는다.

```python
results = []
for key in keys:
    try:
        results.append({"key": key, "presigned_url": make_url(key), "error": None})
    except Exception as e:
        results.append({"key": key, "presigned_url": None, "error": str(e)})
```

키마다 try/except로 감싸서, 성공한 건 URL을, 실패한 건 에러 사유를 각각 담아 돌려준다. 호출한 쪽이 "이건 됐고 저건 왜 안 됐는지"를 한눈에 본다. 잘못된 키가 있어도 나머지 사진 URL은 받을 수 있다.

## 세탁 수량: 넣기 전에 검증하고, 두 번 눌러도 안 불어나게

비슷한 시기에 만든 세탁 명세서 입력 API도 원칙은 같았다. 세탁 업체·지점별로 세탁한 린넨 개수를 대량으로 넣는 건데, 두 가지에 집중했다.

넣기 전에 검증한다. 들어온 세탁 업체 코드·지점 코드가 실제 등록된 것인지, 린넨 품목 ID가 유효한지를 먼저 참조 테이블과 대조하고 나서 insert한다. 여기서 쓰레기 데이터가 한 번 들어가면, 나중에 세탁비 정산이 통째로 꼬인다. 입력 단계에서 걸러내기로 했다.

같은 날 같은 품목이 다시 들어오면 기존 행의 수량을 덮어쓴다.

```sql
INSERT INTO ... VALUES (...)
ON DUPLICATE KEY UPDATE quantity = VALUES(quantity), update_id = ...
```

`ON DUPLICATE KEY UPDATE`로 upsert. 그래서 같은 요청을 여러 번 보내도 데이터가 불어나지 않는다. 멱등성(idempotency). 재시도가 흔한 실무에서 이게 없으면 데이터가 조용히 중복된다. 그리고 이 DAO는 (앞 글에서 고백한 배정 쿼리와 달리) 처음부터 `%s` 파라미터 바인딩으로 짰다. 이쪽은 처음부터 입력값 바인딩을 지켰다.

## 남는 이야기

사진 URL 발급에서는 한 건의 실패가 다른 건에 영향을 주지 않도록 했고, 세탁 수량 입력에서는 잘못된 참조값과 중복 요청을 처리했다. 매일 쓰는 운영 API라 이런 예외 처리를 먼저 챙겼다.
