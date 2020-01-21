require('./index.scss');
const $ = require('jquery');
// require('jquery-ui');
// const _ = require('lodash');
const _escapeRegExp = require('lodash/escapeRegExp');
const _join = require('lodash/join');
const _map = require('lodash/map');
const _each = require('lodash/each');
// const XRegExp = require('xregexp/lib/xregexp');
// require('xregexp/lib/addons/matchrecursive')(XRegExp);
// const rand = require('lodash/random');

// import registerServiceWorker from '@henderea/static-site-builder/registerServiceWorker';
// registerServiceWorker();

class ParseRule {
    constructor(character, formatName) {
        this._character = character;
        this._formatName = formatName;
        let escaped = _escapeRegExp(character);
        this._pattern = new RegExp(`${escaped}([^${escaped}\\s](?:[^\\n${escaped}]*[^${escaped}\\s])?)${escaped}`, 'g');
    }

    get character() { return this._character; }
    get formatName() { return this._formatName; }
    get pattern() { return this._pattern; }

    apply(str) {
        return str.replace(this.pattern, `<span class="cm cm-${this.formatName}">$1</span>`);
    }
}

const r = (character, formatName) => new ParseRule(character, formatName);

const rules = [
    r('*', 'bold'),
    r('_', 'italic'),
    r('+', 'underline'),
    r('~', 'strike'),
    r('`', 'code')
];

const mapChar = (c) => {
    if(c == '*') { return '\0b\0' }
    if(c == '_') { return '\0i\0' }
    if(c == '+') { return '\0u\0' }
    if(c == '~') { return '\0s\0' }
    if(c == '`') { return '\0c\0' }
    return c;
}

const mapChars = (c) => _join(_map(`${c}`.split(''), mapChar), '');

const parse = str => {
    str = str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    str = str.replace(/([^`~*_+\s])([`~*_+]+)([^`~*_+\s])/g, (m, b, c, a) => `${b}${mapChars(c)}${a}`)
    str = str.replace(/[`]([^`\s](?:[^\n`]*[^`\s])?)[`]/g, (m, c) => '`' + c.replace(/([~*_+]+)/g, (m, ch) => mapChars(ch)) + '`');
    _each(rules, rule => {
        str = rule.apply(str);
    });
    str = str.replace(/\n/g, '<br>');
    str = str.replace(/\0b\0/g, '*');
    str = str.replace(/\0i\0/g, '_');
    str = str.replace(/\0u\0/g, '+');
    str = str.replace(/\0s\0/g, '~');
    str = str.replace(/\0c\0/g, '`');
    return str;
};

const applyFormat = () => {
    Promise.resolve().then(() => {
        let input = $('#comment').val();
        let output = parse(input);
        $('#output').html(output);
    });
}

$(function() {
    $('#comment').on('keydown keyup keypress change', applyFormat);
    applyFormat();
});