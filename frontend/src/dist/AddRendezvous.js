"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var react_1 = require("react");
var Calandar_1 = require("./components/Calandar");
var moment_1 = require("moment");
require("moment/locale/fr"); // Import French locale
var antd_1 = require("antd");
var Button_1 = require("./components/Button");
var swr_1 = require("swr");
var mutation_1 = require("swr/mutation");
var axios_1 = require("./axios");
var react_hook_form_1 = require("react-hook-form");
var zod_1 = require("zod");
var zod_2 = require("@hookform/resolvers/zod");
function AddRendezvous() {
    var _this = this;
    var _a = react_1.useState([]), events = _a[0], setEvents = _a[1];
    var calendarController = Calandar_1.createCalendarController();
    var _b = react_1.useState(moment_1["default"]()), date = _b[0], setDate = _b[1];
    // console.log(date.format("DD MMM YYYY"));
    calendarController.subscribe({
        eventsListner: function (events) {
            setEvents(events);
        },
        dateListner: function (date) {
            setDate(date);
        }
    });
    var _c = swr_1["default"]("/rendezvous/all", function (url) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, axios_1.fetcher.get(url)];
                case 1: return [2 /*return*/, (_a.sent()).data.map(function (r) {
                        return ({
                            id: r.id,
                            title: r.title,
                            date: moment_1["default"](r.dateTime),
                            description: r.description,
                            payload: {
                                client: r.client,
                                forfait: r.forfait
                            }
                        });
                    })];
            }
        });
    }); }), data = _c.data, refetch = _c.mutate;
    return (react_1["default"].createElement("div", { className: "event-wrapper w-full h-full grid md:grid-cols-8 max-w-[1200px] mx-auto py-5 px-5 md:px-0" },
        react_1["default"].createElement("div", { className: "col-span-4" },
            react_1["default"].createElement(Calandar_1.Calendar, { date: date, controller: calendarController, events: __spreadArrays((data !== null && data !== void 0 ? data : [])) })),
        react_1["default"].createElement(EventDisplay, { events: events, onEventAdded: function () {
                refetch();
            }, date: date })));
}
exports["default"] = AddRendezvous;
var addRendezVousSchema = zod_1.z.object({
    title: zod_1.z.string(),
    description: zod_1.z.string()
});
function EventDisplay(_a) {
    var _this = this;
    var events = _a.events, date = _a.date, onEventAdded = _a.onEventAdded;
    var _b = react_1.useState(false), createEventModalVisible = _b[0], setCreateEventModalVisible = _b[1];
    var createEvent = mutation_1["default"]("/rendezvous/create", function (url, _a) {
        var _b = _a.arg, title = _b.title, description = _b.description, date = _b.date, clientId = _b.clientId, forfaitId = _b.forfaitId;
        return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        // console.log({ title: title, description: description, date: date.toISOString(), clientId: clientId });
                        return [4 /*yield*/, axios_1.fetcher.post("/rendezvous/create", {
                                title: title,
                                description: description,
                                dateTime: date.toISOString(),
                                clientId: clientId,
                                forfaitId: forfaitId
                            })];
                    case 1: return [2 /*return*/, _c.sent()];
                }
            });
        });
    }, {
        onSuccess: function () {
            setCreateEventModalVisible(false);
            onEventAdded === null || onEventAdded === void 0 ? void 0 : onEventAdded();
        }
    }).trigger;
    var _c = swr_1["default"]("/users/get/student", function (url) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, axios_1.fetcher.get(url)];
                case 1: return [2 /*return*/, (_a.sent()).data];
            }
        });
    }); }, {
        onSuccess: function (data) {
            setStudentId(data[0].id);
        }
    }), students = _c.data, loadingStudents = _c.isLoading, errorStudents = _c.error;
    var _d = swr_1["default"]("/users/get/monitor", function (url) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, axios_1.fetcher.get(url)];
                case 1: return [2 /*return*/, (_a.sent()).data.toSorted(function (a, b) {
                        return a.name.localeCompare(b.name);
                    })];
            }
        });
    }); }), monitors = _d.data, loadingMonitors = _d.isLoading, errorMonitors = _d.error, refresh = _d.mutate;
    var _e = swr_1["default"]("/forfait/all", function (url) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, axios_1.fetcher.get(url)];
                case 1: return [2 /*return*/, (_a.sent()).data];
            }
        });
    }); }), forfaits = _e.data, loadingForfaits = _e.isLoading, errorForfaits = _e.error;
    var _f = react_hook_form_1.useForm({
        resolver: zod_2.zodResolver(addRendezVousSchema)
    }), register = _f.register, handleSubmit = _f.handleSubmit, errors = _f.formState.errors;
    var _g = react_1.useState(date), heureEtMinute = _g[0], setHeureEtMinute = _g[1];
    var _h = react_1.useState(heureEtMinute.hour()), heure = _h[0], setHeure = _h[1];
    var _j = react_1.useState(heureEtMinute.minute()), minute = _j[0], setMinute = _j[1];
    var _k = react_1.useState(null), studentId = _k[0], setStudentId = _k[1];
    var _l = react_1.useState(null), forfaitId = _l[0], setForfaitId = _l[1];
    react_1.useEffect(function () {
        setHeureEtMinute(date);
        setHeure(date.hour());
        setMinute(date.minute());
    }, [date.hour(), date.minute()]);
    // Add this function in the EventDisplay component or wherever you are managing events
    var handleDeleteEvent = function (eventId) { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    // Make a DELETE request to your backend API
                    return [4 /*yield*/, axios_1.fetcher("/rendezvous/delete/" + eventId, {
                            method: "DELETE"
                        })];
                case 1:
                    // Make a DELETE request to your backend API
                    _a.sent();
                    // Update the events state or refetch the events
                    onEventAdded === null || onEventAdded === void 0 ? void 0 : onEventAdded(); // Assuming you have a refetch function
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error("Error deleting event:", error_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    return (react_1["default"].createElement(react_1["default"].Fragment, null,
        react_1["default"].createElement(antd_1.Modal, { open: createEventModalVisible, onCancel: function () { return setCreateEventModalVisible(false); }, title: "Ajouter un rendez-vous", okButtonProps: {
                className: "hidden"
            } },
            react_1["default"].createElement("form", { className: "flex flex-col gap-2", onSubmit: handleSubmit(function (data) {
                    // console.log(data, heureEtMinute, studentId, forfaitId);
                    if (!studentId) {
                        alert("Veuillez choisir un client");
                        return;
                    }
                    if (!forfaitId) {
                        alert("Veuillez choisir un forfait");
                        return;
                    }
                    createEvent({
                        title: data.title,
                        description: data.description,
                        date: heureEtMinute,
                        clientId: studentId,
                        forfaitId: forfaitId
                    });
                }) },
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("label", { htmlFor: "titre" }, "Intervention*"),
                    react_1["default"].createElement("input", __assign({ type: "text", className: "w-full border border-gray-300 rounded-md p-2" }, register("title")))),
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("label", { htmlFor: "description" }, "Commentaire"),
                    react_1["default"].createElement("textarea", __assign({ className: "w-full border border-gray-300 rounded-md p-2" }, register("description")))),
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("label", null, "Client*"),
                    react_1["default"].createElement("select", { value: studentId !== null && studentId !== void 0 ? studentId : "", onChange: function (e) {
                            setStudentId(e.target.value);
                        }, className: "border border-gray-300 rounded-md p-2 w-full" },
                        react_1["default"].createElement("option", { value: "", disabled: true },
                            " ",
                            "-- Choisir un client --",
                            " "), students === null || students === void 0 ? void 0 :
                        students.map(function (student) { return (react_1["default"].createElement("option", { key: student.id, value: student.id },
                            student.name,
                            " ",
                            student.lastname)); }))),
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("label", null, "Employ\u00E9*"),
                    react_1["default"].createElement("select", { value: studentId !== null && studentId !== void 0 ? studentId : "", onChange: function (e) {
                            setStudentId(e.target.value);
                        }, className: "border border-gray-300 rounded-md p-2 w-full" },
                        react_1["default"].createElement("option", { value: "", disabled: true },
                            " ",
                            "-- Choisir un Employ\u00E9 --",
                            " "), monitors === null || monitors === void 0 ? void 0 :
                        monitors.map(function (monitor) { return (react_1["default"].createElement("option", { key: monitor.id, value: monitor.id },
                            monitor.name,
                            " ",
                            monitor.lastname)); }))),
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("label", null, "Intervention*"),
                    react_1["default"].createElement("select", { value: forfaitId !== null && forfaitId !== void 0 ? forfaitId : "", onChange: function (e) {
                            setForfaitId(e.target.value);
                        }, className: "border border-gray-300 rounded-md p-2 w-full" },
                        react_1["default"].createElement("option", { value: "", disabled: true },
                            " ",
                            "-- Choisir une intervention --",
                            " "), forfaits === null || forfaits === void 0 ? void 0 :
                        forfaits.map(function (forfait) { return (react_1["default"].createElement("option", { key: forfait.id, value: forfait.id },
                            forfait.name,
                            " ",
                            forfait.heure)); }))),
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("label", null, "Heure de rendez-vous*"),
                    react_1["default"].createElement("div", { className: "flex flex-row gap-2 items-center" },
                        react_1["default"].createElement("select", { value: heure, onChange: function (e) {
                                setHeure(parseInt(e.target.value));
                                setHeureEtMinute(heureEtMinute.hour(parseInt(e.target.value)));
                            }, className: "border border-gray-300 rounded-md p-2" }, Array.from({ length: 24 }).map(function (_, index) { return (react_1["default"].createElement("option", { key: index, value: index }, 
                        // display 0 as 00
                        index.toString().padStart(2, "0"))); })),
                        react_1["default"].createElement("select", { value: minute, onChange: function (e) {
                                setMinute(parseInt(e.target.value));
                                setHeureEtMinute(moment_1["default"](heureEtMinute).minute(parseInt(e.target.value)));
                            }, className: "border border-gray-300 rounded-md p-2" }, Array.from({ length: 60 }).map(function (_, index) { return (react_1["default"].createElement("option", { key: index, value: index }, 
                        // display 0 as 00
                        index.toString().padStart(2, "0"))); })))),
                react_1["default"].createElement(Button_1["default"], { type: "submit", useStyle: true, className: "w-full m-0" }, "Ajouter"))),
        react_1["default"].createElement("div", { className: "col-span-3 col-start-6 bg-white  h-fit p-3 rounded-lg shadow-sm flex flex-col gap-2" },
            react_1["default"].createElement("div", { className: "flex flex-col gap-2" },
                react_1["default"].createElement("div", { className: "flex flex-row justify-between items-center  border-gray-200 pb-2 mb-2" },
                    react_1["default"].createElement("div", { className: "text-xl font-semibold" }, "Rendez-vous"),
                    react_1["default"].createElement("div", { className: "text-sm text-gray-500" }, date.format("DD MMM YYYY")),
                    react_1["default"].createElement("div", { className: "text-sm text-gray-500" },
                        events.length,
                        " rendez-vous")),
                react_1["default"].createElement(Button_1["default"], { onClick: function () { return setCreateEventModalVisible(true); }, useStyle: true, className: "w-full m-0" }, "Ajouter un rendez-vous")),
            react_1["default"].createElement("div", { className: "flex flex-col gap-2 overflow-y-auto h-[450px]" }, events
                .toSorted(function (a, b) { return b.date.valueOf() - a.date.valueOf(); })
                .map(function (event, index) {
                var _a, _b;
                return (react_1["default"].createElement("div", { key: index, className: "flex flex-col gap-2border border-gray-200  p-3 bg-white shadow-md rounded-lg border" },
                    react_1["default"].createElement("div", { className: "flex flex-col space-y-1" },
                        react_1["default"].createElement("div", { className: "flex flex-row justify-between" },
                            react_1["default"].createElement("div", { className: "font-semibold text-lg" }, event.title),
                            react_1["default"].createElement("div", { className: "text-sm text-gray-500" }, event.date.format("DD MMM YYYY HH:mm")),
                            react_1["default"].createElement("div", null,
                                react_1["default"].createElement(Button_1["default"], { onClick: function () { return handleDeleteEvent(event.id); }, useStyle: true, className: "w-full m-0" }, "Supprimer"))),
                        react_1["default"].createElement("div", { className: "text-sm text-gray-500" },
                            event.description,
                            " - ",
                            event.payload.client.name,
                            " - ", (_a = event.payload.forfait) === null || _a === void 0 ? void 0 :
                            _a.name,
                            " - ", (_b = event.payload.forfait) === null || _b === void 0 ? void 0 :
                            _b.heure))));
            })))));
}
