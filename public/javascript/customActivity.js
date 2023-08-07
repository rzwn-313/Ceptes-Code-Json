"use strict";
if (
  !(window.self !== window.top) &&
  !(
    window.self.toString().endsWith("marketingcloudapps.com/") ||
    window.self.toString().endsWith("marketingcloudapps.com")
  )
) {
  document.location.href = "/accessDenied";
}

const validateForm = function (cb) {

  $form = $(".js-settings-form");

  $form.validate({
    submitHandler: function (form) {},
    errorPlacement: function () {},
  });

  $form.submit((event) => {
    $("#connect-load").css("display", "block");
    const formValues1 = {
      username: event.target.elements.username.value,
      password: event.target.elements.password.value,
      MID: JSON.parse(localStorage.getItem("tokens")).MID,
    };

    fetch("/login", {
      method: "POST",
      body: JSON.stringify(formValues1),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    })
      .then((res) => res.json())
      .then((response) => {
        if (response.redirect === true) {
          localStorage.setItem("username", response.username);

          window.location.href = `/dashboard?u=${localStorage.getItem(
            "username"
          )}&&mid=${JSON.parse(localStorage.getItem("tokens")).MID}`;
          // $("#connect-load").css("display", "none")
        } else if (response.redirect === false) {
          $("#connect-load").css("display", "none");
          $(".error").text(response.message);
        }
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

connection.on("initActivity", initialize);
connection.on("requestedTokens", onGetTokens);
connection.on("requestedEndpoints", onGetEndpoints);

connection.on("clickedNext", save);
connection.on('requestedInteraction', requestedInteractionHandler);
const buttonSettings = {
  button: "next",
  text: "done",
  visible: true,
  enabled: false,
};

function onRender() {
  connection.trigger("ready");
  connection.trigger("requestTokens");
  connection.trigger("requestEndpoints");
  connection.trigger('requestInteraction');
  
}

/**
 * Initialization
 * @param data
 */
function initialize(data) {
  if (data) {
    payload = data;
    sessionStorage.setItem("payload", JSON.stringify(data))
  }
  const hasInArguments = Boolean(
    payload["arguments"] &&
      payload["arguments"].execute &&
      payload["arguments"].execute.inArguments &&
      payload["arguments"].execute.inArguments.length > 0
  );

  const inArguments = hasInArguments
    ? payload["arguments"].execute.inArguments
    : {};

  $.each(inArguments, function (index, inArgument) {
    $.each(inArgument, function (key, value) {
      const $el = $("#" + key);
      if ($el.attr("type") === "checkbox") {
        $el.prop("checked", value === "true");
      } else {
        $el.val(value);
      }
    });
  });

  validateForm(function ($form) {
    buttonSettings.enabled = $form.valid();
    connection.trigger("updateButton", buttonSettings);
  });
}


/**
 *
 *
 * @param {*} tokens
 */
function onGetTokens(tokens) {
  localStorage.setItem("tokens", JSON.stringify(tokens));
  authTokens = tokens;

  let userData = document.getElementById("users");

  if (userData) {
    let users = JSON.parse(userData.value)[tokens.MID];
    if (
      users != undefined &&
      users.length > 0 &&
      users.filter((x) => x.username === localStorage.getItem("username"))
        .length > 0
    ) {
      document.location.href = `/dashboard?u=${localStorage.getItem(
        "username"
      )}&&mid=${JSON.parse(localStorage.getItem("tokens")).MID}`;
    } else {
      $("#loading").css("display", "none");
      $("#loginpage").css("display", "block");
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
}

/**
 * Save settings
 */
function save() {
    payload = JSON.parse(sessionStorage.getItem("payload"));
    
    
    
    
    payload["metaData"] = payload["metaData"] || {};
    payload["metaData"].isConfigured = true;
  

    payload["arguments"] = payload["arguments"] || {}
    payload["arguments"]["execute"] = payload["arguments"]["execute"] || {}
  
    payload["arguments"].execute.inArguments = [];
  
    payload["arguments"].execute.inArguments = [
      {
        contactKey: "{{Contact.Key}}"
      }
    ];
  
    payload["arguments"].execute.inArguments.unshift(
      localStorage.getItem("formValues")
    );
    localStorage.removeItem("formValues");
    connection.trigger("updateActivity", payload);
  
 
  // }
}

function requestedInteractionHandler (settings) {

        console.log("SETTINGS",settings.triggers[0].metaData.eventDefinitionKey)

}
$(document).ready(function () {
  if (
    window.self.location.pathname === "/dashboard" &&
    document.getElementById("tokenExpiredError").innerHTML
  ) {
    $(".message-form").hide();
    $(".redirect").show();
    localStorage.clear();
  } else {
    $(".redirect").hide();
  }

  $(".message-form").submit(function () {
    var formData = {};
    $.each($(this).serializeArray(), function (i, field) {
      formData[field.name] = field.value;
    });

    var matches = JSON.parse(formData.template).content.match(/{{[^{}]*}}/g);
    let templateDiv = document.getElementById("templateDiv");
    templateDiv.innerHTML += JSON.parse(formData.template).content;
    jQuery(".modalForm").append(
      `<input class="default-input" name="wabaId" type="hidden" value="${
        JSON.parse(formData.template).wabaId
      }">`
    );
    jQuery(".modalForm").append(
      `<input class="default-input" name="namespace" type="hidden" value="${
        JSON.parse(formData.template).name
      }">`
    );
    jQuery(".modalForm").append(
      `<input class="default-input" name="content" type="hidden" value="${
        JSON.parse(formData.template).content
      }">`
    );
    if (matches && matches.length) {
      for (let i = 0; i < matches.length; i++) {
        let input = jQuery(
          `<label class="dynamic-input">${matches[i]} :</label><input class="dynamic-input" required name="${matches[i]}">`
        );
        jQuery(".modalForm").append(input);
      }
    }

    jQuery(".modalForm").append(
      `<input class="dynamic-mid" name="mid" type="hidden" value=${
        JSON.parse(localStorage.getItem("tokens")).MID
      }>`
    );
    jQuery(".modalForm").append(
      `<input class="dynamic-mid" name="from" type="hidden" value=${formData.from}>`
    );
    jQuery(".modalForm").append(
      `<input class="dynamic-mid" name="to" type="hidden" value=${formData.to}>`
    );
    jQuery(".modalForm").append(
      '<input class="dynamic-next" type="submit" value="Save">'
    );

    $(".modal-wrapper").toggleClass("open");
    $(".page-wrapper").toggleClass("blur");
    return false;
  });

  $(".modalForm").submit(function (event) {
    var value = {};
    var mergeData = [];
    $('input[class^="dynamic-input"]').each(function (input) {
      value[$(this).attr("name")] = $(this).val();
      // value.push({
      //    [$(this).attr("name")]  : $(this).val()
      // });
    });
    $('input[class^="dynamic-input"]').each(function (input) {
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
      // templateId: event.target.elements.wabaId.value,
      namespace: event.target.elements.namespace.value,
      to: event.target.elements.to.value,
      from: event.target.elements.from.value,
      MID: JSON.parse(localStorage.getItem("tokens")).MID,
      username: localStorage.getItem("username"),
      mergeData: mergeData,
      // finalMessage: newTemp
    };

    localStorage.setItem("formValues", JSON.stringify(formValues));
    document.location.href = "/success";
    return false;
  });

  $(".trigger").click(function () {
    jQuery(".dynamic-input").remove();
    jQuery(".default-input").remove();
    jQuery(".static-input").remove();
    jQuery(".dynamic-mid").remove();
    jQuery(".dynamic-next").remove();
    let templateDiv = document.getElementById("templateDiv");
    templateDiv.innerHTML = "";
    $(".modal-wrapper").toggleClass("open");
    $(".page-wrapper").toggleClass("blur");
    return false;
  });

  $(".v1")
    .unbind("click")
    .click(function () {
      $(this).toggleClass("open");

      $(".templates").attr("style", "display:none;");
      $(".templates").css("display", "none");

      $(".v2>div>span>i").addClass("fa-angle-down");
      $(".v2>div>span>i").removeClass("fa-angle-up");

      $("i", this).toggleClass("fa-angle-down fa-angle-up");
      $(this).next().stop().animate(
        {
          height: "toggle",
          opacity: "toggle",
        },
        "slow"
      );
    });
  $(".v2 div")
    .unbind("click")
    .click(function () {
      $(this).toggleClass("close");

      $(".number").attr("style", "display:none;");
      $(".number").css("display", "none");
      $(".v1>h3>span>i").addClass("fa-angle-down");
      $(".v1>h3>span>i").removeClass("fa-angle-up");

      $("i", this).toggleClass("fa-angle-up fa-angle-down");
      $(this).parent().next().stop().animate(
        {
          height: "toggle",
          opacity: "toggle",
        },
        "slow"
      );
    });
});
