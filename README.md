# 허가형 블록체인을 이용한 데이터 수집 시스템
## 팀원 소개

|학번|이름|연락처|역할|
|------|---|---|---|
|201924484|박형주|hju00forwork@gmail.com|시스템 프로토타입 구현 및 스마트 컨트랙트 작성|
|201924427|김민종|kmj010105@naver.com|프론트엔드 개발 및 데이터 시각화 대시보드 작성|
|201924566|전원균|spotydol7@gmail.com|백엔드 개발 및 하이퍼레저 패브릭 네트워크 구성|

## 과제 배경
과제를 수행하기 앞서 저희가 발견한 기존 데이터 수집 시스템의 문제점은 아래와 같습니다.
- 중앙 집중형 데이터 수집 시스템의 경우, 수집 데이터 공유를 수행하며 **데이터 투명성의 저하**가 초래될 수 있습니다.
- 퍼블릭 블록체인을 사용한 데이터 수집 시스템의 경우 무분별한 데이터 생성으로 인해 **데이터의 질이 저하되는 문제**가 발생할 수 있습니다.

따라서 저희는 아래와 같은 목표를 토대로 과제를 진행하고자 하였습니다.
- 허가형 블록체인 플랫폼 하이퍼레저 패브릭을 활용해 **무분별한 데이터 생성을 방지**하는 데이터 수집 시스템 구현
- 체인코드를 통해 **트랜잭션을 자동화**하여 부정행위 방지, 신뢰성 있는 데이터 수집 시스템 구현
- 스마트 컨트랙트를 기반으로 **다양한 데이터 수집 도메인에 적용 가능한** 유연한 데이터 수집 시스템 구현

  
## 시스템 구성도
![화면 캡처 2024-10-25 053102](https://github.com/user-attachments/assets/678934a2-9f61-4fa5-9083-0ca5b4b1ee44)

## 사용 기술 스택
|기술|버전|
|----|----|
|Hyperledger Fabric|2.5.9 (latest)|
|Fabric CA Server|1.5.12 (latest)|
|Docker|4.34.2 (latest)|
|MySQL|9.0.1 (latest)|
|CouchDB|3.3.3 (latest)|
|REACT|18.3.1|
|Node.js|16.13.0|
|ELK Stack|8.15.0|
