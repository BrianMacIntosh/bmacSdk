
var assert = require('assert');
require('../testutils');

require("../../polyfills/string");

//TODO: don't use || polyfills for tests

describe('String', function() {
	describe('#trim()', function() {
		it('should trim leading whitespace', function() {
			assert.equal("  hello world".trim(), "hello world");
			assert.equal("\r\nhello world".trim(), "hello world");
			assert.equal("\thello world".trim(), "hello world");
			assert.equal(" \t\r\nhello world".trim(), "hello world");
		});
		it('should trim trailing whitespace', function() {
			assert.equal("hello world  ".trim(), "hello world");
			assert.equal("hello world\r\n".trim(), "hello world");
			assert.equal("hello world\t".trim(), "hello world");
			assert.equal("hello world \t\r\n".trim(), "hello world");
		});
		it('should trim leading and trailing whitespace', function() {
			assert.equal("  hello world  ".trim(), "hello world");
			assert.equal("\r\nhello world\r\n".trim(), "hello world");
			assert.equal("\thello world\t".trim(), "hello world");
			assert.equal(" \t\r\nhello world \t\r\n".trim(), "hello world");
		});
		it('should return empty string for all-whitespace strings', function() {
			assert.equal("".trim(), "");
			assert.equal(" \t".trim(), "");
		});
	});
});

describe('String', function() {
	describe('#trimStart()', function() {
		it('should trim leading whitespace', function() {
			assert.equal("  hello world".trimStart(), "hello world");
			assert.equal("\r\nhello world".trimStart(), "hello world");
			assert.equal("\thello world".trimStart(), "hello world");
			assert.equal(" \t\r\nhello world".trimStart(), "hello world");
		});
		it('should NOT trim trailing whitespace', function() {
			assert.equal("  hello world  ".trimStart(), "hello world  ");
			assert.equal("\r\nhello world\r\n".trimStart(), "hello world\r\n");
			assert.equal("\thello world\t".trimStart(), "hello world\t");
			assert.equal(" \t\r\nhello world \t\r\n".trimStart(), "hello world \t\r\n");
		});
		it('should return empty string for all-whitespace strings', function() {
			assert.equal("".trimStart(), "");
			assert.equal(" \t".trimStart(), "");
		});
	});
});

describe('String', function() {
	describe('#trimEnd()', function() {
		it('should trim trailing whitespace', function() {
			assert.equal("hello world  ".trimEnd(), "hello world");
			assert.equal("hello world\r\n".trimEnd(), "hello world");
			assert.equal("hello world\t".trimEnd(), "hello world");
			assert.equal("hello world \t\r\n".trimEnd(), "hello world");
		});
		it('should NOT trim leading whitespace', function() {
			assert.equal("  hello world  ".trimEnd(), "  hello world");
			assert.equal("\r\nhello world\r\n".trimEnd(), "\r\nhello world");
			assert.equal("\thello world\t".trimEnd(), "\thello world");
			assert.equal(" \t\r\nhello world \t\r\n".trimEnd(), " \t\r\nhello world");
		});
		it('should return empty string for all-whitespace strings', function() {
			assert.equal("".trimEnd(), "");
			assert.equal(" \t".trimEnd(), "");
		});
	});
});

//TODO: djb2Hash?

describe('String', function() {
	describe('#endsWith()', function() {
		it('should match strings ending with the value', function() {
			assert.ok("hello world".endsWith("world"));
			assert.ok("hello world".endsWith("ld"));
		});
		it('should work with the position parameter', function() {
			assert.ok("hello world".endsWith("hello", 5));
			assert.ok("hello world".endsWith("lo", 5));
		});
		it('should match strings matching the value', function() {
			assert.ok("hello world".endsWith("hello world"));
			assert.ok("a".endsWith("a"));
			assert.ok("".endsWith(""));
		});
	});
});
