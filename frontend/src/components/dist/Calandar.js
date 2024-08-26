"use strict";
exports.__esModule = true;
exports.Calendar = exports.createCalendarController = void 0;
var utils_1 = require("../utils");
var react_1 = require("react");
var moment_1 = require("moment");
require("moment/locale/fr"); // Import French locale
var lucide_react_1 = require("lucide-react");
var CalendarController = /** @class */ (function () {
    function CalendarController() {
        this.eventListners = new Set();
    }
    CalendarController.prototype._subscribe = function (eventListner) {
        var _this = this;
        this.eventListners.add(eventListner);
        return function () {
            _this.eventListners["delete"](eventListner);
        };
    };
    CalendarController.prototype.publish = function (event, date) {
        this.eventListners.forEach(function (eventListner) {
            if (eventListner.eventListner) {
                if (event.length > 0) {
                    eventListner.eventListner(event[0]);
                }
            }
            if (eventListner.eventsListner) {
                eventListner.eventsListner(event);
            }
            if (eventListner.dateListner) {
                eventListner.dateListner(date);
            }
        });
        return this;
    };
    CalendarController.prototype.subscribe = function (eventListner) {
        var _this = this;
        react_1.useEffect(function () {
            var unsub = _this._subscribe(eventListner);
            return function () {
                unsub();
            };
        }, []);
    };
    return CalendarController;
}());
function createCalendarController() {
    return react_1.useMemo(function () { return new CalendarController(); }, []);
}
exports.createCalendarController = createCalendarController;
function Calendar(_a) {
    var className = _a.className, _b = _a.events, events = _b === void 0 ? [] : _b, controller = _a.controller, date = _a.date;
    var months = moment_1["default"].months();
    var years = Array.from({ length: 10 }, function (_, index) { return new Date().getFullYear() + index; });
    var _c = react_1.useState(new Date().getMonth()), selectedMonth = _c[0], setSelectedMonth = _c[1];
    var _d = react_1.useState(new Date().getFullYear()), selectedYear = _d[0], setSelectedYear = _d[1];
    var _e = react_1.useState([]), daysInMonth = _e[0], setDaysInMonth = _e[1];
    var _f = react_1.useState(0), emptySlots = _f[0], setEmptySlots = _f[1];
    var _g = react_1.useState([]), weekDays = _g[0], setWeekDays = _g[1];
    react_1.useEffect(function () {
        var daysArray = [];
        var daysCount = moment_1["default"]([selectedYear, selectedMonth]).daysInMonth();
        for (var i = 1; i <= daysCount; i++) {
            var currentMoment = moment_1["default"]([selectedYear, selectedMonth, i]);
            currentMoment.locale("fr");
            daysArray.push({
                number: i,
                name: currentMoment.format("ddd"),
                moment: currentMoment
            });
        }
        var getDays = function (arr) {
            var days = [];
            arr.forEach(function (day) {
                if (day.moment.weekday() !== 1 && days.length === 0) {
                    return;
                }
                if (!days.includes(day.name)) {
                    days.push(day.name);
                }
            });
            return days;
        };
        var days = getDays(daysArray).map(function (day) { return day.toLowerCase(); });
        setWeekDays(days);
        var firstDayOfMonth = daysArray[0].name.toLowerCase();
        var emptySlots = days.indexOf(firstDayOfMonth);
        // console.log(days, firstDayOfMonth, emptySlots);
        setDaysInMonth(daysArray);
        setEmptySlots(emptySlots);
    }, [selectedMonth, selectedYear]);
    react_1.useEffect(function () {
        var todayEvents = events.filter(function (event) {
            return event.date.isSame(new Date(), "day");
        });
        controller === null || controller === void 0 ? void 0 : controller.publish(todayEvents, moment_1["default"](new Date()));
    }, []);
    react_1.useEffect(function () {
        var eventsAvailble = events.filter(function (event) {
            return event.date.isSame(new Date(), "day");
        });
        controller === null || controller === void 0 ? void 0 : controller.publish(eventsAvailble, moment_1["default"](new Date()));
        // console.log(eventsAvailble);
    }, [events.length]);
    var _h = react_1.useState(null), selectedDay = _h[0], setSelectedDay = _h[1];
    return (react_1["default"].createElement("div", { className: utils_1.cn("w-full rounded-md bg-white shadow-md h-fit", className) },
        react_1["default"].createElement("div", { className: "flex justify-between p-4" },
            react_1["default"].createElement("select", { className: "rounded-md border border-gray-300 p-2 text-gray-600 font-semibold", value: selectedMonth, onChange: function (e) { return setSelectedMonth(parseInt(e.target.value)); } }, months.map(function (month, index) { return (react_1["default"].createElement("option", { key: index, value: index }, month)); })),
            react_1["default"].createElement("div", { className: "flex gap-2 items-center" },
                react_1["default"].createElement("button", { className: "rounded-lg border border-gray-300 p-2 text-gray-400 h-8 w-8 hover:bg-gray-100 hover:text-gray-500", onClick: function () {
                        // prev month
                        if (selectedMonth === 0) {
                            setSelectedMonth(11);
                            setSelectedYear(selectedYear - 1);
                            return;
                        }
                        setSelectedMonth(selectedMonth - 1);
                    } },
                    react_1["default"].createElement(lucide_react_1.Minus, { size: 16 })),
                react_1["default"].createElement("button", { className: "rounded-lg  border border-gray-300 p-2 text-gray-400 h-8 w-8 hover:bg-gray-100 hover:text-gray-500", onClick: function () {
                        // next month
                        if (selectedMonth === 11) {
                            setSelectedMonth(0);
                            setSelectedYear(selectedYear + 1);
                            return;
                        }
                        setSelectedMonth(selectedMonth + 1);
                    } },
                    react_1["default"].createElement(lucide_react_1.Plus, { size: 16 })),
                react_1["default"].createElement("button", { className: "rounded-lg border border-gray-300 p-2 text-gray-400 h-8 flex items-center hover:bg-gray-100 hover:text-gray-500", onClick: function () {
                        setSelectedMonth(new Date().getMonth());
                        setSelectedYear(new Date().getFullYear());
                    } },
                    react_1["default"].createElement("span", { className: "text-gray-600 font-semibold text-sm" }, moment_1["default"](new Date()).format("DD MMM YYYY")))),
            react_1["default"].createElement("select", { className: "rounded-md border border-gray-300 p-2 text-gray-600 font-semibold", value: selectedYear, onChange: function (e) { return setSelectedYear(parseInt(e.target.value)); } }, years.map(function (year) { return (react_1["default"].createElement("option", { key: year, value: year }, year)); }))),
        react_1["default"].createElement("div", { className: "p-4 grid grid-cols-7 gap-2" },
            weekDays.map(function (day) { return (react_1["default"].createElement("div", { key: day, className: "p-2 border text-center h-16 w-16 flex items-center justify-center flex-col rounded-lg shadow-sm bg-gray-100 font-bold text-gray-500 text-xl capitalize" }, day)); }),
            Array.from({ length: emptySlots }).map(function (_, index) { return (react_1["default"].createElement("div", { key: index })); }),
            daysInMonth.map(function (day) {
                var eventsAvailble = events.filter(function (event) {
                    return event.date.isSame(day.moment, "day");
                });
                return (react_1["default"].createElement("div", { onClick: function () {
                        controller === null || controller === void 0 ? void 0 : controller.publish(eventsAvailble, day.moment);
                        setSelectedDay(day.moment); // Update the selected day
                    }, key: day.number, className: utils_1.cn("p-2 border text-center h-16 w-16 flex items-center justify-center flex-col rounded-lg shadow-sm relative cursor-pointer", day.moment.isSame(selectedDay, "day")
                        ? "bg-blue-500 text-white hover:bg-blue-600"
                        : "hover:bg-gray-100 hover:text-gray-500", day.moment.isSame(new Date(), "day") &&
                        !day.moment.isSame(selectedDay, "day")
                        ? "bg-blue-100"
                        : "") },
                    eventsAvailble.length > 0 && (react_1["default"].createElement("span", { className: utils_1.cn("absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold") }, eventsAvailble.length)),
                    react_1["default"].createElement("span", { className: utils_1.cn("text-sm font-bold") }, day.number)));
            }),
            Array.from({
                length: 6 - emptySlots
            }).map(function (_, index) { return (react_1["default"].createElement("div", { key: index })); }))));
}
exports.Calendar = Calendar;
