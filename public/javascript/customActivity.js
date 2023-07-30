'use strict';
if(!(window.self !== window.top) && !(window.self.toString().endsWith('marketingcloudapps.com/') || window.self.toString().endsWith('marketingcloudapps.com'))){
    document.location.href="/accessDenied";
   }

const validateForm = function(cb) {

    // let jwtAccessToken = localStorage.getItem("accessToken");
    // if(jwtAccessToken){
    // const decodedToken = parseJwt(jwtAccessToken);
    
    // var isExpiredToken = false;
    
    // var dateNow = new Date();
    
    // if(decodedToken.exp < dateNow.getTime()/1000)
    
    // {
    //        localStorage.removeItem("accessToken")
    //        isExpiredToken = true;
    // }
    
    // if(!isExpiredToken){
    //     $("#loading").css("display", "none");
    //     $("#loginpage").css("display", "none");
    //     window.location.href="/dashboard";
    //     // return false;
    // }
    // else{
    //     // window.location.href="/";
    //     $("#loading").css("display", "none");
    //     $("#loginpage").css("display", "block");
    // }}
    // else{
    //     // window.location.href="/";
    //     $("#loading").css("display", "none");
    //     $("#loginpage").css("display", "block");
    // }
    
    console.log("formValidation");
    $form = $('.js-settings-form');
  

    // payload["arguments"].execute.newVal = {templateId: 2, mid: 456, mergeData: ['Ruth', "Zeptoh"]}
    // console.log("initialPayload", payload["arguments"].execute.newVal)
    // connection.trigger('updateActivity', payload);
    
    $form.validate({
        submitHandler: function(form) { },
        errorPlacement: function () { },
    });

    $form.submit((event)=>{
        
        console.log(JSON.parse(localStorage.getItem('tokens')).MID, "LOCALSTORAGE");
        const formValues1 = {
            username: event.target.elements.username.value,
            password: event.target.elements.password.value,
            MID: JSON.parse(localStorage.getItem('tokens')).MID
        }
    console.log(formValues1, "FORM VALUES")
//     if(formValues1.username !== "admin" || formValues1.password !== "admin@123"){
//         $('.error').text('Incorrect Username/Password');
//     }
// else{
    fetch('/login', {
	method: 'POST',
	body: JSON.stringify(formValues1),
	headers: {
		'Content-type': 'application/json; charset=UTF-8'
	}
}).then(res=> res.json()).then( (response) => {
	console.log(response, "response")
    if(response.redirect === true){
        // localStorage.setItem("accessToken", response.accessToken)
        localStorage.setItem("username", response.username)
        // localStorage.setItem("accessToken", response.accessToken)
        // window.location.href = response.url;
        window.location.href = `/dashboard?u=${localStorage.getItem('username')}&&mid=${JSON.parse(localStorage.getItem('tokens')).MID}`
        // fetch('/getToken', {
        //     method: 'POST',
        //     body: JSON.stringify({username: formValues1.username, password: formValues1.password}),
	    //     headers: {
		//      'Content-type': 'application/json; charset=UTF-8'
	    //     }
        //   }).then((res)=> console.log("*****TOKEN", res)).catch((err)=> console.log(err))
        
    }
    else if(response.redirect === false){
        $('.error').text(response.message);
    }
    
    // $(location).prop('href', response.url)
});
// }  
    });


    cb($form);
    
};

let from = "";
const connection = new Postmonger.Session();
let authTokens = {};
let payload = {};
let formValues = {};
// let modalFormValues = {};
let $form;
$(window).ready(onRender);

connection.on('initActivity', initialize);
connection.on('requestedTokens', onGetTokens);
connection.on('requestedEndpoints', onGetEndpoints);

connection.on('clickedNext', save);

const buttonSettings = {
    button: 'next',
    text: 'done',
    visible: true,
    enabled: false,
};

function onRender() {
    connection.trigger('ready');
    connection.trigger('requestTokens');
    connection.trigger('requestEndpoints');

    // validation
    // validateForm(function($form) {
    //     $form.on('change click keyup input paste', 'input, textarea', function () {
    //         buttonSettings.enabled = $form.valid();
    //         connection.trigger('updateButton', buttonSettings);
    //     });
    // });
}

/**
 * Initialization
 * @param data
 */
function initialize(data) {
    console.log("data", data)
    if (data) {
        payload = data;
    }
    const hasInArguments = Boolean(
        payload['arguments'] &&
        payload['arguments'].execute &&
        payload['arguments'].execute.inArguments &&
        payload['arguments'].execute.inArguments.length > 0
    );
    console.log("hasInArguments", hasInArguments)


    const inArguments = hasInArguments
        ? payload['arguments'].execute.inArguments
        : {};

    $.each(inArguments, function (index, inArgument) {
        $.each(inArgument, function (key, value) {
            const $el = $('#' + key);
            if($el.attr('type') === 'checkbox') {
                $el.prop('checked', value === 'true');
            } else {
                $el.val(value);
            }
        });
    });
    
    validateForm(function($form) {
        buttonSettings.enabled = $form.valid();
        connection.trigger('updateButton', buttonSettings);
    });
}

function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

   return JSON.parse(jsonPayload);
}


/**
 *
 *
 * @param {*} tokens
 */
function onGetTokens(tokens) {
    console.log("tokens", tokens);
    localStorage.setItem("tokens", JSON.stringify(tokens))
    authTokens = tokens;

//     $("#loading").css("display", "none");
// $("#loginpage").css("display", "block");

  
    let userData = document.getElementById('users');

    if(userData){
        let users = JSON.parse(userData.value)[tokens.MID];
       if(users != undefined && users.length > 0 && users.filter(x=> x.username === localStorage.getItem("username")).length > 0){
        document.location.href=`/dashboard?u=${localStorage.getItem('username')}&&mid=${JSON.parse(localStorage.getItem('tokens')).MID}`;
       }
       else{
        $("#loading").css("display", "none");
        $("#loginpage").css("display", "block");
       }
    }
//     if(userData){
//         let users = JSON.parse(userData.value).users;
//         console.log("users", users)
//         if(users.filter(x=> x.MID === JSON.parse(localStorage.getItem('tokens')).MID && x.username === localStorage.getItem("username")).length > 0){
//            console.log("yes")
//            document.location.href=`/dashboard?accessToken=${localStorage.getItem('accessToken')}`;
//         }
//         else{
//            $("#loading").css("display", "none");
// $("#loginpage").css("display", "block");
//         }
//     }
   

}

/**
 *
 *
 * @param {*} endpoints
 */
function onGetEndpoints(endpoints) {
    console.log("endpoints", endpoints);
    // let sessionDetails = localStorage.getItem('sfmc-session');
    // console.log("sessionDetails", localStorage.getItem('sfmc-session'))
    // let sessionId = sessionDetails ? JSON.parse(sessionDetails).sessionKey.split('.')[0] : null
    // console.log("MID", sessionId);
}

/**
 * Save settings
 */
function save() {
    // if($form.valid()) {
        console.log("&&&&&&&&&&&PAYLOAD", payload.activityId)
        payload['metaData'].isConfigured = true;

        payload['arguments'].execute.inArguments = []

        payload['arguments'].execute.inArguments = [
            {
                "contactKey": "{{Contact.Key}}"
            },
        ];

        // payload['arguments'].execute.inArguments = []
        // console.log("&&&&&&&&&&&", $('#finalValue').val())
        payload['arguments'].execute.inArguments.unshift(localStorage.getItem("formValues"))
        localStorage.removeItem("formValues");
        // payload["arguments"].execute.inArguments.unshift({templateId: 2, mid: 456, mergeData: ['Ruth', "Zeptoh"]})
        // console.log("initialPayload", payload["arguments"].execute.inArguments[0])

        // "MID": "{{Contact.Key}}",
        //         "templateId": "{{Contact.Default.TemplateId}}",
        //         "templateContent": "{{Contact.Default.TemplateContent}}",
        //         "mergedValues": "{{Contact.Default.MergedValues}}",
        //         "finalMessage": "{{Contact.Default.FinalMessage}}"

        // $('.js-activity-setting').each(function () {
        //     const $el = $(this);
        //     const setting = {
        //         id: $(this).attr('id'),
        //         value: $(this).val()
        //     };

        //     $.each(payload['arguments'].execute.inArguments, function(index, value) {
        //         if($el.attr('type') === 'checkbox') {
        //             if($el.is(":checked")) {
        //                 value[setting.id] = setting.value;
        //             } else {
        //                 value[setting.id] = 'false';
        //             }
        //         } else {
        //             value[setting.id] = setting.value;
        //         }
        //     })
        // });
        connection.trigger('updateActivity', payload);
    // }
}


// modalFormValues.watch( 'p', function( id, oldVal, newVal ) {
//     console.log("******** values changed ********")
// });
$( document ).ready(function() {
   if(window.self.location.pathname === "/dashboard" && document.getElementById("tokenExpiredError").innerHTML){
    $('.message-form').hide()
    $('.redirect').show()
    localStorage.clear()
   }
   else{
    $('.redirect').hide()
   }
  

   console.log("*****************", payload)
    console.log("**",  document.referrer,
     document.location.href)
   
    $('.message-form').submit(function(){
        var formData = {};
$.each($(this).serializeArray(), function(i, field) {
    formData[field.name] = field.value;
});
        console.log( formData)
        // var values = $(this).serialize();
        // console.log(values.deserialize())
        // var formData = $(this).serializeArray().reduce(function(obj, item) {
        //     obj[item.name] = item.value;
        //     return JSON.parse(obj.template);
        // }, {});
        // console.log("formData", formData)
        // let numOfVars = formData.content.match(/{{/g);
        var matches = JSON.parse(formData.template).content.match(/{{[^{}]*}}/g);
        let templateDiv = document.getElementById('templateDiv');
        templateDiv.innerHTML += JSON.parse(formData.template).content;
        jQuery('.modalForm').append(`<input class="default-input" name="wabaId" type="hidden" value="${JSON.parse(formData.template).wabaId}">`);
        jQuery('.modalForm').append(`<input class="default-input" name="namespace" type="hidden" value="${JSON.parse(formData.template).name}">`);
        jQuery('.modalForm').append(`<input class="default-input" name="content" type="hidden" value="${JSON.parse(formData.template).content}">`);
        if(matches && matches.length){
            for(let i=0; i<matches.length;i++){
                console.log(i)
                let input = jQuery(`<label class="dynamic-input">${matches[i]} :</label><input class="dynamic-input" required name="${matches[i]}">`);
                jQuery('.modalForm').append(input);
            }
            
        }
        
        jQuery('.modalForm').append(`<input class="dynamic-mid" name="mid" type="hidden" value=${JSON.parse(localStorage.getItem('tokens')).MID}>`);
        jQuery('.modalForm').append(`<input class="dynamic-mid" name="from" type="hidden" value=${formData.from}>`);
        jQuery('.modalForm').append(`<input class="dynamic-mid" name="to" type="hidden" value=${formData.to}>`);
        jQuery('.modalForm').append('<input class="dynamic-next" type="submit" value="Save">');

       $('.modal-wrapper').toggleClass('open');
      $('.page-wrapper').toggleClass('blur');
       return false;
    });

    $('.modalForm').submit(function(event){
        // payload["arguments"].execute.inArguments.push("Hi Ruthh")
        
        var value = {};
        var mergeData = [];
        $('input[class^="dynamic-input"]').each(function(input){
            console.log("input name", $(this).attr("name"));
            value[$(this).attr("name")] = $(this).val()
            // value.push({
            //    [$(this).attr("name")]  : $(this).val()
            // });
            
        });
        $('input[class^="dynamic-input"]').each(function(input){
            mergeData.push($(this).val()); 
        });
        let newTemp = event.target.elements.content.value;
        const matches = event.target.elements.content.value.match(/{{[^{}]*}}/g);

        if (value && Object.keys(value).length && Object.keys(value).length > 0) {
          for (let i = 0; i < matches.length; i++) {
            newTemp = newTemp.replace(matches[i], value[matches[i]]);
          }
        }
       
         formValues = {
            templateId: event.target.elements.wabaId.value,
            namespace: event.target.elements.namespace.value,
            to: event.target.elements.to.value,
            from: event.target.elements.from.value,
            MID: JSON.parse(localStorage.getItem('tokens')).MID,
            mergeData: mergeData,
            finalMessage: newTemp
        }

        console.log("&&&&&&&&", formValues)
        
        // $('#finalValue').val(JSON.stringify(formValues));
        localStorage.setItem("formValues", JSON.stringify(formValues))
        document.location.href="/success";
        return false;
        // payload.arguments = {execute: {
        //     inArguments: [formValues]
        // }};

        // payload.arguments.execute.inArguments.unshift(formValues);
        // connection.trigger('updateActivity', payload);
       });
    // $('.modalForm').submit(function(){
    //     console.log("modalFormSubmitted")
    //     // let formVal = $(this).serializeArray().reduce(function(obj, item) {
    //     //     obj[item.name] = item.value;
    //     //     return obj;
    //     // }, {});
    
    //     // console.log(formVal)
    // });



    $('.trigger').click(function() {
        jQuery('.dynamic-input').remove();
        jQuery('.default-input').remove();
        jQuery('.static-input').remove();
        jQuery('.dynamic-mid').remove();
        jQuery('.dynamic-next').remove();
        let templateDiv = document.getElementById('templateDiv');
        templateDiv.innerHTML = '';
        $('.modal-wrapper').toggleClass('open');
       $('.page-wrapper').toggleClass('blur');
        return false;
     });

     
   $(".v1").unbind('click').click(function() {
    $(this).toggleClass('open');
    $("i", this).toggleClass("fa-angle-down fa-angle-up");
    $(this).next().stop().animate({
      height: "toggle",
      opacity: "toggle"
    }, "slow");
  });
  $(".v2 div").unbind('click').click(function() {
    $(this).toggleClass('close');
    $("i", this).toggleClass("fa-angle-up fa-angle-down");
    $(this).parent().next().stop().animate({
      height: "toggle",
      opacity: "toggle"
    }, "slow");
  });


  });


  

