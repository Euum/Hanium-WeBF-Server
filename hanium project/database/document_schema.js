var utils = require('../utils/utils');
var Schema = {};

Schema.createSchema = function(mongoose){
    var DocumentSchema = mongoose.Schema({
        number:{type:Number, require: true, index:true, 'default':-1},
        title: {type: String, require: true, 'default': 'untitled'},
        category: {type:mongoose.Schema.ObjectId, index:true, ref:'category0'/*TODO: 추후 제대로 된 컬렉션으로 변경 필요*/},
        writer: {type:mongoose.Schema.ObjectId, inbex:true, ref:'test0'/*TODO: 추후 제대로 된 컬렉션으로 변경 필요*/},
        contents : {type: String, trim:true, 'default':'내용이 없습니다.'},
        created_at: { type: Date, index: { unique: false }, 'default': Date.now },
        updated_at: { type: Date, index: { unique: false }, 'default': Date.now },
    });

    DocumentSchema.path('title').required(true, '글 제목을 입력해주세요.');
    DocumentSchema.path('contents').required(true, '글 내용을 입력해주세요');

    DocumentSchema.method('saveDocument', function(callback){
        var self = this;

        this.validate(function(err){
            if(err) return callback(err);

            self.save(callback);
        });
    });

    DocumentSchema.static('load', function(writerid, categoryid, number, callback){
        this.findOne({'writer':writerid, 'category':categoryid, 'number':number})
        .populate('writer','id')
        .populate('category', 'categoryTtitle')
        .exec(callback);
    });
    DocumentSchema.static('list', function(options, callback){
        var criteria = options.criteria || {};

        this.find(criteria)
        .populate('writer','id')
        .sort({'created_at':-1})
        .limit(Number(options.perPage))
        .skip(options.perPage * options.page)
        .exec(callback);
    });
    DocumentSchema.static('removeDocuments',function(categoryObjId,callback){
        return this.deleteMany({'category':categoryObjId}, callback);
    });
    DocumentSchema.static('removeDocumentOne',function(categoryObjId,number,callback){
        return this.deleteOne({'category':categoryObjId, 'number':number},callback);
    })

    return DocumentSchema;
}

module.exports = Schema;