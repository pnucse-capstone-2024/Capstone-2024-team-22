const express = require('express');
const mysql = require('mysql2');
const nano = require('nano')('http://admin:password@localhost:5984'); // CouchDB URL with credentials
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const app = express();
const { exec } = require('child_process');
const port = 3001;
const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const fs = require('fs');
const path = require('path');
const registerUser = require('./server/registerUser');

// Fabric Network 연결 Configuration
const ccpPath = path.resolve(__dirname, '../config-files/connection-org1.json'); // 연결 프로파일 파일의 경로
const walletPath = path.join(process.cwd(), 'server/wallet'); // 지갑 경로

// CouchDB 데이터베이스 선택
const chaincodeDB = nano.db.use('smart_contract_pool'); // 'chaincode_db'는 CouchDB 데이터베이스 이름

// MySQL 데이터베이스 연결 설정
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'userinfo',
  port: 3306
});

db.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
});

// 세션 설정
app.use(session({
  secret: 'your-secret-key', // 세션 암호화에 사용할 키
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // HTTPS 사용 시 true로 설정
}));

// 정적 파일 제공
app.use(express.static(path.join(__dirname, 'build')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 루트 경로에 대한 요청을 React 앱의 index.html로 리디렉션
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/src/MainPage.js'));
});

// -------------------------블록체인 네트워크 연결--------------------------------
async function connectToNetwork() {
  try {
    // 1. 연결 프로필 파일 로드
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

    // 2. 지갑 생성 또는 가져오기
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path(이건 서버측): ${walletPath}`);

    // 3. 사용자 인증서 확인
    const identity = await wallet.get('appUser');
    if (!identity) {
      console.log('An identity for the user "appUser" does not exist in the wallet');
      console.log('Run the registerUser.js application before retrying');
      return null;
    }

    // 4. Gateway 인스턴스 생성
    const gateway = new Gateway();

    await gateway.connect(ccp, {
      wallet,
      identity: 'appUser',
      discovery: { enabled: true, asLocalhost: true },
    });

    // 5. 네트워크와 체인코드 참조 가져오기
    const network = await gateway.getNetwork('mychannel'); // 채널 이름
    const contract = network.getContract('mycc'); // 체인코드 이름

    //연결 성공 메세지
    console.log('Successfully connected to Hyperledger Fabric network and fetched contract.');

    return contract; // 체인코드 참조 반환
  } catch (error) {
    console.error(`Failed to connect to network: ${error}`);
    return null;
  }
}

connectToNetwork().then(contract => {
  if (contract) {
    console.log('Fabric network is ready for transactions.');
  }
});
// ---------------------------로그인 관련--------------------------------------

// 회원가입 API
app.post('/api/register', async (req, res) => {
  const { organization, id, password, name, phonenumber } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10); // 비밀번호 해싱
  const query = 'INSERT INTO users (id, password, name, phonenumber) VALUES (?, ?, ?, ?)';

  try {
    // registerUser 함수 호출 및 처리
    await registerUser(organization, id, password, name, phonenumber);
    return res.json({ message: 'User registered successfully'});
  } catch (registerError) {
    console.error('Error during registering user in blockchain:', registerError);
    return res.status(500).json({ error: 'Failed to register user in blockchain', details: registerError.message });
  }
});

/* 이 밑에 app관련 주석처리돼있었음 registerUser관련 */
/*
app.post('/api/register', async (req, res) => {
  const { organization, id, username, name } = req.body;

  if (!['org1', 'org2'].includes(organization)) {
      return res.status(400).send({ error: 'Invalid organization' });
  }

  try {
      await registerUser(organization, id, username, name);
      res.status(200).send({ message: 'User registered successfully' });
  } catch (error) {
      res.status(500).send({ error: `Failed to register user: ${error.message}` });
  }
});*/

// 로그인 API
app.post('/api/login', (req, res) => {
  const { id, password } = req.body;
  const query = 'SELECT * FROM users WHERE id = ?';
  db.query(query, [id], async (err, results) => {
    if (err) {
      console.error('Error during login:', err);
      res.status(500).json({ error: 'Failed to login', details: err });
      return;
    }
    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const user = results[0];
    // 비밀번호 확인
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    // 로그인 성공, 세션 저장
    req.session.user = user;
    res.json({ message: 'Login successful' });
  });
});

// 로그아웃 API
app.post('/api/logout', (req, res) => {
  // 세션을 파괴하여 로그아웃합니다.
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ error: 'Failed to logout' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

// 로그인 상태 확인 API
app.get('/api/me', (req, res) => {
  // 사용자 세션 또는 토큰에서 로그인 정보를 가져옵니다.
  // 예를 들어, 세션을 사용하여 로그인 상태를 확인합니다.
  // (여기서는 간단하게 세션 정보를 사용한다고 가정합니다.)
  const user = req.session.user; // 세션에서 사용자 정보를 가져옵니다.
  
  if (user) {
    res.json({ loggedIn: true, id: user.id, isAdmin: user.is_admin, organization: user.organization });
  } else {
    res.json({ loggedIn: false });
  }
});

// ---------------------------로그인 관련--------------------------------------
// ---------------------------데이터 수집 관련----------------------------------
/*
// 투표 데이터 수집 API
app.post('/api/collect-vote-data', (req, res) => {
  const { candidates } = req.body;
  const candidateEntries = Object.values(candidates);

  const query = 'INSERT INTO vote_data (symbolNumber, name) VALUES ?';
  const values = candidateEntries.map(candidate => [candidate.symbolNumber, candidate.name]);

  db.query(query, [values], (err, result) => {
    if (err) {
      console.error('Error collecting vote data:', err);
      res.status(500).json({ error: 'Failed to collect vote data', details: err });
      return;
    }
    res.json({ message: 'Vote data collected successfully', result });
  });
});

// 지역별 온도 데이터 수집 API
app.post('/api/collect-temperature-data', (req, res) => {
  const { regions } = req.body;
  const regionEntries = Object.values(regions);

  const query = 'INSERT INTO temperature_data (region) VALUES ?';
  const values = regionEntries.map(region => [region.region]);

  db.query(query, [values], (err, result) => {
    if (err) {
      console.error('Error collecting temperature data:', err);
      res.status(500).json({ error: 'Failed to collect temperature data', details: err });
      return;
    }
    res.json({ message: 'Temperature data collected successfully', result });
  });
});

// 설문 데이터 수집 API
app.post('/api/collect-survey-data', (req, res) => {
  const { questions } = req.body;
  const questionEntries = Object.values(questions);

  const query = 'INSERT INTO survey_data (questionNumber, content) VALUES ?';
  const values = questionEntries.map(question => [question.questionNumber, question.content]);

  db.query(query, [values], (err, result) => {
    if (err) {
      console.error('Error collecting survey data:', err);
      res.status(500).json({ error: 'Failed to collect survey data', details: err });
      return;
    }
    res.json({ message: 'Survey data collected successfully', result });
  });
});
*/

// 데이터 수집 API
app.post('/api/collect-data', (req, res) => {
  const { data } = req.body;
  
  // 데이터베이스에 데이터를 저장하는 로직을 추가하세요.
  // 예를 들어, MySQL에 데이터를 저장할 수 있습니다.
  const query = 'INSERT INTO collected_data (data) VALUES (?)';
  db.query(query, [data], (err, result) => {
    if (err) {
      console.error('Error collecting data:', err);
      res.status(500).json({ error: 'Failed to collect data', details: err });
      return;
    }
    res.json({ message: 'Data collected successfully', result });
  });
});

// 피드백 제출 API
app.post('/api/feedback', async (req, res) => {
  const { chaincodeName, feedback } = req.body;
  const user = req.session.user.id;
  
  const query = 'INSERT INTO feedback (id, chaincodename, feedback) VALUES (?, ?, ?)';
  db.query(query, [user, chaincodeName, feedback], (err, result) => {
    if (err) {
      console.error('Error submitting feedback:', err);
      res.status(500).json({ error: 'Failed to submit feedback', details: err });
      return;
    }
    else {
      res.json({ message: 'Feedback submitted successfully', result });
    }
  });
});

// 피드백 조회 API
app.get('/api/view-feedback/:chaincodeName', (req, res) => {
  const { chaincodeName } = req.params;
  const query = 'SELECT * FROM feedback WHERE chaincodename = ?';
  db.query(query, [chaincodeName], (err, results) => {
    if (err) {
      console.error('Error retrieving feedback:', err);
      res.status(500).json({ error: 'Failed to retrieve feedback', details: err });
      return;
    }
    res.json({ feedbacks: results });
  });
});

// ---------------------------데이터 수집 관련----------------------------------

// 스마트 컨트랙트 배포 API
app.post('/api/deploy-smart-contract', async (req, res) => {
  const { chaincodeName, chaincodePath, chaincodeLabel } = req.body;
  const user = req.session.user.id;

  if (!chaincodeName || !chaincodePath || !chaincodeLabel) {
    return res.status(400).json({ error: 'Missing required fields: chaincodeName, chaincodePath, chaincodeLabel' });
  }

  // 쉘 스크립트 경로
  const deployScript = path.join(__dirname, 'deployChaincode.sh');

  // 스크립트를 실행합니다.
  exec(`bash ${deployScript} ${chaincodeName} ${chaincodePath} ${chaincodeLabel}`, (error, stdout, stderr) => {
    if (error) {
      console.error('Error executing deployChaincode script:', error);
      return res.status(500).json({ error: 'Failed to deploy smart contract', details: error.message });
    }

    if (stderr) {
      console.error('Standard error output from deployChaincode script:', stderr);
    }
    console.log('Standard output from deployChaincode script:', stdout);

    // MySQL에 user와 chaincodeName 저장
    const query = 'INSERT INTO deployedchaincode (id, chaincodename) VALUES (?, ?)';
    db.query(query, [user, chaincodeName], (err, result) => {
      if (err) {
        console.error('Error saving deployed chaincode info:', err);
        return res.status(500).json({ error: 'Failed to save deployed chaincode info', details: err });
      }
      res.json({ message: 'Smart contract deployed successfully and info saved to DB', output: stdout });
    });
  });
});

// 내가 배포한 체인코드 조회 API
app.get('/api/mychaincode', (req, res) => {
  const user = req.session.user.id;
  const query = 'SELECT * FROM deployedchaincode WHERE id = ?';
  db.query(query, [user], (err, results) => {
    if (err) {
      console.error('Error retrieving my data collection:', err);
      res.status(500).json({ error: 'Failed to retrieve my data collection', details: err });
      return;
    }
    res.json({ chaincodeName: results });
  });
});

// 관리자 인증 미들웨어
function adminAuth(req, res, next) {
  if (req.session.user && req.session.user.is_admin) {
    return next();
  }
  res.status(403).json({ error: 'Access denied' });
}

// 스마트 컨트랙트 모니터링 구현
app.get('/api/monitor-smart-contracts', (req, res) => {
  const command = 'docker logs peer0.org1.data-collector.com';

  exec(command, (err, stdout, stderr) => {
    if (err) {
      console.error('명령어 실행 중 오류 발생:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (stderr) {
      console.error('표준 오류:', stderr);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    // 로그를 JSON 형식으로 변환
    const logs = stdout.split('\n').map(line => ({ message: line }));

    res.json(logs);
  });
});

// 배포된 스마트 컨트랙트 조회
app.get('/api/deployed-chaincodes', (req, res) => {
  exec('docker exec cli peer lifecycle chaincode querycommitted --channelID mychannel', (error, stdout, stderr) => {
    if (error) {
      console.error('Error querying deployed chaincodes:', error);
      return res.status(500).json({ error: 'Failed to get deployed chaincodes', details: error.message });
    }

    if (stderr) {
      console.error('Standard error output:', stderr);
    }

    const chaincodes = stdout.split('\n').filter(line => line.includes('Name:')).map(line => {
      const nameMatch = line.match(/Name: (\S+)/);
      const versionMatch = line.match(/Version: (\S+)/);
      return {
        name: nameMatch ? nameMatch[1] : '',
        version: versionMatch ? versionMatch[1] : ''
      };
    });

    res.json(chaincodes);
  });
});

// 모든 체인코드 데이터를 조회하는 API
app.get('/api/query-all-assets/:chaincodeName', async (req, res) => {
  const chaincodeName = req.params.chaincodeName;
  const user = req.session.user.id;

  try {
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
    const orgPath = path.join(process.cwd(), 'server/wallet/org1');
    const wallet = await Wallets.newFileSystemWallet(orgPath);
    const gateway = new Gateway();

    await gateway.connect(ccp, {
      wallet,
      identity: user,
      discovery: { enabled: true, asLocalhost: true }
    });

    const network = await gateway.getNetwork('mychannel');
    const contract = network.getContract(chaincodeName);

    const assetsJSON = await contract.evaluateTransaction('QueryAllAssets');
    res.status(200).json(JSON.parse(assetsJSON.toString()));
    await gateway.disconnect();
  } catch (error) {
    console.error('Error querying all assets:', error);
    res.status(500).json({ error: 'Failed to query all assets', details: error.message });
  }
});

// 체인코드 메타데이터 조회 API
app.get('/api/chaincode-metadata/:chaincodeName', async (req, res) => {
  const chaincodeName = req.params.chaincodeName;
  const user = req.session.user.id;

  try {
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
    const orgPath = path.join(process.cwd(), 'server/wallet/org2');
    const wallet = await Wallets.newFileSystemWallet(orgPath);
    const gateway = new Gateway();

    await gateway.connect(ccp, {
      wallet,
      identity: user,
      discovery: { enabled: true, asLocalhost: true }
    });

    const network = await gateway.getNetwork('mychannel');
    const contract = network.getContract(chaincodeName);

    const metadata = await contract.evaluateTransaction('GetAssetMetadata');
    res.json(JSON.parse(metadata.toString()));
    await gateway.disconnect();
  } catch (error) {
    console.error('Error fetching chaincode metadata:', error);
    res.status(500).json({ error: 'Failed to get chaincode metadata', details: error.message });
  }
});

// Create Asset API
app.post('/api/create-asset', async (req, res) => {
  const { chaincodeName, assetData } = req.body;
  const user = req.session.user.id;

  try {
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
    const orgPath = path.join(process.cwd(), 'server/wallet/org2');
    const wallet = await Wallets.newFileSystemWallet(orgPath);
    const gateway = new Gateway();

    await gateway.connect(ccp, {
      wallet,
      identity: user,
      discovery: { enabled: true, asLocalhost: true }
    });

    const network = await gateway.getNetwork('mychannel');
    const contract = network.getContract(chaincodeName);

    // Extract parameters from assetData based on metadata keys
    const metadataResponse = await contract.evaluateTransaction('GetAssetMetadata');
    const metadata = JSON.parse(metadataResponse.toString());

    // Prepare parameters for passing to the shell script
    const params = Object.keys(metadata).map(key => `"${assetData[key]}"`).join(' ');

    //console.log(params);

    const createScript = path.join(__dirname, 'createAsset.sh');
    
    // Pass each parameter as a separate argument to the shell script
    exec(`bash ${createScript} ${chaincodeName} ${params}`, (error, stdout, stderr) => {
      if (error) {
        console.error('Error creating Assets:', error);
        return res.status(500).json({ error: 'Failed to create Assets', details: error.message });
      }

      if (stderr) {
        console.error('Standard output from createAsset script:', stderr);
      }

      //console.log('Standard output from createAsset script:', stdout);
      return res.json({ message: 'Asset created successfully', output: stdout });
    });

    await gateway.disconnect();
  } catch (error) {
    console.error('Error creating asset:', error);
    return res.status(500).json({ error: 'Failed to create asset', details: error.message });
  }
});

// RAW 데이터 다운로드 API
app.get('/api/download-raw-data', async (req, res) => {
  try {
    const doc = await chaincodeDB.get('test-template'); 
    res.setHeader('Content-Disposition', 'attachment; filename="raw_data.json"');
    res.setHeader('Content-Type', 'application/json');
    res.send(doc);
  } catch (error) {
    console.error('Error retrieving raw data:', error);
    res.status(500).json({ error: 'Failed to retrieve raw data from CouchDB', details: error });
  }
});


// 모든 문서의 _id 조회 API
app.get('/api/templates', adminAuth, async (req, res) => {
  try {
    const ids = await chaincodeDB.list({ include_docs: false });
    res.json(ids.rows.map(row => row.id));
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve templates from CouchDB', details: error });
  }
});

// 특정 문서 조회 API
app.get('/api/templates/:id', adminAuth, async (req, res) => {
  const id = req.params.id;
  try {
    const doc = await chaincodeDB.get(id);
    res.json(doc);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve template from CouchDB', details: error });
  }
});

// 특정 문서 수정 API
app.put('/api/templates/:id', adminAuth, async (req, res) => {
  const id = req.params.id;
  const newContent = req.body.content;
  try {
    const doc = await chaincodeDB.get(id);
    doc.content = newContent;
    const response = await chaincodeDB.insert(doc);
    res.json({ message: 'Template updated successfully', response });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update template in CouchDB', details: error });
  }
});

// 새 템플릿 생성
app.post('/api/create-template', adminAuth, async (req, res) => {
  const { _id, content } = req.body;
  if (!content) {
    return res.status(400).json({ error: '템플릿을 작성해 주세요.' });
  }

  try {
    const response = await chaincodeDB.insert({ _id, content });
    res.json({ message: 'Template created successfully', response });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create template in CouchDB', details: error });
  }
});


// 서버 시작
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
