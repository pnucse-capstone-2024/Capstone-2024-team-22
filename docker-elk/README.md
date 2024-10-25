# ELK 스택을 이용한 CouchDB 데이터 시각화

## 1. CouchDB에서 데이터 저장
Hyperledger Fabric에서 가져온 JSON 데이터를 CouchDB에 저장합니다.

## 2. Logstash와 CouchDB 연동
Logstash를 사용하여 CouchDB에 저장된 데이터를 Elasticsearch로 가져옵니다.

### Logstash 설정 파일 (`logstash.conf`) 예시:
```plaintext
input {
  couchdb_changes {
    db => "candidates_db"
    host => "localhost"
    port => 5984
    username => "admin"  # CouchDB의 사용자 이름
    password => "password"  # CouchDB의 비밀번호
    type => "candidate"  # 문서 타입 설정
  }
}

filter {
  mutate {
    rename => { "[doc][CommonAttributes][VoteCount]" => "VoteCount" }
    rename => { "[doc][CandidateNumber]" => "CandidateNumber" }
    rename => { "[doc][CandidateName]" => "CandidateName" }
  }
}

output {
  elasticsearch {
    hosts => ["http://localhost:9200"]
    index => "candidates"
  }
  stdout { codec => rubydebug }
}
```
### 설정 설명

- **input**:
  - `couchdb_changes`: CouchDB에서 변경된 데이터를 가져오는 플러그인입니다.
    - `db`: CouchDB의 데이터베이스 이름 (`candidates_db`)입니다.
    - `host`와 `port`: CouchDB가 실행되고 있는 호스트와 포트입니다.
    - `username`과 `password`: CouchDB의 인증을 위한 사용자 이름과 비밀번호입니다.
    - `type`: 가져올 문서의 유형을 지정합니다.

- **filter**:
  - `mutate`: CouchDB에서 가져온 JSON 데이터의 필드 이름을 Elasticsearch에 적합하게 변경합니다.
    - `rename`: JSON 내부의 필드 경로를 `VoteCount`, `CandidateNumber`, `CandidateName`으로 변경하여 Elasticsearch에서 쉽게 접근할 수 있도록 합니다.

- **output**:
  - `elasticsearch`: 데이터를 Elasticsearch에 전송합니다.
    - `hosts`: Elasticsearch 클러스터의 호스트와 포트입니다. (`http://localhost:9200`)
    - `index`: 데이터를 저장할 Elasticsearch 인덱스의 이름 (`candidates`)입니다.
  - `stdout`: 데이터를 콘솔에 출력하여 디버깅 용도로 사용할 수 있습니다. `rubydebug` 코덱을 사용하여 JSON 데이터의 가독성을 높입니다.
## 3. Logstash 실행

설정 파일이 준비되면 Logstash를 실행하여 CouchDB에서 Elasticsearch로 데이터를 전송합니다. 다음 명령어를 사용하여 Logstash를 실행합니다:

```bash
bin/logstash -f logstash.conf
```
- `-f logstash.conf`: Logstash가 사용할 설정 파일의 경로를 지정합니다. 설정 파일은 `logstash.conf`로 명명되었으며, CouchDB와 Elasticsearch 간의 데이터 전송을 구성하고 있습니다.

Logstash가 실행되면, 설정 파일에 정의된 CouchDB의 변경 사항을 실시간으로 감지하고 Elasticsearch 인덱스에 데이터를 전송합니다. 데이터가 성공적으로 전송되면, Kibana에서 이 데이터를 시각화할 수 있습니다.
## 4. Elasticsearch에서 데이터 확인

데이터가 Elasticsearch로 제대로 인덱싱되었는지 확인하려면 Kibana의 Dev Tools에서 다음 쿼리를 실행합니다:
```json
GET /candidates/_search
{
  "query": {
    "match_all": {}
  }
}
```
이 쿼리는 candidates 인덱스의 모든 데이터를 반환합니다.

## 5. Kibana에서 원형 차트 생성

Kibana를 사용하여 후보자의 득표 비율을 나타내는 원형 차트를 생성합니다.

	1.	Kibana 접속: Kibana에 접속한 후 Visualize 메뉴로 이동합니다.
	2.	새 시각화 생성: Create new visualization을 클릭하고 Pie chart를 선택합니다.
	3.	데이터 설정:
	•	Bucket에서 Split slices를 선택합니다.
	•	Aggregation에서 Terms를 선택하고, Field에는 CandidateName.keyword를 설정합니다.
	•	Metric은 기본적으로 Count로 설정되지만, 이를 Sum으로 변경한 후 Field에는 VoteCount를 선택합니다.
	4.	시각화 완료: 설정이 완료되면 원형 차트가 생성됩니다. 이를 저장하고 대시보드에 추가하여 시각화를 관리할 수 있습니다.

이 과정을 통해 CouchDB에 저장된 데이터를 Elasticsearch로 직접 가져와 Kibana에서 시각화할 수 있습니다.
