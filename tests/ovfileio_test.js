'use strict';
global.window = global;
global.btoa = s => Buffer.from(s, 'binary').toString('base64');
global.atob = s => Buffer.from(s, 'base64').toString('binary');
global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder;
global.Blob = class { constructor(p, o) { this.p = p; this.type = (o && o.type) || ''; } };
let _blobId = 0;
const _blobs = {};
global.URL = {
  createObjectURL: (blob) => { const id = 'blob:' + (++_blobId); _blobs[id] = blob; return id; },
  revokeObjectURL: (id) => { delete _blobs[id]; }
};
global.document = {
  createElement: (tag) => {
    const el = {
      tagName: tag.toUpperCase(), style: {}, children: [],
      addEventListener: (ev, cb) => { el['on' + ev] = cb; },
      removeEventListener: () => {},
      appendChild: () => {}, remove: () => {},
      click: function () { if (el.onclick) el.onclick(); }
    };
    return el;
  },
  body: { appendChild: () => {}, removeChild: () => {} },
  documentElement: {}
};

const path = require('path');
require(path.join(__dirname, '../js/hash.js'));
require(path.join(__dirname, '../js/fileio.js'));

const OVFileIO = global.OVFileIO;
const OVHash   = global.OVHash;

let failed = 0;
function assert(cond, msg) {
  if (!cond) { console.error('  FAIL:', msg); failed++; }
  else        console.log ('  ok  :', msg);
}

const sample = { user: 'alice', plan: 'pro', seats: 3, n: 42 };
const token  = OVHash.encode(JSON.stringify(sample), 'salt-XYZ');
console.log('encoded token:', token);

const FUTURE = Date.now() + 365 * 24 * 3600 * 1000; // ~1 year from now
const payload = {
  entity:  'usr_8f3a2b',
  product: 'app_offline_validator',
  version: '2.1.0',
  issued:  1719926400000,
  expires: FUTURE,
  plan:    'pro',
  flags:   ['has_email', 'has_json'],
  serial:  'lic-abc123',
  fields:  3,
  token:   token
};

(async () => {
  const origCreate = document.createElement;
  let captured;
  document.createElement = (tag) => {
    const el = origCreate(tag);
    el.click = function () {
      const id = el.href;
      const blob = _blobs[id];
      captured = Array.isArray(blob.p) ? blob.p.join('') : String(blob.p);
      if (el.onclick) el.onclick();
    };
    return el;
  };

  console.log('\n== downloadStructured ==');
  await OVFileIO.downloadStructured('mylicense', token, payload, { created: '2026-03-09T12:00:00Z' });
  console.log('  generated text:\n' + captured.split('\n').map(l => '    | ' + l).join('\n'));
  assert(captured.startsWith('OV-STRUCT-V2'), 'header is OV-STRUCT-V2');
  assert(captured.includes('entity: usr_8f3a2b'), 'entity present');
  assert(captured.includes('flags: has_email,has_json'), 'flags serialized with comma');
  assert(captured.includes('---'), 'separator present');
  assert(captured.trim().endsWith(token), 'body is the token');

  console.log('\n== parseHashFile round-trip ==');
  const parsed = OVFileIO.parseHashFile(captured);
  assert(parsed !== null, 'parsed != null');
  assert(parsed._kind === 'ovstruct', '_kind == ovstruct');
  assert(parsed.entity  === 'usr_8f3a2b', 'entity parsed');
  assert(parsed.product === 'app_offline_validator', 'product parsed');
  assert(parsed.plan    === 'pro', 'plan parsed');
  assert(parsed.serial  === 'lic-abc123', 'serial parsed');
  assert(parsed.issued  === 1719926400000, 'issued parsed as number');
  assert(parsed.expires === FUTURE, 'expires parsed as number (future)');
  assert(Array.isArray(parsed.flags) && parsed.flags.length === 2 &&
         parsed.flags[0] === 'has_email' && parsed.flags[1] === 'has_json',
         'flags parsed as array of 2 strings');
  assert(parsed.fields === 3, 'fields count parsed');
  assert(parsed.token === token, 'token body preserved');
  console.log('  all parsed keys:', Object.keys(parsed).join(','));

  console.log('\n== parseAndDecode ==');
  const pad = OVFileIO.parseAndDecode(captured, 'salt-XYZ');
  assert(pad.valid === true, 'pad.valid == true');
  assert(pad.header.entity  === 'usr_8f3a2b', 'header.entity set');
  assert(pad.header.expires === FUTURE, 'header.expires surfaced');
  assert(pad.header.flags.length === 2, 'header.flags surfaced as array');
  assert(pad.expired === false, 'not expired (future expires)');
  assert(typeof pad.decoded === 'object' && pad.decoded !== null, 'decoded is object');
  assert(pad.decoded.user === 'alice' && pad.decoded.plan === 'pro' &&
         pad.decoded.seats === 3 && pad.decoded.n === 42,
         'decoded JSON matches original sample');
  assert(pad.errors.length === 0, 'no errors');

  console.log('\n== parseAndDecode wrong-salt ==');
  const bad = OVFileIO.parseAndDecode(captured, 'wrong-salt');
  assert(bad.valid === false, 'invalid with wrong salt');
  assert(bad.errors.some(e => /integrity|salt/i.test(e)), 'error message mentions salt/integrity');

  console.log('\n== parseAndDecode expired ==');
  const expiredCaptured = captured.replace('expires: ' + FUTURE, 'expires: 1000');
  const exp = OVFileIO.parseAndDecode(expiredCaptured, 'salt-XYZ');
  assert(exp.expired === true, 'expired flag set');
  assert(exp.errors.some(e => /expired/i.test(e)), 'error mentions expired');

  console.log('\n== parseHashFile invalid ==');
  assert(OVFileIO.parseHashFile('') === null, 'empty -> null');
  assert(OVFileIO.parseHashFile('garbage\n---\nbody') === null, 'no header -> null');
  assert(OVFileIO.parseHashFile('OV-UNKNOWN\nfoo: bar\n---\nx') === null, 'unknown header -> null');

  console.log('\n== parseHashFile V1 .ovhash ==');
  const v1token = OVHash.encode('hello', 'salt1');
  const v1text = ['OV-HASH-FILE-V1', 'algorithm: xor-shift-v1', 'salt: salt1',
                  'created: 2026-01-01T00:00:00Z', '---', v1token].join('\n');
  const v1p = OVFileIO.parseHashFile(v1text);
  assert(v1p && v1p._kind === 'ovhash', 'V1 .ovhash parses');
  assert(v1p.token === v1token, 'V1 token preserved');

  console.log('\n== validatePayloadFile ==');
  const v1val = OVFileIO.validatePayloadFile(v1text);
  assert(v1val.valid === false, 'V1 is not a valid ovstruct');
  assert(v1val.errors.some(e => /ovstruct/.test(e)), 'error mentions ovstruct');
  const v2val = OVFileIO.validatePayloadFile(captured);
  assert(v2val.valid === true, 'V2 with all fields is valid');
  assert(v2val.missingFields.length === 0, 'no missing fields');
  const broken = captured.replace('entity: usr_8f3a2b', 'entity: ');
  const v2bad = OVFileIO.validatePayloadFile(broken);
  assert(v2bad.valid === false, 'broken -> invalid');
  assert(v2bad.missingFields.indexOf('entity') >= 0, 'entity reported as missing');

  console.log('\n== downloadHash + parseHashFile ==');
  let captured2;
  document.createElement = (tag) => {
    const el = origCreate(tag);
    el.click = function () {
      const id = el.href;
      const blob = _blobs[id];
      captured2 = Array.isArray(blob.p) ? blob.p.join('') : String(blob.p);
      if (el.onclick) el.onclick();
    };
    return el;
  };
  await OVFileIO.downloadHash('h1', v1token, { salt: 'salt1', created: '2026-01-01T00:00:00Z' });
  assert(captured2.startsWith('OV-HASH-FILE-V1'), 'V1 header');
  const v1round = OVFileIO.parseHashFile(captured2);
  assert(v1round && v1round._kind === 'ovhash' && v1round.token === v1token,
         'V1 download -> parse round-trip');

  console.log('\n== downloadJSON ==');
  let captured3;
  document.createElement = (tag) => {
    const el = origCreate(tag);
    el.click = function () {
      const id = el.href;
      const blob = _blobs[id];
      captured3 = Array.isArray(blob.p) ? blob.p.join('') : String(blob.p);
      if (el.onclick) el.onclick();
    };
    return el;
  };
  await OVFileIO.downloadJSON('data', { a: 1, b: [1, 2, 3] });
  const j = JSON.parse(captured3);
  assert(j.a === 1 && Array.isArray(j.b) && j.b.length === 3, 'JSON download content ok');

  console.log('\n== downloadLicense ==');
  let captured4;
  document.createElement = (tag) => {
    const el = origCreate(tag);
    el.click = function () {
      const id = el.href;
      const blob = _blobs[id];
      captured4 = Array.isArray(blob.p) ? blob.p.join('') : String(blob.p);
      if (el.onclick) el.onclick();
    };
    return el;
  };
  await OVFileIO.downloadLicense('myllic', token);
  assert(captured4.startsWith('OV-STRUCT-V2'), 'license has V2 header');

  console.log('\n== enableDropZone ==');
  const dropEl = { addEventListener: () => {}, removeEventListener: () => {},
                   classList: { add: () => {}, remove: () => {} } };
  const disable = OVFileIO.enableDropZone(dropEl, () => {});
  assert(typeof disable === 'function', 'enableDropZone returns teardown function');

  console.log('\n== readFile ==');
  global.FileReader = class {
    readAsText(blob) { this.result = blob.p.join(''); setTimeout(() => this.onload && this.onload(), 0); }
  };
  const blobFile = new global.Blob([captured], { type: 'text/plain' });
  const text = await OVFileIO.readFile(blobFile);
  assert(text === captured, 'readFile returns text content');

  console.log('\n' + (failed ? '*** ' + failed + ' TESTS FAILED ***' : '*** ALL TESTS PASSED ***'));
  process.exit(failed ? 1 : 0);
})();
