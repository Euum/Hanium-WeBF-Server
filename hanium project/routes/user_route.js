//사용자를 추가하는 함수
var addUser = (database, id, password, email, callback) => {
    console.log('addUser 호출됨. %s, %s, %s',id, password, email);
    //UserModel의 인스턴스 생성
    var user = new database.UserModel({"id":id, "password":password, "email":email});

    //save로 저장
    user.save((err)=>{
        if(err){
            callback(err,null)
            return;
        }
        console.log('사용자 데이터 추가함.');
        callback(null, user);
    });
};

//사용자를 인증하는 함수 - 아이디를 먼저 찾고 그다음에 비밀번호 비교
var authUser = (database, id, password, callback) => {
    console.log('authUser 호출됨.');

    //1. 아이디를 사용해 검색
    database.UserModel.findById(id, (err, results)=>{
        if(err){
            callback(err,null);
            return;
        }
        console.log('아이디 [%s]로 사용자 검색 결과.',id, password);
   
        if(results.length > 0){
            console.log('아이디와 일치하는 사용자 찾음.');

            //2. 비밀번호를  - 모델 인스턴스 객체를 만들고 authenticate() 메소드 호출
            var user = new database.UserModel({'id':id});
            var authenticated = user.authenticate(password, results[0]._doc.salt, results[0]._doc.hashed_password);

            if(authenticated){
                console.log('비밀번호 일치함.');
                callback(null, results);
            }else{
                console.log('비밀번호 일치하지 않음');
                callback(null, null);
            }
        }else{
            console.log('아이디와 일치하는 사용자를 찾지 못함.');
            callback(null, null);
        }
    });
}


var index = function(req, res){
    console.log('/ 호출됨.(GET)');
    res.render('index');
}


var login = function(req, res){
    console.log('/process/login 호출됨.');
    var db = req.app.get('database');

    var id = req.body.id || req.query.id;
    var password = req.body.password || req.query.password;


    if(db){
        authUser(db, id, password, (err, docs)=>{
            if(err) throw err;

            if(docs){
                console.dir(docs);
                var username = docs[0]._doc.name;
                console.log(username);
                res.writeHead(200, {"Content-type":"text/html;charset=utf8"});
                res.write(
                    `
                    <h1>로그인 성공</h1>
                    <div><p>사용자 아이디: `+id+`</p></div>
                    <div><p>사용자 이름: `+username+`</p></div>
                    <br><br><a href="/public/login.html" style="text-decoration:none;"><b>다시 로그인하기</b></a></br></br>
                    `
                );
                res.end();
            }else{
                res.writeHead(200, {"Content-type":"text/html;charset=utf8"});
                res.write(
                    `
                    <h1>로그인 실패</h1>
                    <div><p>아이디와 비밀번호를 다시 확인하십시오.</p></div>
                    <br><br><a href="/public/login.html" style="text-decoration:none;"><b>다시 로그인하기</b></a></br></br>
                    `
                );
                res.end();
            }
        });
    }else{
        res.writeHead(200, {"Content-type":"text/html;charset=utf8"});
        res.write(
            `
            <h2>데이터베이스 연결 실패</h2>
            <div><p>데이터베이스에 연결하지 못했습니다.</p></div>
            `
        );
        res.end();
    }
};

var adduser = function(req, res){
    console.log('/process/adduser 호출됨.');
    var db = req.app.get('database');
    var id = req.body.id_r || req.query.id_r;
    var password = req.body.password_r || req.query.password_r;
    var email = req.body.email || req.query.email;

    console.log('요청 파라미터 : %s, %s, %s',id, password, email);

    //데이터베이스 객체가 초기화된 경우, addUser함수 호출하여 추가

    if(db){
        addUser(db, id, password, email, (err, user)=>{
            try{
                if(err) throw err;

                //결과 객체 확인하여 추가된 데이터 있으면 성공 응답 전송
                if(user){
                    console.log(user);

                    res.writeHead(200, {"Content-type":"text/html;charset=utf8"});
                    res.write(
                        `
                        <h2>사용자 추가 성공</h2>
                        <br><br><a href="/public/index.html" style="text-decoration:none;"><b>로그인하기</b></a></br></br>
                        `
                    );
                    res.end();
                }else{//결과 객체가 없으면 실패 응답 전송
                    throw new Error('user객체 생성 실패');   
                }
            }catch(e){
                res.writeHead(200, {"Content-type":"text/html;charset=utf8"});
                res.write(
                    `
                    <h2>사용자 추가 실패</h2>
                    <br><p>`+e.message+`</p></br>
                    <br><br><a href="/public/adduser.html" style="text-decoration:none;"><b>다시 가입하기</b></a></br></br>
                    `
                );
                res.end();
                console.error(e.stack);
            }
        });
    }else{
        res.writeHead(200, {"Content-type":"text/html;charset=utf8"});
        res.write('<h2>데이터베이스 연결 실패</h2>');
        res.end();
    }
    
};

var listuser = function(req, res){
    console.log('/process/listuser 호출됨');
    var db = req.app.get('database');

    //데이터베이스 객체가 초기화된 경우, 모델 객체의 findAll 메소드 호출
    if(db){
        //1. 모든 사용자 검색
        UserModel.findAll((err, results)=>{
            //오류가 발생했을 때 클라이언트로 오류 전송
            if(err){
                console.error('사용자 리스트 조회 중 오류 발생: '+err.stack);

                res.writeHead(200, {"Content-type":"text/html;charset=utf8"});
                res.write(
                    `<h2>사용자 리스트 조회 중 오류 발생</h2>
                    <p>`+err.stack+`</p>`
                );
                res.end();
                return;
            }

            if(results){
                console.dir(results);

                res.writeHead(200, {"Content-type":"text/html;charset=utf8"});
                res.write(
                    `<h2>사용자 리스트</h2>
                    <div><ul>`
                );

                for(var i = 0; i <results.length; i++){
                    var curId = results[i]._doc.id;
                    var curName = results[i]._doc.name;
                    res.write('<li># '+i+': '+curId+', '+curName+'</li>');
                }
                res.write('</ul></div>');
                res.end();
            }else{
                res.writeHead(200, {"Content-type":"text/html;charset=utf8"});
                res.write('<h2>사용자 리스트 조회 실패</h2>');
                res.end();
            }
        });
    }else{
        res.writeHead(200, {"Content-type":"text/html;charset=utf8"});
        res.write('<h2>데이터베이스 연결 실패</h2>');
        res.end();
    }
};

var idCheck = function(req,res){
    var id = req.body.id || req.query.id;
    var db = req.app.get('database');

    db.UserModel.findById(id,(err,results)=>{
        var retVal = true;
        if(err){
            console.log(err);
            return;
        }
        if(results.length > 0){
            retVal = true;
        }else{
            retVal = false;
        }
        res.send(retVal);
    });
}
module.exports.index = index;
module.exports.login = login;
module.exports.adduser = adduser;
module.exports.listuser = listuser;
module.exports.idCheck = idCheck;