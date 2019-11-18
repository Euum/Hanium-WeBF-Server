var mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);

//database 객체에 db, schema, model 모두 추가
var database = { };

database.init = function(app, config){
    console.log('init() 호출됨.');

    connect(app, config);
}


//데이터베이스에 연결하고 응답 객체의 속성으로 db 객체 추가
function connect(app, config){
    console.log('connect() 호출됨.');
     //데이터베이스 연결 정보
     var databaseUrl = config.db_url;
     //데이터베이스 연결
     console.log('데이터베이스 연결을 시도합니다.');
     mongoose.Promise = global.Promise;
     mongoose.connect(databaseUrl,{ useNewUrlParser: true });
     database = mongoose.connection;
 
     database.on('error', console.error.bind(console, 'mongoose connection error.'));
     database.on('open', ()=>{
         console.log('데이터베이스에 연결되었습니다: '+databaseUrl);
         //스키마 정의
         createSchema(app,config);
     });
     //연결 끊어졌을 때 5초 후 재연결
     database.on('disconnected', ()=>{
         console.log('연결이 끊어졌습니다. 5초후 다시 연결합니다.');
         setInterval(connectDB, 5000);
     });
}

function createSchema(app, config){
    var schemaLen = config.db_schemas.length;
    console.log('설정에 정의된 스키마의 수 : %d', schemaLen);

    for(var i=0; i<schemaLen; i++){
        var curItem = config.db_schemas[i];

        //모듈 파일에서 모듈 불러온 후 createSchema함수 호출하기
        var curSchema = require(curItem.file).createSchema(mongoose);

        //UserModel 정의
        var curModel = mongoose.model(curItem.collection, curSchema);
        console.log('%s 컬렉션을 위해 모델 정의함.', curItem.collection);

        //database객체에 속성으로 추가
        database[curItem.schemaName] = curSchema;
        database[curItem.modelName] = curModel;
        console.log('스키마 이름[%s], 모델 이름[%s]이 database 객체의 속성으로 추가됨.', curItem.schemaName, curItem.modelName);
    }

    app.set('database', database);
    console.log('database가 app객체의 속성으로 추가됨.');
}

module.exports = database;