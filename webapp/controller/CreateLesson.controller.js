sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "../model/formatter"
],
    function (BaseController, JSONModel, formatter) {
        "use strict";

        var oHeader = {
            items: []
        }

        return BaseController.extend("lessons.controller.CreateLesson", {

            formatter: formatter,

            onInit: function () {
                var oViewModel = new JSONModel({
                    busy: false,
                    delay: 0,
                }),

                    oLessonHeader = new JSONModel({
                        items: []
                    }),

                    oLessonData = new JSONModel({
                        items: []
                    });

                this.setModel(oLessonHeader, "HeaderData");
                this.setModel(oLessonData, "LessonData");
                this.setModel(oViewModel, "createOperation");
            },

            onAfterRendering: function () {
                if (this.getModel("appView").getProperty("/fromLaunchpad")) {
                    var that = this;
                    sessionStorage.setItem("goToLaunchpad", "");
                    window.addEventListener("message", function (event) {
                        var data = event.data;
                        if (data.action == "goToMainPage") {
                            that.onNavBack();
                        }
                    });
                } else {

                }
            },

            onCreateLesson: function () {
                var aControl = [],
                    aContainers = [],
                    oEntry;

                aControl.push(sap.m.Input, sap.m.DatePicker, sap.m.Select);
                aContainers.push("GeneralInfoContainer");

                var oHeaderFieldsChecked = this.checkEmptyFields(aControl, aContainers, ""),
                    oURLParams = new URLSearchParams(window.location.search),
                    oToken = oURLParams.get('token');

                if (oHeaderFieldsChecked) {
                    var sPath = "/Lessons",
                        oEntry = this.getModel("HeaderData").getData().items[0];

                    oEntry.To_Session_Item = this.getModel("LessonData").oData.items;

                    this.onCreate(sPath, oEntry, oToken);
                }
            },

            onSaveHeader: function () {
                var oModel = this.getView().getModel("HeaderData");
                var aControl = [],
                    aContainers = [];

                aControl.push(sap.m.DatePicker, sap.m.TimePicker);
                aContainers.push("GeneralInfoContainer");
                oModel.setProperty("/items", []);
                oHeader.oData = [];
                
                var oHeaderFieldsChecked = this.checkEmptyFields(aControl, aContainers, "");
                if (oHeaderFieldsChecked) {
                    var oEntry = {
                        LessonNo: "0000000000",
                        LessonDate: this.byId("lesson_date").getDateValue(),
                        InitHour: this.byId("init_hour").getValue(),
                        EndHour: this.byId("end_hour").getValue(),
                        To_Session_Item: []
                    };

                    oHeader.items.push(oEntry);
                    oModel.setData(oHeader);
                    this.onSaveLesson();
                } else {

                }
            },

            onSaveLesson: function () {
                var aButtons = [],
                    oSaveHeader = {
                        id: "SaveHeaderLesson",
                        visible: false
                    },
                    onEditHeader = {
                        id: "EditHeaderLesson",
                        visible: true
                    },
                    oCancelHeader = {
                        id: "CancelHeaderLesson",
                        visible: false
                    },
                    oAddDriver = {
                        id: "AddDriverToLesson",
                        visible: true
                    },
                    oDeleteDriver = {
                        id: "DeleteDriverToLesson",
                        visible: true
                    };

                aButtons.push(oSaveHeader, oAddDriver, oDeleteDriver, onEditHeader, oCancelHeader);

                this.onManageButtonsState(aButtons);
                this.onManageContainerFieldsState("GeneralInfoContainer", false);
            },

            onPressEditHeaderLesson: function () {
                var aButtons = [],
                    oConfirmButton = {
                        id: "SaveHeaderLesson",
                        visible: true
                    },
                    oEditButton = {
                        id: "EditHeaderLesson",
                        visible: false
                    },
                    oCancelButton = {
                        id: "CancelHeaderLesson",
                        visible: true
                    };

                aButtons.push(oConfirmButton, oEditButton, oCancelButton);

                this.onManageButtonsState(aButtons);
                this.onManageContainerFieldsState("GeneralInfoContainer", true);
            },

            onPressCancelLessonHeader: function () {
                var oLesson = this.getModel("HeaderData").oData.items[0],
                    sEdited = this.onValidateEditedFieldsHeader("GeneralInfoContainer", oLesson);

                if (sEdited) {
                    var that = this;
                    new sap.m.MessageBox.warning(this.getResourceBundle().getText("editLessonHeaderDataText"), {
                        title: this.getResourceBundle().getText("editLessonHeaderDataTitle"),
                        actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
                        emphasizedAction: sap.m.MessageBox.Action.OK,
                        onClose: function (oAction) {
                            if (oAction === sap.m.MessageBox.Action.OK) {
                                var oChecked = that.onSetContainerFieldsValues("GeneralInfoContainer");

                                if (oChecked) {
                                    that.onManageContainerFieldsState("GeneralInfoContainer", false);

                                    var aButtons = [],
                                        oConfirmButton = {
                                            id: "SaveHeaderLesson",
                                            visible: false
                                        },
                                        oEditButton = {
                                            id: "EditHeaderLesson",
                                            visible: true
                                        },
                                        oCancelButton = {
                                            id: "CancelHeaderLesson",
                                            visible: false
                                        };

                                    aButtons.push(oConfirmButton, oEditButton, oCancelButton);
                                    that.onManageButtonsState(aButtons);
                                }
                            }
                        }
                    });
                } else {
                    this.onManageContainerFieldsState("GeneralInfoContainer", false);

                    var aButtons = [],
                        oConfirmButton = {
                            id: "SaveHeaderLesson",
                            visible: false
                        },
                        oEditButton = {
                            id: "EditHeaderLesson",
                            visible: true
                        },
                        oCancelButton = {
                            id: "CancelHeaderLesson",
                            visible: false
                        };

                    aButtons.push(oConfirmButton, oEditButton, oCancelButton);
                    this.onManageButtonsState(aButtons);
                }
            },

            onSelectionChange: function (oEvent) {
                var oSource = oEvent.getSource(),
                    aSelectedPaths = oSource.getSelectedContextPaths();

                this.onEnabledTableButtons(aSelectedPaths.length);
            },

            onEnabledTableButtons: function (aSelectedPaths) {
                this.byId("DeleteDriverToLesson").setProperty("enabled", aSelectedPaths > 0);
            },

        });
    });
