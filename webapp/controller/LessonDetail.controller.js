sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "../model/formatter",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/VBox"
],
    function (BaseController, JSONModel, formatter, Dialog, Button, VBox) {
        "use strict";

        var aContainerFields = [
            {
                id: "lesson_date",
                control: "sap.m.DatePicker",
                value: "{lesson_date}",
                formatter: "true",
                name: "lesson_date"
            },
            {
                id: "init_hour",
                control: "sap.m.TimePicker",
                value: "{init_hour}",
                formatter: "true",
                name: "init_hour"
            },
            {
                id: "end_hour",
                control: "sap.m.TimePicker",
                value: "{end_hour}",
                formatter: "true",
                name: "end_hour"
            },
        ];

        var aContainerFieldLabels = [
            {
                id: "lesson_date",
                labelText: "lesson_date"
            },
            {
                id: "init_hour",
                labelText: "init_hour"
            },
            {
                id: "end_hour",
                labelText: "end_hour"
            }
        ]

        return BaseController.extend("lessons.controller.LessonDetail", {

            formatter: formatter,

            onInit: function () {
                var oViewModel = new JSONModel({
                    delay: 0,
                    busy: false,
                });

                this.sPath;

                this.setModel(oViewModel, "LessonDetail");
                this.getOwnerComponent().getRouter().attachRouteMatched(this.onObjectMatchedDetail, this);
            },

            onAfterRendering: function () {
                if (this.getModel("appView").getProperty("/fromLaunchpad")) {
                    var that = this;
                    sessionStorage.setItem("goToLaunchpad", "");
                    window.addEventListener("message", function (event) {
                        var data = event.data;
                        if (data.action == "goToMainPage") {
                            that.onNavBackDetail();
                        }
                    });
                } else {

                }
            },

            onBuildGeneralDataSimpleForm: function (oAction) {
                var oSimpleForm = this.byId("GeneralInfoContainer");

                oSimpleForm.destroyContent();

                var oToolbar = new sap.m.Toolbar({ ariaLabelledBy: "Title2" });

                oToolbar.addContent(new sap.m.ToolbarSpacer());

                var oConfirmButton = new sap.m.Button({
                    id: "ConfirmButton",
                    text: this.getResourceBundle().getText("saveLesson"),
                    type: sap.m.ButtonType.Emphasized,
                    press: this.onPressConfirmLesson.bind(this)
                });

                var oCancelButton = new sap.m.Button({
                    id: "CancelButton",
                    text: this.getResourceBundle().getText("cancelLesson"),
                    press: this.onPressCancelLesson.bind(this)
                });

                var oBtChange = new sap.m.Button({
                    id: "EditButton",
                    text: this.getResourceBundle().getText("editLesson"),
                    press: this.onPressEditLesson.bind(this)
                });

                if (oAction == 1) {
                    oConfirmButton.setVisible(false);
                    oCancelButton.setVisible(false);
                    oBtChange.setVisible(true);

                } else {
                    oConfirmButton.setVisible(true);
                    oCancelButton.setVisible(true);
                    oBtChange.setVisible(false);
                }

                oToolbar.addContent(oConfirmButton);
                oToolbar.addContent(oCancelButton);
                oToolbar.addContent(oBtChange);

                oSimpleForm.addContent(oToolbar);

                aContainerFields.forEach(oField => {
                    switch (oAction) {
                        case 1:
                            oSimpleForm.addContent(new sap.m.Label({
                                text: this.getResourceBundle().getText(aContainerFieldLabels.find(({ id }) => id === oField.id).labelText)
                            }));

                            if (oField.control == "sap.m.DatePicker") {
                                oSimpleForm.addContent(
                                    new sap.m.Text({
                                        id: oField.id,
                                        text: {
                                            path: oField.value.replace("{", "").replace("}", ""),
                                            type: 'sap.ui.model.type.DateTime',
                                            formatOptions: {
                                                style: 'short',
                                                strictParsing: true,
                                                pattern: "dd.MM.yyyy",
                                            }
                                        }
                                    })
                                );
                            } else if (oField.control == "sap.m.TimePicker") {
                                var formattedTime = this.convertEdmTimeToHHmmss(oField.id);

                                oSimpleForm.addContent(
                                    new sap.m.Text({
                                        id: oField.id,
                                        text: formattedTime
                                    })
                                );
                            }

                            break;
                        case 2:
                            switch (oField.control) {
                                case "sap.m.DatePicker":
                                    oSimpleForm.addContent(new sap.m.Label({
                                        text: this.getResourceBundle().getText(aContainerFieldLabels.find(({ id }) => id === oField.id).labelText)
                                    }));

                                    oSimpleForm.addContent(
                                        new sap.m.DateTimePicker({
                                            id: oField.id,
                                            name: oField.name,
                                            showTimezone: true,
                                            showCurrentTimeButton: true,
                                            required: true,
                                            enabled: oField.enabled,
                                            value: {
                                                path: oField.value.replace("{", "").replace("}", ""),
                                                type: 'sap.ui.model.type.DateTime',
                                                formatOptions: {
                                                    style: 'short',
                                                    strictParsing: true,
                                                    pattern: "dd.MM.yyyy"
                                                },
                                                valueFormat: "yyyy-MM-dd"
                                            },
                                        })
                                    );
                                    break;
                                case "sap.m.TimePicker":
                                    oSimpleForm.addContent(new sap.m.Label({
                                        text: this.getResourceBundle().getText(aContainerFieldLabels.find(({ id }) => id === oField.id).labelText)
                                    }));

                                    var formattedTime = this.convertEdmTimeToHHmmss(oField.id);
                                    oSimpleForm.addContent(
                                        new sap.m.TimePicker({
                                            id: oField.id,
                                            name: oField.name,
                                            required: true,
                                            enabled: oField.enabled,
                                            value: formattedTime,
                                            valueFormat: "HHmmss",
                                            displayFormat: "HH:mm",
                                            placeholder: "HH:mm"
                                        })
                                    );
                                    break;
                            }
                            break;
                    }

                });
            },

            onObjectMatchedDetail: function (oEvent) {
                this.onBindViewDetail("/" + oEvent.getParameter("config").pattern.replace("/{objectId}", "") + oEvent.getParameter("arguments").objectId);
            },

            onBindViewDetail: function (sObjectPath, bForceRefresh) {
                var that = this;
                this.sPath = sObjectPath;

                if (sObjectPath.includes("xTQAxLESSONS_ITEMS_DD")) {
                    var lessonNoMatch = sObjectPath.match(/lesson_no='([^']+)'/);
                    if (lessonNoMatch && lessonNoMatch[1]) {
                        var lessonNo = lessonNoMatch[1];
                        sObjectPath = "/xTQAxLessons_DD('" + lessonNo + "')";
                    }
                }

                this.getModel("appView").setProperty("/sPath", sObjectPath);
                this.getView().bindElement({
                    path: sObjectPath,
                    change: this.onBindingChange.bind(this),
                    events: {
                        dataRequested: function () {
                            this.getModel("appView").setProperty("/busy", true);
                        }.bind(this),
                        dataReceived: function () {
                            this.getModel("appView").setProperty("/busy", false);
                            this.onBuildGeneralDataSimpleForm(1);
                        }.bind(this)
                    }
                });

                if (bForceRefresh || !this.getView().getModel().getProperty("/" + sObjectPath)) {
                    this.getView().getModel().refresh();
                }
            },

            onNavBackDetail: function (oEvent) {
                sessionStorage.setItem("goToLaunchpad", "X");
                var that = this,
                    oLesson = this.getModel().getObject(this.getView().getBindingContext().getPath()),
                    sEdited = this.onValidateEditedFieldsHeader("GeneralInfoContainer", oLesson);

                if (sEdited) {
                    new sap.m.MessageBox.warning(this.getResourceBundle().getText("editLessonHeaderDataText"), {
                        title: this.getResourceBundle().getText("editLessonHeaderDataTitle"),
                        actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
                        emphasizedAction: sap.m.MessageBox.Action.OK,
                        onClose: function (oAction) {
                            if (oAction === sap.m.MessageBox.Action.OK) {
                                that.onBuildGeneralDataSimpleForm(1);
                                that.onNavigation("", "RouteMain", "");
                            }
                        }
                    });
                } else {
                    this.onNavigation("", "RouteMain", "");
                }

                this.byId("LessonItemsTable").removeSelections();
                this.byId("DeleteItemLesson").setEnabled(false);
            },

            onPressConfirmLesson: function () {
                var oLesson = this.getModel().getObject(this.getView().getBindingContext().getPath()),
                    sEdited = this.onValidateEditedFields("GeneralInfoContainer", oLesson);

                if (sEdited) {
                    var aControls = [sap.m.DatePicker, sap.m.TimePicker],
                        aContainers = ["GeneralInfoContainer"],
                        oMainControl = "";

                    var oChecked = this.checkEmptyFields(aControls, aContainers, oMainControl);

                    if (oChecked) {
                        var oLesson = this.getModel().getObject(this.getView().getBindingContext().getPath()),
                            oEntry = {
                                LessonNo: oLesson.lesson_no,
                                LessonDate: sap.ui.getCore().byId("lesson_date").getDateValue(),
                                InitHour: this.convertTimeFormat(sap.ui.getCore().byId("init_hour").getValue()),
                                EndHour: this.convertTimeFormat(sap.ui.getCore().byId("end_hour").getValue()),
                            };

                        var sPath = "/Lessons('" + oLesson.lesson_no + "')";

                        if (oEntry) {
                            this.onUpdate(sPath, oEntry);
                        } else {
                            new sap.m.MessageBox.error(this.getResourceBundle().getText("noPossibleLessonHeaderText"), {
                                title: this.getResourceBundle().getText("noPossibleLessonHeaderTitle"),
                                actions: [sap.m.MessageBox.Action.OK],
                                emphasizedAction: sap.m.MessageBox.Action.OK
                            });
                        }
                        this.onBuildGeneralDataSimpleForm(1);
                    }
                } else {
                    new sap.m.MessageBox.warning(this.getResourceBundle().getText("noDataEditedHeaderText"), {
                        title: this.getResourceBundle().getText("noDataEditedHeaderTitle"),
                        actions: [sap.m.MessageBox.Action.OK],
                        emphasizedAction: sap.m.MessageBox.Action.OK
                    });
                }
            },

            onPressEditLesson: function () {
                this.onBuildGeneralDataSimpleForm(2);
            },

            onPressCancelLesson: function () {
                var that = this,
                    oLesson = this.getModel().getObject(this.getView().getBindingContext().getPath()),
                    sEdited = this.onValidateEditedFieldsHeader("GeneralInfoContainer", oLesson);

                if (sEdited) {
                    new sap.m.MessageBox.warning(this.getResourceBundle().getText("editLessonHeaderDataText"), {
                        title: this.getResourceBundle().getText("editLessonHeaderDataTitle"),
                        actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
                        emphasizedAction: sap.m.MessageBox.Action.OK,
                        onClose: function (oAction) {
                            if (oAction === sap.m.MessageBox.Action.OK) {
                                that.onBuildGeneralDataSimpleForm(1);
                            }
                        }
                    });
                } else {
                    this.onBuildGeneralDataSimpleForm(1);
                }
            },

            onSelectionChange: function (oEvent) {
                var aSelectedPaths = oEvent.getSource().getSelectedContextPaths();

                this.byId("DeleteItemLesson").setProperty("enabled", aSelectedPaths.length > 0);
            },

            onPressDriverDetail: function (oEvent) {
                var sPath = oEvent.oSource.getBindingContext().sPath.replace("/xTQAxLESSONS_ITEMS_DD", "");
                sPath = sPath.replace(/lesson_no='[^']*',?/, '').replace(/(^,|,$)/g, '');

                var message = {
                    action: "navTo",
                    bHistory: true,
                    pathToOpen: sPath,
                    pathToBack: this.getModel("appView").getProperty("/sPath"),
                    appIdToBack: '039',
                    appIdToOpen: '013',
                    create: false
                }
                window.parent.postMessage(message, "*");
            },

            onOpenExamDetail: function () {
                if (this.byId("LessonItemsTable").getSelectedContexts().length > 0) {
                    var sPath = this.byId("LessonItemsTable").getSelectedContexts()[0].sPath.replace("/xTQAxLESSONS_DD", ""),
                        oModel = this.getModel(),
                        oAppViewModel = this.getModel("appView");

                    this.driverName = this.getModel().getObject(sPath).name

                    if (sPath) {
                        var that = this;

                        var str = sPath,
                            lessonNoMatch = str.match(/lesson_no='(\d+)'/),
                            lessonNo = lessonNoMatch ? lessonNoMatch[1] : null,
                            driverMatch = str.match(/usrid='(\d+)'/),
                            driverNo = driverMatch ? driverMatch[1] : null;

                        oModel.read("/Exams", {
                            filters: [
                                new sap.ui.model.Filter("LessonNo", sap.ui.model.FilterOperator.EQ, lessonNo),
                                new sap.ui.model.Filter("Driver", sap.ui.model.FilterOperator.EQ, driverNo)
                            ],
                            success: function (oData) {
                                that.onBuildExam(oData.results);
                            },
                            error: function (oError) {
                                var sError = JSON.parse(oError.responseText).error.message.value;

                                alert(sError);
                            }
                        });

                        oModel.attachRequestSent(function () {
                            oAppViewModel.setProperty("/busy", true);
                        });
                        oModel.attachRequestCompleted(function () {
                            oAppViewModel.setProperty("/busy", false);
                        });
                        oModel.attachRequestFailed(function () {
                            oAppViewModel.setProperty("/busy", false);
                        });
                    }
                } else {
                    new sap.m.MessageBox.warning(this.getResourceBundle().getText("noDataSelectedText"), {
                        title: this.getResourceBundle().getText("noDataSelectedTitle"),
                        actions: [sap.m.MessageBox.Action.OK],
                        emphasizedAction: sap.m.MessageBox.Action.OK
                    });
                }
            },

            onBuildExam: function (pData) {
                try {
                    var oVBox = new VBox("questionsVBox");

                    pData.forEach(function (oAnswerData, index) {
                        var aParsedPossibleAnswers = JSON.parse(oAnswerData.Json);

                        var oTitle = new sap.m.Title({
                            text: (index + 1) + ". " + oAnswerData.Description,
                            level: "H3"
                        });

                        oVBox.addItem(oTitle);

                        var oQuestionGroupVBox = new sap.m.VBox(),
                            letters = ["A) ", "B) ", "C) ", "D) ", "E) ", "F) ", "G) ", "H) ", "I) ", "J) "];

                        aParsedPossibleAnswers.forEach(function (oPossibleAnswer, answerIndex) {
                            var oLabel = new sap.m.Label({
                                text: letters[answerIndex] + oPossibleAnswer.DESCRIPTION,
                                customData: [
                                    new sap.ui.core.CustomData({
                                        key: "QUESTION_ITEM",
                                        value: oPossibleAnswer.QUESTION_ITEM
                                    })
                                ],
                                wrapping: true,
                                width: "100%"
                            });

                            var oCheckBox;
                            if (oPossibleAnswer.CORRECT && oPossibleAnswer.ANSWERED) {
                                oCheckBox = new sap.m.CheckBox({
                                    select: function (oEvent) {
                                        this.handleCheckBoxSelected(oEvent, oQuestionGroupVBox);
                                    }.bind(this),
                                    selected: true,
                                    valueState: "Success"
                                });
                            } else if (!oPossibleAnswer.CORRECT && oPossibleAnswer.ANSWERED) {
                                oCheckBox = new sap.m.CheckBox({
                                    select: function (oEvent) {
                                        this.handleCheckBoxSelected(oEvent, oQuestionGroupVBox);
                                    }.bind(this),
                                    selected: true,
                                    valueState: "Error"
                                });
                            } else {
                                oCheckBox = new sap.m.CheckBox({
                                    select: function (oEvent) {
                                        this.handleCheckBoxSelected(oEvent, oQuestionGroupVBox);
                                    }.bind(this),
                                    selected: false,
                                    valueState: "None"
                                });
                            }

                            var oHBox = new sap.m.HBox({
                                items: [oCheckBox, oLabel],
                                alignItems: "Center"
                            });

                            oQuestionGroupVBox.addItem(oHBox);
                        }.bind(this));

                        oVBox.addItem(oQuestionGroupVBox);
                    }.bind(this));

                    var oDialog = new Dialog({
                        title: "{i18n>questions} (" + this.driverName + ")",
                        contentWidth: "50%",
                        contentHeight: "70%",
                        draggable: true,
                        content: [oVBox],
                        resizable: true,
                        beginButton: new Button({
                            text: "{i18n>closeDialog}",
                            press: function () {
                                oDialog.close();
                            }
                        }),
                        afterClose: function () {
                            oDialog.destroy();
                        }
                    });

                    oDialog.addStyleClass("sapUiResponsivePadding--content sapUiResponsivePadding--header sapUiResponsivePadding--footer sapUiResponsivePadding--subHeader");

                    this.getView().addDependent(oDialog);
                    oDialog.open();

                } catch (error) {
                    var oMessage = {
                        oText: error.message,
                        oTitle: this.getResourceBundle().getText("error")
                    };

                    this.showErrorMessage(oMessage);
                }
            },

        });
    });
