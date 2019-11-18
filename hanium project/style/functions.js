function changeBoxSize() {
    var login_form = document.getElementById('login-form');
    var login_label = document.getElementById('login-label');
    var register_form = document.getElementById('register-form');
    var register_label = document.getElementById('register-label');

    $('#cardbox').animate({
        height: 'toggle',
    }, 500, function () {
        register_form.style.display = "block";
        register_label.style.display = "block";
        login_form.style.display = "none";
        login_label.style.display = "none";
    });

    $('#cardbox').animate({
        height: 'toggle',
    }, 500);
}

var idState = false;
var pwdState = false;
var pwdChkState = false;
var emailState = false;
var categoryState = false;

var idTimer;
function idCheck() {
    var id = $('[name="id_r"]').val();
    var reg = /^[a-zA-Z0-9_]{4,25}$/;
    if (reg.test(id) === false || id.length < 4) {
        $('#showIdRules').slideDown('fast');
        $('#showIdState').slideUp('fast');
        idState = false;
        submitClickable();
    } else {
        $('#showIdRules').slideUp('fast');

        if (idTimer) {
            clearTimeout(idTimer);
        }

        idTimer = setTimeout(function () {
            $.ajax(
                {
                    type: 'GET',
                    url: './IDCHECK',
                    data: { 'id': id },
                    success: function (result) {
                        if (result == true & id.length !== 0) {
                            $('#showIdState').slideDown('fast');
                            idState = false;
                        } else {
                            $('#showIdState').slideUp('fast');
                            idState = true;
                        }
                        submitClickable();
                    },
                    error: function (log) { console.log('실패:%s', log); }
                }
            );
        }, 200);
    }

}
function passwordRules() {
    var password = $('[name="password_r"]').val();
    var message = document.getElementById('showPwdRules');
    var reg = /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,25}$/;

    if (reg.test(password) === false) {
        $('#showPwdRules').slideDown('fast');
        pwdState = false;
    } else {
        $('#showPwdRules').slideUp('fast');
        pwdState = true;
    }
    submitClickable();
}

function passwordCheck() {
    var password = $('[name="password_r"]').val();
    var chkPassword = $('[name="chkPassword"]').val();

    if (password !== chkPassword) {
        $('#showChkRules').slideDown('fast');
        pwdChkState = false;
    } else {
        $('#showChkRules').slideUp('fast');
        pwdChkState = true;
    }
    submitClickable();
}

function emailCheck() {
    var email = $('[name="email"]').val();
    var reg = /([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;
    if (reg.test(email) === false) {
        $('#showEmailRules').slideDown('fast');
        emailState = false;
    } else {
        $('#showEmailRules').slideUp('fast');
        emailState = true;
    }
    submitClickable();
}

function submitClickable() {
    if (idState & pwdState & pwdChkState & emailState) {
        document.getElementById('regSubmit').disabled = false;
    } else {
        document.getElementById('regSubmit').disabled = true;
    }
}


function isElementOverflow(element) {
    var overflowX = element.offsetWidth < element.scrollWidth;
    var overflowY = element.offsetHeight < element.scrollHeight;

    return (overflowX || overflowY);
}

function wrapContentsInMarquee(element) {
    var marquee = document.createElement('marquee');
    var contents = element.innerText;

    marquee.innerText = contents;
    element.innerHTML = '';
    element.appendChild(marquee);
}

function setMarqueeContents(className) {
    console.log('호출');
    var elements = document.getElementsByClassName(className);
    for (var i = 0; i < elements.length; i++) {
        if (isElementOverflow(elements[i])) {
            console.log(isElementOverflow(elements[i]));
            wrapContentsInMarquee(elements[i]);
        }
    }
}

var toggleFlag = false;
function showCreateBox(id) {
    if (toggleFlag == false) {
        $('#custom-container').css('pointer-events', 'none');
        var box = $('#' + id);
        box.animate(
            {
                top: '45%',
                opacity: 1
            }
            , 500, function () {
                toggleFlag = true;
            });
    }
}

function hideCreateBox(id) {
    if (toggleFlag == true) {
        $('#custom-container').css('pointer-events', 'all');
        var box = $('#' + id);
        box.animate(
            {
                top: '-50%',
                opacity: 0
            }
            , 500, function () {
                toggleFlag = false;
            });

    }
}


var categoryTimer;
function categoryCheck() {
    document.getElementById('categorySubmit').disabled = true;
    var categoryTitle = $('[name="categoryTitle"]').val();
    categoryTitle = categoryTitle.replace(/(^ *)|( *$)/g, "").replace(/ +/g, " ")

    if (categoryTitle.length == 0) {
        return;
    }
    if (categoryTimer) {
        clearTimeout(categoryTimer);
    }

    categoryTimer = setTimeout(function () {
        console.log(categoryTitle);
        $.ajax(
            {
                type: 'GET',
                url: '/CATEGORYCHECK',
                data: { 'categoryTitle': categoryTitle },
                success: function (result) {
                    if (result == true) {
                        $('#showCategoryState').slideDown('fast');
                        document.getElementById('categorySubmit').disabled = true;
                    } else {
                        $('#showCategoryState').slideUp('fast');
                        document.getElementById('categorySubmit').disabled = false;
                    }
                },
                error: function (log) { console.log('실패:%s', log); }
            }
        );
    }, 200);

}

function btnMouseOver(item) {
    $("[id=" + "'" + item + "'" + "]").show();
}

function btnMouseOut(item) {
    $("[id=" + "'" + item + "'" + "]").hide();
}


var toggleFlag2 = false;
function showDocumentBox(id, number, category) {
    if (toggleFlag2 == false) {
        $('#custom-container').css('pointer-events', 'none');
        $.ajax(
            {
                type: 'GET',
                url: '/SHOWDOCUMENT',
                data: { 'category': category, 'number': number },
                success: function (result) {
                    console.log(result);
                    if (result) {
                        $('#show-title').html(result.title);
                        $('#show-content').html(result.contents);
                    }
                },
                error: function (log) { console.log('실패:%s', log); }
            }
        );

        var box = $('#' + id);
        box.animate(
            {
                left: '1%',
                opacity: 1
            }
            , 500, function () {
                toggleFlag2 = true;
            });
    }
}

function hideDocumentBox(id) {
    if (toggleFlag2 == true) {
        $('#custom-container').css('pointer-events', 'all');
        var box = $('#' + id);
        box.animate(
            {
                left: '-200%',
                opacity: 0
            }
            , 500, function () {
                toggleFlag2 = false;
            });

    }
}

function paging(category, page, perPage) {
    window.location.href = '/main/' + category + '?page=' + page + '&perPage=' + perPage;
}

function confirm_delete(category, formid) {
    var retVal = prompt('삭제하시려면 ' + category + '을(를) 정확하게 입력하세요.');
    if (retVal == null) {
        return;
    }
    if (retVal == category) {
        $('#' + formid).submit();
    } else {
        alert('잘못 입력하셨습니다.');
    }

}

function confirm_docDelete(formid, trid) {
    if (confirm('정말 삭제하시겠습니까?')) {
        $('#' + trid)
            .find('td')
            .wrapInner('<div style="display: block;" />')
            .parent()
            .find('td > div')
            .animate(
                {
                    opacity:0,
                    height:0
                }
                ,700, function () {
                $('#'+formid).submit();
            });
    }
}