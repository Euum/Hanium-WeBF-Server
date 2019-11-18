var sessionCheck = require('../utils/utils').sessionCheck;
var moment = require('moment');
//----------------------------------------------------------------------------
//
//                                Categories
//
//----------------------------------------------------------------------------


//카테고리 이름 중복체크
var categoryCheck = function (req, res) {
    sessionCheck(req,
        function () {
            var _id = req.session.user._id;
            var categoryTitle = req.body.categoryTitle || req.query.categoryTitle;
            var db = req.app.get('database');

            var regExp = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi;
            if(regExp.test(categoryTitle)){
                categoryTitle = categoryTitle.replace(regExp, "");
            }
            categoryTitle = categoryTitle.replace(/(^ *)|( *$)/g, "").replace(/ +/g, " ")
            if(categoryTitle==""){
                res.send(true);
                return;
            }
            db.CategoryModel.findByCategory(_id, categoryTitle, (err, results) => {
                var retVal = true;
                if (err) {
                    console.log(err);
                    return;
                }
                if (results.length > 0) {
                    retVal = true;
                } else {
                    retVal = false;
                }
                console.log(retVal);
                res.send(retVal);
            });
        },
        function () {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.write("<script>alert('세션이 만료되었습니다.'); window.location.href='/';</script>");
            res.end();
        }
    );
}
//카테고리 목록
var category = function (req, res) {
    sessionCheck(req,
        function () {
            var id = req.session.user.id;
            var _id = req.session.user._id;
            var db = req.app.get('database');
            db.CategoryModel.list(_id, function (err, results) {
                if (err) {
                    console.error('카테고리 조회중 오류 발생 [ 사용자명: ' + id + ' ]: ' + err.stack);
                    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                    res.write('<h2>카테고리 조회중 오류 발생</h2>');
                    res.write('<h3>관리자에게 문의하세요.</h3>');
                    res.end();
                    return;
                }
                var categories = [];
                console.log(results);
                if (results) {
                    categories = results;
                }
                res.render('category',
                    {
                        'categories': categories,
                        'id': id
                    }
                );
            });
        },
        function () {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.write("<script>alert('세션이 만료되었습니다.'); window.location.href='/';</script>");
            res.end();
        }
    );

}
//카테고리 추가
var addcategory = function (req, res) {
    sessionCheck(req,
        function () {
            var id = req.session.user.id
            var db = req.app.get('database');
            var categoryTitle = req.body.categoryTitle || req.query.categoryTitle;
            var regExp = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi;
            if(regExp.test(categoryTitle)){
                categoryTitle = categoryTitle.replace(regExp, "");
            }
            categoryTitle = categoryTitle.replace(/(^ *)|( *$)/g, "").replace(/ +/g, " ")
            if (db) {
                db.UserModel.findById(id, function (err, results) {
                    if (err) {
                        throw err;
                    }

                    if (results) {
                        var ObjectId = results[0]._doc._id;
                        var category = new db.CategoryModel({
                            creator: ObjectId,
                            'categoryTitle': categoryTitle
                        });

                        category.saveCategory(function (err, result) {
                            if (err) {
                                console.error('처리되지 않은 예외:' + err.stack);
                                return;
                            }

                            res.redirect('/main');
                        });
                    }
                });
            } else {
                console.log('db연결 실패');
                res.writeHead(200, { "Content-type": "text/html;charset=utf8" });
                res.write('<h2>DB연결 실패</h2>');
                res.end();
            }
        },
        function () {
            res.writeHead(200, { "Content-type": "text/html;charset=utf8" });
            res.write("<script>alert('세션이 만료되었습니다.'); window.location.href='/';</script>");
            res.end();
        }
    );
}

//TODO: 카테고리 삭제기능 - [선행기능]카테고리 내의 게시판 기능 구현후 완성할 것.
var delcategory = function (req, res) {
    sessionCheck(req,
        function(){
            var _id = req.session.user._id;
            var categoryTitle = req.body.categoryTitleforDel || req.query.categoryTitleforDel;
            var db = req.app.get('database');

            if(db){
                db.CategoryModel.getCategoryObjId(_id, categoryTitle,function(err, result){
                    if(err){
                        res.writeHead(200,{"Content-type":"text/html;charset=utf8"});
                        res.write('<h2>카테고리ID 검색 실패</h2>');
                        res.end();
                        return;
                    }

                    if(result){
                        var categoryObjectId = result._id;
                        console.dir(db.DocumentSchema);
                        db.CategoryModel.removeCategory(categoryObjectId,function(err){
                            if(err){
                                res.writeHead(200,{"Content-type":"text/html;charset=utf8"});
                                res.write('<h2>Document Cascading 실패</h2>');
                                res.end();
                                return;
                            }
                            db.DocumentModel.removeDocuments(categoryObjectId,function(err){
                                if(err){
                                    res.writeHead(200,{"Content-type":"text/html;charset=utf8"});
                                    res.write('<h2>Documents 삭제 실패</h2>');
                                    res.end();
                                    return;
                                }
                                res.writeHead(200, { "Content-type": "text/html;charset=utf8" });
                                res.write("<script>alert('카테고리 삭제 성공'); window.location.href='/';</script>");
                                res.end();
                                return;
                            });
                        });
                    }else{
                        res.writeHead(200,{"Content-type":"text/html;charset=utf8"});
                        res.write('<h2>해당 카테고리는 존재하지 않습니다.</h2>');
                        res.end();
                        return;
                    }

                });
            } else {
                res.writeHead(200,"Content-type","text/html;charset=utf8");
                res.write('<h2>DB연결 실패</h2>');
                res.end();
            }
        },
        function(){
            res.writeHead(200, { "Content-type": "text/html;charset=utf8" });
            res.write("<script>alert('세션이 만료되었습니다.'); window.location.href='/';</script>");
            res.end();
        }
        
    );
}



//----------------------------------------------------------------------------
//
//                                 Documents
//
//----------------------------------------------------------------------------
var documentlist = function (req, res) {
    console.log('documentlist 호출');
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
                        console.error('DB 접근중 문제 발생 :' + err.stack);
                        res.writeHead(200, { 'Content-Type': 'text/html;charset=utf8' });
                        res.write('<h2>DB 접근중 문제 발생</h2>');
                        res.write('<p>' + err.stack + '</p>');
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
                                console.log('글 조회 중 오류 발생:' + err.stack);
                                res.writeHead(200, { 'Content-Type': 'text/html;charset=utf8' });
                                res.write('<h2>글 조회 중 오류 발생</h2>');
                                res.write('<p>' + err.stack + '</p>');
                                res.end();
                                return;
                            }

                            if (results) {
                                console.dir(results);
                                //전체 문서 객체 수 확인
                                db.DocumentModel.countDocuments({writer:_id, category:categoryObjectId},function (err, count) {
                                    res.writeHead(200, { 'Content-Type': 'text/html;charset=utf8' });
                                    console.log('count:'+count);
                                    //뷰 템플릿을 사용하여 렌더링한 후 전송
                                    var context = {
                                        'id': id,
                                        category: categoryTitle,
                                        categoryid: categoryObjectId,
                                        documents: results,
                                        page: parseInt(page),
                                        pageCount: Math.ceil(count / perPage),
                                        'perPage': perPage,
                                        totalRecords: count,
                                        size: perPage,
                                        'moment': moment
                                    };
                                    console.dir(context);
                                    res.render('document', context, function (err, html) {
                                        if (err) {
                                            console.error('응답 웹문서 생성중 오류 발생 : ' + err.stack);
                                            res.writeHead(200, { 'Content-Type': 'text/html;charset=utf8' });
                                            res.write('<h2>응답 웹문서 생성중 오류 발생</h2>');
                                            res.write('<p>' + err.stack + '</p>');
                                            res.end();
                                            return;
                                        }
                                        res.end(html);
                                    });
                                });
                            }
                        });
                    } else {
                        console.log('카테고리 검색결과 없음');
                        res.writeHead(200, { 'Content-Type': 'text/html;charset=utf8' });
                        res.write('<h2>카테고리가 없습니다.</h2>');
                        res.end();
                        return;
                    }
                });
            } else {
                console.log('db연결 실패');
                res.writeHead(200, { "Content-type": "text/html;charset=utf8" });
                res.write('<h2>DB연결 실패</h2>');
                res.end();
            }
        },
        function () {
            res.writeHead(200, { "Content-type": "text/html;charset=utf8" });
            res.write("<script>alert('세션이 만료되었습니다.'); window.location.href='/';</script>");
            res.end();
        }
    );

}

//191014 작성
var adddocument = function (req, res) {

    sessionCheck(req,
        function () {
            var title = req.body.title || req.query.title;
            var category = req.body.category || req.query.category;
            var contents = req.body.contents || req.query.contents;
            var _id = req.session.user._id;
            var db = req.app.get('database');

            if (db) {
                var categoryObjectId = {};
                var counter = 0;
                db.CategoryModel.findByCategory(_id, category, function (err, results) {
                    if (err) {
                        console.error('DB 접근중 문제 발생 :' + err.stack);
                        res.writeHead(200, { 'Content-Type': 'text/html;charset=utf8' });
                        res.write('<h2>DB 접근중 문제 발생</h2>');
                        res.write('<p>' + err.stack + '</p>');
                        res.end();
                        return;
                    }
                    console.dir(results);
                    if (results.length != 0) {
                        categoryObjectId = results[0]._doc._id;
                        counter = results[0]._doc.counter;
                        var document = new db.DocumentModel({
                            'number' : counter + 1,
                            'title': title,
                            'category': categoryObjectId,
                            'contents': contents,
                            'writer': _id
                        });
                        
                        db.CategoryModel.findOneAndUpdate({creator:_id, categoryTitle:category},{$set:{counter: counter+1}},function(err){
                            console.log('카운터 업데이트');
                            if(err) {
                                throw err;
                            }
                        })

                        document.saveDocument(function (err, result) {
                            if (err) throw err;

                            return res.redirect('/main/' + category + '?page=0&perPage=10');
                        });
                    } else {
                        console.log('카테고리 검색결과 없음');
                        res.writeHead(200, { 'Content-Type': 'text/html;charset=utf8' });
                        res.write('<h2>카테고리가 없습니다.</h2>');
                        res.end();
                        return;
                    }
                });
            } else {
                console.log('db연결 실패');
                res.writeHead(200, { "Content-type": "text/html;charset=utf8" });
                res.write('<h2>DB연결 실패</h2>');
                res.end();
            }
        },
        function () {
            res.writeHead(200, { "Content-type": "text/html;charset=utf8" });
            res.write("<script>alert('세션이 만료되었습니다.'); window.location.href='/';</script>");
            res.end();
        }
    );
};

var showdocument = function(req, res){
    console.log('showdocument 호출');
    sessionCheck(req,
        function(){
            var category = req.body.category || req.query.category || req.params.category;
            var number = req.body.number || req.query.number || req.params.number;
            var _id = req.session.user._id;
            var db = req.app.get('database');
        
            console.log('요청: %s %s %s',_id, number, category);
            if(db){
                db.DocumentModel.load(_id, category, number, function(err, result){
                    if(err){
                        console.error('DB 접근중 문제 발생 :' + err.stack);
                        res.writeHead(200, { 'Content-Type': 'text/html;charset=utf8' });
                        res.write('<h2>DB 접근중 문제 발생</h2>');
                        res.write('<p>' + err.stack + '</p>');
                        res.end();
                        return;
                    }

                    if(result){
                        res.send(result);
                    }else{
                        res.send({title:'조회 실패', contents:'조회 실패'});
                    }
                });
            }else{
                console.log('db연결 실패');
                res.writeHead(200, { "Content-type": "text/html;charset=utf8" });
                res.write('<h2>DB연결 실패</h2>');
                res.end();
            }
        },
        function(){
            res.writeHead(200, { "Content-type": "text/html;charset=utf8" });
            res.write("<script>alert('세션이 만료되었습니다.'); window.location.href='/';</script>");
            res.end();
        }    
    );
}
var deldocument = function(req, res){

    sessionCheck(req,
        function(){
            var categoryObjId = req.body.categoryObjId || req.query.categoryObjId;
            var number = req.body.number || req.query.number;
            var db = req.app.get('database');
            console.log(categoryObjId+', '+number);
            if(db){
                db.DocumentModel.removeDocumentOne(categoryObjId,number,function(err){
                    if(err){
                        res.writeHead(200, { "Content-type": "text/html;charset=utf8" });
                        res.write('<h2>Document 삭제 실패</h2>');
                        res.end();
                        return;
                    }
                    res.writeHead(200, { "Content-type": "text/html;charset=utf8" });
                    res.write("<script>window.location = document.referrer;</script>");
                    res.end();
                });
            }else{
                console.log('db연결 실패');
                res.writeHead(200, { "Content-type": "text/html;charset=utf8" });
                res.write('<h2>DB연결 실패</h2>');
                res.end();
            }
        },
        function(){
            res.writeHead(200, { "Content-type": "text/html;charset=utf8" });
            res.write("<script>alert('세션이 만료되었습니다.'); window.location.href='/';</script>");
            res.end();
        }    
    )
}

module.exports.categoryCheck = categoryCheck;
module.exports.category = category;
module.exports.addcategory = addcategory;
module.exports.delcategory = delcategory;
module.exports.documentlist = documentlist;
module.exports.adddocument = adddocument;
module.exports.showdocument = showdocument;
module.exports.deldocument = deldocument;