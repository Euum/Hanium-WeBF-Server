var sessionCheck = require('../utils/utils').sessionCheck;

//사용자를 인증하는 함수 - 아이디를 먼저 찾고 그다음에 비밀번호 비교
var authUser = (database, id, password, callback) => {

    //1. 아이디를 사용해 검색
    database.UserModel.findById(id, (err, results) => {
        if (err) {
            callback(err, null);
            return;
        }

        if (results.length > 0) {

            //2. 비밀번호를  - 모델 인스턴스 객체를 만들고 authenticate() 메소드 호출
            var user = new database.UserModel({ 'id': id });
            var authenticated = user.authenticate(password, results[0]._doc.salt, results[0]._doc.hashed_password);

            if (authenticated) {
                callback(null, results);
            } else {
                callback(null, null);
            }
        } else {
            callback(null, null);
        }
    });
}

var mobileLogin = function (req, res) {
    var db = req.app.get('database');

    var id = req.body.id || req.query.id;
    var password = req.body.password || req.query.password;

    if (db) {
        authUser(db, id, password, (err, docs) => {
            if (err) throw err;

            var output = "";

            if (docs) {
                var username = docs[0]._doc.name;
                if (req.session.user) {
                    output = "aleady login";
                } else {
                    req.session.user = {
                        'id': id,
                        _id: docs[0]._doc._id,
                        pw: password,
                        authorized: true
                    }
                    output = "login success";
                }

            } else {
                output = "login fail";
            }
            res.send(output);
            res.end();
        });
    } else {
        res.writeHead(200, { "Content-type": "text/html;charset=utf8" });
        res.write(
            `
            <h2>데이터베이스 연결 실패</h2>
            <div><p>데이터베이스에 연결하지 못했습니다.</p></div>
            `
        );
        res.end();
    }
}

var mobileCategory = function (req, res) {
    sessionCheck(req,
        function () {
            var id = req.session.user.id;
            var _id = req.session.user._id;
            var db = req.app.get('database');
            db.CategoryModel.list(_id, function (err, results) {
                if (err) {
                    console.error('카테고리 조회중 오류 발생 [ 사용자명: ' + id + ' ][MOBILE]: ' + err.stack);
                    res.send('Error 다시 시도하세요.');
                    res.end();

                    return;
                }
                var categories = [];
                console.log(results);
                if (results) {
                    categories = results;
                }
                res.send(categories);
                res.end();
            });
        },
        function () {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.write("<script>alert('세션이 만료되었습니다.'); window.location.href='/';</script>");
            res.end();
        }
    )
}
var mobileLogout = function (req, res) {
    sessionCheck(req,
        function () {
            req.session.destroy(
                function (err) {
                    if (err) {
                        console.log(err.stack);
                        return;
                    } else {
                        res.send("logout success");
                        res.end();
                    }
                }
            )
        },
        function () {
            res.send("aleady logout");
            res.end();
        }
    );
};

var mobileDocList = function (req, res) {
    sessionCheck(req,
        function () {
            var id = req.session.user.id;
            var _id = req.session.user._id;
            var categoryTitle = req.body.categoryTitle || req.query.categoryTitle || req.params.categoryTitle;
            var page = req.body.page || req.query.page || req.params.page;
            var perPage = req.body.perPage || req.query.perPage || req.params.perPage;
            var db = req.app.get('database');
            console.log("%s %s %s %s", id, categoryTitle, page, perPage);
            if (db) {
                db.CategoryModel.findByCategory(_id, categoryTitle, function (err, results) {
                    if (err) {
                        res.send('Find by category error');
                        res.end();
                        return;
                    }

                    var categoryObjectId = {};
                    if (results.length != 0) {
                        categoryObjectId = results[0]._doc._id;
                        var options = {
                            criteria: {
                                writer: _id,
                                category: categoryObjectId
                            },
                            'page': page,
                            'perPage': perPage
                        };
                        db.DocumentModel.list(options, function (err, results) {
                            if (err) {
                                res.send('List search error');
                                res.end();
                                return;
                            }

                            if (results) {
                                //전체 문서 객체 수 확인
                                db.DocumentModel.countDocuments({ writer: _id, category: categoryObjectId }, function (err, count) {
                                    if (err) {
                                        res.send('Counting documents error');
                                        res.end();
                                        return;
                                    }
                                    //뷰 템플릿을 사용하여 렌더링한 후 전송
                                    var context = {
                                        documents: results,
                                        page: parseInt(page),
                                        pageCount: Math.ceil(count / perPage),
                                        'perPage': perPage,
                                        totalRecords: count,
                                        size: perPage,
                                    };
                                    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
                                    res.send(context);
                                    res.end();
                                });
                            }
                        });
                    } else {
                        res.send("There's no category");
                        res.end();
                        return;
                    }
                });
            } else {
                res.send('Database error');
                res.end();
            }
        },
        function () {
            res.send('Session terminated');
            res.end();
        }
    );

}

var mobileReadDoc = function (req, res) {
    console.log('showdocument 호출');
    var category = req.body.category || req.query.category || req.params.category;
    var number = req.body.number || req.query.number || req.params.number;
    var writer = req.body.writer || req.query.writer || req.params.writer;
    var db = req.app.get('database');

    console.log('요청: %s %s %s', writer, number, category);
    if (db) {
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        db.DocumentModel.load(writer, category, number, function (err, result) {
            if (err) {
                res.send('Database Error');
                res.end();
                return;
            }

            if (result) {
                res.send(result.contents);
                res.end();
            } else {
                res.send("조회 실패");
                res.end();
            }
        });
    } else {
        res.send('DB connection fail');
        res.end();
    }

}

module.exports.mobileLogin = mobileLogin;
module.exports.mobileCategory = mobileCategory;
module.exports.mobileLogout = mobileLogout;
module.exports.mobileDocList = mobileDocList;
module.exports.mobileReadDoc = mobileReadDoc;