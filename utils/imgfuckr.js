var $estr = function() {
	return js_Boot.__string_rec(this, "");
};
function $extend(from, fields) {
	function Inherit() {}
	Inherit.prototype = from;
	var proto = new Inherit();
	for (var name in fields) proto[name] = fields[name];
	if (fields.toString !== Object.prototype.toString)
		proto.toString = fields.toString;
	return proto;
}
var HxOverrides = function() {};
HxOverrides.__name__ = true;
HxOverrides.cca = function(s, index) {
	var x = s.charCodeAt(index);
	if (x != x) return undefined;
	return x;
};
HxOverrides.substr = function(s, pos, len) {
	if (pos != null && pos != 0 && len != null && len < 0) return "";
	if (len == null) len = s.length;
	if (pos < 0) {
		pos = s.length + pos;
		if (pos < 0) pos = 0;
	} else if (len < 0) len = s.length + len - pos;
	return s.substr(pos, len);
};
var Main = function() {
	this.jpegData = {
		width: 0,
		height: 0,
		pixels: null,
		quality: 0,
		argb: false,
		yQuantRandom: 0.0,
		uvQuantRandom: 0.0,
		dctQuantRowRandom: 0.0,
		dctQuantColRandom: 0.0,
		yduNoise: { r: 0.0, g: 0.0, b: 0.0 },
		uduNoise: { r: 0.0, g: 0.0, b: 0.0 },
		vduNoise: { r: 0.0, g: 0.0, b: 0.0 },
		dcyMultRandom: 0.0,
		dcuMultRandom: 0.0,
		dcvMultRandom: 0.0,
		dcyOffsetRandom: 0.0,
		dcuOffsetRandom: 0.0,
		dcvOffsetRandom: 0.0,
		rowReadRandom: 0.0,
		colReadRandom: 0,
		nullFillMaxLen: 0,
		nullFillMaxVal: 0,
		rgbXOffsetRange: { r: 0, g: 0, b: 0 },
		rgbYOffsetRange: { r: 0, g: 0, b: 0 }
	};
	//this.processImage(process.argv.slice(2)[0]);
};
Main.__name__ = true;
Main.main = function() {
	new Main();
};
Main.rr = function(min, max) {
	return min + Math.random() * (max - min);
};
Main.prototype = {
	processImage: function(url, status) {
		var _g = this;
		if (this.processing) {
			this.processQueue.push({ url: url, status: status });
			console.log(
				"image processing queued. queuesize:" + this.processQueue.length
			);
			if (this.processQueue.length > Main.MAX_PROCESS_QUEUE_SIZE) {
				console.log(
					"processQueue size exceeds MAX_PROCESS_QUEUE_SIZE (" +
						Main.MAX_PROCESS_QUEUE_SIZE +
						"). Shifting oldest one."
				);
				this.processQueue.shift();
			}
			return;
		}
		this.processing = true;
		imgfkr_BufferLoader.load(url, function(data) {
			var response = null;
			if (!_g.shuttingDown && data != null && data.length > 0)
				response = _g.processBuffer(data);
			else console.log("Error loading image at " + url);
			_g.onImageProcessingComplete(response, url);
			_g.processing = false;
		});
	},
	processBuffer: function(data) {
		var decoded = imgfkr_jpg_JpegJs.decode(data);
		if (decoded != null) return this.glitchEncode(decoded);
		else {
			console.log("Error decoding image.");
			return null;
		}
	},
	onImageProcessingComplete: function(data, url) {
		if (this.shuttingDown) return;
		if (data != null) {
			js_node_Fs.writeFileSync("output-" + url + ".jpg", data, {
				encoding: "base64"
			});
			console.log("and you should be good to go!<3");
		} else console.log("something went wrong processing the tweeted image");
	},
	glitchEncode: function(img) {
		var quality = Math.random() * Math.random() * 100;
		var wScale = img.width / 20;
		var hScale = img.height / 20;
		this.jpegData.width = img.width;
		this.jpegData.height = img.height;
		this.jpegData.pixels = haxe_io_Bytes.ofData(img.data);
		this.jpegData.quality = quality;
		this.jpegData.argb = Math.random() < 0.25;
		if (Math.random() < 0.25) this.jpegData.yQuantRandom = Math.random();
		else this.jpegData.yQuantRandom = 0.0;
		if (Math.random() < 0.15) this.jpegData.uvQuantRandom = Math.random();
		else this.jpegData.uvQuantRandom = 0.0;
		if (Math.random() < 0.1)
			this.jpegData.dctQuantRowRandom =
				(Math.random() - 0.5) * Math.random() * 100;
		else this.jpegData.dctQuantRowRandom = 0.0;
		if (Math.random() < 0.1)
			this.jpegData.dctQuantColRandom = Math.random() * 100;
		else this.jpegData.dctQuantColRandom = 0.0;
		this.randomiseRGB(
			this.jpegData.yduNoise,
			Math.random() < 0.1 ? 0.25 : 0.01,
			Math.random() < 0.1 ? 0.25 : 0.01,
			Math.random() < 0.1 ? 0.25 : 0.01
		);
		this.randomiseRGB(
			this.jpegData.uduNoise,
			Math.random() < 0.1 ? 0.25 : 0.01,
			Math.random() < 0.1 ? 0.25 : 0.01,
			Math.random() < 0.1 ? 0.25 : 0.01
		);
		this.randomiseRGB(
			this.jpegData.vduNoise,
			Math.random() < 0.2 ? 0.25 : 0.01,
			Math.random() < 0.2 ? 0.25 : 0.01,
			Math.random() < 0.2 ? 0.25 : 0.01
		);
		if (Math.random() < 0.15)
			this.jpegData.dcyMultRandom = Math.random() * 1.2;
		else this.jpegData.dcyMultRandom = 0.0;
		if (Math.random() < 0.15)
			this.jpegData.dcuMultRandom = Math.random() * 1.2;
		else this.jpegData.dcuMultRandom = 0.0;
		if (Math.random() < 0.15)
			this.jpegData.dcvMultRandom = Math.random() * 1.2;
		else this.jpegData.dcvMultRandom = 0.0;
		if (Math.random() < 0.15)
			this.jpegData.dcyOffsetRandom = Math.random() * 1.2;
		else this.jpegData.dcyOffsetRandom = 0.0;
		if (Math.random() < 0.15)
			this.jpegData.dcuOffsetRandom = Math.random() * 1.2;
		else this.jpegData.dcuOffsetRandom = 0.0;
		if (Math.random() < 0.15)
			this.jpegData.dcvOffsetRandom = Math.random() * 1.2;
		else this.jpegData.dcvOffsetRandom = 0.0;
		if (Math.random() < 0.5)
			this.jpegData.rowReadRandom = Main.rr(-1.5, 1.5);
		else this.jpegData.rowReadRandom = 0.0;
		if (Math.random() < 0.25)
			this.jpegData.colReadRandom = Main.rr(-1.5, 1.5);
		else this.jpegData.colReadRandom = 0;
		if (Math.random() < 0.8)
			this.jpegData.nullFillMaxLen = Std["int"](Math.random() * 4);
		else this.jpegData.nullFillMaxLen = 0;
		this.jpegData.nullFillMaxVal = Std["int"](Main.rr(0, 255));
		if (Math.random() < 0.9) this.jpegData.rgbXOffsetRange.r = 0;
		else
			this.jpegData.rgbXOffsetRange.r = Std["int"](
				Math.random() * wScale
			);
		if (Math.random() < 0.9) this.jpegData.rgbXOffsetRange.g = 0;
		else
			this.jpegData.rgbXOffsetRange.g = Std["int"](
				Math.random() * wScale
			);
		if (Math.random() < 0.9) this.jpegData.rgbXOffsetRange.b = 0;
		else
			this.jpegData.rgbXOffsetRange.b = Std["int"](
				Math.random() * wScale
			);
		if (Math.random() < 0.9) this.jpegData.rgbYOffsetRange.r = 0;
		else
			this.jpegData.rgbYOffsetRange.r = Std["int"](
				Math.random() * hScale
			);
		if (Math.random() < 0.9) this.jpegData.rgbYOffsetRange.g = 0;
		else
			this.jpegData.rgbYOffsetRange.g = Std["int"](
				Math.random() * hScale
			);
		if (Math.random() < 0.9) this.jpegData.rgbYOffsetRange.b = 0;
		else
			this.jpegData.rgbYOffsetRange.b = Std["int"](
				Math.random() * hScale
			);
		var wScalei = Math.round(wScale);
		if (Math.random() < 0.5) {
			this.shuffleBlocks(4 + Std["int"](12 * Math.random()), [
				16,
				32,
				64,
				128
			]);
			this.shuffleBlocks(2 + Std["int"](4 * Math.random()), [
				wScalei,
				wScalei << 1,
				wScalei << 2,
				wScalei << 3,
				wScalei << 4
			]);
		} else {
			this.shuffleBlocks(2 + Std["int"](4 * Math.random()), [
				wScalei,
				wScalei << 1,
				wScalei << 2,
				wScalei << 3,
				wScalei << 4
			]);
			this.shuffleBlocks(4 + Std["int"](12 * Math.random()), [
				16,
				32,
				64,
				128
			]);
		}
		return haxe_crypto_Base64.encode(this.writeJPEG());
	},
	writeJPEG: function() {
		var io = new haxe_io_BytesOutput();
		var w = new imgfkr_jpg_CustomWriter(io);
		w.write(this.jpegData);
		return io.getBytes();
	},
	shuffleBlocks: function(count, blockSizes) {
		if (count == null) count = 8;
		var p = this.jpegData.pixels;
		var w = this.jpegData.width;
		var h = this.jpegData.height;
		var offsetBiasX;
		if (Math.random() < 0.5) offsetBiasX = 0;
		else offsetBiasX = (Math.random() - 0.5) * 2.5;
		var offsetBiasY;
		if (Math.random() < 0.5) offsetBiasY = 0;
		else offsetBiasY = (Math.random() - 0.5) * 2.5;
		var _g = 0;
		while (_g < count) {
			var c = _g++;
			var xOff = Std["int"](
				(Math.random() * Math.random() - 0.5 + offsetBiasX) * w / 5
			);
			var yOff = Std["int"](
				(Math.random() * Math.random() - 0.5 + offsetBiasY) * h / 5
			);
			var startX = Std["int"](Math.random() * w);
			var startY = Std["int"](Math.random() * h);
			var blockSize =
				blockSizes[Std["int"](Math.random() * blockSizes.length)];
			var width = blockSize;
			var height;
			if (Math.random() < 0.6) height = blockSize;
			else
				height =
					blockSizes[Std["int"](Math.random() * blockSizes.length)];
			if (width + startX > w) startX -= w;
			if (height + startY > h) startY -= h;
			var _g2 = startX;
			var _g1 = startX + width;
			while (_g2 < _g1) {
				var x = _g2++;
				var _g4 = startY;
				var _g3 = startY + height;
				while (_g4 < _g3) {
					var y = _g4++;
					var offsetA = (y * w + x) << 2;
					var offsetB = ((y + yOff) * w + x + xOff) << 2;
					p.b[offsetB] = p.b[offsetA] & 255;
					p.b[offsetB + 1] = p.b[offsetA + 1] & 255;
					p.b[offsetB + 2] = p.b[offsetA + 2] & 255;
					p.b[offsetB + 3] = p.b[offsetA + 3] & 255;
				}
			}
		}
	},
	randomiseRGB: function(rgb, aR, aG, aB) {
		rgb.r = Math.random() * aR;
		rgb.g = Math.random() * aG;
		rgb.b = Math.random() * aB;
	},
	__class__: Main
};
Math.__name__ = true;
var Std = function() {};
Std.__name__ = true;
Std.string = function(s) {
	return js_Boot.__string_rec(s, "");
};
Std["int"] = function(x) {
	return x | 0;
};
Std.parseInt = function(x) {
	var v = parseInt(x, 10);
	if (v == 0 && (HxOverrides.cca(x, 1) == 120 || HxOverrides.cca(x, 1) == 88))
		v = parseInt(x);
	if (isNaN(v)) return null;
	return v;
};
var StringTools = function() {};
StringTools.__name__ = true;
StringTools.fastCodeAt = function(s, index) {
	return s.charCodeAt(index);
};
var haxe_IMap = function() {};
haxe_IMap.__name__ = true;
var haxe__$Int64__$_$_$Int64 = function(high, low) {
	this.high = high;
	this.low = low;
};
haxe__$Int64__$_$_$Int64.__name__ = true;
haxe__$Int64__$_$_$Int64.prototype = {
	__class__: haxe__$Int64__$_$_$Int64
};
var haxe_io_Bytes = function(data) {
	this.length = data.byteLength;
	this.b = new Uint8Array(data);
	this.b.bufferValue = data;
	data.hxBytes = this;
	data.bytes = this.b;
};
haxe_io_Bytes.__name__ = true;
haxe_io_Bytes.alloc = function(length) {
	return new haxe_io_Bytes(new ArrayBuffer(length));
};
haxe_io_Bytes.ofString = function(s) {
	var a = [];
	var i = 0;
	while (i < s.length) {
		var c = StringTools.fastCodeAt(s, i++);
		if (55296 <= c && c <= 56319)
			c = ((c - 55232) << 10) | (StringTools.fastCodeAt(s, i++) & 1023);
		if (c <= 127) a.push(c);
		else if (c <= 2047) {
			a.push(192 | (c >> 6));
			a.push(128 | (c & 63));
		} else if (c <= 65535) {
			a.push(224 | (c >> 12));
			a.push(128 | ((c >> 6) & 63));
			a.push(128 | (c & 63));
		} else {
			a.push(240 | (c >> 18));
			a.push(128 | ((c >> 12) & 63));
			a.push(128 | ((c >> 6) & 63));
			a.push(128 | (c & 63));
		}
	}
	return new haxe_io_Bytes(new Uint8Array(a).buffer);
};
haxe_io_Bytes.ofData = function(b) {
	var hb = b.hxBytes;
	if (hb != null) return hb;
	return new haxe_io_Bytes(b);
};
haxe_io_Bytes.prototype = {
	get: function(pos) {
		return this.b[pos];
	},
	set: function(pos, v) {
		this.b[pos] = v & 255;
	},
	getString: function(pos, len) {
		if (pos < 0 || len < 0 || pos + len > this.length)
			throw new js__$Boot_HaxeError(haxe_io_Error.OutsideBounds);
		var s = "";
		var b = this.b;
		var fcc = String.fromCharCode;
		var i = pos;
		var max = pos + len;
		while (i < max) {
			var c = b[i++];
			if (c < 128) {
				if (c == 0) break;
				s += fcc(c);
			} else if (c < 224) s += fcc(((c & 63) << 6) | (b[i++] & 127));
			else if (c < 240) {
				var c2 = b[i++];
				s += fcc(((c & 31) << 12) | ((c2 & 127) << 6) | (b[i++] & 127));
			} else {
				var c21 = b[i++];
				var c3 = b[i++];
				var u =
					((c & 15) << 18) |
					((c21 & 127) << 12) |
					((c3 & 127) << 6) |
					(b[i++] & 127);
				s += fcc((u >> 10) + 55232);
				s += fcc((u & 1023) | 56320);
			}
		}
		return s;
	},
	toString: function() {
		return this.getString(0, this.length);
	},
	__class__: haxe_io_Bytes
};
var haxe_crypto_Base64 = function() {};
haxe_crypto_Base64.__name__ = true;
haxe_crypto_Base64.encode = function(bytes, complement) {
	if (complement == null) complement = true;
	var str = new haxe_crypto_BaseCode(haxe_crypto_Base64.BYTES)
		.encodeBytes(bytes)
		.toString();
	if (complement) {
		var _g = bytes.length % 3;
		switch (_g) {
			case 1:
				str += "==";
				break;
			case 2:
				str += "=";
				break;
			default:
		}
	}
	return str;
};
var haxe_crypto_BaseCode = function(base) {
	var len = base.length;
	var nbits = 1;
	while (len > 1 << nbits) nbits++;
	if (nbits > 8 || len != 1 << nbits)
		throw new js__$Boot_HaxeError(
			"BaseCode : base length must be a power of two."
		);
	this.base = base;
	this.nbits = nbits;
};
haxe_crypto_BaseCode.__name__ = true;
haxe_crypto_BaseCode.prototype = {
	encodeBytes: function(b) {
		var nbits = this.nbits;
		var base = this.base;
		var size = (b.length * 8 / nbits) | 0;
		var out = haxe_io_Bytes.alloc(
			size + ((b.length * 8) % nbits == 0 ? 0 : 1)
		);
		var buf = 0;
		var curbits = 0;
		var mask = (1 << nbits) - 1;
		var pin = 0;
		var pout = 0;
		while (pout < size) {
			while (curbits < nbits) {
				curbits += 8;
				buf <<= 8;
				buf |= b.get(pin++);
			}
			curbits -= nbits;
			out.set(pout++, base.b[(buf >> curbits) & mask]);
		}
		if (curbits > 0)
			out.set(pout++, base.b[(buf << (nbits - curbits)) & mask]);
		return out;
	},
	__class__: haxe_crypto_BaseCode
};
var haxe_ds_IntMap = function() {
	this.h = {};
};
haxe_ds_IntMap.__name__ = true;
haxe_ds_IntMap.__interfaces__ = [haxe_IMap];
haxe_ds_IntMap.prototype = {
	__class__: haxe_ds_IntMap
};
var haxe_io_BytesBuffer = function() {
	this.b = [];
};
haxe_io_BytesBuffer.__name__ = true;
haxe_io_BytesBuffer.prototype = {
	addBytes: function(src, pos, len) {
		if (pos < 0 || len < 0 || pos + len > src.length)
			throw new js__$Boot_HaxeError(haxe_io_Error.OutsideBounds);
		var b1 = this.b;
		var b2 = src.b;
		var _g1 = pos;
		var _g = pos + len;
		while (_g1 < _g) {
			var i = _g1++;
			this.b.push(b2[i]);
		}
	},
	getBytes: function() {
		var bytes = new haxe_io_Bytes(new Uint8Array(this.b).buffer);
		this.b = null;
		return bytes;
	},
	__class__: haxe_io_BytesBuffer
};
var haxe_io_Output = function() {};
haxe_io_Output.__name__ = true;
haxe_io_Output.prototype = {
	writeByte: function(c) {
		throw new js__$Boot_HaxeError("Not implemented");
	},
	writeBytes: function(s, pos, len) {
		var k = len;
		var b = s.b.bufferValue;
		if (pos < 0 || len < 0 || pos + len > s.length)
			throw new js__$Boot_HaxeError(haxe_io_Error.OutsideBounds);
		while (k > 0) {
			this.writeByte(b[pos]);
			pos++;
			k--;
		}
		return len;
	},
	write: function(s) {
		var l = s.length;
		var p = 0;
		while (l > 0) {
			var k = this.writeBytes(s, p, l);
			if (k == 0) throw new js__$Boot_HaxeError(haxe_io_Error.Blocked);
			p += k;
			l -= k;
		}
	},
	__class__: haxe_io_Output
};
var haxe_io_BytesOutput = function() {
	this.b = new haxe_io_BytesBuffer();
};
haxe_io_BytesOutput.__name__ = true;
haxe_io_BytesOutput.__super__ = haxe_io_Output;
haxe_io_BytesOutput.prototype = $extend(haxe_io_Output.prototype, {
	writeByte: function(c) {
		this.b.b.push(c);
	},
	writeBytes: function(buf, pos, len) {
		this.b.addBytes(buf, pos, len);
		return len;
	},
	getBytes: function() {
		return this.b.getBytes();
	},
	__class__: haxe_io_BytesOutput
});
var haxe_io_Eof = function() {};
haxe_io_Eof.__name__ = true;
haxe_io_Eof.prototype = {
	toString: function() {
		return "Eof";
	},
	__class__: haxe_io_Eof
};
var haxe_io_Error = {
	__ename__: true,
	__constructs__: ["Blocked", "Overflow", "OutsideBounds", "Custom"]
};
haxe_io_Error.Blocked = ["Blocked", 0];
haxe_io_Error.Blocked.toString = $estr;
haxe_io_Error.Blocked.__enum__ = haxe_io_Error;
haxe_io_Error.Overflow = ["Overflow", 1];
haxe_io_Error.Overflow.toString = $estr;
haxe_io_Error.Overflow.__enum__ = haxe_io_Error;
haxe_io_Error.OutsideBounds = ["OutsideBounds", 2];
haxe_io_Error.OutsideBounds.toString = $estr;
haxe_io_Error.OutsideBounds.__enum__ = haxe_io_Error;
haxe_io_Error.Custom = function(e) {
	var $x = ["Custom", 3, e];
	$x.__enum__ = haxe_io_Error;
	$x.toString = $estr;
	return $x;
};
var haxe_io_FPHelper = function() {};
haxe_io_FPHelper.__name__ = true;
haxe_io_FPHelper.i32ToFloat = function(i) {
	var sign = 1 - ((i >>> 31) << 1);
	var exp = (i >>> 23) & 255;
	var sig = i & 8388607;
	if (sig == 0 && exp == 0) return 0.0;
	return sign * (1 + Math.pow(2, -23) * sig) * Math.pow(2, exp - 127);
};
haxe_io_FPHelper.floatToI32 = function(f) {
	if (f == 0) return 0;
	var af;
	if (f < 0) af = -f;
	else af = f;
	var exp = Math.floor(Math.log(af) / 0.6931471805599453);
	if (exp < -127) exp = -127;
	else if (exp > 128) exp = 128;
	var sig = Math.round((af / Math.pow(2, exp) - 1) * 8388608) & 8388607;
	return (f < 0 ? -2147483648 : 0) | ((exp + 127) << 23) | sig;
};
haxe_io_FPHelper.i64ToDouble = function(low, high) {
	var sign = 1 - ((high >>> 31) << 1);
	var exp = ((high >> 20) & 2047) - 1023;
	var sig =
		(high & 1048575) * 4294967296 +
		(low >>> 31) * 2147483648 +
		(low & 2147483647);
	if (sig == 0 && exp == -1023) return 0.0;
	return sign * (1.0 + Math.pow(2, -52) * sig) * Math.pow(2, exp);
};
haxe_io_FPHelper.doubleToI64 = function(v) {
	var i64 = haxe_io_FPHelper.i64tmp;
	if (v == 0) {
		i64.low = 0;
		i64.high = 0;
	} else {
		var av;
		if (v < 0) av = -v;
		else av = v;
		var exp = Math.floor(Math.log(av) / 0.6931471805599453);
		var sig;
		var v1 = (av / Math.pow(2, exp) - 1) * 4503599627370496;
		sig = Math.round(v1);
		var sig_l = sig | 0;
		var sig_h = (sig / 4294967296.0) | 0;
		i64.low = sig_l;
		i64.high = (v < 0 ? -2147483648 : 0) | ((exp + 1023) << 20) | sig_h;
	}
	return i64;
};
var imgfkr_BufferLoader = function() {};
imgfkr_BufferLoader.__name__ = true;
imgfkr_BufferLoader.load = function(url, done) {
	js_node_Fs.readFile(url, function(err, data) {
		done(js_node_buffer_Buffer.from(data));
	});
};
var imgfkr_jpg_CustomWriter = function(out) {
	this.YTable = [];
	this.UVTable = [];
	this.fdtbl_Y = [];
	this.fdtbl_UV = [];
	var _g = 0;
	while (_g < 64) {
		var i = _g++;
		this.YTable.push(0);
		this.UVTable.push(0);
		this.fdtbl_Y.push(0.0);
		this.fdtbl_UV.push(0.0);
	}
	this.bitcode = new haxe_ds_IntMap();
	this.category = new haxe_ds_IntMap();
	this.byteout = out;
	this.bytenew = 0;
	this.bytepos = 7;
	this.YDC_HT = new haxe_ds_IntMap();
	this.UVDC_HT = new haxe_ds_IntMap();
	this.YAC_HT = new haxe_ds_IntMap();
	this.UVAC_HT = new haxe_ds_IntMap();
	this.YDU = [];
	this.UDU = [];
	this.VDU = [];
	this.DU = [];
	var _g1 = 0;
	while (_g1 < 64) {
		var i1 = _g1++;
		this.YDU.push(0.0);
		this.UDU.push(0.0);
		this.VDU.push(0.0);
		this.DU.push(0.0);
	}
	this.initZigZag();
	this.initLuminance();
	this.initChrominance();
	this.initHuffmanTbl();
	this.initCategoryNumber();
};
imgfkr_jpg_CustomWriter.__name__ = true;
imgfkr_jpg_CustomWriter.prototype = {
	initZigZag: function() {
		this.ZigZag = [
			0,
			1,
			5,
			6,
			14,
			15,
			27,
			28,
			2,
			4,
			7,
			13,
			16,
			26,
			29,
			42,
			3,
			8,
			12,
			17,
			25,
			30,
			41,
			43,
			9,
			11,
			18,
			24,
			31,
			40,
			44,
			53,
			10,
			19,
			23,
			32,
			39,
			45,
			52,
			54,
			20,
			22,
			33,
			38,
			46,
			51,
			55,
			60,
			21,
			34,
			37,
			47,
			50,
			56,
			59,
			61,
			35,
			36,
			48,
			49,
			57,
			58,
			62,
			63
		];
	},
	initQuantTables: function(sf) {
		var YQT = [
			16,
			11,
			10,
			16,
			24,
			40,
			51,
			61,
			12,
			12,
			14,
			19,
			26,
			58,
			60,
			55,
			14,
			13,
			16,
			24,
			40,
			57,
			69,
			56,
			14,
			17,
			22,
			29,
			51,
			87,
			80,
			62,
			18,
			22,
			37,
			56,
			68,
			109,
			103,
			77,
			24,
			35,
			55,
			64,
			81,
			104,
			113,
			92,
			49,
			64,
			78,
			87,
			103,
			121,
			120,
			101,
			72,
			92,
			95,
			98,
			112,
			100,
			103,
			99
		];
		var _g = 0;
		while (_g < 64) {
			var i = _g++;
			var t = Math.floor((YQT[i] * sf + 50) / 100);
			if (t < 1) t = 1;
			else if (t > 255) t = 255;
			this.YTable[this.ZigZag[i]] = t;
		}
		var UVQT = [
			17,
			18,
			24,
			47,
			99,
			99,
			99,
			99,
			18,
			21,
			26,
			66,
			99,
			99,
			99,
			99,
			24,
			26,
			56,
			99,
			99,
			99,
			99,
			99,
			47,
			66,
			99,
			99,
			99,
			99,
			99,
			99,
			99,
			99,
			99,
			99,
			99,
			99,
			99,
			99,
			99,
			99,
			99,
			99,
			99,
			99,
			99,
			99,
			99,
			99,
			99,
			99,
			99,
			99,
			99,
			99,
			99,
			99,
			99,
			99,
			99,
			99,
			99,
			99
		];
		var _g1 = 0;
		while (_g1 < 64) {
			var j = _g1++;
			var u = Math.floor((UVQT[j] * sf + 50) / 100);
			if (u < 1) u = 1;
			else if (u > 255) u = 255;
			this.UVTable[this.ZigZag[j]] = u;
		}
		var aasf = [
			1.0,
			1.387039845,
			1.306562965,
			1.175875602,
			1.0,
			0.785694958,
			0.5411961,
			0.275899379
		];
		var k = 0;
		var yQRandom = this.imgData.yQuantRandom;
		var uvQRandom = this.imgData.uvQuantRandom;
		var _g2 = 0;
		while (_g2 < 8) {
			var row = _g2++;
			var _g11 = 0;
			while (_g11 < 8) {
				var col = _g11++;
				this.fdtbl_Y[k] =
					1.0 /
					(this.YTable[this.ZigZag[k]] *
						aasf[row] *
						aasf[col] *
						8.0 *
						(1.0 + yQRandom * Math.random()));
				this.fdtbl_UV[k] =
					1.0 /
					(this.UVTable[this.ZigZag[k]] *
						aasf[row] *
						aasf[col] *
						8.0 *
						(1.0 + uvQRandom * Math.random()));
				k++;
			}
		}
	},
	initLuminance: function() {
		this.std_dc_luminance_nrcodes = [
			0,
			0,
			1,
			5,
			1,
			1,
			1,
			1,
			1,
			1,
			0,
			0,
			0,
			0,
			0,
			0,
			0
		];
		this.std_dc_luminance_values = this.strIntsToBytes(
			"0,1,2,3,4,5,6,7,8,9,10,11"
		);
		this.std_ac_luminance_nrcodes = [
			0,
			0,
			2,
			1,
			3,
			3,
			2,
			4,
			3,
			5,
			5,
			4,
			4,
			0,
			0,
			1,
			125
		];
		this.std_ac_luminance_values = this.strIntsToBytes(
			"0x01,0x02,0x03,0x00,0x04,0x11,0x05,0x12," +
				"0x21,0x31,0x41,0x06,0x13,0x51,0x61,0x07," +
				"0x22,0x71,0x14,0x32,0x81,0x91,0xa1,0x08," +
				"0x23,0x42,0xb1,0xc1,0x15,0x52,0xd1,0xf0," +
				"0x24,0x33,0x62,0x72,0x82,0x09,0x0a,0x16," +
				"0x17,0x18,0x19,0x1a,0x25,0x26,0x27,0x28," +
				"0x29,0x2a,0x34,0x35,0x36,0x37,0x38,0x39," +
				"0x3a,0x43,0x44,0x45,0x46,0x47,0x48,0x49," +
				"0x4a,0x53,0x54,0x55,0x56,0x57,0x58,0x59," +
				"0x5a,0x63,0x64,0x65,0x66,0x67,0x68,0x69," +
				"0x6a,0x73,0x74,0x75,0x76,0x77,0x78,0x79," +
				"0x7a,0x83,0x84,0x85,0x86,0x87,0x88,0x89," +
				"0x8a,0x92,0x93,0x94,0x95,0x96,0x97,0x98," +
				"0x99,0x9a,0xa2,0xa3,0xa4,0xa5,0xa6,0xa7," +
				"0xa8,0xa9,0xaa,0xb2,0xb3,0xb4,0xb5,0xb6," +
				"0xb7,0xb8,0xb9,0xba,0xc2,0xc3,0xc4,0xc5," +
				"0xc6,0xc7,0xc8,0xc9,0xca,0xd2,0xd3,0xd4," +
				"0xd5,0xd6,0xd7,0xd8,0xd9,0xda,0xe1,0xe2," +
				"0xe3,0xe4,0xe5,0xe6,0xe7,0xe8,0xe9,0xea," +
				"0xf1,0xf2,0xf3,0xf4,0xf5,0xf6,0xf7,0xf8," +
				"0xf9,0xfa"
		);
	},
	strIntsToBytes: function(s) {
		var len = s.length;
		var b = new haxe_io_BytesBuffer();
		var val = 0;
		var i = 0;
		var _g = 0;
		while (_g < len) {
			var j = _g++;
			if (s.charAt(j) == ",") {
				val = Std.parseInt(HxOverrides.substr(s, i, j - i));
				b.b.push(val);
				i = j + 1;
			}
		}
		if (i < len) {
			val = Std.parseInt(HxOverrides.substr(s, i, null));
			b.b.push(val);
		}
		return b.getBytes();
	},
	initChrominance: function() {
		this.std_dc_chrominance_nrcodes = [
			0,
			0,
			3,
			1,
			1,
			1,
			1,
			1,
			1,
			1,
			1,
			1,
			0,
			0,
			0,
			0,
			0
		];
		this.std_dc_chrominance_values = this.strIntsToBytes(
			"0,1,2,3,4,5,6,7,8,9,10,11"
		);
		this.std_ac_chrominance_nrcodes = [
			0,
			0,
			2,
			1,
			2,
			4,
			4,
			3,
			4,
			7,
			5,
			4,
			4,
			0,
			1,
			2,
			119
		];
		this.std_ac_chrominance_values = this.strIntsToBytes(
			"0x00,0x01,0x02,0x03,0x11,0x04,0x05,0x21," +
				"0x31,0x06,0x12,0x41,0x51,0x07,0x61,0x71," +
				"0x13,0x22,0x32,0x81,0x08,0x14,0x42,0x91," +
				"0xa1,0xb1,0xc1,0x09,0x23,0x33,0x52,0xf0," +
				"0x15,0x62,0x72,0xd1,0x0a,0x16,0x24,0x34," +
				"0xe1,0x25,0xf1,0x17,0x18,0x19,0x1a,0x26," +
				"0x27,0x28,0x29,0x2a,0x35,0x36,0x37,0x38," +
				"0x39,0x3a,0x43,0x44,0x45,0x46,0x47,0x48," +
				"0x49,0x4a,0x53,0x54,0x55,0x56,0x57,0x58," +
				"0x59,0x5a,0x63,0x64,0x65,0x66,0x67,0x68," +
				"0x69,0x6a,0x73,0x74,0x75,0x76,0x77,0x78," +
				"0x79,0x7a,0x82,0x83,0x84,0x85,0x86,0x87," +
				"0x88,0x89,0x8a,0x92,0x93,0x94,0x95,0x96," +
				"0x97,0x98,0x99,0x9a,0xa2,0xa3,0xa4,0xa5," +
				"0xa6,0xa7,0xa8,0xa9,0xaa,0xb2,0xb3,0xb4," +
				"0xb5,0xb6,0xb7,0xb8,0xb9,0xba,0xc2,0xc3," +
				"0xc4,0xc5,0xc6,0xc7,0xc8,0xc9,0xca,0xd2," +
				"0xd3,0xd4,0xd5,0xd6,0xd7,0xd8,0xd9,0xda," +
				"0xe2,0xe3,0xe4,0xe5,0xe6,0xe7,0xe8,0xe9," +
				"0xea,0xf2,0xf3,0xf4,0xf5,0xf6,0xf7,0xf8," +
				"0xf9,0xfa"
		);
	},
	initHuffmanTbl: function() {
		this.YDC_HT = this.computeHuffmanTbl(
			this.std_dc_luminance_nrcodes,
			this.std_dc_luminance_values
		);
		this.UVDC_HT = this.computeHuffmanTbl(
			this.std_dc_chrominance_nrcodes,
			this.std_dc_chrominance_values
		);
		this.YAC_HT = this.computeHuffmanTbl(
			this.std_ac_luminance_nrcodes,
			this.std_ac_luminance_values
		);
		this.UVAC_HT = this.computeHuffmanTbl(
			this.std_ac_chrominance_nrcodes,
			this.std_ac_chrominance_values
		);
	},
	computeHuffmanTbl: function(nrcodes, std_table) {
		var codevalue = 0;
		var pos_in_table = 0;
		var HT = new haxe_ds_IntMap();
		var _g = 1;
		while (_g < 17) {
			var k = _g++;
			var end = nrcodes[k];
			var _g1 = 0;
			while (_g1 < end) {
				var j = _g1++;
				var idx = std_table.b[pos_in_table];
				var value = new imgfkr_jpg__$CustomWriter_BitString(
					k,
					codevalue
				);
				HT.h[idx] = value;
				pos_in_table++;
				codevalue++;
			}
			codevalue *= 2;
		}
		return HT;
	},
	initCategoryNumber: function() {
		var nrlower = 1;
		var nrupper = 2;
		var idx;
		var _g = 1;
		while (_g < 16) {
			var cat = _g++;
			var _g1 = nrlower;
			while (_g1 < nrupper) {
				var nr = _g1++;
				idx = 32767 + nr;
				this.category.h[idx] = cat;
				var value = new imgfkr_jpg__$CustomWriter_BitString(cat, nr);
				this.bitcode.h[idx] = value;
			}
			var nrneg = -(nrupper - 1);
			while (nrneg <= -nrlower) {
				idx = 32767 + nrneg;
				this.category.h[idx] = cat;
				var value1 = new imgfkr_jpg__$CustomWriter_BitString(
					cat,
					nrupper - 1 + nrneg
				);
				this.bitcode.h[idx] = value1;
				nrneg++;
			}
			nrlower <<= 1;
			nrupper <<= 1;
		}
	},
	writeBits: function(bs) {
		if (bs == null) {
			if (this.imgData.nullFillMaxLen <= 0) return;
			bs = new imgfkr_jpg__$CustomWriter_BitString(
				Std["int"](Math.random() * this.imgData.nullFillMaxLen),
				Std["int"](Math.random() * this.imgData.nullFillMaxVal)
			);
		}
		var value = bs.val;
		var posval = bs.len - 1;
		while (posval >= 0) {
			if ((value & (1 << posval)) != 0) this.bytenew |= 1 << this.bytepos;
			posval--;
			this.bytepos--;
			if (this.bytepos < 0) {
				if (this.bytenew == 255) {
					this.byteout.writeByte(255);
					this.byteout.writeByte(0);
				} else this.byteout.writeByte(this.bytenew);
				this.bytepos = 7;
				this.bytenew = 0;
			}
		}
	},
	writeWord: function(val) {
		this.byteout.writeByte((val >> 8) & 255);
		this.byteout.writeByte(val & 255);
	},
	fDCTQuant: function(data, fdtbl) {
		var rowRandom = this.imgData.dctQuantRowRandom;
		var colRandom = this.imgData.dctQuantColRandom;
		var dataOff = 0;
		var _g = 0;
		while (_g < 8) {
			var i = _g++;
			var tmp0 = data[dataOff] + data[dataOff + 7];
			var tmp7 = data[dataOff] - data[dataOff + 7];
			var tmp1 = data[dataOff + 1] + data[dataOff + 6];
			var tmp6 = data[dataOff + 1] - data[dataOff + 6];
			var tmp2 = data[dataOff + 2] + data[dataOff + 5];
			var tmp5 = data[dataOff + 2] - data[dataOff + 5];
			var tmp3 = data[dataOff + 3] + data[dataOff + 4];
			var tmp4 = data[dataOff + 3] - data[dataOff + 4];
			var tmp10 = tmp0 + tmp3;
			var tmp13 = tmp0 - tmp3;
			var tmp11 = tmp1 + tmp2;
			var tmp12 = tmp1 - tmp2;
			data[dataOff] = tmp10 + tmp11;
			data[dataOff + 4] = tmp10 - tmp11;
			var z1 = (tmp12 + tmp13) * 0.707106781;
			data[dataOff + 2] = tmp13 + z1;
			data[dataOff + 6] = tmp13 - z1;
			tmp10 = tmp4 + tmp5;
			tmp11 = tmp5 + tmp6;
			tmp12 = tmp6 + tmp7;
			var z5 = (tmp10 - tmp12) * 0.382683433;
			var z2 = 0.5411961 * tmp10 + z5;
			var z4 = 1.306562965 * tmp12 + z5;
			var z3 = tmp11 * 0.707106781 * (1.0 + rowRandom * Math.random());
			var z11 = tmp7 + z3;
			var z13 = tmp7 - z3;
			data[dataOff + 5] = z13 + z2;
			data[dataOff + 3] = z13 - z2;
			data[dataOff + 1] = z11 + z4;
			data[dataOff + 7] = z11 - z4;
			dataOff += 8;
		}
		dataOff = 0;
		var _g1 = 0;
		while (_g1 < 8) {
			var j = _g1++;
			var tmp0p2 = data[dataOff] + data[dataOff + 56];
			var tmp7p2 = data[dataOff] - data[dataOff + 56];
			var tmp1p2 = data[dataOff + 8] + data[dataOff + 48];
			var tmp6p2 = data[dataOff + 8] - data[dataOff + 48];
			var tmp2p2 = data[dataOff + 16] + data[dataOff + 40];
			var tmp5p2 = data[dataOff + 16] - data[dataOff + 40];
			var tmp3p2 = data[dataOff + 24] + data[dataOff + 32];
			var tmp4p2 = data[dataOff + 24] - data[dataOff + 32];
			var tmp10p2 = tmp0p2 + tmp3p2;
			var tmp13p2 = tmp0p2 - tmp3p2;
			var tmp11p2 = tmp1p2 + tmp2p2;
			var tmp12p2 = tmp1p2 - tmp2p2;
			data[dataOff] = tmp10p2 + tmp11p2;
			data[dataOff + 32] = tmp10p2 - tmp11p2;
			var z1p2 = (tmp12p2 + tmp13p2) * 0.707106781;
			data[dataOff + 16] = tmp13p2 + z1p2;
			data[dataOff + 48] = tmp13p2 - z1p2;
			tmp10p2 = tmp4p2 + tmp5p2;
			tmp11p2 = tmp5p2 + tmp6p2;
			tmp12p2 = tmp6p2 + tmp7p2;
			var z5p2 = (tmp10p2 - tmp12p2) * 0.382683433;
			var z2p2 = 0.5411961 * tmp10p2 + z5p2;
			var z4p2 = 1.306562965 * tmp12p2 + z5p2;
			var z3p2 =
				tmp11p2 * 0.707106781 * (1.0 + colRandom * Math.random());
			var z11p2 = tmp7p2 + z3p2;
			var z13p2 = tmp7p2 - z3p2;
			data[dataOff + 40] = z13p2 + z2p2;
			data[dataOff + 24] = z13p2 - z2p2;
			data[dataOff + 8] = z11p2 + z4p2;
			data[dataOff + 56] = z11p2 - z4p2;
			dataOff++;
		}
		var _g2 = 0;
		while (_g2 < 64) {
			var k = _g2++;
			data[k] = Math.round(data[k] * fdtbl[k]);
		}
		return data;
	},
	writeAPP0: function() {
		this.byteout.writeByte(255);
		this.byteout.writeByte(224);
		this.byteout.writeByte(0);
		this.byteout.writeByte(16);
		this.byteout.writeByte(74);
		this.byteout.writeByte(70);
		this.byteout.writeByte(73);
		this.byteout.writeByte(70);
		this.byteout.writeByte(0);
		this.byteout.writeByte(1);
		this.byteout.writeByte(1);
		this.byteout.writeByte(0);
		this.byteout.writeByte(0);
		this.byteout.writeByte(1);
		this.byteout.writeByte(0);
		this.byteout.writeByte(1);
		this.byteout.writeByte(0);
		this.byteout.writeByte(0);
	},
	writeDQT: function() {
		this.byteout.writeByte(255);
		this.byteout.writeByte(219);
		this.byteout.writeByte(0);
		this.byteout.writeByte(132);
		this.byteout.writeByte(0);
		var _g = 0;
		while (_g < 64) {
			var j = _g++;
			this.byteout.writeByte(this.YTable[j]);
		}
		this.byteout.writeByte(1);
		var _g1 = 0;
		while (_g1 < 64) {
			var j1 = _g1++;
			this.byteout.writeByte(this.UVTable[j1]);
		}
	},
	writeSOF0: function(width, height) {
		this.byteout.writeByte(255);
		this.byteout.writeByte(192);
		this.byteout.writeByte(0);
		this.byteout.writeByte(17);
		this.byteout.writeByte(8);
		this.byteout.writeByte((height >> 8) & 255);
		this.byteout.writeByte(height & 255);
		this.byteout.writeByte((width >> 8) & 255);
		this.byteout.writeByte(width & 255);
		this.byteout.writeByte(3);
		this.byteout.writeByte(1);
		this.byteout.writeByte(17);
		this.byteout.writeByte(0);
		this.byteout.writeByte(2);
		this.byteout.writeByte(17);
		this.byteout.writeByte(1);
		this.byteout.writeByte(3);
		this.byteout.writeByte(17);
		this.byteout.writeByte(1);
	},
	writeDHT: function() {
		this.byteout.writeByte(255);
		this.byteout.writeByte(196);
		this.byteout.writeByte(1);
		this.byteout.writeByte(162);
		this.byteout.writeByte(0);
		var _g = 1;
		while (_g < 17) {
			var j = _g++;
			this.byteout.writeByte(this.std_dc_luminance_nrcodes[j]);
		}
		this.byteout.write(this.std_dc_luminance_values);
		this.byteout.writeByte(16);
		var _g1 = 1;
		while (_g1 < 17) {
			var j1 = _g1++;
			this.byteout.writeByte(this.std_ac_luminance_nrcodes[j1]);
		}
		this.byteout.write(this.std_ac_luminance_values);
		this.byteout.writeByte(1);
		var _g2 = 1;
		while (_g2 < 17) {
			var j2 = _g2++;
			this.byteout.writeByte(this.std_dc_chrominance_nrcodes[j2]);
		}
		this.byteout.write(this.std_dc_chrominance_values);
		this.byteout.writeByte(17);
		var _g3 = 1;
		while (_g3 < 17) {
			var j3 = _g3++;
			this.byteout.writeByte(this.std_ac_chrominance_nrcodes[j3]);
		}
		this.byteout.write(this.std_ac_chrominance_values);
	},
	writeSOS: function() {
		this.byteout.writeByte(255);
		this.byteout.writeByte(218);
		this.byteout.writeByte(0);
		this.byteout.writeByte(12);
		this.byteout.writeByte(3);
		this.byteout.writeByte(1);
		this.byteout.writeByte(0);
		this.byteout.writeByte(2);
		this.byteout.writeByte(17);
		this.byteout.writeByte(3);
		this.byteout.writeByte(17);
		this.byteout.writeByte(0);
		this.byteout.writeByte(63);
		this.byteout.writeByte(0);
	},
	processDU: function(CDU, fdtbl, DC, HTDC, HTAC) {
		var EOB = HTAC.h[0];
		var M16zeroes = HTAC.h[240];
		var DU_DCT = this.fDCTQuant(CDU, fdtbl);
		var _g = 0;
		while (_g < 64) {
			var i1 = _g++;
			this.DU[this.ZigZag[i1]] = DU_DCT[i1];
		}
		var idx;
		var Diff = (this.DU[0] - DC) | 0;
		DC = this.DU[0];
		if (Diff == 0) this.writeBits(HTDC.h[0]);
		else {
			idx = 32767 + Diff;
			this.writeBits(
				(function($this) {
					var $r;
					var key = $this.category.h[idx];
					$r = HTDC.h[key];
					return $r;
				})(this)
			);
			this.writeBits(this.bitcode.h[idx]);
		}
		var end0pos = 63;
		while (end0pos > 0 && this.DU[end0pos] == 0.0) end0pos--;
		if (end0pos == 0) {
			this.writeBits(EOB);
			return DC;
		}
		var i = 1;
		while (i <= end0pos) {
			var startpos = i;
			while (this.DU[i] == 0.0 && i <= end0pos) i++;
			var nrzeroes = i - startpos;
			if (nrzeroes >= 16) {
				var _g1 = 0;
				var _g2 = nrzeroes >> 4;
				while (_g1 < _g2) {
					var nrmarker = _g1++;
					this.writeBits(M16zeroes);
				}
				nrzeroes &= 15;
			}
			idx = 32767 + (this.DU[i] | 0);
			this.writeBits(
				(function($this) {
					var $r;
					var key1 = nrzeroes * 16 + $this.category.h[idx];
					$r = HTAC.h[key1];
					return $r;
				})(this)
			);
			this.writeBits(this.bitcode.h[idx]);
			i++;
		}
		if (end0pos != 63) this.writeBits(EOB);
		return DC;
	},
	RGB2YUV: function(img, width, xpos, ypos) {
		var yduNoise = this.imgData.yduNoise;
		var uduNoise = this.imgData.uduNoise;
		var vduNoise = this.imgData.vduNoise;
		var argb = this.imgData.argb;
		var rXOffset = this.imgData.rgbXOffsetRange.r;
		var gXOffset = this.imgData.rgbXOffsetRange.g;
		var bXOffset = this.imgData.rgbXOffsetRange.b;
		var rYOffset = this.imgData.rgbYOffsetRange.r;
		var gYOffset = this.imgData.rgbYOffsetRange.g;
		var bYOffset = this.imgData.rgbYOffsetRange.b;
		var w4 = width << 2;
		var pos = 0;
		var _g = 0;
		while (_g < 8) {
			var y = _g++;
			var offset = ((y + ypos) * width + xpos) << 2;
			var _g1 = 0;
			while (_g1 < 8) {
				var x = _g1++;
				if (argb) offset++;
				var R = img.b[offset + (rXOffset << 2) + rYOffset * w4];
				var G = img.b[offset + 1 + (gXOffset << 2) + gYOffset * w4];
				var B = img.b[offset + 2 + (bXOffset << 2) + bYOffset * w4];
				offset += 3;
				if (!argb) offset++;
				this.YDU[pos] =
					(0.299 + yduNoise.r * Math.random()) * R +
					(0.587 + yduNoise.g * Math.random()) * G +
					(0.114 + yduNoise.b * Math.random()) * B -
					128;
				this.UDU[pos] =
					(-0.16874 + uduNoise.r * Math.random()) * R +
					(-0.33126 + uduNoise.g * Math.random()) * G +
					(0.5 + uduNoise.b * Math.random()) * B;
				this.VDU[pos] =
					(0.5 + vduNoise.r * Math.random()) * R +
					(-0.41869 + vduNoise.g * Math.random()) * G +
					(-0.08131 + vduNoise.b * Math.random()) * B;
				pos++;
			}
		}
	},
	write: function(image) {
		this.imgData = image;
		var quality = image.quality;
		if (quality <= 0) quality = 1;
		if (quality > 100) quality = 100;
		var sf;
		if (quality < 50) sf = (5000 / quality) | 0;
		else sf = (200 - quality * 2) | 0;
		this.initQuantTables(sf);
		this.bytenew = 0;
		this.bytepos = 7;
		var width = image.width;
		var height = image.height;
		this.writeWord(65496);
		this.writeAPP0();
		this.writeDQT();
		this.writeSOF0(width, height);
		this.writeDHT();
		this.writeSOS();
		var dcyOffsetRandom = this.imgData.dcyOffsetRandom;
		var dcuOffsetRandom = this.imgData.dcuOffsetRandom;
		var dcvOffsetRandom = this.imgData.dcvOffsetRandom;
		var dcyRandom = this.imgData.dcyMultRandom;
		var dcuRandom = this.imgData.dcuMultRandom;
		var dcvRandom = this.imgData.dcvMultRandom;
		var colReadRandom = this.imgData.colReadRandom;
		var rowReadRandom =
			this.imgData.rowReadRandom * this.imgData.height / 64;
		var DCY = 0.0;
		var DCU = 0.0;
		var DCV = 0.0;
		this.bytenew = 0;
		this.bytepos = 7;
		var ypos = 0;
		var pixels = image.pixels;
		while (ypos < height) {
			var xpos = Std["int"](Math.random() * 8.0 * colReadRandom);
			while (xpos < width) {
				this.RGB2YUV(pixels, width, xpos, ypos);
				DCY =
					dcyOffsetRandom * Math.random() +
					(1.0 + (dcyRandom * Math.random() - dcyRandom / 2.0)) *
						this.processDU(
							this.YDU,
							this.fdtbl_Y,
							DCY,
							this.YDC_HT,
							this.YAC_HT
						);
				DCU =
					dcuOffsetRandom * Math.random() +
					(1.0 + (dcuRandom * Math.random() - dcuRandom / 2.0)) *
						this.processDU(
							this.UDU,
							this.fdtbl_UV,
							DCU,
							this.UVDC_HT,
							this.UVAC_HT
						);
				DCV =
					dcvOffsetRandom * Math.random() +
					(1.0 + (dcvRandom * Math.random() - dcvRandom / 2.0)) *
						this.processDU(
							this.VDU,
							this.fdtbl_UV,
							DCV,
							this.UVDC_HT,
							this.UVAC_HT
						);
				xpos += 8;
			}
			ypos += 8 + Math.round((Math.random() - 0.5) * rowReadRandom);
		}
		if (this.bytepos >= 0) {
			var fillbits = new imgfkr_jpg__$CustomWriter_BitString(
				this.bytepos + 1,
				(1 << (this.bytepos + 1)) - 1
			);
			this.writeBits(fillbits);
		}
		this.writeWord(65497);
	},
	__class__: imgfkr_jpg_CustomWriter
};
var imgfkr_jpg__$CustomWriter_BitString = function(l, v) {
	this.len = l;
	this.val = v;
};
imgfkr_jpg__$CustomWriter_BitString.__name__ = true;
imgfkr_jpg__$CustomWriter_BitString.prototype = {
	__class__: imgfkr_jpg__$CustomWriter_BitString
};
var imgfkr_jpg_JpegJs = require("jpeg-js");
var js__$Boot_HaxeError = function(val) {
	Error.call(this);
	this.val = val;
	this.message = String(val);
	if (Error.captureStackTrace)
		Error.captureStackTrace(this, js__$Boot_HaxeError);
};
js__$Boot_HaxeError.__name__ = true;
js__$Boot_HaxeError.__super__ = Error;
js__$Boot_HaxeError.prototype = $extend(Error.prototype, {
	__class__: js__$Boot_HaxeError
});
var js_Boot = function() {};
js_Boot.__name__ = true;
js_Boot.getClass = function(o) {
	if (o instanceof Array && o.__enum__ == null) return Array;
	else {
		var cl = o.__class__;
		if (cl != null) return cl;
		var name = js_Boot.__nativeClassName(o);
		if (name != null) return js_Boot.__resolveNativeClass(name);
		return null;
	}
};
js_Boot.__string_rec = function(o, s) {
	if (o == null) return "null";
	if (s.length >= 5) return "<...>";
	var t = typeof o;
	if (t == "function" && (o.__name__ || o.__ename__)) t = "object";
	switch (t) {
		case "object":
			if (o instanceof Array) {
				if (o.__enum__) {
					if (o.length == 2) return o[0];
					var str2 = o[0] + "(";
					s += "\t";
					var _g1 = 2;
					var _g = o.length;
					while (_g1 < _g) {
						var i1 = _g1++;
						if (i1 != 2)
							str2 += "," + js_Boot.__string_rec(o[i1], s);
						else str2 += js_Boot.__string_rec(o[i1], s);
					}
					return str2 + ")";
				}
				var l = o.length;
				var i;
				var str1 = "[";
				s += "\t";
				var _g2 = 0;
				while (_g2 < l) {
					var i2 = _g2++;
					str1 +=
						(i2 > 0 ? "," : "") + js_Boot.__string_rec(o[i2], s);
				}
				str1 += "]";
				return str1;
			}
			var tostr;
			try {
				tostr = o.toString;
			} catch (e) {
				if (e instanceof js__$Boot_HaxeError) e = e.val;
				return "???";
			}
			if (
				tostr != null &&
				tostr != Object.toString &&
				typeof tostr == "function"
			) {
				var s2 = o.toString();
				if (s2 != "[object Object]") return s2;
			}
			var k = null;
			var str = "{\n";
			s += "\t";
			var hasp = o.hasOwnProperty != null;
			for (var k in o) {
				if (hasp && !o.hasOwnProperty(k)) {
					continue;
				}
				if (
					k == "prototype" ||
					k == "__class__" ||
					k == "__super__" ||
					k == "__interfaces__" ||
					k == "__properties__"
				) {
					continue;
				}
				if (str.length != 2) str += ", \n";
				str += s + k + " : " + js_Boot.__string_rec(o[k], s);
			}
			s = s.substring(1);
			str += "\n" + s + "}";
			return str;
		case "function":
			return "<function>";
		case "string":
			return o;
		default:
			return String(o);
	}
};
js_Boot.__interfLoop = function(cc, cl) {
	if (cc == null) return false;
	if (cc == cl) return true;
	var intf = cc.__interfaces__;
	if (intf != null) {
		var _g1 = 0;
		var _g = intf.length;
		while (_g1 < _g) {
			var i = _g1++;
			var i1 = intf[i];
			if (i1 == cl || js_Boot.__interfLoop(i1, cl)) return true;
		}
	}
	return js_Boot.__interfLoop(cc.__super__, cl);
};
js_Boot.__instanceof = function(o, cl) {
	if (cl == null) return false;
	switch (cl) {
		case Int:
			return (o | 0) === o;
		case Float:
			return typeof o == "number";
		case Bool:
			return typeof o == "boolean";
		case String:
			return typeof o == "string";
		case Array:
			return o instanceof Array && o.__enum__ == null;
		case Dynamic:
			return true;
		default:
			if (o != null) {
				if (typeof cl == "function") {
					if (o instanceof cl) return true;
					if (js_Boot.__interfLoop(js_Boot.getClass(o), cl))
						return true;
				} else if (typeof cl == "object" && js_Boot.__isNativeObj(cl)) {
					if (o instanceof cl) return true;
				}
			} else return false;
			if (cl == Class && o.__name__ != null) return true;
			if (cl == Enum && o.__ename__ != null) return true;
			return o.__enum__ == cl;
	}
};
js_Boot.__nativeClassName = function(o) {
	var name = js_Boot.__toStr.call(o).slice(8, -1);
	if (
		name == "Object" ||
		name == "Function" ||
		name == "Math" ||
		name == "JSON"
	)
		return null;
	return name;
};
js_Boot.__isNativeObj = function(o) {
	return js_Boot.__nativeClassName(o) != null;
};
js_Boot.__resolveNativeClass = function(name) {
	return global[name];
};
var js_html_compat_ArrayBuffer = function(a) {
	if (a instanceof Array && a.__enum__ == null) {
		this.a = a;
		this.byteLength = a.length;
	} else {
		var len = a;
		this.a = [];
		var _g = 0;
		while (_g < len) {
			var i = _g++;
			this.a[i] = 0;
		}
		this.byteLength = len;
	}
};
js_html_compat_ArrayBuffer.__name__ = true;
js_html_compat_ArrayBuffer.sliceImpl = function(begin, end) {
	var u = new Uint8Array(this, begin, end == null ? null : end - begin);
	var result = new ArrayBuffer(u.byteLength);
	var resultArray = new Uint8Array(result);
	resultArray.set(u);
	return result;
};
js_html_compat_ArrayBuffer.prototype = {
	slice: function(begin, end) {
		return new js_html_compat_ArrayBuffer(this.a.slice(begin, end));
	},
	__class__: js_html_compat_ArrayBuffer
};
var js_html_compat_DataView = function(buffer, byteOffset, byteLength) {
	this.buf = buffer;
	if (byteOffset == null) this.offset = 0;
	else this.offset = byteOffset;
	if (byteLength == null) this.length = buffer.byteLength - this.offset;
	else this.length = byteLength;
	if (
		this.offset < 0 ||
		this.length < 0 ||
		this.offset + this.length > buffer.byteLength
	)
		throw new js__$Boot_HaxeError(haxe_io_Error.OutsideBounds);
};
js_html_compat_DataView.__name__ = true;
js_html_compat_DataView.prototype = {
	getInt8: function(byteOffset) {
		var v = this.buf.a[this.offset + byteOffset];
		if (v >= 128) return v - 256;
		else return v;
	},
	getUint8: function(byteOffset) {
		return this.buf.a[this.offset + byteOffset];
	},
	getInt16: function(byteOffset, littleEndian) {
		var v = this.getUint16(byteOffset, littleEndian);
		if (v >= 32768) return v - 65536;
		else return v;
	},
	getUint16: function(byteOffset, littleEndian) {
		if (littleEndian)
			return (
				this.buf.a[this.offset + byteOffset] |
				(this.buf.a[this.offset + byteOffset + 1] << 8)
			);
		else
			return (
				(this.buf.a[this.offset + byteOffset] << 8) |
				this.buf.a[this.offset + byteOffset + 1]
			);
	},
	getInt32: function(byteOffset, littleEndian) {
		var p = this.offset + byteOffset;
		var a = this.buf.a[p++];
		var b = this.buf.a[p++];
		var c = this.buf.a[p++];
		var d = this.buf.a[p++];
		if (littleEndian) return a | (b << 8) | (c << 16) | (d << 24);
		else return d | (c << 8) | (b << 16) | (a << 24);
	},
	getUint32: function(byteOffset, littleEndian) {
		var v = this.getInt32(byteOffset, littleEndian);
		if (v < 0) return v + 4294967296;
		else return v;
	},
	getFloat32: function(byteOffset, littleEndian) {
		return haxe_io_FPHelper.i32ToFloat(
			this.getInt32(byteOffset, littleEndian)
		);
	},
	getFloat64: function(byteOffset, littleEndian) {
		var a = this.getInt32(byteOffset, littleEndian);
		var b = this.getInt32(byteOffset + 4, littleEndian);
		return haxe_io_FPHelper.i64ToDouble(
			littleEndian ? a : b,
			littleEndian ? b : a
		);
	},
	setInt8: function(byteOffset, value) {
		if (value < 0)
			this.buf.a[byteOffset + this.offset] = (value + 128) & 255;
		else this.buf.a[byteOffset + this.offset] = value & 255;
	},
	setUint8: function(byteOffset, value) {
		this.buf.a[byteOffset + this.offset] = value & 255;
	},
	setInt16: function(byteOffset, value, littleEndian) {
		this.setUint16(
			byteOffset,
			value < 0 ? value + 65536 : value,
			littleEndian
		);
	},
	setUint16: function(byteOffset, value, littleEndian) {
		var p = byteOffset + this.offset;
		if (littleEndian) {
			this.buf.a[p] = value & 255;
			this.buf.a[p++] = (value >> 8) & 255;
		} else {
			this.buf.a[p++] = (value >> 8) & 255;
			this.buf.a[p] = value & 255;
		}
	},
	setInt32: function(byteOffset, value, littleEndian) {
		this.setUint32(byteOffset, value, littleEndian);
	},
	setUint32: function(byteOffset, value, littleEndian) {
		var p = byteOffset + this.offset;
		if (littleEndian) {
			this.buf.a[p++] = value & 255;
			this.buf.a[p++] = (value >> 8) & 255;
			this.buf.a[p++] = (value >> 16) & 255;
			this.buf.a[p++] = value >>> 24;
		} else {
			this.buf.a[p++] = value >>> 24;
			this.buf.a[p++] = (value >> 16) & 255;
			this.buf.a[p++] = (value >> 8) & 255;
			this.buf.a[p++] = value & 255;
		}
	},
	setFloat32: function(byteOffset, value, littleEndian) {
		this.setUint32(
			byteOffset,
			haxe_io_FPHelper.floatToI32(value),
			littleEndian
		);
	},
	setFloat64: function(byteOffset, value, littleEndian) {
		var i64 = haxe_io_FPHelper.doubleToI64(value);
		if (littleEndian) {
			this.setUint32(byteOffset, i64.low);
			this.setUint32(byteOffset, i64.high);
		} else {
			this.setUint32(byteOffset, i64.high);
			this.setUint32(byteOffset, i64.low);
		}
	},
	__class__: js_html_compat_DataView
};
var js_html_compat_Uint8Array = function() {};
js_html_compat_Uint8Array.__name__ = true;
js_html_compat_Uint8Array._new = function(arg1, offset, length) {
	var arr;
	if (typeof arg1 == "number") {
		arr = [];
		var _g = 0;
		while (_g < arg1) {
			var i = _g++;
			arr[i] = 0;
		}
		arr.byteLength = arr.length;
		arr.byteOffset = 0;
		arr.buffer = new js_html_compat_ArrayBuffer(arr);
	} else if (js_Boot.__instanceof(arg1, js_html_compat_ArrayBuffer)) {
		var buffer = arg1;
		if (offset == null) offset = 0;
		if (length == null) length = buffer.byteLength - offset;
		if (offset == 0) arr = buffer.a;
		else arr = buffer.a.slice(offset, offset + length);
		arr.byteLength = arr.length;
		arr.byteOffset = offset;
		arr.buffer = buffer;
	} else if (arg1 instanceof Array && arg1.__enum__ == null) {
		arr = arg1.slice();
		arr.byteLength = arr.length;
		arr.byteOffset = 0;
		arr.buffer = new js_html_compat_ArrayBuffer(arr);
	} else throw new js__$Boot_HaxeError("TODO " + Std.string(arg1));
	arr.subarray = js_html_compat_Uint8Array._subarray;
	arr.set = js_html_compat_Uint8Array._set;
	return arr;
};
js_html_compat_Uint8Array._set = function(arg, offset) {
	var t = this;
	if (js_Boot.__instanceof(arg.buffer, js_html_compat_ArrayBuffer)) {
		var a = arg;
		if (arg.byteLength + offset > t.byteLength)
			throw new js__$Boot_HaxeError("set() outside of range");
		var _g1 = 0;
		var _g = arg.byteLength;
		while (_g1 < _g) {
			var i = _g1++;
			t[i + offset] = a[i];
		}
	} else if (arg instanceof Array && arg.__enum__ == null) {
		var a1 = arg;
		if (a1.length + offset > t.byteLength)
			throw new js__$Boot_HaxeError("set() outside of range");
		var _g11 = 0;
		var _g2 = a1.length;
		while (_g11 < _g2) {
			var i1 = _g11++;
			t[i1 + offset] = a1[i1];
		}
	} else throw new js__$Boot_HaxeError("TODO");
};
js_html_compat_Uint8Array._subarray = function(start, end) {
	var t = this;
	var a = js_html_compat_Uint8Array._new(t.slice(start, end));
	a.byteOffset = start;
	return a;
};
var js_node_Fs = require("fs");
var js_node_buffer_Buffer = require("buffer").Buffer;
String.prototype.__class__ = String;
String.__name__ = true;
Array.__name__ = true;
var Int = { __name__: ["Int"] };
var Dynamic = { __name__: ["Dynamic"] };
var Float = Number;
Float.__name__ = ["Float"];
var Bool = Boolean;
Bool.__ename__ = ["Bool"];
var Class = { __name__: ["Class"] };
var Enum = {};
var ArrayBuffer = global.ArrayBuffer || js_html_compat_ArrayBuffer;
if (ArrayBuffer.prototype.slice == null)
	ArrayBuffer.prototype.slice = js_html_compat_ArrayBuffer.sliceImpl;
var DataView = global.DataView || js_html_compat_DataView;
var Uint8Array = global.Uint8Array || js_html_compat_Uint8Array._new;
Main.AppConfig = {
	imageSearch: {
		retryInterval: 900,
		interval: 8100,
		keywords: [
			"#glitch",
			"#glitchart",
			"#generative",
			"#generativeart",
			"#procedural",
			"#ProceduralArt"
		],
		historySize: 1024
	},
	processQueueMax: 256,
	tweetQueueMax: 256,
	minTweetInterval: 30,
	name: "imgfkr"
};
Main.MAX_PROCESS_QUEUE_SIZE = Main.AppConfig.processQueueMax;
haxe_crypto_Base64.CHARS =
	"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
haxe_crypto_Base64.BYTES = haxe_io_Bytes.ofString(haxe_crypto_Base64.CHARS);
haxe_io_FPHelper.i64tmp = (function($this) {
	var $r;
	var x = new haxe__$Int64__$_$_$Int64(0, 0);
	$r = x;
	return $r;
})(this);
js_Boot.__toStr = {}.toString;
js_html_compat_Uint8Array.BYTES_PER_ELEMENT = 1;

module.exports = Main;
