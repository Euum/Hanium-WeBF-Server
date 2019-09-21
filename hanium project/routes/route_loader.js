var route_loader = {};
var config = require('../config');
var database = require('../database/database');

route_loader.init = function(app){
    console.log('route_loader.init 호출됨.');
    database.init(app,config);
    return initRoutes(app);
}

function initRoutes(app){
    var infoLen = config.route_info.length;
    var database = app.get('database')
    console.log('설정에 정의된 라우팅 모듈의 수 : %d', infoLen);
    for(var i=0; i<infoLen; i++){
        var curItem = config.route_info[i];
        var curModule = require(curItem.file);

        if(curItem.type == 'get'){
            app.get(curItem.path, curModule[curItem.method]);
        }else if(curItem.type == 'post'){
            app.post(curItem.path, curModule[curItem.method]);
        }
        console.log('라우팅 모듈 [%s][%s]가 설정됨.',curItem.method, curItem.type);
    }
}

module.exports = route_loader;