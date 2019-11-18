//세션체크함수
var sessionCheck = (request, success, fail) => {
    //세션에 유저가 있다면
    if (request.session.user) {
        success();
    }
    else {
        fail();
    }
}

//페이징 함수
function indexOf(arr, obj){
    var index=-1;
    var keys=Object.keys(obj);

    var result = arr.filter(function(doc, idx){
        var matched = 0;

        for(var i = keys.length - 1; i >= 0; i--){
            if(doc[keys[i]]=== obj[keys[i]]){
                matched++;

                if(matched === keys.length){
                    index = idx;
                    return idx;
                }
            }
        }
    });

    return index;
}


module.exports.sessionCheck = sessionCheck;
module.exports.indexOf = indexOf;