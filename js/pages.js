/**
 * pages.js
 * Minimalist Black & White Multi-Format Suite Layout & Tool Templates.
 * 100% Client-Side.
 */
(function (global) {
  'use strict';

  // Tool categories and subtools configuration
  const CATEGORIES = [
    {
      id: 'identifiers',
      name: '🧬 IDENTIFIERS',
      tools: [
        { id: 'uuid', name: 'UUID Generator', desc: 'Generate RFC 4122 v4, v1, or Nil UUIDs' },
        { id: 'userid', name: 'User ID Generator', desc: 'Generate custom prefixed user / entity IDs' },
        { id: 'randomid', name: 'Random ID', desc: 'Cryptographically random alphanumeric tokens' },
        { id: 'nanoid', name: 'Nano ID', desc: 'Compact URL-friendly collision-resistant IDs' },
        { id: 'customid', name: 'Custom ID', desc: 'Pattern template-based ID generation' },
      ]
    },
    {
      id: 'hashing',
      name: '🔐 OUR CUSTOM CODEC',
      tools: [
        { id: 'v1encode', name: 'Token Encoder (v1)', desc: 'Encode 1 or 2 values (Data + Salt) into our reversible token' },
        { id: 'v1decode', name: 'Token Decoder (v1)', desc: 'Decode our v1 token back to original Data and Salt' },
        { id: 'v2license', name: 'Structured License (v2)', desc: 'Generate tamper-evident 8-field license token & .ovlicense' },
        { id: 'v2decode', name: 'License Decoder (v2)', desc: 'Decode ov2s$ token or inspect .ovlicense / .ovstruct file' },
        { id: 'verifier', name: 'Token Verifier', desc: 'Verify token integrity and detect tampering via 32-bit checksum' },
      ]
    },
    {
      id: 'encoding',
      name: '🔄 ENCODING',
      tools: [
        { id: 'base64', name: 'Base64', desc: 'UTF-8 safe Base64 encoder & decoder' },
        { id: 'url', name: 'URL', desc: 'URL and URI Component encoder & decoder' },
        { id: 'hex', name: 'Hex', desc: 'Text to Hexadecimal byte encoder & decoder' },
        { id: 'binary', name: 'Binary', desc: 'Text to 8-bit Binary encoder & decoder' },
        { id: 'html', name: 'HTML Entities', desc: 'HTML escape & unescape entity codec' },
      ]
    },
    {
      id: 'datetime',
      name: '📅 DATE & TIME',
      tools: [
        { id: 'dateconverter', name: 'Date Converter', desc: 'Convert ISO 8601, UTC, Local, and Unix timestamps' },
        { id: 'timestampconverter', name: 'Timestamp Converter', desc: 'Unix seconds & milliseconds to human date' },
        { id: 'timezoneconverter', name: 'Timezone Converter', desc: 'Live multi-city global timezone comparison' },
        { id: 'dateformatter', name: 'Date Formatter', desc: 'Format dates with customizable patterns' },
      ]
    },
    {
      id: 'random',
      name: '🎲 RANDOM',
      tools: [
        { id: 'number', name: 'Number', desc: 'Cryptographically secure random numbers' },
        { id: 'string', name: 'String', desc: 'Random strings with custom charset filters' },
        { id: 'uuid', name: 'UUID', desc: 'One-click random UUID v4 generator' },
        { id: 'color', name: 'Color', desc: 'Random colors in HEX, RGB, and HSL' },
        { id: 'customid', name: 'Custom ID', desc: 'Random template-based identifiers' },
      ]
    },
    {
      id: 'text',
      name: '🔤 TEXT',
      tools: [
        { id: 'caseconverter', name: 'Case Converter', desc: 'Convert to camel, snake, kebab, UPPER, Title, etc.' },
        { id: 'sluggenerator', name: 'Slug Generator', desc: 'Generate clean URL slugs from text' },
        { id: 'textcounter', name: 'Text Counter', desc: 'Words, characters, lines, bytes, and reading time' },
        { id: 'reversetext', name: 'Reverse Text', desc: 'Reverse by characters, words, or lines' },
        { id: 'removeduplicates', name: 'Remove Duplicate Lines', desc: 'Deduplicate, sort, and trim lines' },
      ]
    },
    {
      id: 'converters',
      name: '🔢 CONVERTERS',
      tools: [
        { id: 'numberbase', name: 'Number Base', desc: 'Binary, Octal, Decimal, and Hexadecimal conversion' },
        { id: 'jsonformatter', name: 'JSON Formatter', desc: 'Beautify, minify, and validate JSON syntax' },
        { id: 'jsonyaml', name: 'JSON ↔ YAML', desc: 'Bidirectional JSON and YAML converter' },
        { id: 'csvjson', name: 'CSV ↔ JSON', desc: 'Bidirectional CSV and JSON table converter' },
      ]
    },
  ];

  function singlePage() {
    return `
    <div class="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <!-- Minimalist Header -->
      <div class="mb-6 border-b border-neutral-800 pb-5">
        <div class="flex items-center justify-between gap-4 mb-2">
          <div class="inline-flex items-center gap-2">
            <span class="w-2.5 h-2.5 bg-white rounded-full"></span>
            <span class="text-xs font-bold tracking-widest uppercase text-neutral-400">OFFLINE MULTI-FORMAT SUITE</span>
          </div>
          <span class="badge-mono text-[10px]">100% IN-BROWSER · ZERO SERVERS</span>
        </div>
        <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">Developer Utility Suite</h1>
        <p class="text-xs sm:text-sm text-neutral-400 mt-1">Multi-format encoder, decoder, hash engine, date utilities, random generators, and format converters.</p>
      </div>

      <!-- Category Navigation Tabs -->
      <div class="flex items-center gap-1.5 overflow-x-auto pb-2.5 mb-4 scrollbar-none" id="cat-tabs">
        ${CATEGORIES.map((cat, idx) => `
          <button type="button" class="cat-tab ${idx === 0 ? 'active' : ''}" data-cat="${cat.id}">
            ${cat.name}
          </button>
        `).join('')}
      </div>

      <!-- Sub-tool Pills Navigation -->
      <div class="flex items-center gap-1.5 overflow-x-auto pb-2.5 mb-6 scrollbar-none" id="subtool-tabs"></div>

      <!-- Active Tool Workspace Card -->
      <div id="tool-workspace"></div>
    </div>
    `;
  }

  global.OVPages = {
    CATEGORIES,
    singlePage,
  };
})(window);
