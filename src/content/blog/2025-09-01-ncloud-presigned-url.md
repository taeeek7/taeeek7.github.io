---
title: 'NCloud Object Storage presigned URL 발급 API 만들기'
description: '청소·세탁 사진을 안전하게 올리고 내려받게 하는 presigned URL API. NCloud가 S3 호환이라 boto3를 그대로 썼다.'
pubDate: 2025-09-01
tags: ['Backend', 'NCloud', 'FastAPI']
---

화려한 기능은 아니다. 근데 운영엔 꼭 필요한 종류의 API. 청소 전/후 사진, 세탁 클레임 사진 같은 걸 클라이언트가 직접 스토리지에 올리고 내려받게 하는 **presigned URL 발급 API**를 만든 이야기다.

## presigned URL이 왜 필요한가

이미지를 서버가 중계하면 서버가 트래픽을 다 뒤집어쓴다. 사진 몇백 장이 서버를 거쳐가면 낭비다. 그래서 **서버는 "이 주소로 직접 올리세요/받으세요"라는 서명된 URL만 발급**하고, 실제 업로드·다운로드는 클라이언트와 스토리지가 직접 주고받게 한다. 서버 부하도 없고, URL엔 만료 시간이 박혀 있어서 안전하다.

## NCloud가 S3 호환이라 boto3를 그대로 썼다

우리는 NCloud Object Storage를 쓰는데, 이게 **S3 호환 API**를 제공한다. 그래서 AWS용 라이브러리인 `boto3`를 그대로 쓰되, 엔드포인트만 NCloud로 바꿔주면 된다.

```python
import boto3

client = boto3.client(
    "s3",
    endpoint_url="https://kr.object.ncloudstorage.com",
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

이 "S3 호환이니까 boto3 그대로" 트릭을 알고 나면 은근 여러 클라우드에서 써먹을 수 있다. 업로드용은 `put_object`로 발급하고, 필요하면 `ACL: public-read`를 붙여서 공개 URL도 만들어줬다.

## 하나 실패해도 배치가 안 죽게

이미지 URL을 여러 개 한꺼번에 달라는 요청이 많았다. 이때 키 하나가 잘못됐다고 전체 요청을 실패시키면 짜증난다. 그래서 **키마다 try/except로 감싸서**, 성공한 건 URL을, 실패한 건 에러를 각각 담아 돌려줬다.

```python
results = []
for key in keys:
    try:
        results.append({"key": key, "presigned_url": make_url(key), "error": None})
    except Exception as e:
        results.append({"key": key, "presigned_url": None, "error": str(e)})
```

한 건의 실패가 나머지를 말아먹지 않게. 별거 아닌데 이런 게 운영에선 체감이 크다.

## 곁들여: 세탁 수량 입력 API

비슷한 시기에 만든 것 중에 세탁 명세서(린넨 수량) 입력 API도 있다. 세탁 업체·지점별로 세탁한 린넨 개수를 대량으로 넣는 건데, 여기서 신경 쓴 두 가지.

- **넣기 전에 검증한다.** 세탁 업체 코드·지점 코드가 실제 등록된 것인지, 린넨 품목 ID가 유효한지 먼저 확인하고 insert한다. 쓰레기 데이터가 들어오면 나중에 정산이 꼬인다.
- **중복은 덮어쓴다.** 같은 날 같은 품목이 다시 들어오면 새 행을 만드는 게 아니라 수량을 갱신한다. `INSERT ... ON DUPLICATE KEY UPDATE`로 upsert. 여러 번 눌러도 데이터가 안 불어난다.

## 남는 이야기

presigned URL도 세탁 수량도, 블로그에 자랑할 만큼 멋진 건 아니다. 근데 운영을 돌리려면 이런 "잡일 API"가 계속 필요하다. 그리고 잡일일수록 **부분 실패 처리, 입력 검증, 멱등성(idempotency)** 같은 기본기가 티가 난다. 화려하지 않아도 안 죽는 API. 그게 목표였다.
