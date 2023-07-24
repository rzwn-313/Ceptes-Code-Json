'use strict';
const validateForm = function(cb) {
    
    console.log("formValidation");
    $form = $('.js-settings-form');
    $form.validate({
        submitHandler: function(form) { },
        errorPlacement: function () { },
    });

    $form.submit((event)=>{
        console.log(JSON.parse(localStorage.getItem('tokens')).MID, "LOCALSTORAGE");
        const formValues = {
            username: event.target.elements.username.value,
            password: event.target.elements.password.value,
            MID: JSON.parse(localStorage.getItem('tokens')).MID
        }
    console.log(formValues, "FORM VALUES")

    fetch('/login', {
	method: 'POST',
	body: JSON.stringify(formValues),
	headers: {
		'Content-type': 'application/json; charset=UTF-8'
	}
}).then(res=> res.json()).then( (response) => {
	console.log(response, "response")
    if(response.redirect === true){
        window.location.href = response.url;
    }
    else if(response.redirect === false){
        $('.error').text('Incorrect Username/Password');
    }
    
    // $(location).prop('href', response.url)
});
       
    });

    cb($form);
    
};


const connection = new Postmonger.Session();
let authTokens = {};
let payload = {};
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

/**
 *
 *
 * @param {*} tokens
 */
function onGetTokens(tokens) {
    console.log("tokens", tokens);
    localStorage.setItem("tokens", JSON.stringify(tokens))
    authTokens = tokens;
    
    let userData = document.getElementById('users');
    if(userData){
        let users = JSON.parse(userData.value).users;
        console.log("users", users)
        if(users.filter(x=> x.MID === JSON.parse(localStorage.getItem('tokens')).MID).length > 0){
           console.log("yes")
           document.location.href="/dashboard";
        }
        else{
           console.log("no")
        }
    }
    

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
    if($form.valid()) {
        payload['metaData'].isConfigured = true;

        payload['arguments'].execute.inArguments = [
            {
                "contactKey": "{{Contact.Key}}"
            }
        ];

        // "MID": "{{Contact.Key}}",
        //         "templateId": "{{Contact.Default.TemplateId}}",
        //         "templateContent": "{{Contact.Default.TemplateContent}}",
        //         "mergedValues": "{{Contact.Default.MergedValues}}",
        //         "finalMessage": "{{Contact.Default.FinalMessage}}"

        $('.js-activity-setting').each(function () {
            const $el = $(this);
            const setting = {
                id: $(this).attr('id'),
                value: $(this).val()
            };

            $.each(payload['arguments'].execute.inArguments, function(index, value) {
                if($el.attr('type') === 'checkbox') {
                    if($el.is(":checked")) {
                        value[setting.id] = setting.value;
                    } else {
                        value[setting.id] = 'false';
                    }
                } else {
                    value[setting.id] = setting.value;
                }
            })
        });
        connection.trigger('updateActivity', payload);
    }
}
$( document ).ready(function() {

    console.log("**",  document.referrer,
     document.location.href)
    $('.message-form').submit(function(){
        // var values = $(this).serialize();
        // console.log(values.deserialize())
        var formData = $(this).serializeArray().reduce(function(obj, item) {
            obj[item.name] = item.value;
            return JSON.parse(obj.template);
        }, {});
        // let numOfVars = formData.content.match(/{{/g);
        var matches = formData.content.match(/{{[^{}]*}}/g);

        console.log(formData, matches)
        let templateDiv = document.getElementById('templateDiv');
        templateDiv.innerHTML += formData.content;
        jQuery('.modalForm').append(`<input class="default-input" name="wabaId" type="hidden" value="${formData.wabaId}">`);
        jQuery('.modalForm').append(`<input class="default-input" name="content" type="hidden" value="${formData.content}">`);
        if(matches && matches.length){
            for(let i=0; i<matches.length;i++){
                console.log(i)
                let input = jQuery(`<label class="dynamic-input">${matches[i]} :</label><input class="dynamic-input" name="${matches[i]}">`);
                jQuery('.modalForm').append(input);
            }
            
        }
        
        jQuery('.modalForm').append(`<input class="dynamic-mid" name="mid" type="hidden" value=${JSON.parse(localStorage.getItem('tokens')).MID}>`);
        jQuery('.modalForm').append('<input class="dynamic-next" type="submit" value="Next">');

       $('.modal-wrapper').toggleClass('open');
      $('.page-wrapper').toggleClass('blur');
       return false;
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
        jQuery('.dynamic-mid').remove();
        jQuery('.dynamic-next').remove();
        let templateDiv = document.getElementById('templateDiv');
        templateDiv.innerHTML = '';
        $('.modal-wrapper').toggleClass('open');
       $('.page-wrapper').toggleClass('blur');
        return false;
     });


  });


  

