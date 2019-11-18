
var Schema = {};

Schema.createSchema = function (mongoose) {

    var CategorySchema = mongoose.Schema({
        creator: {type: mongoose.Schema.ObjectId, index:true, ref:'test0'/*TODO: 추후 제대로 된 컬렉션으로 변경 필요*/},
        categoryTitle: { type: String, require: true, 'defualt': 'NoName' },
        counter:{type:Number, require:true, 'default':0},
        created_at: { type: Date, index: { unique: false }, 'default': Date.now },
        updated_at: { type: Date, index: { unique: false }, 'default': Date.now }
    });
    
    CategorySchema.path('categoryTitle').required(true, '카테고리명을 입력해주세요.');

    CategorySchema.method('saveCategory',function(callback){
        var self = this;

        this.validate(function(err){
            if(err) return callback(err);

            self.save(callback);
        });
    });
    CategorySchema.static('getCategoryObjId',function(creator, categoryTitle, callback){
        return this.findOne({'creator':creator, 'categoryTitle':categoryTitle}, callback);
    });
    CategorySchema.static('findByCategory',function(creator, categoryTitle, callback){
        return this.find({'creator':creator, 'categoryTitle':categoryTitle}, callback);
    });
    CategorySchema.static('list',function(creator, callback){
        return this.find({'creator':creator})
        .sort({'created_at':1})
        .exec(callback);
    });
    CategorySchema.static('removeCategory',function(categoryObjId, callback){
        return this.deleteOne({'_id':categoryObjId}, callback);
    });

    console.log('CategorySchema 정의함');

    return CategorySchema;
}

module.exports = Schema;