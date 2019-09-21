function changeBoxSize(name){
    var obj = document.getElementsByName(name);
    var login_form = document.getElementById('login-form');
    var login_label = document.getElementById('login-label');
    var register_form = document.getElementById('register-form');
    var register_label = document.getElementById('register-label');

    $('#cardbox').animate({
        height: 'toggle',
    },500, function(){
        register_form.style.display = "block";
        register_label.style.display = "block";
        login_form.style.display = "none";
        login_label.style.display = "none";
    });

    $('#cardbox').animate({
        height: 'toggle',
    },500);
}

var idState = false;
var pwdState = false;
var pwdChkState = false;
var emailState = false;

var idTimer;
function idCheck(){
    var id = $('[name="id_r"]').val();
    var reg = /^[a-zA-Z0-9_]{4,25}$/;
    if(reg.test(id) === false || id.length < 4){
        $('#showIdRules').slideDown('fast');
        $('#showIdState').slideUp('fast');
        idState = false;
        submitClickable();
    }else{
        $('#showIdRules').slideUp('fast');

        if(idTimer){
            clearTimeout(timer);
        }

        timer = setTimeout(function(){
            $.ajax(
                {
                type:'GET',
                url:'./IDCHECK',
                data:{'id':id},
                success: (result)=>{
                    if(result==true & id.length!==0){
                        $('#showIdState').slideDown('fast');
                        idState = false;
                    }else{
                        $('#showIdState').slideUp('fast');
                        idState = true;
                    }
                    submitClickable();
                },
                error: (log)=>{console.log('실패:%s',log);}
                }
            );
        },200);
    }
    
}
function passwordRules(){
    var password = $('[name="password_r"]').val();
    var message =  document.getElementById('showPwdRules');
    var reg = /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,25}$/;

    if(reg.test(password) === false){
        $('#showPwdRules').slideDown('fast');
        pwdState = false;
    }else{
        $('#showPwdRules').slideUp('fast');
        pwdState = true;
    }
    submitClickable();
}

function passwordCheck(){
    var password = $('[name="password_r"]').val();
    var chkPassword = $('[name="chkPassword"]').val();

    if(password !== chkPassword){
        $('#showChkRules').slideDown('fast');
        pwdChkState = false;
    }else{
        $('#showChkRules').slideUp('fast');
        pwdChkState = true;
    }
    submitClickable();
}

function emailCheck(){
    var email = $('[name="email"]').val();
    var reg =/([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;
    if(reg.test(email) === false){
        $('#showEmailRules').slideDown('fast');
        emailState = false;
    }else{
        $('#showEmailRules').slideUp('fast');
        emailState = true;
    }
    submitClickable();
}

function submitClickable(){
    if(idState & pwdState & pwdChkState & emailState ){
        document.getElementById('regSubmit').disabled=false;
    }else{
        document.getElementById('regSubmit').disabled=true;
    }
}


var timer;
function gridBoxArrange(){
    if(timer){
        clearTimeout(timer);
    }
    timer = setTimeout(function(){
        console.log('호출');
        var elem = $('button.gridBtn');
        elem.height(elem.width());
        console.log(elem);
    },200);
    
}

function gridBoxStart(){
    console.log('호출');
        var elem = $('button.gridBtn');
        elem.height(elem.width());
        console.log(elem);
}