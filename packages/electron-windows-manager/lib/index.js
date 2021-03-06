"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _react() {
  const data = _interopRequireDefault(require("react"));

  _react = function _react() {
    return data;
  };

  return data;
}

var _sekleton = require("./actions/sekleton");

function _electron() {
  const data = require("electron");

  _electron = function _electron() {
    return data;
  };

  return data;
}

var native = _interopRequireWildcard(require("./actions/native"));

var _bridge = require("./actions/bridge");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

//const { BrowserWindow, app } = require('electron');
class electronWindowsManager {
  constructor(windowManagerConfig) {
    this.windowsList = void 0;
    this.totalIdleWindowsNum = void 0;
    this.baseWindowConfig = void 0;
    this.webPreferences = void 0;
    this.resourceDir = void 0;
    this.bridge = _bridge.bridge;
    this.totalIdleWindowsNum = windowManagerConfig ? windowManagerConfig.totalIdleWindowsNum : 4; // ???????????????????????????

    this.windowsList = new Map(); // ????????????

    this.webPreferences = windowManagerConfig ? windowManagerConfig.webPreferences : {}; // global.path.resourceDir

    this.resourceDir = windowManagerConfig ? windowManagerConfig.resourceDir : "";
    this.baseWindowConfig = _objectSpread({
      show: false,
      transparent: false,
      frame: true,
      showByClient: true,
      isBoolWindow: true,
      showFirst: false
    }, windowManagerConfig === null || windowManagerConfig === void 0 ? void 0 : windowManagerConfig.baseWindowConfig); // ????????????

    if (electronWindowsManager.__Instance === undefined) {
      electronWindowsManager.__Instance = this;
    }

    return electronWindowsManager.__Instance;
  }
  /**
   * ?????????????????????,?????????????????????????????????
   */


  initIdleWindow() {
    var _this = this;

    return _asyncToGenerator(function* () {
      // ??????????????????????????????
      for (let i = _this.windowsList.size; i < _this.totalIdleWindowsNum; i++) {
        yield _this.createIdleWindow({});
      }
    })();
  }
  /**
   * ????????????????????????
   * @param {windowsManager.userConfig} options
   */


  createIdleWindow(params) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      let userOptions = params.userOptions,
          windowOptions = params.windowOptions,
          webPreferences = params.webPreferences;

      if (!userOptions) {
        userOptions = {
          name: "",
          isCache: true
        };
      }

      if (_this2.windowsList.size === _this2.totalIdleWindowsNum) {
        return _this2.useIdleWindow(userOptions);
      } else {
        // ?????????????????????????????????????????????electron.BrowserWindow???????????????
        // delete options.name;
        // delete options.component;
        const windowId = yield native.createWindow(Object.assign({}, _this2.baseWindowConfig, windowOptions), webPreferences || _this2.webPreferences);

        let window = _this2.getWindowById(windowId);

        window.on("close", e => {
          // Macos uses hide is very nice;
          // fix: use minimize to simulate BrowserWindow.hide
          if (!userOptions) {
            throw new Error("userOptions ?????????");
          }

          if (userOptions.isCache || userOptions.isCache === undefined) {
            if (!(native.getMainWindow() === windowId && native.getWillQuitApp() === true)) {
              e.preventDefault();

              if (process.platform.startsWith("win")) {
                var _window, _window2;

                (_window = window) === null || _window === void 0 ? void 0 : _window.minimize();
                (_window2 = window) === null || _window2 === void 0 ? void 0 : _window2.setSkipTaskbar(true);
              } else {
                var _window3;

                (_window3 = window) === null || _window3 === void 0 ? void 0 : _window3.hide();
              }
            }
          }
        });
        window.on("closed", () => {
          console.log("closed");

          if (native.getMainWindow() === windowId) {
            _this2.closeAllWindows();
          }

          window = null;

          _this2.windowsList.delete(windowId);
        });
        window.on("page-title-updated", (e, title) => {
          e.preventDefault();
          console.log("title", title);
        });
        let windowConfig = {
          isOpen: false,
          name: userOptions.name,
          // ?????????
          // sendMsg: {},
          // backMsg: {},
          isMain: false,
          winId: windowId
        };

        if (userOptions && userOptions.isOpenSekleton) {
          userOptions["resourceDir"] = _this2.resourceDir;
          windowConfig = Object.assign(windowConfig, {
            view: (0, _sekleton.setSekleton)(window, userOptions.Sekleton, userOptions.resourceDir)
          });
        }

        if (userOptions.url) {
          window.loadURL(userOptions.url);
        } else {
          if (userOptions.file) {
            window.loadFile(userOptions.file);
          }
        } // ????????????


        _this2.windowsList.set(windowId, windowConfig); // window.on("ready-to-show", () => {
        //   console.log("ready-to-show");
        //   closeSekleton(window, this.getWindowInfoById(windowId));
        // });


        return window;
      }
    })();
  }
  /**
   * ???????????????????????????
   * @param {windowsManager.windowList} windowInfo
   */


  addWindow(parmas) {
    let windowInfo = parmas.windowInfo,
        userOptions = parmas.userOptions;
    const window = this.getWindowById(windowInfo.winId);
    let windowConfig = windowInfo;
    window.on("close", e => {
      e.preventDefault();

      if (native.getMainWindow() === windowInfo.winId && native.getWillQuitApp() === true) {
        this.closeAllWindows(); // app.quit();
      } else {
        window.hide();
      }
    });

    if (userOptions && userOptions.isOpenSekleton) {
      userOptions["resourceDir"] = userOptions["resourceDir"] || this.resourceDir;
      windowConfig = Object.assign(windowConfig, {
        view: (0, _sekleton.setSekleton)(window, userOptions.Sekleton, userOptions.resourceDir)
      });
    } // ????????????


    this.windowsList.set(windowInfo.winId, windowConfig); // window.on("ready-to-show", () => {
    //   console.log("ready-to-show");
    //   closeSekleton(window, windowConfig);
    // });
  }
  /**
   * ?????????????????????
   */


  setConfig(windowManagerConfig) {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      _this3.totalIdleWindowsNum = windowManagerConfig.totalIdleWindowsNum || 4; // ???????????????????????????
      // global.path.resourceDir

      _this3.resourceDir = windowManagerConfig.resourceDir || "";
      _this3.baseWindowConfig = windowManagerConfig.baseWindowConfig ? Object.assign(_this3.baseWindowConfig, windowManagerConfig.baseWindowConfig) : _this3.baseWindowConfig;
      _this3.webPreferences = windowManagerConfig.webPreferences ? Object.assign(_this3.webPreferences, windowManagerConfig.webPreferences) : _this3.webPreferences;
    })();
  }
  /**
   * ???????????????????????????????????????????????????,????????????
   */


  useIdleWindow(options) {
    // ?????????????????????name???refresh??????????????????name???????????????name???????????????????????????????????????????????????
    let idleWindowInfo, idleWindow, windowId;

    if (options.name) {
      // ??????????????????name????????????
      idleWindowInfo = this.getWindowInfoById(this.getWindowIdByName(options.name)); //  ?????????name??????

      if (!idleWindowInfo) {
        windowId = this.getIdleWindow(); //???????????????

        if (!windowId) {
          throw new Error("??????????????????");
        }

        idleWindowInfo = this.getWindowInfoById(windowId);
        idleWindow = this.getWindowById(windowId);

        if (options && options.isOpenSekleton) {
          options["resourceDir"] = this.resourceDir;
          idleWindowInfo = Object.assign(idleWindowInfo, {
            view: (0, _sekleton.setSekleton)(idleWindow, options.Sekleton, options.resourceDir)
          });
        } // ???????????? ???????????????name??????


        idleWindowInfo.name = options.name;
      } else {
        windowId = idleWindowInfo.winId;
        idleWindow = this.getWindowById(idleWindowInfo.winId);
      } // ????????????????????????name???????????????????????????????????????


      this.urlChange(windowId, options.url, options.file); // ????????????

      this.refreshIdleWindowInfo(idleWindowInfo, idleWindowInfo.winId);
      return idleWindow;
    } else {
      throw new Error("????????????????????????");
    }
  }
  /**
   * ????????????????????????????????????????????????
   */


  openTargetWindow(options) {
    // ????????????????????????
    const windowId = this.getWindowIdByName(options.name);
    const windowInfo = this.getWindowInfoById(windowId); // ?????????????????????????????????????????????????????????????????????????????????

    if (windowInfo) {
      const windowTarget = this.getWindowById(windowId); // lru??????

      windowInfo.isOpen = true; // ????????????

      this.refreshIdleWindowInfo(windowInfo, windowId);
      windowTarget.show();
    } else {
      this.useIdleWindow(options);
      this.openTargetWindow(options);
    }
  }
  /**
   * ???????????????????????????????????????????????????
   */


  closeTargetWindow(options) {
    const windowId = this.getWindowIdByName(options.name);
    const windowInfo = this.getWindowInfoById(windowId);

    if (native.getMainWindow() === windowId && native.getWillQuitApp() === true) {
      this.closeAllWindows();
    } else {
      if (windowInfo) {
        // ??????????????????
        this.getWindowById(windowId).close(); // lru??????

        windowInfo.isOpen = false; // ????????????

        this.refreshIdleWindowInfo(windowInfo, windowId);
      } else {
        throw new Error("?????????????????????");
      }
    }
  }
  /**
   * ??????????????????
   * @param {}
   */


  closeAllWindows() {
    this.windowsList.forEach((value, key) => {
      if (key !== native.getMainWindow()) {
        const window = this.getWindowById(key);
        window.removeAllListeners("close");
        this.getWindowById(key).close();
      }
    });
  }
  /**
   * ?????????????????????????????????????????????????????????
   */


  urlChange(idelWindowId, url, file) {
    const window = this.getWindowById(idelWindowId); // const reg = RegExp("(http|https|ucf)://.*");
    // let url: string;
    // if (!this.authority) {
    //   console.log(Error("??????????????????"));
    // } else {
    //   url = (
    //     reg.test(options.component || "")
    //       ? options.component
    //       : `${this.authority}/${options.path ? options.path : this.path}?${
    //           this.baseUrlInfo[0]
    //         }=${options.name}&${this.baseUrlInfo[1]}=${options.component}`
    //   )!;
    //   window.webContents.reloadIgnoringCache();
    //   if (options && options.isOpenSekleton) {
    //     options["resourceDir"] = this.resourceDir;
    //     this.windowsList.set(
    //       idelWindowId,
    //       Object.assign(this.windowsList.get(idelWindowId), {
    //         view: setSekleton(window, options),
    //       })
    //     );
    //   }
    //   window.loadURL(url);
    // }

    if (url) window.loadURL(url);else if (file) window.loadFile(file);else {
      console.log("??????????????????");
    }
  }
  /**
   * ?????????????????????????????????
   */


  refreshIdleWindowInfo(windowInfo, winowId) {
    this.getWindowById(winowId).setTitle(windowInfo.name);
    this.windowsList.delete(winowId);
    this.windowsList.set(winowId, windowInfo);
  }
  /**
   * ?????????????????????????????????????????????idle???????????????lru???????????????
   */


  getIdleWindow() {
    let windowId = -1;
    this.windowsList.forEach((value, key) => {
      if (value.isOpen === false) {
        windowId = key;
      }
    }); // ????????????????????????????????????????????????????????????

    if (windowId <= 0) {
      var _this$windowsList$get;

      // ???????????????????????????????????????
      const keys = this.windowsList.keys();
      windowId = keys.next().value; // isOpen ???????????????????????????

      if ((_this$windowsList$get = this.windowsList.get(windowId)) === null || _this$windowsList$get === void 0 ? void 0 : _this$windowsList$get.isMain) {
        return keys.next().value;
      } else return windowId;
    } else {
      return windowId;
    }
  }
  /**
   * ??????window???id?????????window?????????????????????????????????
   */


  getWindowInfoById(id) {
    return this.windowsList.get(id);
  }
  /**
   * ??????window???name?????????window??????????????????????????????
   * @param {string} name
   * @returns Boolean|number
   */


  getWindowIdByName(name) {
    let windowId = -1;
    this.windowsList.forEach((value, key) => {
      if (value.name === name) {
        windowId = key;
      }
    });

    if (windowId >= 0) {
      return windowId;
    } else {
      return -1;
    }
  }
  /**
   * ??????windowlist
   * @returns array
   */


  getWindowList() {
    // let res: (number | windowList)[][] = []
    let res = [];
    this.windowsList.forEach((value, key) => {
      res.push([key, value]);
    });
    return res;
  }
  /**
   * ??????name??????????????????
   */


  WMsetMainWindow(name) {
    const windowId = this.getWindowIdByName(name);

    if (windowId !== -1) {
      let windowInfo = this.windowsList.get(windowId);

      if (windowInfo) {
        windowInfo.isMain = true;
        this.windowsList.set(windowId, windowInfo);
        native.setMainWindow(windowId);
        return true;
      } else {
        //???????????????????????????????????????id?????????????????????????????????windowInfo????????????????????????????????????
        console.log("???????????????????????????????????????");
        return false;
      }
    } else {
      console.log("?????????????????????");
      return false;
    }
  }
  /**
   * ??????id??????window??????
   */


  getWindowById(id) {
    return _electron().BrowserWindow.fromId(id);
  }
  /**
   * ??????name??????window??????
   */


  getWindowByName(name) {
    return _electron().BrowserWindow.fromId(this.getWindowIdByName(name));
  }

  closeSekleton(name) {
    (0, _sekleton.closeSekleton)(this.getWindowByName(name), this.getWindowInfoById(this.getWindowIdByName(name)));
  }

  setQuitMode(mode) {
    native.setQuitMode(mode);
  }

}

exports.default = electronWindowsManager;
electronWindowsManager.__Instance = void 0;