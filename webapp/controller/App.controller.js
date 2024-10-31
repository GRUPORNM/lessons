sap.ui.define([
  "./BaseController",
  "sap/ui/model/json/JSONModel"
],
  function (BaseController, JSONModel) {
    "use strict";

    return BaseController.extend("lessons.controller.App", {
      onInit: function () {
        var oViewModel = new JSONModel({
          busy: false,
          delay: 0,
          fromLaunchpad: true
        });

        this.setModel(oViewModel, "appView");

        var urlParams = new URLSearchParams(window.location.search);
        var token = urlParams.get('token');
        this.setModelTQA(token);
        if (!sessionStorage.getItem("oLangu"))
          sap.ui.getCore().getConfiguration().setLanguage("EN");
        else {
          sap.ui.getCore().getConfiguration().setLanguage(sessionStorage.getItem("oLangu"));
        }

        var fnSetAppNotBusy = function () {
          oViewModel.setProperty("/busy", false);
          oViewModel.setProperty("/delay", 0);
        };

        if (sessionStorage.getItem("sPathBack") != 'undefined') {
          var sPath = sessionStorage.getItem("sPathBack");
          sessionStorage.removeItem("sPathBack");
          if (sPath) {
            this.onNavigation(sPath, "lessonDetail", "/xTQAxLESSONS_DD");
          }
        }
      }
    });
  });
