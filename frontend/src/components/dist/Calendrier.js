"use strict";
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
exports.__esModule = true;
var react_1 = require("react");
var antd_1 = require("antd");
var react_fontawesome_1 = require("@fortawesome/react-fontawesome");
var free_solid_svg_icons_1 = require("@fortawesome/free-solid-svg-icons");
var swr_1 = require("swr");
var axios_1 = require("../axios");
function Calendrier(_a) {
    var _this = this;
    var days = _a.days, monitor = _a.monitor;
    var _b = react_1.useState(false), visible = _b[0], setVisible = _b[1];
    var _c = swr_1["default"]("/users/availability/" + monitor.id, function (url) { return __awaiter(_this, void 0, void 0, function () {
        var result, resultData, availabilities;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, axios_1.fetcher.get(url)];
                case 1:
                    result = _a.sent();
                    resultData = result.data;
                    availabilities = resultData.data.reduce(function (acc, item) {
                        acc[item.day] = {
                            start: item.start,
                            end: item.end
                        };
                        return acc;
                    }, {});
                    return [2 /*return*/, availabilities];
            }
        });
    }); }), data = _c.data, error = _c.error, isLoading = _c.isLoading, mutate = _c.mutate;
    // console.log(data);
    react_1.useEffect(function () {
        if (visible) {
            mutate();
        }
    }, [visible]);
    if (isLoading)
        return react_1["default"].createElement("div", null, "Loading...");
    if (error)
        return react_1["default"].createElement("div", null, "Error");
    return (react_1["default"].createElement(react_1["default"].Fragment, null,
        react_1["default"].createElement("div", { className: "flex items-center text-blue-500 cursor-pointer", onClick: function () { return setVisible(true); } },
            react_1["default"].createElement(react_fontawesome_1.FontAwesomeIcon, { icon: free_solid_svg_icons_1.faEye, className: "ml-2" })),
        react_1["default"].createElement(antd_1.Modal, { title: "Calendrier de " + monitor.name + " (" + monitor.email + ")", open: visible, onCancel: function () { return setVisible(false); }, onOk: function () { return setVisible(false); }, footer: null, centered: true, width: 800 },
            react_1["default"].createElement("div", { className: "grid grid-cols-3 gap-2" }, days.map(function (day) {
                var isActive = (data === null || data === void 0 ? void 0 : data[day]) ? true : false;
                var rangeString = (data === null || data === void 0 ? void 0 : data[day]) ? data[day].start + " - " + data[day].end
                    : "";
                return (react_1["default"].createElement("div", { key: day, className: "w-full flex flex-col p-5 rounded-md  items-center justify-center cursor-pointer " + (isActive ? "bg-blue-500 text-white" : "bg-gray-200") },
                    react_1["default"].createElement("span", { className: (isActive ? "text-white" : "text-gray-500") + " font-bold text-lg" }, day),
                    react_1["default"].createElement("div", { className: (isActive ? "text-white" : "text-gray-500") + " font-bold text-lg" }, rangeString)));
            })))));
}
exports["default"] = Calendrier;
