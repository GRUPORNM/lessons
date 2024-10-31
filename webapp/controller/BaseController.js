sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent"
], function (Controller, UIComponent) {
    "use strict";

    var TQAModel;

    var oData = {
        items: []
    };

    return Controller.extend("lessons.controller.BaseController", {
        getModelTQA: function () {
            return TQAModel;
        },

        setModelTQA: function (token) {
            var userLanguage = sessionStorage.getItem("oLangu");
            if (!userLanguage) {
                userLanguage = "EN";
            }
            var serviceUrlWithLanguage = this.getModel().sServiceUrl + (this.getModel().sServiceUrl.includes("?") ? "&" : "?") + "sap-language=" + userLanguage;

            TQAModel = new sap.ui.model.odata.v2.ODataModel({
                serviceUrl: serviceUrlWithLanguage,
                annotationURI: "/zsrv_iwfnd/Annotations(TechnicalName='%2FTQA%2FOD_LESSONS_ANNO_MDL',Version='0001')/$value/",
                headers: {
                    "authorization": token,
                    "applicationName": "SESSION_MANAGE"
                }
            });

            var vModel = new sap.ui.model.odata.v2.ODataModel({
                serviceUrl: "/sap/opu/odata/TQA/OD_VARIANTS_MANAGEMENT_SRV",
                headers: {
                    "authorization": token,
                    "applicationName": "SESSION_MANAGE"
                }
            });
            this.setModel(vModel, "vModel");
            this.setModel(TQAModel);
        },

        getRouter: function () {
            return UIComponent.getRouterFor(this);
        },

        getModel: function (sName) {
            return this.getView().getModel(sName);
        },

        setModel: function (oModel, sName) {
            return this.getView().setModel(oModel, sName);
        },

        getResourceBundle: function () {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },

        onNavBack: function () {
            sessionStorage.setItem("goToLaunchpad", "X");
            var aContainers = [];
            aContainers.push("GeneralInfoContainer");

            if (this.byId("requestDetailPage").getParent().getBindingContext()) {
                var aButtons = [],
                    oConfirmButton = {
                        id: "ConfirmButton",
                        visible: false
                    },
                    oEditButton = {
                        id: "EditButton",
                        visible: true
                    },
                    oCancelButton = {
                        id: "CancelButton",
                        visible: false
                    };

                aButtons.push(oConfirmButton, oEditButton, oCancelButton);

                this.onManageButtonsState(aButtons);
                this.onManageContainerFieldsState("GeneralInfoContainer", false);

                this.onNavigation("", "RouteMain", "");
            } else {
                var oContainerDataCleared = this.onClearContainersData(aContainers)

                if (oContainerDataCleared) {
                    this.onNavigation("", "RouteMain", "");
                }
            }
        },

        onNavigation: function (sPath, oRoute, oEntityName) {
            if (sPath) {
                this.getRouter().navTo(oRoute, {
                    objectId: sPath.replace(oEntityName, "")
                }, false, true);
            } else {
                this.getRouter().navTo(oRoute, {}, false, true);
            }
        },

        onObjectMatched: function (oEvent) {
            this.getUserAuthentication();
            this.onBindView("/" + oEvent.getParameter("config").pattern.replace("/{objectId}", "") + oEvent.getParameter("arguments").objectId);
        },

        onBindView: function (sObjectPath) {
            this.getView().bindElement({
                path: sObjectPath,
                change: this.onBindingChange.bind(this),
                events: {
                    dataRequested: function () {
                        this.getModel("appView").setProperty("/busy", true);
                    }.bind(this),
                    dataReceived: function () {
                        this.getModel("appView").setProperty("/busy", false);
                    }.bind(this)
                }
            });
        },

        onBindingChange: function () {
            var oView = this.getView(),
                oElementBinding = oView.getElementBinding();

            if (!oElementBinding.getBoundContext()) {
                this.getRouter().getTargets().display("notFound");

                return;
            }
        },

        onValidateEditedFields: function (oContainer, oObject) {
            var oEdited = false;
            this.byId(oContainer).getContent().forEach(oField => {

                if (oField instanceof sap.m.Input) {

                    if (oField.getValue() != oObject[oField.getName()]) {
                        oEdited = true;
                    }

                }
                else if (oField instanceof sap.m.DatePicker) {
                    var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({ pattern: 'dd.MM.yyyy' });

                    if (oField.getValue() != oDateFormat.format(oObject[oField.getName()])) {
                        oEdited = true;
                    }

                }
                else if (oField instanceof sap.m.Select) {

                    if (oField.getSelectedKey() != oObject[oField.getName()]) {
                        oEdited = true;
                    }

                }
                else if (oField instanceof sap.m.TimePicker) {

                    var oTimeValue = oField.getDateValue(),
                        oObjectTime = oObject[oField.getName()];

                    if (oTimeValue && oObjectTime) {
                        var oTimeFormat = sap.ui.core.format.DateFormat.getTimeInstance({ pattern: 'HH:mm:ss' }),
                            sFormattedTime = oTimeFormat.format(oTimeValue),
                            sFormattedObjectTime = this.convertEdmTimeToHHmmss(oField.getName());

                        if (sFormattedTime !== sFormattedObjectTime) {
                            oEdited = true;
                        }
                    } else if ((oTimeValue && !oObjectTime) || (!oTimeValue && oObjectTime)) {
                        oEdited = true;
                    }

                }
            });

            if (oEdited) {
                return true;
            } else {
                return false;
            }
        },

        onValidateEditedFieldsHeader: function (oContainer, oObject) {
            var oEdited = false;
            this.byId(oContainer).getContent().forEach(oField => {
                if (oField instanceof sap.m.Input) {

                    if (oField.getValue() != oObject[oField.getName()]) {
                        oEdited = true;
                    }

                } else if (oField instanceof sap.m.DatePicker) {
                    var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({ pattern: 'dd.MM.yyyy' });

                    if (oField.getValue() != oDateFormat.format(oObject[oField.getName()])) {
                        oEdited = true;
                    }

                } else if (oField instanceof sap.m.Select) {

                    if (oField.getSelectedKey() != oObject[oField.getName()]) {
                        oEdited = true;
                    }

                } else if (oField instanceof sap.m.TimePicker) {
                    var oTimeValue = oField.getDateValue(),
                        oObjectTime = oObject[oField.getName()];

                    if (oTimeValue && oObjectTime) {
                        var oTimeFormat = sap.ui.core.format.DateFormat.getTimeInstance({ pattern: 'HH:mm:ss' }),
                            sFormattedTime = oTimeFormat.format(oTimeValue),
                            sFormattedObjectTime = this.convertEdmTimeToHHmmss(oField.getName());

                        if (sFormattedTime !== sFormattedObjectTime) {
                            oEdited = true;
                        }
                    } else if ((oTimeValue && !oObjectTime) || (!oTimeValue && oObjectTime)) {
                        oEdited = true;
                    }

                }
            });

            return oEdited;
        },

        onManageButtonsState: function (aButtons) {
            if (aButtons.length > 0) {

                aButtons.forEach(oButton => {
                    this.byId(oButton.id).setVisible(oButton.visible);
                });

            }
        },

        onManageContainerFieldsState: function (oContainer, sState) {
            this.byId(oContainer).getContent().forEach(oField => {

                if (oField instanceof sap.m.Input || oField instanceof sap.m.Select || oField instanceof sap.m.DatePicker || oField instanceof sap.m.TimePicker) {
                    oField.setEnabled(sState);
                    oField.setValueState("None")
                }

            });
        },


        onSetContainerFieldsValues: function (oContainer) {
            var sPath = this.getView().getBindingContext().getPath(),
                oObject = this.getModel().getObject(sPath);

            if (sPath) {
                this.byId(oContainer).getContent().forEach(oField => {

                    if (oField instanceof sap.m.Input) {
                        oField.setValue(oObject[oField.getName()]);
                    }
                    else if (oField instanceof sap.m.Select) {
                        oField.setSelectedKey(oObject[oField.getName()]);
                    }
                    else if (oField instanceof sap.m.DatePicker) {
                        oField.setDateValue(oObject[oField.getName()]);
                    }
                });

                return true;
            } else {
                return false;
            }
        },

        onClearModelData: function () {
            try {
                var oDriverData = new sap.ui.model.json.JSONModel({
                    items: []
                });
                this.setModel(oDriverData, "LessonData");

                oData.items = [];
                this.aFields = [];

                return true;
            } catch (error) {
                var oMessage = {
                    oText: error.message,
                    oTitle: this.getResourceBundle().getText("errorMessageBoxTitle")
                }

                this.showErrorMessage(oMessage);
            }
        },

        onClearContainersData: function (aContainers) {
            try {
                aContainers.forEach(oContainer => {
                    var oForm = this.byId(oContainer);

                    oForm.getContent().forEach(oElement => {
                        if (oElement instanceof sap.m.Input || oElement instanceof sap.m.DatePicker || oElement instanceof sap.m.TimePicker) {
                            oElement.setValue(null);
                            oElement.setEnabled(true);
                            oElement.setValueState("None");
                            oElement.setValueStateText(null);
                        } else if (oElement instanceof sap.m.Select) {
                            oElement.setSelectedKey(null);
                        }
                    });
                });

                return true;
            } catch (error) {
                var oMessage = {
                    oText: error.message,
                    oTitle: this.getResourceBundle().getText("errorMessageBoxTitle")
                }

                this.showErrorMessage(oMessage);
            }
        },


        buildDialogs: function (oDialogInfo, aDialogFields, aDialogButtons) {
            try {
                this.oDialog = new sap.m.Dialog({
                    title: oDialogInfo.oTitle,
                    id: oDialogInfo.oId,
                    afterClose: this.onAfterClose.bind(this)
                });

                if (aDialogFields.length > 0) {

                    this.oDialog.addContent(this.oGrid = new sap.ui.layout.Grid({
                        defaultSpan: "L12 M12 S12",
                        width: "auto"
                    }));

                    this.oGrid.addContent(this.oSimpleForm = new sap.ui.layout.form.SimpleForm({
                        id: oDialogInfo.oId + "SimpleForm",
                        minWidth: 1024,
                        layout: oDialogInfo.oLayout,
                        labelSpanL: 3,
                        labelSpanM: 3,
                        emptySpanL: 4,
                        emptySpanM: 4,
                        columnsL: 2,
                        columnsM: 2,
                        maxContainerCols: 2,
                        editable: false
                    }));

                    aDialogFields.forEach(oField => {
                        switch (oField.oControl) {

                            case sap.m.Input:
                                this.oSimpleForm.addContent(
                                    new sap.m.Label({ text: oField.oLabelText, required: oField.oRequired })
                                )

                                this.oInput = new sap.m.Input({
                                    id: oField.oId,
                                    name: oField.oName,
                                    enabled: oField.oEnabled
                                });

                                if (oField.oSelectedKey != "") {
                                    this.oInput.setSelectedKey(oField.oSelectedKey);
                                } else if (oField.oValue != "") {
                                    this.oInput.setValue(oField.oValue);
                                }

                                this.oSimpleForm.addContent(this.oInput);
                                break;

                            case sap.m.Select:
                                if (oField.oItems != "") {
                                    this.oSimpleForm.addContent(
                                        new sap.m.Label({ text: oField.oLabelText, required: oField.oRequired })
                                    );

                                    this.oSelect = new sap.m.Select({
                                        id: oField.oId,
                                        name: oField.oName,
                                        enabled: oField.oEnabled,
                                        forceSelection: oField.oForceSelection,
                                    });

                                    this.oSelect.setModel(this.getModel());

                                    this.oSelect.bindAggregation("items", {
                                        path: oField.oItems,
                                        template: new sap.ui.core.Item({
                                            key: oField.oKey,
                                            text: oField.oText
                                        })
                                    });

                                    if (oField.oSelectedKey != "") {
                                        this.oSelect.setSelectedKey(oField.oSelectedKey);
                                    }

                                    this.oSimpleForm.addContent(this.oSelect);
                                }
                                break;

                            case sap.m.DatePicker:

                                this.oSimpleForm.addContent(
                                    new sap.m.Label({ text: oField.oLabelText })
                                );

                                this.oDatePicker = new sap.m.DatePicker({
                                    id: oField.oId,
                                    name: oField.oName,
                                    value: oField.oValue,
                                    valueFormat: oField.oValueFormat,
                                    required: oField.oRequired,
                                    enabled: oField.oEnabled,
                                    displayFormat: oField.oDisplayFormat,
                                    minDate: oField.oMinDate
                                })


                                if (oField.oValue1 != "") {
                                    this.oDatePicker.setDateValue(new Date(oField.oValue1));
                                }

                                this.oSimpleForm.addContent(this.oDatePicker);
                                break;

                            case sap.ui.unified.FileUploader:

                                this.oSimpleForm.addContent(
                                    new sap.m.Label({ text: oField.oLabelText }),
                                );

                                this.oFileUploader = new sap.ui.unified.FileUploader({
                                    id: oField.oId,
                                    name: oField.oName,
                                    enabled: oField.oEnabled,

                                    width: "100%",
                                    tooltip: oField.oTooltip
                                })

                                if (oField.oValue != "") {
                                    this.oFileUploader.setValue(oField.oValue);
                                }

                                this.oSimpleForm.addContent(this.oFileUploader);

                                break;

                        }
                    });

                    if (aDialogButtons.length > 0) {
                        aDialogButtons.forEach(oButton => {
                            this.oDialog.addButton(
                                new sap.m.Button({
                                    id: oButton.oId,
                                    text: oButton.oText,
                                    type: oButton.oType,
                                    press: oButton.oEvent
                                })
                            );
                        });
                    }

                }

                this.oDialog.open();

            } catch (error) {
                var oMessage = {
                    oText: error.message,
                    oTitle: this.getResourceBundle().getText("errorMessageBoxTitle")
                }

                this.showErrorMessage(oMessage);
            }

        },

        getFields: function (aControl, aContainers, oMainControl) {
            this.aFields = [];

            aContainers.forEach(oContainer => {
                var aContainerFields;

                if (oMainControl === "Dialog") {
                    aContainerFields = sap.ui.getCore().byId(oContainer).getContent().filter(oControl =>
                        aControl.some(ControlType => oControl instanceof ControlType)
                    );
                } else {
                    aContainerFields = this.byId(oContainer).getContent().filter(oControl =>
                        aControl.some(ControlType => oControl instanceof ControlType)
                    );
                }

                aContainerFields.forEach(oContainerField => {
                    var oField = {
                        id: oContainerField.getId(),
                        value: ""
                    };

                    try {
                        oField.value = oContainerField.getValue();
                    } catch (error) {
                        try {
                            oField.value = oContainerField.getSelectedKey();
                        } catch (e) {

                        }
                    }

                    this.aFields.push(oField);
                });
            });

            return this.aFields;
        },

        checkEmptyFields: function (aControl, aContainers, oMainControl) {
            this.getFields(aControl, aContainers, oMainControl);
            this.checked = true;

            this.aFields.forEach(oField => {
                var oControl;
                if (oMainControl === "Dialog") {
                    oControl = sap.ui.getCore().byId(oField.id);
                } else {
                    oControl = this.byId(oField.id);
                }

                if (oControl) {
                    if (oControl.getProperty("enabled") && oControl.getProperty("visible")) {
                        if (oControl.getValue && oControl.getValue() === "") {
                            oControl.setValueState("Error");
                            this.checked = false;
                        } else if (oControl.getSelectedKey && oControl.getSelectedKey() === "") {
                            oControl.setValueState("Error");
                            this.checked = false;
                        } else {
                            oControl.setValueState("None");
                        }
                    }
                }
            });

            return this.checked;
        },


        onOpenMessageBox: function (oAction) {
            var oMessage = {
                oTitle: "",
                oText: ""
            }

            oMessage.oTitle = this.getResourceBundle().getText("alertMessageTitle");
            oMessage.oText = this.getResourceBundle().getText("deleteRowFromLessonItems");

            this.showAlertMessage(oMessage, oAction);
        },

        showAlertMessage: function (oMessage, pAction) {
            var that = this;
            new sap.m.MessageBox.warning(oMessage.oText, {
                title: oMessage.oTitle,
                actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
                emphasizedAction: sap.m.MessageBox.Action.OK,
                onClose: function (oAction) {
                    if (oAction === sap.m.MessageBox.Action.OK) {
                        that.onDeleteDriver(pAction);
                    }
                }
            });
        },

        showErrorMessage: function (oMessage) {
            new sap.m.MessageBox.error(oMessage.oText, {
                title: oMessage.oTitle,
                actions: [sap.m.MessageBox.Action.OK],
                emphasizedAction: sap.m.MessageBox.Action.OK
            });
        },

        showSuccessMessage: function (oMessage) {
            new sap.m.MessageBox.success(this.getResourceBundle().getText(oMessage.oText), {
                title: this.getResourceBundle().getText(oMessage.oTitle),
                actions: [sap.m.MessageBox.Action.OK],
                emphasizedAction: sap.m.MessageBox.Action.OK,
            });
        },

        onCreate: function (sPath, oEntry, oToken) {
            try {
                if (sPath) {
                    var oModel = this.getModel(),
                        oAppViewModel = this.getModel("appView"),
                        that = this;

                    oModel.create(sPath, oEntry, {
                        headers: {
                            "authorization": oToken
                        },
                        success: function () {
                            var aContainers = [];
                            aContainers.push("GeneralInfoContainer")

                            var oModelDataCleared = that.onClearModelData(),
                                oContainersDataCleared = that.onClearContainersData(aContainers);

                            if (oModelDataCleared && oContainersDataCleared) {
                                oModel.refresh(true);
                                that.onNavigation("", "RouteMain", "");
                            }
                        },
                        error: function (oError) {
                            var sError = JSON.parse(oError.responseText).error.message.value;

                            sap.m.MessageBox.alert(sError, {
                                icon: "ERROR",
                                onClose: null,
                                styleClass: '',
                                initialFocus: null,
                                textDirection: sap.ui.core.TextDirection.Inherit
                            });
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
            } catch (error) {
                var oMessage = {
                    oText: error.message,
                    oTitle: this.getResourceBundle().getText("errorMessageBoxTitle")
                }

                this.showErrorMessage(oMessage);
            }
        },

        onUpdate: function (sPath, oEntry, oToken) {
            var that = this;
            try {
                if (sPath) {
                    var oModel = this.getModel(),
                        oAppViewModel = this.getModel("appView"),
                        oMessage = {
                            oText: "updateText",
                            oTitle: "updateTitle"
                        };

                    oModel.update(sPath, oEntry, {
                        headers: {
                            "authorization": oToken
                        },
                        success: function () {
                            oModel.refresh(true);
                            that.showSuccessMessage(oMessage);
                        },
                        error: function (oError) {
                            var sError = JSON.parse(oError.responseText).error.message.value;

                            sap.m.MessageBox.alert(sError, {
                                icon: "ERROR",
                                onClose: null,
                                styleClass: '',
                                initialFocus: null,
                                textDirection: sap.ui.core.TextDirection.Inherit
                            });
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
            } catch (error) {
                var oMessage = {
                    oText: error.message,
                    oTitle: this.getResourceBundle().getText("errorMessageBoxTitle")
                }

                this.showErrorMessage(oMessage);
            }
        },

        onDelete: function (sPath, oToken) {
            var that = this;
            try {
                if (sPath) {
                    var oModel = this.getModel(),
                        oAppViewModel = this.getModel("appView"),
                        oMessage = {
                            oText: "driverLessonDeletedText",
                            oTitle: "driverLessonDeletedTitle"
                        };

                    oModel.remove(sPath, {
                        headers: {
                            "authorization": oToken
                        },
                        success: function () {
                            oModel.refresh(true);
                            that.showSuccessMessage(oMessage);
                        },
                        error: function (oError) {
                            var sError = JSON.parse(oError.responseText).error.message.value;

                            sap.m.MessageBox.alert(sError, {
                                icon: "ERROR",
                                onClose: null,
                                styleClass: '',
                                initialFocus: null,
                                textDirection: sap.ui.core.TextDirection.Inherit
                            });
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
            } catch (error) {
                var oMessage = {
                    oText: error.message,
                    oTitle: this.getResourceBundle().getText("errorMessageBoxTitle")
                }

                this.showErrorMessage(oMessage);
            }
        },

        onOpenDriverDialog: function (oAction) {
            var aDialogFields = [],
                oDriver = {
                    oLabelText: this.getResourceBundle().getText("driver"),
                    oItems: "/xTQAxDRIVERS_VH",
                    oKey: "{usrid}",
                    oText: "{name}",
                    oId: "driver_vh",
                    oName: "driver_vh",
                    oRequired: true,
                    oEnabled: true,
                    oSelectedKey: "",
                    oForceSelection: false,
                    liveChange: true,
                    oControl: sap.m.Select
                },
                oDialogInfo = {
                    oId: "DriverDialog",
                    oLayout: "ResponsiveGridLayout",
                    oTitle: this.getResourceBundle().getText("DriverDialog")
                },
                aDialogButtons = [],
                oCancelButton = {
                    oId: "CancelDriverToLesson",
                    oText: this.getResourceBundle().getText("closeDialog"),
                    oType: "Default",
                    oEvent: function () {
                        this.onCloseDialog(oAction);
                    }.bind(this)
                },
                oConfirmButton = {
                    oId: "AddDriverToLesson",
                    oText: this.getResourceBundle().getText("addDriver"),
                    oType: "Emphasized",
                    oEvent: function () {
                        this.onAddDriver(oAction);
                    }.bind(this)
                };

            oDriver.oSelectedKey = "";

            aDialogButtons.push(oConfirmButton, oCancelButton);
            aDialogFields.push(oDriver);

            this.buildDialogs(oDialogInfo, aDialogFields, aDialogButtons);
        },

        onCloseDialog: function (oAction) {
            switch (oAction) {
                case 'LC':
                    this.byId("DriverDocumentationTable").removeSelections();
                    this.onEnabledTableButtons(this.byId("DriverDocumentationTable").getSelectedContextPaths().length);
                    break;

                case 'LE':
                    this.byId("LessonItemsTable").removeSelections();
                    break;
            }

            this.oDialog.close();
        },

        onAfterClose: function () {
            if (this.oDialog) {
                this.oDialog.destroy();
                this.oDialog = null;
            }
        },

        onAddDriver: async function (oAction) {
            try {
                switch (oAction) {
                    case 'LC':
                        var aControl = [],
                            aContainers = [],
                            oModel = this.getView().getModel("LessonData");

                        aControl.push(sap.m.Select);
                        aContainers.push(this.oSimpleForm.getId());

                        const checked = this.checkEmptyFields(aControl, aContainers, "Dialog");

                        if (checked) {
                            if (this.checked) {
                                var aRow = {
                                    LessonNo: "0000000000",
                                    Usrid: this.aFields.find(({ id }) => id === 'driver_vh').value,
                                    Name: sap.ui.getCore().byId("driver_vh").getSelectedItem().getText()
                                }

                                if (aRow) {
                                    oData.items.push(aRow);

                                    oModel.setData(oData);
                                    oModel.refresh(true);
                                }
                                this.onCloseDialog();
                            }
                        }
                        break;

                    case 'LE':
                        var oLesson = this.getModel().getObject(this.getView().getBindingContext().getPath()),
                            oModel = this.getModel(),
                            sPath = "/LessonsItems";

                        var oEntry = {
                            LessonNo: oLesson.lesson_no,
                            Usrid: sap.ui.getCore().byId("driver_vh").getSelectedKey(),
                            Name: sap.ui.getCore().byId("driver_vh").getSelectedItem().getText(),
                            // Obs: oCodCompartimento,
                        };

                        oModel.create(sPath, oEntry, {
                            success: function () {
                                oModel.refresh(true);
                            },
                            error: function (oError) {
                                var sError = JSON.parse(oError.responseText).error.message.value;

                                sap.m.MessageBox.alert(sError, {
                                    icon: "ERROR",
                                    onClose: null,
                                    styleClass: '',
                                    initialFocus: null,
                                    textDirection: sap.ui.core.TextDirection.Inherit
                                });
                            }
                        });

                        this.byId("LessonItemsTable").getBinding("items").refresh();
                        this.byId("DeleteItemLesson").setProperty("enabled", false);
                        this.onCloseDialog();
                        break;
                }
            } catch (error) {
                var oMessage = {
                    oText: error.message,
                    oTitle: this.getResourceBundle().getText("errorMessageBoxTitle")
                }

                this.showErrorMessage(oMessage);
            }
        },

        onDeleteDriver: function (pAction) {
            switch (pAction) {
                case 'D':
                    var oTable = this.byId("DriverDocumentationTable"),
                        oModel = this.getView().getModel("LessonData"),
                        oSelectedContextPath = oTable.getSelectedContextPaths()[0].replace("/items/", "");

                    oData.items.splice(oSelectedContextPath, 1);
                    oTable.removeSelections();

                    var aSelectedContextPaths = oTable.getSelectedContextPaths().length;
                    this.onEnabledTableButtons(aSelectedContextPaths);

                    oModel.refresh(true);
                    break;

                case 'LID':
                    var oLessonItemsTable = this.byId("LessonItemsTable"),
                        oObjectLoad = oLessonItemsTable.getSelectedContextPaths()[0];

                    if (oObjectLoad) {
                        this.onDelete(oObjectLoad, new URLSearchParams(window.location.search).get('token'));
                    }

                    this.byId("LessonItemsTable").getBinding("items").refresh();
                    this.byId("DeleteItemLesson").setProperty("enabled", false);
                    oLessonItemsTable.removeSelections();
                    break;
            }
        },

        convertEdmTimeToHHmmss: function (oField) {
            var oObject = this.getModel().getObject(this.sPath);

            if (oObject[oField]) {
                var ms = oObject[oField].ms,
                    minutes = Math.floor((ms / (1000 * 60)) % 60),
                    hours = Math.floor((ms / (1000 * 60 * 60)) % 24);

                return [hours, minutes]
                    .map(unit => String(unit).padStart(2, '0'))
                    .join(':');
            }
            return null;
        },

        convertTimeFormat: function (time) {
            if (time.includes('PM') || time.includes('AM')) {
                var timeParts = time.split(' '),
                    timeComponents = timeParts[1].split(':'),
                    hours = parseInt(timeComponents[0], 10),
                    minutes = timeComponents[1],
                    seconds = timeComponents[2];

                if (timeParts[2] === 'PM' && hours < 12) {
                    hours += 12;
                } else if (timeParts[2] === 'AM' && hours === 12) {
                    hours = 0;
                }
                return (hours < 10 ? '0' : '') + hours + minutes + seconds;
            } else {
                return time;
            }
        },

        getUserAuthentication: function (type) {
            var that = this,
                urlParams = new URLSearchParams(window.location.search),
                token = urlParams.get('token');

            if (token != null) {
                var headers = new Headers();
                headers.append("X-authorization", token);

                var requestOptions = {
                    method: 'GET',
                    headers: headers,
                    redirect: 'follow'
                };

                fetch("/sap/opu/odata/TQA/AUTHENTICATOR_SRV/USER_AUTHENTICATION", requestOptions)
                    .then(function (response) {
                        if (!response.ok) {
                            throw new Error("Ocorreu um erro ao ler a entidade.");
                        }
                        return response.text();
                    })
                    .then(function (xml) {
                        var parser = new DOMParser(),
                            xmlDoc = parser.parseFromString(xml, "text/xml"),
                            successResponseElement = xmlDoc.getElementsByTagName("d:SuccessResponse")[0],
                            response = successResponseElement.textContent;

                        if (response != 'X') {
                            that.getRouter().navTo("NotFound");
                        }
                        else {
                            that.getModel("appView").setProperty("/token", token);
                        }
                    })
                    .catch(function (error) {
                        console.error(error);
                    });
            } else {
                that.getRouter().navTo("NotFound");
                return;
            }
        },

    });
});