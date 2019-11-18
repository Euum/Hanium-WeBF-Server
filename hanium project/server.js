var config = require('./config'); /*설정파일*/

//Express 기본 모듈 불러오기
var express = require('express')
    ,http = require('http')
    ,path = require('path');

//Express의 미들웨어 불러오기
var bodyParser = require('body-parser')
    ,cookieParser = require('cookie-parser')
    ,static = require('serve-static')
    ,errorHandler = require('errorhandler');

//오류 핸들러 모듈 사용
var expressErrorHandler = require('express-error-handler');

//Session 미들웨어 불러오기
var expressSession = require('express-session');

//익스프레스 객체 생성
var app = express();

//기본 속성 설정
app.set('port', process.env.PORT || config.server_port);
app.set('view engine', 'ejs');
app.set('views', __dirname+'/public')

//body-parser를 사용해 application/x-www-form-urlencoded 파싱
app.use(bodyParser.urlencoded({limit:"50mb", extended:false}));

//body-parser를 사용해 application/json 파싱
app.use(bodyParser.json({limit:"50mb"}));

//public 폴더를 static으로 오픈
app.use('/public', static(path.join(__dirname, 'public')));
app.use('/style', static(path.join(__dirname, 'style')));
app.use('/semantic-ui', static(path.join(__dirname, 'semantic-ui')));


//cookie-parser 설정
app.use(cookieParser());

//세션 설정
app.use(expressSession({
    secret: 'WEbfS3cReTKeYVA!ue',
    resave: false,
    saveUninitialized: true
}));

//라우터 객체 참조
var router = express.Router();

//사용자 모듈 호출 : user_route
var route_loader = require('./routes/route_loader.js');
route_loader.init(app);

//라우터 객체 등록
app.use('/', router);

//===== 404 오류 페이지 처리 =====//
var errorHandler = expressErrorHandler({
    static: {
        '404': './public/404.html'
    }
});

app.use(expressErrorHandler.httpError(404));
app.use(errorHandler);

//===== 서버 시작 =====//
http.createServer(app).listen(app.get('port'), ()=>{
    console.log('서버가 시작되었습니다. 포트 : ' + app.get('port'));
});