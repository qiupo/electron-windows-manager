"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.uriToFsPath = uriToFsPath;
exports.URI = void 0;

function _react() {
  const data = _interopRequireDefault(require("react"));

  _react = function _react() {
    return data;
  };

  return data;
}

var _platform = require("./platform");

var _charCode = require("./charCode");

var paths = _interopRequireWildcard(require("./path"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const _schemePattern = /^\w[\w\d+.-]*$/;
const _singleSlashStart = /^\//;
const _doubleSlashStart = /^\/\//;

function _validateUri(ret, _strict) {
  // scheme, must be set
  if (!ret.scheme && _strict) {
    throw new Error(`[UriError]: Scheme is missing: {scheme: "", authority: "${ret.authority}", path: "${ret.path}", query: "${ret.query}", fragment: "${ret.fragment}"}`);
  } // scheme, https://tools.ietf.org/html/rfc3986#section-3.1
  // ALPHA *( ALPHA / DIGIT / "+" / "-" / "." )


  if (ret.scheme && !_schemePattern.test(ret.scheme)) {
    throw new Error('[UriError]: Scheme contains illegal characters.');
  } // path, http://tools.ietf.org/html/rfc3986#section-3.3
  // If a URI contains an authority component, then the path component
  // must either be empty or begin with a slash ("/") character.  If a URI
  // does not contain an authority component, then the path cannot begin
  // with two slash characters ("//").


  if (ret.path) {
    if (ret.authority) {
      if (!_singleSlashStart.test(ret.path)) {
        throw new Error('[UriError]: If a URI contains an authority component, then the path component must either be empty or begin with a slash ("/") character');
      }
    } else {
      if (_doubleSlashStart.test(ret.path)) {
        throw new Error('[UriError]: If a URI does not contain an authority component, then the path cannot begin with two slash characters ("//")');
      }
    }
  }
} // for a while we allowed uris *without* schemes and this is the migration
// for them, e.g. an uri without scheme and without strict-mode warns and falls
// back to the file-scheme. that should cause the least carnage and still be a
// clear warning


function _schemeFix(scheme, _strict) {
  if (!scheme && !_strict) {
    return 'file';
  }

  return scheme;
} // implements a bit of https://tools.ietf.org/html/rfc3986#section-5


function _referenceResolution(scheme, path) {
  // the slash-character is our 'default base' as we don't
  // support constructing URIs relative to other URIs. This
  // also means that we alter and potentially break paths.
  // see https://tools.ietf.org/html/rfc3986#section-5.1.4
  switch (scheme) {
    case 'https':
    case 'http':
    case 'file':
      if (!path) {
        path = _slash;
      } else if (path[0] !== _slash) {
        path = _slash + path;
      }

      break;
  }

  return path;
}

const _empty = '';
const _slash = '/';
const _regexp = /^(([^:/?#]+?):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/;
/**
 * Uniform Resource Identifier (URI) http://tools.ietf.org/html/rfc3986.
 * This class is a simple parser which creates the basic component parts
 * (http://tools.ietf.org/html/rfc3986#section-3) with minimal validation
 * and encoding.
 *
 * ```txt
 *       foo://example.com:8042/over/there?name=ferret#nose
 *       \_/   \______________/\_________/ \_________/ \__/
 *        |           |            |            |        |
 *     scheme     authority       path        query   fragment
 *        |   _____________________|__
 *       / \ /                        \
 *       urn:example:animal:ferret:nose
 * ```
 */

class URI {
  static isUri(thing) {
    if (thing instanceof URI) {
      return true;
    }

    if (!thing) {
      return false;
    }

    return typeof thing.authority === 'string' && typeof thing.fragment === 'string' && typeof thing.path === 'string' && typeof thing.query === 'string' && typeof thing.scheme === 'string' && typeof thing.fsPath === 'string' && typeof thing.with === 'function' && typeof thing.toString === 'function';
  }
  /**
   * scheme is the 'http' part of 'http://www.msft.com/some/path?query#fragment'.
   * The part before the first colon.
   */


  /**
   * @internal
   */
  constructor(schemeOrData, authority, path, query, fragment, _strict = false) {
    this.scheme = void 0;
    this.authority = void 0;
    this.path = void 0;
    this.query = void 0;
    this.fragment = void 0;

    if (typeof schemeOrData === 'object') {
      this.scheme = schemeOrData.scheme || _empty;
      this.authority = schemeOrData.authority || _empty;
      this.path = schemeOrData.path || _empty;
      this.query = schemeOrData.query || _empty;
      this.fragment = schemeOrData.fragment || _empty; // no validation because it's this URI
      // that creates uri components.
      // _validateUri(this);
    } else {
      this.scheme = _schemeFix(schemeOrData, _strict);
      this.authority = authority || _empty;
      this.path = _referenceResolution(this.scheme, path || _empty);
      this.query = query || _empty;
      this.fragment = fragment || _empty;

      _validateUri(this, _strict);
    }
  } // ---- filesystem path -----------------------

  /**
   * Returns a string representing the corresponding file system path of this URI.
   * Will handle UNC paths, normalizes windows drive letters to lower-case, and uses the
   * platform specific path separator.
   *
   * * Will *not* validate the path for invalid characters and semantics.
   * * Will *not* look at the scheme of this URI.
   * * The result shall *not* be used for display purposes but for accessing a file on disk.
   *
   *
   * The *difference* to `URI#path` is the use of the platform specific separator and the handling
   * of UNC paths. See the below sample of a file-uri with an authority (UNC path).
   *
   * ```ts
  	const u = URI.parse('file://server/c$/folder/file.txt')
  	u.authority === 'server'
  	u.path === '/shares/c$/file.txt'
  	u.fsPath === '\\server\c$\folder\file.txt'
  ```
   *
   * Using `URI#path` to read a file (using fs-apis) would not be enough because parts of the path,
   * namely the server name, would be missing. Therefore `URI#fsPath` exists - it's sugar to ease working
   * with URIs that represent files on disk (`file` scheme).
   */


  get fsPath() {
    // if (this.scheme !== 'file') {
    // 	console.warn(`[UriError] calling fsPath with scheme ${this.scheme}`);
    // }
    return uriToFsPath(this, false);
  } // ---- modify to new -------------------------


  with(change) {
    if (!change) {
      return this;
    }

    let scheme = change.scheme,
        authority = change.authority,
        path = change.path,
        query = change.query,
        fragment = change.fragment;

    if (scheme === undefined) {
      scheme = this.scheme;
    } else if (scheme === null) {
      scheme = _empty;
    }

    if (authority === undefined) {
      authority = this.authority;
    } else if (authority === null) {
      authority = _empty;
    }

    if (path === undefined) {
      path = this.path;
    } else if (path === null) {
      path = _empty;
    }

    if (query === undefined) {
      query = this.query;
    } else if (query === null) {
      query = _empty;
    }

    if (fragment === undefined) {
      fragment = this.fragment;
    } else if (fragment === null) {
      fragment = _empty;
    }

    if (scheme === this.scheme && authority === this.authority && path === this.path && query === this.query && fragment === this.fragment) {
      return this;
    }

    return new Uri(scheme, authority, path, query, fragment);
  } // ---- parse & validate ------------------------

  /**
   * Creates a new URI from a string, e.g. `http://www.msft.com/some/path`,
   * `file:///usr/home`, or `scheme:with/path`.
   *
   * @param value A string which represents an URI (see `URI#toString`).
   */


  static parse(value, _strict = false) {
    const match = _regexp.exec(value);

    if (!match) {
      return new Uri(_empty, _empty, _empty, _empty, _empty);
    }

    return new Uri(match[2] || _empty, percentDecode(match[4] || _empty), percentDecode(match[5] || _empty), percentDecode(match[7] || _empty), percentDecode(match[9] || _empty), _strict);
  }
  /**
   * Creates a new URI from a file system path, e.g. `c:\my\files`,
   * `/usr/home`, or `\\server\share\some\path`.
   *
   * The *difference* between `URI#parse` and `URI#file` is that the latter treats the argument
   * as path, not as stringified-uri. E.g. `URI.file(path)` is **not the same as**
   * `URI.parse('file://' + path)` because the path might contain characters that are
   * interpreted (# and ?). See the following sample:
   * ```ts
  const good = URI.file('/coding/c#/project1');
  good.scheme === 'file';
  good.path === '/coding/c#/project1';
  good.fragment === '';
  const bad = URI.parse('file://' + '/coding/c#/project1');
  bad.scheme === 'file';
  bad.path === '/coding/c'; // path is now broken
  bad.fragment === '/project1';
  ```
   *
   * @param path A file system path (see `URI#fsPath`)
   */


  static file(path) {
    let authority = _empty; // normalize to fwd-slashes on windows,
    // on other systems bwd-slashes are valid
    // filename character, eg /f\oo/ba\r.txt

    if (_platform.isWindows) {
      path = path.replace(/\\/g, _slash);
    } // check for authority as used in UNC shares
    // or use the path as given


    if (path[0] === _slash && path[1] === _slash) {
      const idx = path.indexOf(_slash, 2);

      if (idx === -1) {
        authority = path.substring(2);
        path = _slash;
      } else {
        authority = path.substring(2, idx);
        path = path.substring(idx) || _slash;
      }
    }

    return new Uri('file', authority, path, _empty, _empty);
  }

  static from(components) {
    return new Uri(components.scheme, components.authority, components.path, components.query, components.fragment);
  }
  /**
   * Join a URI path with path fragments and normalizes the resulting path.
   *
   * @param uri The input URI.
   * @param pathFragment The path fragment to add to the URI path.
   * @returns The resulting URI.
   */


  static joinPath(uri, ...pathFragment) {
    if (!uri.path) {
      throw new Error(`[UriError]: cannot call joinPath on URI without path`);
    }

    let newPath;

    if (_platform.isWindows && uri.scheme === 'file') {
      newPath = URI.file(paths.win32.join(uriToFsPath(uri, true), ...pathFragment)).path;
    } else {
      newPath = paths.posix.join(uri.path, ...pathFragment);
    }

    return uri.with({
      path: newPath
    });
  } // ---- printing/externalize ---------------------------

  /**
   * Creates a string representation for this URI. It's guaranteed that calling
   * `URI.parse` with the result of this function creates an URI which is equal
   * to this URI.
   *
   * * The result shall *not* be used for display purposes but for externalization or transport.
   * * The result will be encoded using the percentage encoding and encoding happens mostly
   * ignore the scheme-specific encoding rules.
   *
   * @param skipEncoding Do not encode the result, default is `false`
   */


  toString(skipEncoding = false) {
    return _asFormatted(this, skipEncoding);
  }

  toJSON() {
    return this;
  }

  static revive(data) {
    if (!data) {
      return data;
    } else if (data instanceof URI) {
      return data;
    } else {
      const result = new Uri(data);
      result._formatted = data.external;
      result._fsPath = data._sep === _pathSepMarker ? data.fsPath : null;
      return result;
    }
  }

}

exports.URI = URI;

const _pathSepMarker = _platform.isWindows ? 1 : undefined; // This class exists so that URI is compatibile with vscode.Uri (API).


class Uri extends URI {
  constructor(...args) {
    super(...args);
    this._formatted = null;
    this._fsPath = null;
  }

  get fsPath() {
    if (!this._fsPath) {
      this._fsPath = uriToFsPath(this, false);
    }

    return this._fsPath;
  }

  toString(skipEncoding = false) {
    if (!skipEncoding) {
      if (!this._formatted) {
        this._formatted = _asFormatted(this, false);
      }

      return this._formatted;
    } else {
      // we don't cache that
      return _asFormatted(this, true);
    }
  }

  toJSON() {
    const res = {
      $mid: 1
    }; // cached state

    if (this._fsPath) {
      res.fsPath = this._fsPath;
      res._sep = _pathSepMarker;
    }

    if (this._formatted) {
      res.external = this._formatted;
    } // uri components


    if (this.path) {
      res.path = this.path;
    }

    if (this.scheme) {
      res.scheme = this.scheme;
    }

    if (this.authority) {
      res.authority = this.authority;
    }

    if (this.query) {
      res.query = this.query;
    }

    if (this.fragment) {
      res.fragment = this.fragment;
    }

    return res;
  }

} // reserved characters: https://tools.ietf.org/html/rfc3986#section-2.2


const encodeTable = {
  [_charCode.CharCode.Colon]: '%3A',
  // gen-delims
  [_charCode.CharCode.Slash]: '%2F',
  [_charCode.CharCode.QuestionMark]: '%3F',
  [_charCode.CharCode.Hash]: '%23',
  [_charCode.CharCode.OpenSquareBracket]: '%5B',
  [_charCode.CharCode.CloseSquareBracket]: '%5D',
  [_charCode.CharCode.AtSign]: '%40',
  [_charCode.CharCode.ExclamationMark]: '%21',
  // sub-delims
  [_charCode.CharCode.DollarSign]: '%24',
  [_charCode.CharCode.Ampersand]: '%26',
  [_charCode.CharCode.SingleQuote]: '%27',
  [_charCode.CharCode.OpenParen]: '%28',
  [_charCode.CharCode.CloseParen]: '%29',
  [_charCode.CharCode.Asterisk]: '%2A',
  [_charCode.CharCode.Plus]: '%2B',
  [_charCode.CharCode.Comma]: '%2C',
  [_charCode.CharCode.Semicolon]: '%3B',
  [_charCode.CharCode.Equals]: '%3D',
  [_charCode.CharCode.Space]: '%20'
};

function encodeURIComponentFast(uriComponent, allowSlash) {
  let res = undefined;
  let nativeEncodePos = -1;

  for (let pos = 0; pos < uriComponent.length; pos++) {
    const code = uriComponent.charCodeAt(pos); // unreserved characters: https://tools.ietf.org/html/rfc3986#section-2.3

    if (code >= _charCode.CharCode.a && code <= _charCode.CharCode.z || code >= _charCode.CharCode.A && code <= _charCode.CharCode.Z || code >= _charCode.CharCode.Digit0 && code <= _charCode.CharCode.Digit9 || code === _charCode.CharCode.Dash || code === _charCode.CharCode.Period || code === _charCode.CharCode.Underline || code === _charCode.CharCode.Tilde || allowSlash && code === _charCode.CharCode.Slash) {
      // check if we are delaying native encode
      if (nativeEncodePos !== -1) {
        res += encodeURIComponent(uriComponent.substring(nativeEncodePos, pos));
        nativeEncodePos = -1;
      } // check if we write into a new string (by default we try to return the param)


      if (res !== undefined) {
        res += uriComponent.charAt(pos);
      }
    } else {
      // encoding needed, we need to allocate a new string
      if (res === undefined) {
        res = uriComponent.substr(0, pos);
      } // check with default table first


      const escaped = encodeTable[code];

      if (escaped !== undefined) {
        // check if we are delaying native encode
        if (nativeEncodePos !== -1) {
          res += encodeURIComponent(uriComponent.substring(nativeEncodePos, pos));
          nativeEncodePos = -1;
        } // append escaped variant to result


        res += escaped;
      } else if (nativeEncodePos === -1) {
        // use native encode only when needed
        nativeEncodePos = pos;
      }
    }
  }

  if (nativeEncodePos !== -1) {
    res += encodeURIComponent(uriComponent.substring(nativeEncodePos));
  }

  return res !== undefined ? res : uriComponent;
}

function encodeURIComponentMinimal(path) {
  let res = undefined;

  for (let pos = 0; pos < path.length; pos++) {
    const code = path.charCodeAt(pos);

    if (code === _charCode.CharCode.Hash || code === _charCode.CharCode.QuestionMark) {
      if (res === undefined) {
        res = path.substr(0, pos);
      }

      res += encodeTable[code];
    } else {
      if (res !== undefined) {
        res += path[pos];
      }
    }
  }

  return res !== undefined ? res : path;
}
/**
 * Compute `fsPath` for the given uri
 */


function uriToFsPath(uri, keepDriveLetterCasing) {
  let value;

  if (uri.authority && uri.path.length > 1 && uri.scheme === 'file') {
    // unc path: file://shares/c$/far/boo
    value = `//${uri.authority}${uri.path}`;
  } else if (uri.path.charCodeAt(0) === _charCode.CharCode.Slash && (uri.path.charCodeAt(1) >= _charCode.CharCode.A && uri.path.charCodeAt(1) <= _charCode.CharCode.Z || uri.path.charCodeAt(1) >= _charCode.CharCode.a && uri.path.charCodeAt(1) <= _charCode.CharCode.z) && uri.path.charCodeAt(2) === _charCode.CharCode.Colon) {
    if (!keepDriveLetterCasing) {
      // windows drive letter: file:///c:/far/boo
      value = uri.path[1].toLowerCase() + uri.path.substr(2);
    } else {
      value = uri.path.substr(1);
    }
  } else {
    // other path
    value = uri.path;
  }

  if (_platform.isWindows) {
    value = value.replace(/\//g, '\\');
  }

  return value;
}
/**
 * Create the external version of a uri
 */


function _asFormatted(uri, skipEncoding) {
  const encoder = !skipEncoding ? encodeURIComponentFast : encodeURIComponentMinimal;
  let res = '';
  let scheme = uri.scheme,
      authority = uri.authority,
      path = uri.path,
      query = uri.query,
      fragment = uri.fragment;

  if (scheme) {
    res += scheme;
    res += ':';
  }

  if (authority || scheme === 'file') {
    res += _slash;
    res += _slash;
  }

  if (authority) {
    let idx = authority.indexOf('@');

    if (idx !== -1) {
      // <user>@<auth>
      const userinfo = authority.substr(0, idx);
      authority = authority.substr(idx + 1);
      idx = userinfo.indexOf(':');

      if (idx === -1) {
        res += encoder(userinfo, false);
      } else {
        // <user>:<pass>@<auth>
        res += encoder(userinfo.substr(0, idx), false);
        res += ':';
        res += encoder(userinfo.substr(idx + 1), false);
      }

      res += '@';
    }

    authority = authority.toLowerCase();
    idx = authority.indexOf(':');

    if (idx === -1) {
      res += encoder(authority, false);
    } else {
      // <auth>:<port>
      res += encoder(authority.substr(0, idx), false);
      res += authority.substr(idx);
    }
  }

  if (path) {
    // lower-case windows drive letters in /C:/fff or C:/fff
    if (path.length >= 3 && path.charCodeAt(0) === _charCode.CharCode.Slash && path.charCodeAt(2) === _charCode.CharCode.Colon) {
      const code = path.charCodeAt(1);

      if (code >= _charCode.CharCode.A && code <= _charCode.CharCode.Z) {
        path = `/${String.fromCharCode(code + 32)}:${path.substr(3)}`; // "/c:".length === 3
      }
    } else if (path.length >= 2 && path.charCodeAt(1) === _charCode.CharCode.Colon) {
      const code = path.charCodeAt(0);

      if (code >= _charCode.CharCode.A && code <= _charCode.CharCode.Z) {
        path = `${String.fromCharCode(code + 32)}:${path.substr(2)}`; // "/c:".length === 3
      }
    } // encode the rest of the path


    res += encoder(path, true);
  }

  if (query) {
    res += '?';
    res += encoder(query, false);
  }

  if (fragment) {
    res += '#';
    res += !skipEncoding ? encodeURIComponentFast(fragment, false) : fragment;
  }

  return res;
} // --- decode


function decodeURIComponentGraceful(str) {
  try {
    return decodeURIComponent(str);
  } catch (_unused) {
    if (str.length > 3) {
      return str.substr(0, 3) + decodeURIComponentGraceful(str.substr(3));
    } else {
      return str;
    }
  }
}

const _rEncodedAsHex = /(%[0-9A-Za-z][0-9A-Za-z])+/g;

function percentDecode(str) {
  if (!str.match(_rEncodedAsHex)) {
    return str;
  }

  return str.replace(_rEncodedAsHex, match => decodeURIComponentGraceful(match));
}