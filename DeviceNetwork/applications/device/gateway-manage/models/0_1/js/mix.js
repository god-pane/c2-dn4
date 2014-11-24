Array.prototype.find = function(v) {
	for (var i = 0; i < this.length; ++i)
		if (this[i] == v) return i;
	return -1;
}

Array.prototype.remove = function(v) {
	for (var i = 0; i < this.length; ++i) {
		if (this[i] == v) {
			this.splice(i, 1);
			return true;
		}
	}
	return false;
}

// -----------------------------------------------------------------------------

String.prototype.trim = function() {
	return this.replace(/^\s+/, '').replace(/\s+$/, '');
}

// -----------------------------------------------------------------------------

Number.prototype.pad = function(min) {
	var s = this.toString();
	while (s.length < min) s = '0' + s;
	return s;
}

Number.prototype.hex = function(min)
{
	var h = '0123456789ABCDEF';
	var n = this;
	var s = '';
	do {
		s = h.charAt(n & 15) + s;
		n = n >>> 4;
	} while ((--min > 0) || (n > 0));
	return s;
}

// -----------------------------------------------------------------------------

//	Element.protoype. doesn't work with all browsers

var elem = {
	getOffset: function(e) {
		var r = { x: 0, y: 0 };
		e = E(e);
		while (e.offsetParent) {
			r.x += e.offsetLeft;
			r.y += e.offsetTop;
			e = e.offsetParent;
		}
		return r;
	},

	addClass: function(e, name) {
		if ((e = E(e)) == null) return;
		var a = e.className.split(/\s+/);
		var k = 0;
		for (var i = 1; i < arguments.length; ++i) {
			if (a.find(arguments[i]) == -1) {
				a.push(arguments[i]);
				k = 1;
			}
		}
		if (k) e.className = a.join(' ');
	},

	removeClass: function(e, name) {
		if ((e = E(e)) == null) return;
		var a = e.className.split(/\s+/);
		var k = 0;
		for (var i = 1; i < arguments.length; ++i)
			k |= a.remove(arguments[i]);
		if (k) e.className = a.join(' ');
	},

	remove: function(e) {
		 if ((e = E(e)) != null) e.parentNode.removeChild(e);
	},

    parentElem: function(e, tagName) {
		e = E(e);
		tagName = tagName.toUpperCase();
		while (e.parentNode) {
			e = e.parentNode;
			if (e.tagName == tagName) return e;
		}
		return null;
	},

	display: function() {
		var enable = arguments[arguments.length - 1];
		for (var i = 0; i < arguments.length - 1; ++i) {
			E(arguments[i]).style.display = enable ? '' : 'none';
		}
	},

	display2: function() {
		var enable = arguments[arguments.length - 1];
		for (var i = 0; i < arguments.length - 1; ++i) {
			elem.display(PR(arguments[i]), enable);
		}
	},
	
	enable: function() {
		var enable = arguments[arguments.length - 1];
		for (var i = 0; i < arguments.length - 1; ++i) {
			E(arguments[i]).disabled = ! enable;
		}
	},

	display_and_enable: function() {
		var enable = arguments[arguments.length - 1];
		for (var i = 0; i < arguments.length - 1; ++i) {
			elem.display(PR(arguments[i]), enable);
			
//			E(arguments[i]).style.display = enable ? '' : 'none';
			E(arguments[i]).disabled = ! enable;
		}
	},
	

	isVisible: function(e) {
		e = E(e);
		while (e) {
			if ((e.style.visibility != 'visible') || (e.style.display == 'none')) return false;
			e = e.parentNode;
		}
		return true;
	},

	setInnerHTML: function(e, html) {
		 e = E(e);
		 if (e.innerHTML != html) e.innerHTML = html;	// reduce flickering
	}
};

// -----------------------------------------------------------------------------

var docu = {
	getViewSize: function() {
		if (window.innerHeight) {
			return { width: window.innerWidth, height: window.innerHeight };
		}
		else if (document.documentElement && document.documentElement.clientHeight) {
			return { width: document.documentElement.clientWidth, height: document.documentElement.clientHeight };
		}
		return { width: document.body.clientWidth, height: document.body.clientHeight };
	},

	getPageOffset: function()
	{
		if (typeof(window.pageYOffset) != 'undefined') {
			return { x: window.pageXOffset, y: window.pageYOffset };
		}
		else if ((document.documentElement) && (typeof(document.documentElement.scrollTop) != 'undefined')) {
			return { x: document.documentElement.scrollLeft, y: document.documentElement.scrollTop };
		}
		return { x: document.body.scrollLeft, y: document.body.scrollTop };
	}
};

// -----------------------------------------------------------------------------

var fields = {
	getAll: function(e) {
		var a = [];
		switch (e.tagName) {
		case 'INPUT':
		case 'SELECT':
			a.push(e);
			break;
		default:
			if (e.childNodes) {
				for (var i = 0; i < e.childNodes.length; ++i) {
					a = a.concat(fields.getAll(e.childNodes[i]));
				}
			}
		}
		return a;
	},
	disableAll: function(e, d) {
		var a = this.getAll(E(e));
		for (var i = a.length - 1; i >= 0; --i) {
			a[i].disabled = d;
		}
	},
	radio: {
		selected: function(e) {
			for (var i = 0; i < e.length; ++i) {
				if (e[i].checked) return e[i];
			}
			return null;
		},
		find: function(e, value) {
			for (var i = 0; i < e.length; ++i) {
				if (e[i].value == value) return e[i];
			}
			return null;
		}
	}
};

// -----------------------------------------------------------------------------
var __redirect__ = null;
function redirectPage()
{
	window.location.replace(__redirect__);	
}

var form = {
	submitHidden: function(url, fields) {
		var fom, body;

		fom = document.createElement('FORM');
		fom.action = url;
		fom.method = 'post';
		for (var f in fields) {
			var e = document.createElement('INPUT');
			e.type = 'hidden';
			e.name = f;
			e.value = fields[f];
			fom.appendChild(e);
		}
		body = document.getElementsByTagName('body')[0];
		fom = body.appendChild(fom);
		this.submit(fom, 1);
		body.removeChild(fom);
	},

	disableAll: function(fom) {
		var i, f;
		
		for (i = 0; i < fom.elements.length; i++) {
			f = fom.elements[i];
			
			if(f.name.substr(0, 1) == '_') continue;
			
			f.disabled = true;
		}
	},

	submit: function(fom, async, url) {
		fom = E(fom);

		if (isLocal()) {
			this.dump(fom, async, url);
			return;
		}

		//FIXME: shandy
//		if (this.xhttp) return;
		if (this.xhttp) delete this.xhttp;

		var v, f, i, wait, msg, sb, cb;

		v = ['_ajax=1'];
		wait = 5;
		__redirect__ = null;
		for (var i = 0; i < fom.elements.length; i++) {
			f = fom.elements[i];
			if ((f.disabled) || (f.name == '') || (f.name.substr(0, 2) == 'f_')) continue;
			
			if ((f.tagName == 'INPUT') && ((f.type == 'CHECKBOX') || (f.type == 'RADIO')) && (!f.checked)) continue;
			
			if (f.name == '_nextwait') {
				wait = f.value * 1;
				if (isNaN(wait)) wait = 5;
				else wait = Math.abs(wait);
				continue;
			}
			
			if (f.name == '_redirect') {
				__redirect__ = f.value;
				continue;
			}
			
			v.push(escapeCGI(f.name) + '=' + escapeCGI(f.value));
		}

		if ((sb = E('save-button')) != null) sb.disabled = 1;
		if ((cb = E('cancel-button')) != null) cb.disabled = 1;

		if ((!async) || (!useAjax())) {
			if (url) fom.action = url;
			fom.submit();
			return;
		}

		show_info(infomsg.doing, wait);
		
		this.xhttp = new XmlHttp();
		this.xhttp.onCompleted = function(text, xml) {
			var r;
		
			if ((sb = E('save-button')) != null) sb.disabled = 0;
			if ((cb = E('cancel-button')) != null) cb.disabled = 0;
//			if (text.match(/@msg:(.+)/)) show_info(escapeHTML(RegExp.$1), wait);
			if (r = text.match(/@msg:(.+)/)) show_info(eval(r[1]), wait);
			else show_info(infomsg.saved, 1);
			form.xhttp = null;
		}
		this.xhttp.onError = function(x) {
			if (url) fom.action = url;
			fom.submit();
		}

		//alert("param: " + v.join('&'));
		this.xhttp.post(url ? url : fom.action, v.join('&'));
	},

	dump: function(fom, async, url) {
	}
};

// -----------------------------------------------------------------------------
function show_alert(content)
{
	var msg = "<center>" + content + "</center><br>";
	
	top.Dialog.alert(msg, 
		{width:300, height:100, okLabel: ui.ok, 
			ok:function(win) {
				return true;
				}
			}
		); 
}

var __info_msg;
var __info_timeout;

function buildMsg()
{
	return __info_msg + "<br/><br/>" + infomsg.wait + __info_timeout + " " + ui.seconds + " ...";
}

function infoTimeout() {
	__info_timeout--; 
	if (__info_timeout >0) {
		top.Dialog.setInfoMessage(buildMsg());
		setTimeout(infoTimeout, 1000) 
	}
	else { 
		top.Dialog.closeInfo();
		if (__redirect__) redirectPage();
	}
}

function show_confirm(content)
{
	return confirm(content);
}

function show_info(content, timeout)
{	
	__info_msg = content;
	__info_timeout = timeout;
	
	top.Dialog.closeInfo();
	top.Dialog.info(buildMsg(), {width:250, height:100, showProgress: true});
			
	setTimeout(infoTimeout, 1000);
}

var ferror = {
	set: function(e, message, quiet) {
		if ((e = E(e)) == null) return;
		e._error_msg = message;
		e._error_org = e.title;
		e.title = message;
		elem.addClass(e, 'error');
		if (!quiet) this.show(e);
	},

	clear: function(e) {
		if ((e = E(e)) == null) return;
		e.title = e._error_org || '';
		elem.removeClass(e, 'error');
		e._error_msg = null;
		e._error_org = null;
	},

	clearAll: function(e) {
		for (var i = 0; i < e.length; ++i)
			this.clear(e[i]);
	},
	
	show: function(e) {
		if ((e = E(e)) == null) return;
		if (!e._error_msg) return;
		elem.addClass(e, 'error-focused');
		e.focus();
		alert(e._error_msg);
		elem.removeClass(e, 'error-focused');
	},

	ok: function(e) {
		if ((e = E(e)) == null) return 0;
        return !e._error_msg;
	}
};

// -----------------------------------------------------------------------------

function _v_range(e, quiet, min, max, name)
{
	var v;

	if ((e = E(e)) == null) return 0;
	v = e.value * 1;
	if ((isNaN(v)) || (v < min) || (v > max)) {
		ferror.set(e, ui.invalid + '. ' + ui.valid_range + ': ' + min + '-' + max, quiet);
		return 0;
	}
	e.value = v;
	ferror.clear(e);
	return 1;
}

function v_range(e, quiet, min, max)
{
	return _v_range(e, quiet, min, max, 'number');
}

function v_port(e, quiet)
{
	return _v_range(e, quiet, 1, 0xFFFF, 'port');
}

function v_octet(e, quiet)
{
	return _v_range(e, quiet, 1, 254, 'address');
}

function v_macip(e, quiet, bok, ipp)
{
	var s, a, b, c, d, i;

	if ((e = E(e)) == null) return 0;
	s = e.value.replace(/\s+/g, '');

	if ((a = fixMAC(s)) != null) {
		if (isMAC0(a)) {
			if (bok) {
				e.value = '';
			}
			else {
				ferror.set(e, 'Invalid MAC or IP address');
				return false;
			}
		}
        else e.value = a;
		ferror.clear(e);
		return true;
	}

	a = s.split('-');
	if (a.length > 2) {
		ferror.set(e, errmsg.ip_range, quiet);
		return false;
	}
	c = 0;
	for (i = 0; i < a.length; ++i) {
		b = a[i];
		if (b.match(/^\d+$/)) b = ipp + b;

		b = fixIP(b);
		if (!b) {
			ferror.set(e, errmsg.ip, quiet);
			return false;
		}

		if (b.indexOf(ipp) != 0) {
			ferror.set(e, 'IP address outside of LAN', quiet);
			return false;
		}

		d = (b.split('.'))[3];
		if (d <= c) {
			ferror.set(e, errmsg.ip_range, quiet);
			return false;
		}

		a[i] = c = d;
	}
	e.value = ipp + a.join('-');
	return true;
}

function fixIP(ip, x)
{
	var a, n, i;

	a = ip.split('.');
	if (a.length != 4) return null;
	for (i = 0; i < 4; ++i) {
		n = a[i] * 1;
		if ((isNaN(n)) || (n < 0) || (n > 255)) return null;
		a[i] = n;
	}
	//if ((x) && ((a[3] == 0) || (a[3] == 255))) return null;
	return a.join('.');
}

function v_ipnz(e, quiet, x)
{
	if ((e = E(e)) == null) return 0;
	e = E(e); //|| e.value == '0.0.0.0'
	if (e.value == ''){
		ferror.set(e, errmsg.ip, quiet);
		return false;
	}
	
	return v_ip(e, quiet);
}

function v_ip(e, quiet, x)
{
	var ip;

	if ((e = E(e)) == null) return 0;
	ip = fixIP(e.value, x);
	if (!ip) {
		ferror.set(e, errmsg.ip, quiet);
		return false;
	}
	e.value = ip;
	ferror.clear(e);
	return true;
}

function v_ipz(e, quiet)
{
	if ((e = E(e)) == null) return 0;
	e = E(e);
	if (e.value == '') e.value = '0.0.0.0';
	else return v_ip(e, quiet);
}

function aton(ip)
{
	var o, x, i;

	// this is goofy because << mangles numbers as signed
	o = ip.split('.');
	x = '';
	for (i = 0; i < 4; ++i) x += (o[i] * 1).hex(2);
	return parseInt(x, 16);
}

// 1.2.3.4, 1.2.3.4/24, 1.2.3.4/255.255.255.0, 1.2.3.4-1.2.3.5
function v_iptip(e, quiet)
{
	var ip, ma, x, y, z;
	var r;

	if ((e = E(e)) == null) return 0;

	ip = e.value;
	ma = '';
	if (r = ip.match(/^(.*)-(.*)$/)) {
		ip = fixIP(r[1]);
		x = fixIP(r[2]);
		if ((ip == null) || (x == null)) {
			ferror.set(e, errmsg.ip_range, quiet);
			return 0;
		}
		ferror.clear(e);
		y = aton(ip);
		z = aton(x);
		if (y == z) {
			e.value = ip;
		}
		else if (z < y) {
			e.value = x + '-' + ip;
		}
		else {
			e.value = ip + '-' + x;
		}
		return 1;
	}
	if (r = ip.match(/^(.*)\/(.*)$/)) {
		ip = r[1];
		ma = r[2];
		x = ma * 1;
		if (!isNaN(x)) {
			if ((x < 0) || (x > 32)) {
				ferror.set(e, errmsg.netmask, quiet);
				return 0;
			}
			if (x==0) ma = '0';
			else ma = x;
		}
		else {
			ma = fixIP(ma);
			if ((ma == null) || (!_v_netmask(ma))) {
				ferror.set(e, errmsg.netmask, quiet);
				return 0;
			}
		}
	}
	ip = fixIP(ip);
	if (!ip) {
		ferror.set(e, errmsg.ip, quiet);
		return 0;
	}
	e.value = ip + ((ma != '') ? ('/' + ma) : '');
	ferror.clear(e);
	return 1;
}

function fixPort(p)
{
	p *= 1;
	if ((isNaN(p)) || (p < 1) || (p > 65535)) return -1;
	return p;
}

function _v_portrange(e, quiet, v)
{
	var x, y;
	var r;

	if (r = v.match(/^(.*)[-:](.*)$/)) {
		x = fixPort(r[1]);
		y = fixPort(r[2]);
		if ((x == -1) || (y == -1)) {
			ferror.set(e, errmsg.port_range + ' : ' + v, quiet);
			return null;
		}
		if (x > y) {
			v = x;
			x = y;
			y = v;
		}
		ferror.clear(e);
		if (x == y) return x;
		return x + '-' + y;
	}

	v = fixPort(v);
	if (v == -1) {
		ferror.set(e, errmsg.prt, quiet);
		return null;
	}

	ferror.clear(e);
	return v;
}

function v_portrange(e, quiet)
{
	var v;

	if ((e = E(e)) == null) return 0;
	v = _v_portrange(e, quiet, e.value);
	if (v == null) return 0;
	e.value = v;
	return 1;
}

function v_iptport(e, quiet)
{
	var a, i, v;

	if ((e = E(e)) == null) return 0;

	a = e.value.split(/,/);
	for (i = 0; i < MIN(a.length, 10); ++i) {
		v = _v_portrange(e, quiet, a[i]);
		if (v == null) return 0;
		a[i] = v;
	}
	if (a.length == 0) {
		ferror.set(e, 'Expecting a list of ports or port range.', quiet);
		return 0;
	}
	e.value = a.join(',');
	ferror.clear(e);
	return 1;
}

function _v_netmask(mask)
{
	var v = aton(mask) ^ 0xFFFFFFFF;
	return (((v + 1) & v) == 0);
}

function v_netmask(e, quiet)
{
	var n, b, r;

	if ((e = E(e)) == null) return 0;
	n = fixIP(e.value);
	if (n) {
		if (_v_netmask(n)) {
			e.value = n;
			ferror.clear(e);
			return 1;
		}
	}
	else if (r = e.value.match(/^\s*\/\s*(\d+)\s*$/)) {
		b = r[1] * 1;
		if ((b >= 1) && (b <= 32)) {
			if (b == 32) n = 0xFFFFFFFF;	// js quirk
				else n = (0xFFFFFFFF >>> b) ^ 0xFFFFFFFF;
			e.value = (n >>> 24) + '.' + ((n >>> 16) & 0xFF) + '.' + ((n >>> 8) & 0xFF) + '.' + (n & 0xFF);
			ferror.clear(e);
			return 1;
		}
	}
	ferror.set(e, errmsg.netmask, quiet);
	return 0;
}

function fixMAC(mac)
{
	var t, i;

	mac = mac.replace(/\s+/g, '').toUpperCase();
	if (mac.length == 0) {
		mac = [0,0,0,0,0,0];
	}
	else if (mac.length == 12) {
		mac = mac.match(/../g);
	}
	else {
		mac = mac.split(/[:\-]/);
		if (mac.length != 6) return null;
	}
	for (i = 0; i < 6; ++i) {
		t = '' + mac[i];
		if (t.search(/^[0-9A-F]+$/) == -1) return null;
		if ((t = parseInt(t, 16)) > 255) return null;
		mac[i] = t.hex(2);
	}
	return mac.join(':');
}

function v_mac(e, quiet)
{
	var mac;

	if ((e = E(e)) == null) return 0;
	mac = fixMAC(e.value);
	if ((!mac) || (isMAC0(mac))) {
		ferror.set(e, errmsg.mac, quiet);
		return 0;
	}
	e.value = mac;
	ferror.clear(e);
	return 1;
}

function v_macz(e, quiet)
{
	var mac;

	if ((e = E(e)) == null) return 0;
	mac = fixMAC(e.value);
	if (!mac) {
		ferror.set(e, errmsg.mac, quiet);
		return false;
	}
	e.value = mac;
	ferror.clear(e);
	return true;
}

function v_length(e, quiet, min, max)
{
	var s, n;

	if ((e = E(e)) == null) return 0;
	s = e.value.trim();
	n = s.length;
	if (min == undefined) min = 1;
	if (n < min) {
//		ferror.set(e, 'Invalid length. Please enter at least ' + min + ' character' + (min == 1 ? '.' : 's.'), quiet);
		ferror.set(e, errmsg.len + ' > ' + min + '.', quiet);
		return 0;
	}
	max = max || e.maxlength;
    if (n > max) {
//		ferror.set(e, 'Invalid length. Please reduce the length to ' + max + ' characters or less.', quiet);
		ferror.set(e, errmsg.len + ' < ' + max + '.', quiet);
		return 0;
	}
	e.value = s;
	ferror.clear(e);
	return 1;
}

function v_domain(e, quiet)
{
	var s;

	if ((e = E(e)) == null) return 0;
	s = e.value.trim().replace(/\s+/g, ' ');
	if ((s.length > 32) || ((s.length > 0) && (s.search(/^[.a-zA-Z0-9_\- ]+$/) == -1))) {
		ferror.set(e, errmsg.bad_name, quiet);
		return 0;
	}
	e.value = s;
	ferror.clear(e);
	return 1;
}

function isMAC0(mac)
{
	return (mac == '00:00:00:00:00:00');
}

function v_ip_in_net(e, net, netmask)
{
	return 1;
}

function v_ip_in_mip(e, mip)
{
	return 1;
}

function ip_increase(ip, m)
{
	var ip2;
	
	var a, n, i;

	a = ip.split('.');
	if (a.length != 4) return '';
	
	for (i = 0; i < 4; ++i) {
		n = a[i] * 1;
		if ((isNaN(n)) || (n < 0) || (n > 255)) return '';
		a[i] = n;
	}
	
	a[3] += m & 0xff;
	a[2] += (m>>8) & 0xff;
	a[1] += (m>>16) & 0xff;
	a[0] += (m>>24) & 0xff;

	for (i = 3; i >= 0; i--) {
		if (a[i]>255) {
			a[i] -= 255;
			if (i==0) break;
			a[i-1]++;
		}
	}
	
	return a.join('.');
}

function net_increase(ip, mask)
{
	var ip2;
	
	var a, n, i;
	var m;

	a = mask.split('.');
	if (a.length != 4) return '';
	m = 0;
	for (i = 0; i <4; i++) {
		n = a[i] * 1;
		if ((isNaN(n)) || (n < 0) || (n > 255)) return '';
		m = m * 256.0 + n;
	}

	a = ip.split('.');
	if (a.length != 4) return '';
	ip2 = 0;
	for (i = 0; i < 4 ; i++) {
		n = a[i] * 1;
		if ((isNaN(n)) || (n < 0) || (n > 255)) return '';
		ip2 = ip2 * 256.0 + n;
	}

	//ip2 = ip2 & m;
	m = 0xffffffff - m;
	ip2 = ip2 + m + 1;
	for (i = 3; i >=0; i--) {
		a[i] = ip2 & 0xff;
		ip2 = ip2 /256;
	}
	
	return a.join('.');
}
// -----------------------------------------------------------------------------

function cmpIP(a, b)
{
	if ((a = fixIP(a)) == null) a = '255.255.255.255';
	if ((b = fixIP(b)) == null) b = '255.255.255.255';
	return aton(a) - aton(b);
}

function cmpText(a, b)
{
	if (a == '') a = '\xff';
	if (b == '') b = '\xff';
	return (a < b) ? -1 : ((a > b) ? 1 : 0);
}

function cmpInt(a, b)
{
	a = parseInt(a, 10);
	b = parseInt(b, 10);
	return ((isNaN(a)) ? -0x7FFFFFFF : a) - ((isNaN(b)) ? -0x7FFFFFFF : b);
}

function cmpDate(a, b)
{
	return b.getTime() - a.getTime();
}

// -----------------------------------------------------------------------------

// todo: cleanup this mess

function TGO(e)
{
	return elem.parentElem(e, 'TABLE').gridObj;
}

function tgHideIcons()
{
	var e;
	while ((e = document.getElementById('tg-row-panel')) != null) e.parentNode.removeChild(e);
}

// options = sort, move, delete
function webGrid(tb, options, maxAdd, editorFields)
{
	this.init(tb, options, maxAdd, editorFields);
	return this;
}

webGrid.prototype = {
	init: function(tb, options, maxAdd, editorFields) {
		if (tb) {
			this.tb = E(tb);
			this.tb.gridObj = this;
		}
		else {
			this.tb = null;
		}
		if (!options) options = '';
		this.header = null;
		this.footer = null;
		this.editor = null;
		this.canSort = options.indexOf('sort') != -1;
		this.canMove = options.indexOf('move') != -1;
		this.maxAdd = maxAdd || 100;
//		this.canEdit = (editorFields != null);
		this.canEdit = (options.indexOf('readonly') == -1);
		this.canDelete = (options.indexOf('readonly') == -1) && (this.canEdit || (options.indexOf('delete') != -1));
		this.editorFields = editorFields;
		this.sortColumn = -1;
		this.sortAscending = true;
	},

	_insert: function(at, cells, escCells) {
		var tr, td, c;
		var i, t;

		tr = this.tb.insertRow(at);
		for (i = 0; i < cells.length; ++i) {
			c = cells[i];
			if (typeof(c) == 'string') {
				td = tr.insertCell(i);
				td.className = 'co' + (i + 1);
				if (escCells) td.appendChild(document.createTextNode(c));
					else td.innerHTML = c;
			}
			else {
				tr.appendChild(c);
			}
		}
		return tr;
	},

	// header

	headerClick: function(cell) {
		if (this.canSort) {
			this.sort(cell.cellN);
		}
	},

	headerSet: function(cells, escCells) {
		var e, i;

		elem.remove(this.header);
		this.header = e = this._insert(0, cells, escCells);
		e.className = 'header';

		for (i = 0; i < e.cells.length; ++i) {		
			e.cells[i].cellN = i;	// cellIndex broken in Safari
			e.cells[i].onclick = function() { return TGO(this).headerClick(this); };
		}
		return e;
	},

	// footer

	footerClick: function(cell) {
	},

	footerSet: function(cells, escCells) {
		var e, i;

		elem.remove(this.footer);
		this.footer = e = this._insert(-1, cells, escCells);
		e.className = 'footer';
		for (i = 0; i < e.cells.length; ++i) {
			e.cells[i].cellN = i;
			e.cells[i].onclick = function() { TGO(this).footerClick(this) };
		}
		return e;
	},

	//

	rpUp: function(e) {
		var i;

		e = PR(e);
		TGO(e).moving = null;
		i = e.previousSibling;
		if (i == this.header) return;
		e.parentNode.removeChild(e);
		i.parentNode.insertBefore(e, i);

		this.recolor();
		this.rpHide();
	},

	rpDn: function(e) {
		var i;

		e = PR(e);
		TGO(e).moving = null;
		i = e.nextSibling;
		if (i == this.footer) return;
		e.parentNode.removeChild(e);
		i.parentNode.insertBefore(e, i.nextSibling);

		this.recolor();
		this.rpHide();
	},

	rpMo: function(img, e) {
		var me;

		e = PR(e);
		me = TGO(e);
		if (me.moving == e) {
			me.moving = null;
			this.rpHide();
			return;
		}
		me.moving = e;
		img.style.border = "1px dotted red";
	},
	
	rpDel: function(e) {
		e = PR(e);
		TGO(e).moving = null;
		e.parentNode.removeChild(e);
		this.recolor();
		this.rpHide();
	},

	rpMouIn: function(evt) {
		var e, x, ofs, me, s, n;

		if ((evt = checkEvent(evt)) == null) return;

		me = TGO(evt.target);
		if (me.isEditing()) return;
		if (me.moving) return;

		me.rpHide();
		e = document.createElement('div');
		e.tgo = me;
		e.ref = evt.target;
		e.setAttribute('id', 'tg-row-panel');

		n = 0;
		s = '';
		if (me.canMove) {
			s = '<img src="images/rpu.gif" onclick="this.parentNode.tgo.rpUp(this.parentNode.ref)" title="' + ui.move_up + '"<img src="images/rpd.gif" onclick="this.parentNode.tgo.rpDn(this.parentNode.ref)" title="' + ui.move_down + '"><img src="images/rpm.gif" onclick="this.parentNode.tgo.rpMo(this,this.parentNode.ref)" title="' + ui.move + '">';
			n += 3;
		}
		if (me.canDelete) {
			s += '<img src="images/rpx.gif" onclick="this.parentNode.tgo.rpDel(this.parentNode.ref)" title="' + ui.del + '">';
			++n;
		}
		x = PR(evt.target);
		x = x.cells[x.cells.length - 1];
		ofs = elem.getOffset(x);
		n *= 18;
		e.style.left = (ofs.x + x.offsetWidth - n) + 'px';
		e.style.top = ofs.y + 'px';
		e.style.width = n + 'px';
		e.innerHTML = s;

		document.body.appendChild(e);
	},
	
	rpHide: tgHideIcons,

	//

	onClick: function(cell) {
		if (this.canEdit) {
			if (this.moving) {
				var p = this.moving.parentNode;
				var q = PR(cell);
				if (this.moving != q) {
					var v = this.moving.rowIndex > q.rowIndex;
					p.removeChild(this.moving);
					if (v) p.insertBefore(this.moving, q);
						else p.insertBefore(this.moving, q.nextSibling);
					this.recolor();
				}
				this.moving = null;
				this.rpHide();
				return;
			}
			this.edit(cell);
		}
	},

	insert: function(at, data, cells, escCells) {
		var e, i;

		if ((this.footer) && (at == -1)) at = this.footer.rowIndex;
		e = this._insert(at, cells, escCells);
		e.className = (e.rowIndex & 1) ? 'even' : 'odd';

		for (i = 0; i < e.cells.length; ++i) {
			e.cells[i].onclick = function() { return TGO(this).onClick(this); };
		}

		e._data = data;
		e.getRowData = function() { return this._data; }
		e.setRowData = function(data) { this._data = data; }

		if ((this.canMove) || (this.canEdit) || (this.canDelete)) {
			e.onmouseover = this.rpMouIn;
//			e.onmouseout = this.rpMouOut;
			if (this.canEdit) e.title = infomsg.edt;
		}

		return e;
	},

	//

	insertData: function(at, data) {
		return this.insert(at, data, this.dataToView(data), false);
	},

	dataToView: function(data) {
		var v = [];
		for (var i = 0; i < data.length; ++i)
			v.push(escapeHTML('' + data[i]));
		return v;
	},

	dataToFieldValues: function(data) {
		return data;
	},

	fieldValuesToData: function(row) {
		var e, i, data;

		data = [];
		e = fields.getAll(row);
		for (i = 0; i < e.length; ++i) data.push(e[i].value);
		return data;
	},

	//

	edit: function(cell) {
		var sr, er, e, c;

		if (this.isEditing()) return;

		sr = PR(cell);
		sr.style.display = 'none';
		elem.removeClass(sr, 'hover');
		this.source = sr;

		er = this.createEditor('edit', sr.rowIndex, sr);
        er.className = 'editor';
		this.editor = er;

		c = er.cells[cell.cellIndex || 0];
		e = c.getElementsByTagName('input');
		if ((e) && (e.length > 0)) {
			try {	// IE quirk
				e[0].focus();
			}
			catch (ex) {
			}
		}

		this.controls = this.createControls('edit', sr.rowIndex);

		this.disableNewEditor(true);
		this.rpHide();
		this.verifyFields(this.editor, true);
	},

	createEditor: function(which, rowIndex, source) {
		var values;

		if (which == 'edit') values = this.dataToFieldValues(source.getRowData());

		var row = this.tb.insertRow(rowIndex);
		row.className = 'editor';

		var common = ' onkeypress="return TGO(this).onKey(\'' + which + '\', event)" onchange="TGO(this).onChange(\'' + which + '\', this)"';

		var vi = 0;
		for (var i = 0; i < this.editorFields.length; ++i) {
			var s = '';
    		var ef = this.editorFields[i].multi;
			if (!ef) ef = [this.editorFields[i]];

			for (var j = 0; j < ef.length; ++j) {
				var f = ef[j];

				if (f.prefix) s += f.prefix;
				var attrib = ' class="fi' + (vi + 1) + '" ' + (f.attrib || '');
				switch (f.type) {
				case 'text':
					s += '<input type="text" maxlength=' + f.maxlen + common + attrib;
					if (which == 'edit') s += ' value="' + escapeHTML('' + values[vi]) + '">';
						else s += '>';
					break;
				case 'select':
					s += '<select' + common + attrib + '>';
					for (var k = 0; k < f.options.length; ++k) {
						a = f.options[k];
						if (which == 'edit') {
							s += '<option value="' + a[0] + '"' + ((a[0] == values[vi]) ? ' selected>' : '>') + a[1] + '</option>';
						}
						else {
							s += '<option value="' + a[0] + '">' + a[1] + '</option>';
						}
					}
					s += '</select>';
					break;
				case 'checkbox':
					s += '<input type="checkbox"' + common + attrib;
					if ((which == 'edit') && (values[vi])) s += ' checked';
					s += '>';
					break;
				default:
					s += f.custom.replace(/\$which\$/g, which);
				}
				if (f.suffix) s += f.suffix;

				++vi;
			}
			var c = row.insertCell(i);
			c.innerHTML = s;
			if (this.editorFields[i].vtop) c.vAlign = 'top';
		}

		return row;
	},

	createControls: function(which, rowIndex) {
		var r, c;

		r = this.tb.insertRow(rowIndex);
		r.className = 'controls';

		c = r.insertCell(0);
		c.colSpan = this.header.cells.length;
		if (which == 'edit') {
			c.innerHTML =
				'<input type=button value=' + ui.del + ' onclick="TGO(this).onDelete()"> &nbsp; ' +
				'<input type=button value=' + ui.ok + ' onclick="TGO(this).onOK()"> ' +
				'<input type=button value=' + ui.cancel + ' onclick="TGO(this).onCancel()">';
		}
		else {
			c.innerHTML =
				'<input type=button value=' + ui.add + ' onclick="TGO(this).onAdd()">';
		}
		return r;
	},

	removeEditor: function() {
		if (this.editor) {

			elem.remove(this.editor);
			this.editor = null;
		}
		if (this.controls) {
			elem.remove(this.controls);
			this.controls = null;
		}
	},

	showSource: function() {
		if (this.source) {
			this.source.style.display = '';
			this.source = null;
		}
	},

	onChange: function(which, cell) {
		return this.verifyFields((which == 'new') ? this.newEditor : this.editor, true);
	},

	onKey: function(which, ev) {
		switch (ev.keyCode) {
		case 27:
			if (which == 'edit') this.onCancel();
			return false;
		case 13:
			if (((ev.srcElement) && (ev.srcElement.tagName == 'SELECT')) ||
				((ev.target) && (ev.target.tagName == 'SELECT'))) return true;
			if (which == 'edit') this.onOK();
				else this.onAdd();
			return false;
		}
		return true;
	},

	onDelete: function() {
		this.removeEditor();
		elem.remove(this.source);
		this.source = null;
		this.disableNewEditor(false);
	},

	onCancel: function() {
		this.removeEditor();
		this.showSource();
		this.disableNewEditor(false);
	},

	onOK: function() {
		var i, data, view;

		if (!this.verifyFields(this.editor, false)) return;

		data = this.fieldValuesToData(this.editor);
		view = this.dataToView(data);

		this.source.setRowData(data);
		for (i = 0; i < this.source.cells.length; ++i) {
			this.source.cells[i].innerHTML = view[i];
		}

		this.removeEditor();
		this.showSource();
		this.disableNewEditor(false);
	},

	onAdd: function() {
		var data;

		this.moving = null;
		this.rpHide();

		if (!this.verifyFields(this.newEditor, false)) return;

		data = this.fieldValuesToData(this.newEditor);
		this.insertData(-1, data);

		this.disableNewEditor(false);
		this.resetNewEditor();
	},

	verifyFields: function(row, quiet) {
		return true;
	},

	showNewEditor: function() {
		var r;

		r = this.createEditor('new', -1, null);
		this.footer = this.newEditor = r;

		r = this.createControls('new', -1);
		this.newControls = r;

		this.disableNewEditor(false);
	},

	disableNewEditor: function(disable) {
		if (this.getDataCount() >= this.maxAdd) disable = true;
		if (this.newEditor) fields.disableAll(this.newEditor, disable);
		if (this.newControls) fields.disableAll(this.newControls, disable);
	},

	resetNewEditor: function() {
		var i, e;

		e = fields.getAll(this.newEditor);
		ferror.clearAll(e);
		for (i = 0; i < e.length; ++i) {
			var f = e[i];
			if (f.selectedIndex) f.selectedIndex = 0;
				else f.value = '';
		}
		//if (e.length) e[0].focus();
	},

	getDataCount: function() {
		var n;
		n = this.tb.rows.length;
		if (this.footer) n = this.footer.rowIndex;
		if (this.header) n -= this.header.rowIndex + 1;
		return n;
	},

	sortCompare: function(a, b) {
		var obj = TGO(a);
		var col = obj.sortColumn;
		var r = cmpText(a.cells[col].innerHTML, b.cells[col].innerHTML);
		return obj.sortAscending ? r : -r;
	},

	sort: function(column) {
		if (this.editor) return;

		if (this.sortColumn >= 0) {
			elem.removeClass(this.header.cells[this.sortColumn], 'sortasc', 'sortdes');
		}
		if (column == this.sortColumn) {
			this.sortAscending = !this.sortAscending;
		}
		else {
			this.sortAscending = true;
			this.sortColumn = column;
		}
		elem.addClass(this.header.cells[column], this.sortAscending ? 'sortasc' : 'sortdes');

		this.resort();
	},

	resort: function() {
		if ((this.sortColumn < 0) || (this.getDataCount() == 0) || (this.editor)) return;

		var p = this.header.parentNode;
		var a = [];
		var i, j, max, e, p;
		var top;

		this.moving = null;

		top = this.header ? this.header.rowIndex + 1 : 0;
		max = this.footer ? this.footer.rowIndex : this.tb.rows.length;
		for (i = top; i < max; ++i) a.push(p.rows[i]);
		a.sort(THIS(this, this.sortCompare));
		this.removeAllData();
		j = top;
		for (i = 0; i < a.length; ++i) {
			e = p.insertBefore(a[i], this.footer);
			e.className = (j & 1) ? 'even' : 'odd';
			++j;
		}
	},

	recolor: function() {
		 var i, e, o;

		 i = this.header ? this.header.rowIndex + 1 : 0;
		 e = this.footer ? this.footer.rowIndex : this.tb.rows.length;
		 for (; i < e; ++i) {
			 o = this.tb.rows[i];
			 o.className = (o.rowIndex & 1) ? 'even' : 'odd';
		 }
	},

	removeAllData: function() {
		var i, count;

		i = this.header ? this.header.rowIndex + 1 : 0;
		count = (this.footer ? this.footer.rowIndex : this.tb.rows.length) - i;
		while (count-- > 0) elem.remove(this.tb.rows[i]);
	},

	getAllData: function() {
		var i, max, data, r;

		data = [];
		max = this.footer ? this.footer.rowIndex : this.tb.rows.length;
		for (i = this.header ? this.header.rowIndex + 1 : 0; i < max; ++i) {
			r = this.tb.rows[i];
			if ((r.style.display != 'none') && (r._data)) data.push(r._data);
		}
		return data;
	},

	isEditing: function() {
		return (this.editor != null);
	}
}


// -----------------------------------------------------------------------------


function xmlHttpObj()
{
	var ob;
	try {
		ob = new XMLHttpRequest();
		if (ob) return ob;
	}
	catch (ex) { }
	try {
		ob = new ActiveXObject('Microsoft.XMLHTTP');
		if (ob) return ob;
	}
	catch (ex) { }
	return null;
}

var _useAjax = -1;
var _holdAjax = null;

function useAjax()
{
	if (_useAjax == -1) _useAjax = ((_holdAjax = xmlHttpObj()) != null);
	return _useAjax;
}

function XmlHttp()
{
	if ((!useAjax()) || ((this.xob = xmlHttpObj()) == null)) return null;
	return this;
}

XmlHttp.prototype = {
    get: function(url, vars) {
		try {
			this.xob.onreadystatechange = THIS(this, this.onReadyStateChange);
			if ((vars) && (vars.length)) url += '?' + vars;
			this.xob.open('GET', url, true);
			this.xob.send(null);
		}
		catch (ex) {
			this.onError(ex);
		}
	},

	post: function(url, vars) {
		try {
			this.xob.onreadystatechange = THIS(this, this.onReadyStateChange);
			this.xob.open('POST', url, true);
			this.xob.send(vars);
		}
		catch (ex) {
			this.onError(ex);
		}
	},

	abort: function() {
		try {
			this.xob.onreadystatechange = function () { }
			this.xob.abort();
		}
		catch (ex) {
		}
	},

	onReadyStateChange: function() {
		try {
			if (typeof(E) == 'undefined') return;	// oddly late? testing for bug...

			if (this.xob.readyState == 4) {
				if (this.xob.status == 200) {
					this.onCompleted(this.xob.responseText, this.xob.responseXML);
				}
				else {
					this.onError('' + (this.xob.status || 'unknown'));
				}
			}
		}
		catch (ex) {
			this.onError(ex);
		}
	},

	onCompleted: function(text, xml) { },
	onError: function(ex) { }
}


// -----------------------------------------------------------------------------


function webTimer(func, ms)
{
	this.tid = null;
	this.onTimer = func;
	if (ms) this.start(ms);
	return this;
}

webTimer.prototype = {
	start: function(ms) {
		this.stop();
		this.tid = setTimeout(THIS(this, this._onTimer), ms);
	},
	stop: function() {
		if (this.tid) {
			clearTimeout(this.tid);
			this.tid = null;
		}
	},

	isRunning: function() {
		return (this.tid != null);
	},

	_onTimer: function() {
		this.tid = null;
		this.onTimer();
	},

	onTimer: function() {
	}
}


// -----------------------------------------------------------------------------


function webRefresh(actionURL, postData, refreshTime, cookieTag)
{
	this.setup(actionURL, postData, refreshTime, cookieTag);
	this.timer = new webTimer(THIS(this, this.start));
}

webRefresh.prototype = {
	running: 0,

	setup: function(actionURL, postData, refreshTime, cookieTag) {
		var e, v;

		this.actionURL = actionURL;
		this.postData = postData;
		this.refreshTime = refreshTime * 1000;
		this.cookieTag = cookieTag;
	},

	start: function() {
		var e;

		if ((e = E('refresh-time')) != null) {
			if (this.cookieTag) cookie.set(this.cookieTag, e.value);
			this.refreshTime = e.value * 1000;
		}
		e = undefined;

		this.updateUI('start');

		this.running = 1;
		if ((this.http = new XmlHttp()) == null) {
			reloadPage();
			return;
		}

		this.http.parent = this;

		this.http.onCompleted = function(text, xml) {
			var p = this.parent;

			if (p.cookieTag) cookie.unset(p.cookieTag + '-error');
			if (!p.running) {
				p.stop();
				return;
			}

			p.refresh(text);

			if ((p.refreshTime > 0) && (!p.once)) {
				p.updateUI('wait');
				p.timer.start(Math.round(p.refreshTime));
			}
			else {
				p.stop();
			}
			
			p.errors = 0;
		}

		this.http.onError = function(ex) {
			var p = this.parent;
			if ((!p) || (!p.running)) return;
			
			p.timer.stop();

			if (++p.errors <= 3) {
				p.updateUI('wait');
				p.timer.start(3000);
				return;
			}
			
			if (p.cookieTag) {
				var e = cookie.get(p.cookieTag + '-error') * 1;
				if (isNaN(e)) e = 0;
					else ++e;
				cookie.unset(p.cookieTag);
				cookie.set(p.cookieTag + '-error', e, 1);
				if (e >= 3) {
					alert('XMLHTTP: ' + ex);
					return;
				}
			}

			setTimeout(reloadPage, 2000);
		}

		this.errors = 0;
		this.http.post(this.actionURL, this.postData);
	},

	stop: function() {
		if (this.cookieTag) cookie.set(this.cookieTag, -(this.refreshTime / 1000));
		this.running = 0;
		this.updateUI('stop');
		this.timer.stop();
		this.http = null;
		this.once = undefined;
	},

	toggle: function(delay) {
		if (this.running) this.stop();
			else this.start(delay);
	},

	updateUI: function(mode) {
		var e, b;

		if (typeof(E) == 'undefined') return;	// for a bizzare bug...

		b = (mode != 'stop') && (this.refreshTime > 0);
		if ((e = E('refresh-button')) != null) {
			e.value = b ? ui.stp : ui.rfresh;
			e.disabled = ((mode == 'start') && (!b));
		}
		if ((e = E('refresh-time')) != null) e.disabled = b;
		if ((e = E('refresh-spinner')) != null) e.style.visibility = b ? 'visible' : 'hidden';
	},

	initPage: function(delay, def) {
		var e, v;

		e = E('refresh-time');
		if (((this.cookieTag) && (e != null)) &&
			((v = cookie.get(this.cookieTag)) != null) && (!isNaN(v *= 1))) {
			e.value = Math.abs(v);
			if (v > 0) v = (v * 1000) + (delay || 0);
		}
		else if (def) {
			v = def;
			if (e) e.value = def;
		}
		else v = 0;

		if (delay < 0) {
			v = -delay;
			this.once = 1;
		}

		if (v > 0) {
			this.running = 1;
			this.refreshTime = v;
			this.timer.start(v);
			this.updateUI('wait');
		}
	}
}

function genStdTimeList(id, zero, min)
{
	var b = [];
	var t = [3,4,5,10,15,30,60,120,180,240,300,10*60,15*60,20*60,30*60];
	var i, v;

	if (min >= 0) {
		b.push('<select id="' + id + '"><option value=0>' + zero);
		for (i = 0; i < t.length; ++i) {
			v = t[i];
			if (v < min) continue;
			b.push('<option value=' + v + '>');
			if (v == 60) b.push('1  ' + ui.minute );
				else if (v > 60) b.push((v / 60) + "  " + ui.minutes);
				else b.push(v + "  " + ui.seconds);
		}
		b.push('</select> ');
	}
	W(b.join(''));
}

function genStdRefresh(spin, min, exec)
{
	W('<div style="text-align:right">');
	if (spin) W('<img src="css/alert/progress.gif" id="refresh-spinner"> ');
	genStdTimeList('refresh-time', ui.manual_refresh, min);
	W('<input type="button" value="');
	W(ui.rfresh);
	W('" onclick="' + (exec ? exec : 'refreshClick()') + '" id="refresh-button"></div>');
}

function genStdFooter(args)
{
	W("<div id='footer'>");
	W("<span id='footer-msg'></span>");
	W("<input type='button' value='" + ui.aply + "' id='save-button' onclick='save(" + args + ")'>");
	W("<input type='button' value='" + ui.cancel + "' id='cancel-button' onclick='reloadPage();'>");	
	W("</div>");
}

// -----------------------------------------------------------------------------


function _tabCreate(tabs)
{
	var buf = [];
	buf.push('<ul id="tabs">');
	for (var i = 0; i < arguments.length; ++i)
		buf.push('<li><a href="javascript:tabSelect(\'' + arguments[i][0] + '\')" id="' + arguments[i][0] + '">' + arguments[i][1] + '</a>');
	buf.push('</ul><div id="tabs-bottom"></div>');
	return buf.join('');
}

function tabCreate(tabs)
{
	W(_tabCreate.apply(this, arguments));
}

function tabHigh(id)
{
	var a = E('tabs').getElementsByTagName('A');
	for (var i = 0; i < a.length; ++i) {
		if (id != a[i].id) elem.removeClass(a[i], 'active');
	}
	elem.addClass(id, 'active');
}

// -----------------------------------------------------------------------------

var cookie = {
	set: function(key, value, days) {
		document.cookie = 'web_' + key + '=' + value + '; expires=' +
			(new Date(new Date().getTime() + ((days ? days : 14) * 86400000))).toUTCString() + '; path=/';
	},

	get: function(key) {
		var r = ('; ' + document.cookie + ';').match('; web_' + key + '=(.*?);');
		return r ? r[1] : null;
	},

	unset: function(key) {
		document.cookie = 'web_' + key + '=; expires=' +
			(new Date(1)).toUTCString() + '; path=/';
	}
};

// -----------------------------------------------------------------------------

function checkEvent(evt)
{
	if (typeof(evt) == 'undefined') {
		// IE
		evt = event;
		evt.target = evt.srcElement;
		evt.relatedTarget = evt.toElement;
	}
	return evt;
}

function W(s)
{
	document.write(s);
}

function E(e)
{
	return (typeof(e) == 'string') ? document.getElementById(e) : e;
}

function PR(e)
{
	return elem.parentElem(e, 'TR');
}

function THIS(obj, func)
{
	return function() { return func.apply(obj, arguments); }
}

function UT(v)
{
	return (typeof(v) == 'undefined') ? '' : '' + v;
}

function escapeHTML(s)
{
	function esc(c) {
		return '&#' + c.charCodeAt(0) + ';';
	}
	return s.replace(/[&"'<>\r\n]/g, esc);
}

function escapeCGI(s)
{
	return escape(s).replace(/\+/g, '%2B');	// escape() doesn't handle +
}

function escapeD(s)
{
	function esc(c) {
		return '%' + c.charCodeAt(0).hex(2);
	}
	return s.replace(/[<>|%]/g, esc);
}

function ellipsis(s, max) {
	return (s.length <= max) ? s : s.substr(0, max - 3) + '...';
}

function MIN(a, b)
{
	return a < b ? a : b;
}

function MAX(a, b)
{
	return a > b ? a : b;
}

function fixInt(n, min, max, def)
{
	if (n === null) return def;
	n *= 1;
	if (isNaN(n)) return def;
	if (n < min) return min;
	if (n > max) return max;
	return n;
}

function comma(n)
{
	n = '' + n;
	var p = n;
	while ((n = n.replace(/(\d+)(\d{3})/g, '$1,$2')) != p) p = n;
	return n;
}

function scaleSize(n)
{
	if (isNaN(n *= 1)) return '-';
	if (n <= 9999) return '' + n;
	var s = -1;
	do {
		n /= 1024;
		++s;
	} while ((n > 9999) && (s < 2));
	return comma(n.toFixed(2)) + (['KB', 'MB', 'GB'])[s];
}

function timeString(mins)
{
	var h = Math.floor(mins / 60);
	if ((new Date(2000, 0, 1, 23, 0, 0, 0)).toLocaleString().indexOf('23') != -1)
		return h + ':' + (mins % 60).pad(2);
	return ((h == 0) ? 12 : ((h > 12) ? h - 12 : h)) + ':' + (mins % 60).pad(2) + ((h >= 12) ? ' PM' : ' AM');
}

function nothing()
{
}

// -----------------------------------------------------------------------------

function show_notice1(s)
{
	if (s.length) W('<div id="notice1">' + s + '</div><br style="clear:both">');
}

// -----------------------------------------------------------------------------

function myName()
{
	var name, i;

	name = document.location.pathname;
	name = name.replace(/\\/g, '/');	// IE local testing
	if ((i = name.lastIndexOf('/')) != -1) name = name.substring(i + 1, name.length);
	if (name == '') name = 'status-overview.asp';
	return name;
}

function createFieldTableBuf(flags, desc)
{
	var common;
	var i, n;
	var name;
	var id;
	var fields;
	var f;
	var a;
	var buf = [];
	var tr;

	if ((flags.indexOf('noopen') == -1)) buf.push('<table class="fields">');
	for (desci = 0; desci < desc.length; ++desci) {
		var v = desc[desci];

		if (!v) {
			buf.push('<tr><td colspan=2 class="spacer">&nbsp;</td></tr>');
			continue;
		}

		if (v.ignore) continue;

		buf.push('<tr');
		if (v.rid) buf.push(' id="' + v.rid + '"');
		if (v.hidden) buf.push(' style="display:none"');
		buf.push('>');

		if (v.text) {
			if (v.title) {
				buf.push('<td class="title indent' + (v.indent || 1) + '">' + v.title + '</td><td class="content">' + v.text + '</td></tr>');
			}
			else {
				buf.push('<td colspan=2>' + v.text + '</td></tr>');
			}
			continue;
		}

		buf.push('<td class="title indent' + (v.indent ? v.indent : 1) + '">' + v.title + '</td>');
		buf.push('<td class="content">');

		if (v.multi) fields = v.multi;
			else fields = [v];

		for (n = 0; n < fields.length; ++n) {
			f = fields[n];
			if (f.prefix) buf.push(f.prefix);

			if ((f.type == 'radio') && (!f.id)) id = '_' + f.name + '_' + i;
				else id = (f.id ? f.id : ('_' + f.name));
			common = ' onchange="verifyFields(this, 1)" id="' + id + '"';
			if (f.attrib) common += ' ' + f.attrib;
			name = f.name ? (' name="' + f.name + '"') : '';

			switch (f.type) {
			case 'checkbox':
				buf.push('<input type="checkbox"' + name + (f.value ? ' checked' : '') + ' onclick="verifyFields(this, 1)"' + common + '>');
				break;
			case 'radio':
				buf.push('<input type="radio"' + name + (f.value ? ' checked' : '') + ' onclick="verifyFields(this, 1)"' + common + '>');
				break;
			case 'password':
			case 'text':
				buf.push('<input type="' + f.type + '"' + name + ' value="' + escapeHTML(UT(f.value)) + '" maxlength=' + f.maxlen + (f.size ? (' size=' + f.size) : '') + common + '>');
				break;
			case 'select':
				buf.push('<select' + name + common + '>');
				for (i = 0; i < f.options.length; ++i) {
					a = f.options[i];
					if (a.length == 1) a.push(a[0]);
					buf.push('<option value="' + a[0] + '"' + ((a[0] == f.value) ? ' selected' : '') + '>' + a[1] + '</option>');
				}
				buf.push('</select>');
				break;
			case 'textarea':
				buf.push('<textarea' + name + common + '>' + escapeHTML(UT(f.value)) + '</textarea>');
				break;
			default:
				if (f.custom) buf.push(f.custom);
				break;
			}
			if (f.suffix) buf.push(f.suffix);
		}
		buf.push('</td>');
		buf.push('</tr>');
	}
	if ((!flags) || (flags.indexOf('noclose') == -1)) buf.push('</table>');
	
	return buf.join('');
}

function createFieldTable(flags, desc)
{
	W(createFieldTableBuf(flags, desc));
}


// -----------------------------------------------------------------------------

function reloadPage()
{
	document.location.reload(1);
}

// -----------------------------------------------------------------------------
// debug

function isLocal()
{
	return location.href.search('file://') == 0;
}

function GetText(obj)
{
	W(obj);
}

///////////////////////////////////////////////////////////////////////////////////
//var ike_default_policies = [['3des-md5-96', '3DES-MD5-96'], ['aes-md5-96', 'AES-MD5-96']];
var ike_default_policies = [['3des-md5-modp768', '3DES-MD5-DH1'], ['3des-md5-modp1024', '3DES-MD5-DH2'], ['3des-md5-modp1536', '3DES-MD5-DH5'], ['3des-sha1-modp768', '3DES-SHA1-DH1'], ['3des-sha1-modp1024', '3DES-SHA1-DH2'], ['3des-sha1-modp1536', '3DES-SHA1-DH5'], ['aes-md5-modp768', 'AES-MD5-DH1'], ['aes-md5-modp1024', 'AES-MD5-DH2'], ['aes-md5-modp1536', 'AES-MD5-DH5'], ['aes-sha1-modp768', 'AES-SHA1-DH1'], ['aes-sha1-modp1024', 'AES-SHA1-DH2'], ['aes-sha1-modp1536', 'AES-SHA1-DH5']];
var ipsec_default_policies = [['3des-md5-96', '3DES-MD5-96'], ['aes-md5-96', 'AES-MD5-96']];

//var ipsec_auth_types = [['0', ipsec.shared_key],['1', ipsec.cert],['2', ipsec.rsasig]];
var ipsec_auth_types = [['0', ipsec.shared_key],['1', ipsec.cert]];
var ipsec_id_types = [['0', ui.ip],['1', 'User FQDN'], ['2', 'FQDN']];
var ipsec_startup_modes = [['0', ipsec.auto],['1', ipsec.dod],['2', ipsec.passive],['3', ipsec.manual]];
var ipsec_neg_modes = [['0', ipsec.main_mode],['1', ipsec.agg_mode]];
var ipsec_ipsec_protos = [['0', 'ESP'],['1', 'AH']];
var ipsec_ipsec_modes = [['0', ipsec.tunnel_mode],['1', ipsec.transport_mode]];
var ipsec_tunnel_types = [['0', ipsec.host_host],['1', ipsec.host_net],['2', ipsec.net_host],['3', ipsec.net_net]];
var ipsec_tunnel_pfs = [['0', ipsec.none],['1', 'Group 1'],['2','Group 2'],['5','Group 5']];
//var scep_status_list = [['re-enrolling', scep.stat_new],['enrolling',scep.stat_enrolling],['resume-enrolling',scep.stat_resume],['ok',scep.stat_ok]];
var scep_status_list = {'re-enrolling': scep.stat_new, 'enrolling': scep.stat_enrolling, 'resume-enrolling' : scep.stat_resume, 'ok': scep.stat_ok};
var log_prio = {'x': ui.al, '0': ui.emerg, '1': ui.alt, '2': ui.crit, '3': ui.err, '4': ui.warn, '5': ui.notice, '6': ui.info, '7': ui.dbg};
var log_prio_list = [['x', ui.al], ['0', ui.emerg], ['1', ui.alt], ['2', ui.crit], ['3', ui.err], ['4', ui.warn], ['5', ui.notice], ['6', ui.info], ['7', ui.dbg]];

///////////////////////////////////////////////////////////////////////////////////////////////////////////
// ä»¥ä¸ä¸ºrouteréç½®
///////////////////////////////////////////////////////////////////////////////////////////////////////////
var _type_info = {
	name : 'InDTU132GS',
	type : 0, //0: router, 1: dtu
	model: 711,
	net:   'G',
	vendor: 'S',
	modem: 39,
	
	lan0_ip: '',
	lan0_netmask: '',
	lan0_mip: ''
};

function setDeviceType(t)
{
	_type_info.name = t;
	if (t.substr(0, 5)=='InDTU'){
		_type_info.type = 1;
		t = t.substr(5);
	}else if (t.substr(0, 8)=='InRouter'){
		_type_info.type = 0;
		t = t.substr(8);
	}else{
		_type_info.type = 0;
		if (t.substr(0, 2)=='IR') t = t.substr(2);
	}

	_type_info.model = parseInt(t.substr(0,3));
	_type_info.net = t.substr(3,1);
	_type_info.vendor = t.substr(4,1);
	_type_info.modem = t.substr(5,2);
}

var _single_mode = 1;
function setDeviceNum(n)
{
	if (n>1) n = 0;
	else n = 1;

	if (_single_mode!=n) {
		_single_mode = n;
		verifyFields(null, 1);
	}
}

// å¯ç¨/ç¦ç¨ç»éç½®ï¼ç¦ç¨æ¶éèç»éç½®
function enableGroup(groupId)
{	
	var enable = E(groupId + '_enable');
	var show = E(groupId + '_show');
	var icon = E(groupId + '_icon');
	var section = E(groupId + '_section');

	//show.value = enable.checked ? '0' : '1';
	//toggleGroup(groupId);

	if (enable.checked){
		//icon.style.display = "";
		for (i=0; i<section.childNodes.length; i+=1){
			E(section.childNodes[i].id + '_enable').checked = 1;
		}
	}else{
		//icon.style.display = "none";
		for (i=0; i<section.childNodes.length; i+=1){
			E(section.childNodes[i].id + '_enable').checked = 0;
		}
	}
}


function enableAllGroup(){
       var checkAll=E('checkAll');
       var dtu_root_system=E('dtu_root_enable');
       var section_system=E('dtu_root_section');
       
       if (checkAll.checked){
          dtu_root_system.checked=1;
		  for (i=0; i<section_system.childNodes.length; i+=1){
			 E(section_system.childNodes[i].id + '_enable').checked = 1;
		  }
	   }else{
	      dtu_root_system.checked=0;
         
		  for (i=0; i<section_system.childNodes.length; i+=1){
			 E(section_system.childNodes[i].id + '_enable').checked = 0;
		  }
		 
	   }
       
}

// åæ¢ç»éç½®çæ¾ç¤ºç¶æ
function toggleGroup(groupId)
{
	var show = E(groupId + '_show');
	var icon = E(groupId + '_icon');
	var section = E(groupId + '_section');

	show.value = show.value=='1' ? '0' : '1';
		
	if (show.value=='1') {
		icon.src = "images/task-up.png";
		icon.alt = "<<<";
		section.style.display = "";
	}else{
		icon.src = "images/task-down.png";	
		icon.alt = ">>>";
		section.style.display = "none";
	}	
}

function toggleAllGroup()
{
   var checkbox=E('checkbox');
   var show_system=E('dtu_root_show');
   var icon_system=E('dtu_root_icon');
   var section_system=E('dtu_root_section');
   
   show_system.value=show_system.value=='1' ? '0' : '1';
   
   if(show_system.value == '0'){
      checkbox.src="images/task-up.png";
      icon_system.src = "images/task-up.png";
	  icon_system.alt = "<<<";
	  section_system.style.display = "";
   }else{
      checkbox.src="images/task-down.png";
      icon_system.src = "images/task-down.png";
	  icon_system.alt = "<<<";
	  section_system.style.display = "none";
	  
   }
          
}

// ç»éç½®çèµ·å§å£°æ
function groupBegin(groupId, groupName)
{
	W("<div class='section-border'>")
	W("<div class='section-title' id='" + groupId + "' >");
		W("<div style='margin-left:10px;height:20px;text-align:left;vertical-align: middle;'>");
			W("<input type='checkbox' id='" + groupId + "_enable'" + "onclick='enableGroup(\"" + groupId + "\")'>");
			W("<input type='hidden' id='" + groupId + "_show' value='1'/>");
			W(" " + groupName + " ");
		W("</div>");
		W("<div style='margin-top:-20px;height:20px;text-align:right;vertical-align: middle;'>");
			W("<img border=0 style='text-aligh:right'  onclick='toggleGroup(\"" + groupId + "\")' id='" + groupId + "_icon' src='images/task-up.png' alt='<<<'>" );
		W("</div>");
	W("</div>");
	W("<div class='section' id='" + groupId + "_section'>");
}

// ç»éç½®çç»æå£°æ
function groupEnd(groupId)
{
	W("</div>")
	W("</div>");//close section-border target
}

// å¯ç¨/ç¦ç¨å­ç»éç½®ï¼ç¦ç¨æ¶éèç»éç½®
function enableSubGroup(groupId)
{	
	var enable = E(groupId + '_enable');
	var show = E(groupId + '_show');
	var section = E(groupId + '_section');

	//show.value = enable.checked ? '0' : '1';
	//toggleSubGroup(groupId);
}

var groupShow = 'setup_wan1';

// åæ¢ç»éç½®çæ¾ç¤ºç¶æ
function showSubGroup(groupId, v)
{
	tgHideIcons(); 										//隐藏小图标
	var section = E(groupId + '_section');

	E(groupShow).style.fontWeight = "400";
	E(groupShow + '_section').style.display = 'none';
	section.style.display = '';	
	groupShow = groupId;
	E(groupShow).style.fontWeight = "bold";
	
	
	if (v) verifyFields(null, 2);
}

var subGroups = "";

// ç»éç½®çèµ·å§å£°æ
function subGroup(subGroupId, subGroupName, content)
{	
	W("<div class='sub-section-title' id='" + subGroupId + "'>");
	W("<input type='checkbox' id='" + subGroupId + "_enable'" + " checked onclick='enableSubGroup(\"" + subGroupId + "\")'>");
	W(" <a href='javascript:void(0)'  onclick='showSubGroup(\"" + subGroupId + "\", 1)'>" + subGroupName + "</a>");
	W("</div>");

	subGroups += "<div class='section' id='" + subGroupId + "_section' style='display:none'>" + content + "</div>";
}

//å¨æå®çä½ç½®åå»ºææéç½®é¡¹ç®
function createPage()
{	
	W("<table><tr><td width='20%' valign='top'>");
	W("<div id='menu-area'>");
	
	groupBegin('dtu_root', dtu.root);
	
	subGroup('setup_com', dtu.setup_com, 
		createFieldTableBuf('', [
			{ title: serial.baud, name: 'com0_baud', type: 'select', options: 
				[['1','300'],['2','600'],['3','1200'],['4','2400'],['5','4800'],['6','9600'],['7','14400'],['8','19200'],['9','38400'],['10','56000'],['11','57600'],['12','115200']],
				value: '6' },
			{ title: serial.databit, name: 'com0_databit', type: 'select', options: 
				[['8','8'],['7','7'],['6','6'],['5','5']],
				value: '8' },
			{ title: serial.parity, name: 'com0_parity', type: 'select', options: 
				[['0',serial.parity_none],['1',serial.parity_odd],['2',serial.parity_even],['3','space'],['4','mark']],
				value: '0' },
			{ title: serial.stopbit, name: 'com0_stopbit', type: 'select', options: 
				[['0','1'],['1','1.5'],['2','2']],
				value: '0' },
			{ title: dtu.interval, name: 'com0_interval', type: 'text', maxlen: 5, size: 7, suffix: dtu.ms},
			{ title: dtu.timeout, name: 'com0_timeout', type: 'text', maxlen: 5, size: 7, suffix: ui.seconds}
		])
	);

	subGroup('setup_mode', dtu.setup_mode,
		createFieldTableBuf('', [
			{ title: dtu.enable_wmmp, name: 'wmmp_enable', type: 'select', options: [['1', ui.yes],['0', ui.no]]},
			{ title: dtu.conn_mode, name: 'wan1_ppp_mode', type: 'select', options: [['0', dtu.mode0],['1', dtu.mode1]]},
			{ title: ui.trig_call, name: 'wan1_trig_call', type: 'select', options: [['1', ui.yes],['0', ui.no]]},
			{ title: ui.trig_sms, name: 'wan1_trig_sms', type: 'select', options: [['1', ui.yes],['0', ui.no]]},
			{ title: ui.trig_data, name: 'wan1_trig_data', type: 'select', options: [['1', ui.yes],['0', ui.no]]},
			{ title: dtu.off_interval, name: 'wan1_trig_interval', type: 'text', maxlen: 5, size: 7, suffix: ui.minutes },
			{ title: dtu.trig_interval, name: 'wan1_off_interval', type: 'text', maxlen: 5, size: 7, suffix: ui.minutes }
			//{ title: dtu.trans_mode, name: 'dtu_trans_mode', type: 'select', options: [['0', ui.yes],['1', ui.no]]}
		])
	);
		
	subGroup('setup_wan1', dtu.setup_wan1,
		createFieldTableBuf('', [
			{ title: ui.auto_dial, name: 'f_wan1_enable', type: 'checkbox'},
			{ title: ui.callno, name: 'wan1_ppp_callno', type: 'text', maxlen: 32, size: 17},
			{ title: 'APN', name: 'wan1_ppp_apn',        type: 'text', maxlen: 128, size: 17 },
			{ title: ui.username, name: 'wan1_ppp_username', type: 'text', maxlen: 64, size: 17 },
			{ title: ui.password, name: 'wan1_ppp_passwd', type: 'password', maxlen: 64, size: 17},
			{ title: dtu.hb_interval, name: 'wan1_ppp_check_interval', type: 'text', maxlen: 5, size: 7, suffix: ui.seconds }
		])
	);
	subGroup('setup_wmmp', dtu.setup_wmmp,
		createFieldTableBuf('', [
			{ title: dtu.wmmp_id, name: 'wmmp_id', type: 'text', maxlen: 32, size: 17},
			{ title: dtu.wmmp_svr, name: 'wmmp_svr', type: 'text', maxlen: 32, size: 17 },
			{ title: dtu.wmmp_port, name: 'wmmp_port', type: 'text', maxlen: 5, size: 8 },
			{ title: dtu.wmmp_proto, name: 'wmmp_proto', type: 'select', options: [['0', 'UDP']]},
			{ title: dtu.wmmp_hb_interval, name: 'wmmp_hb_interval', type: 'text', maxlen: 5, size: 7, suffix: ui.seconds },
			{ title: dtu.wmmp_sca, name: 'wmmp_sca', type: 'text', maxlen: 16, size: 17},
			{ title: dtu.wmmp_sms_num, name: 'wmmp_sms_num', type: 'text', maxlen: 16, size: 17}
		])
	);
	subGroup('setup_app', dtu.setup_app,
		createFieldTableBuf('', [
			{ title: dtu.app_id, name: 'app_id', type: 'text', maxlen: 16, size: 13},
			{ title: dtu.app_svr, name: 'app_svr', type: 'text', maxlen: 32, size: 17},
			{ title: dtu.app_host, name: 'app_host', type: 'text', maxlen: 32, size: 17},
			{ title: dtu.app_port, name: 'app_port', type: 'text', maxlen: 5, size: 8 },
			{ title: dtu.app_proto, name: 'app_proto', type: 'select', options: [['0', 'TCP'],['1','UDP'],['2','WDAP'],['3','DCUDP'],['4','DCTCP'],['5','Modbus-Net-Bridge']]},
			{ title: dtu.app_retries, name: 'app_retries', type: 'text', maxlen: 5, size: 7 },
			{ title: dtu.app_hb_interval, name: 'app_hb_interval', type: 'text', maxlen: 5, size: 7, suffix: ui.minutes },
			{ title: 'DNS IP 1', name: 'dns1', type: 'text', maxlen: 15, size: 17},
			{ title: 'DNS IP 2', name: 'dns2', type: 'text', maxlen: 15, size: 17}
		])
	);

	subGroup('setup_app_ext', dtu.setup_app_ext,
		createFieldTableBuf('', [
			{ title: dtu.app1_svr, name: 'app1_svr', type: 'text', maxlen: 32, size: 17 },
			{ title: dtu.app1_host, name: 'app1_host', type:'text', maxlen: 32, size: 17},
			{ title: dtu.app1_port, name: 'app1_port', type: 'text', maxlen: 5, size: 8 },
			{ title: dtu.app1_proto, name: 'app1_proto', type: 'select', options: [['0', 'TCP'],['1','UDP'],['2','WDAP'],['3','DCUDP'],['4','DCTCP'],['5','Modbus-Net-Bridge']]},
			{ title: dtu.app2_svr, name: 'app2_svr', type: 'text', maxlen: 32, size: 17 },
			{ title: dtu.app2_host, name: 'app2_host', type:'text', maxlen: 32, size: 17},
			{ title: dtu.app2_port, name: 'app2_port', type: 'text', maxlen: 5, size: 8 },
			{ title: dtu.app2_proto, name: 'app2_proto', type: 'select', options: [['0', 'TCP'],['1','UDP'],['2','WDAP'],['3','DCUDP'],['4','DCTCP'],['5','Modbus-Net-Bridge']]},
			{ title: dtu.app3_svr, name: 'app3_svr', type: 'text', maxlen: 32, size: 17 },
			{ title: dtu.app3_host, name: 'app3_host', type:'text', maxlen: 32, size: 17},
			{ title: dtu.app3_port, name: 'app3_port', type: 'text', maxlen: 5, size: 8 },
			{ title: dtu.app3_proto, name: 'app3_proto', type: 'select', options: [['0', 'TCP'],['1','UDP'],['2','WDAP'],['3','DCUDP'],['4','DCTCP'],['5','Modbus-Net-Bridge']]},
			{ title: dtu.app4_svr, name: 'app4_svr', type: 'text', maxlen: 32, size: 17 },
			{ title: dtu.app4_host, name: 'app4_host', type:'text', maxlen: 32, size: 17},
			{ title: dtu.app4_port, name: 'app4_port', type: 'text', maxlen: 5, size: 8 },
			{ title: dtu.app4_proto, name: 'app4_proto', type: 'select', options: [['0', 'TCP'],['1','UDP'],['2','WDAP'],['3','DCUDP'],['4','DCTCP'],['5','Modbus-Net-Bridge']]}
		])
	);
	subGroup('setup_misc', dtu.setup_misc,
		createFieldTableBuf('', [
			{ title: dtu.max_login, name: 'max_login', type: 'text', maxlen: 3, size: 8 },
			{ title: dtu.sms_passwd, name: 'sms_passwd', type: 'text', maxlen: 16, size: 17 },
			{ title: dtu.debug, name: 'debug', type: 'select', options: [['1', ui.yes],['0', ui.no]]}
		])
	);
	subGroup('service_ovdp', menu.service_ovdp, 
		createFieldTableBuf('', [
			{ title: ui.sn, name: 'f_sn', type: 'text', maxlen: 10, size: 32},
			{ title: ovdp.mode, name: 'ovdp_mode', type: 'select',
				options: [['0',ovdp.mode0],['1',ovdp.mode1],['2',ovdp.mode2]]},
			{ title: ovdp.vendor, name: 'ovdp_vendor_id', type: 'select', options: [
				['0003',ui.deflt],['0004',"GJJ"]]},
			{ title: ovdp.device_id, name: 'ovdp_device_id', type: 'text', maxlen: 10, size: 32},
			{ title: ui.server, name: 'ovdp_center', type: 'text', maxlen: 128, size: 20},
			{ title: ui.prt, name: 'ovdp_center_port', type: 'text', maxlen: 10, size: 10},
			//{ title: ovdp.login_retries, name: 'ovdp_login_retries', type: 'text', maxlen: 20, size: 10},
			{ title: ovdp.hb_interval, name: 'ovdp_hb_interval', type: 'text', suffix: ui.seconds, maxlen: 20, size: 10},
			//{ title: ovdp.rx_timeout, name: 'ovdp_rx_timeout', type: 'text', suffix: ui.seconds, maxlen: 20, size: 10},
			//{ title: ovdp.tx_retries, name: 'ovdp_tx_retries', type: 'text', maxlen: 20, size: 10},
			{ title: ovdp.trust_list, name: 'ovdp_trust_list', type: 'text', maxlen: 128, size: 60}
		])
	);
	
	groupEnd('dtu_root');

	W("</div>");
	
	W("</td><td  width='80%' valign='top'>");
		
	W("<div id='show-area'>" + subGroups + "</div>");
	subGroups = "";
	W("</td></tr></table>");

	//æ¾ç¤ºé»è®¤é¡µé¢
	showSubGroup('setup_wan1', 0);
}

function verifyTrustList(e,quiet)
{
	var phone;
	
	if((e=E(e))==null) return 0;
	phone = E(e).value;
	
	if ( phone.length==0 ) return 1;
	else if ( v_length(e, quiet, 5, 64) ) return 1;
	return 0;
}

// æ ¡éªéç½®é¡¹
// æ³¨æï¼æ ¡éªå°éè¯¯æ¶ä¸­éä¸è¦è¿åï¼ç¥éæ ¡éªå®ææé¡¹ç®ååè¿åç»æ
function verifyFields(focused, quiet)
{
	if(!E('setup_com_enable').checked&&!E('setup_mode_enable').checked&&!E('setup_wan1_enable').checked&&!E('setup_wmmp_enable').checked&&
		!E('setup_app_enable').checked&&!E('setup_app_ext_enable').checked&&!E('setup_misc_enable').checked&&!E('service_ovdp_enable').checked){
		return -1;
	}
	

	var ok = 1;
	var current_group = groupShow;

	if (focused) quiet = 2;

	/////////////////////////////////////////////////////////////////////////
	//1
	if (quiet || E('setup_com_enable').checked) {
		showSubGroup('setup_com', 0);
		ok &= v_range('_com0_interval', quiet, 1, 100) && v_range('_com0_timeout', quiet, 5, 30);
		if (!ok && quiet!=2) {
			return 0;
		}		
	}
	//2
	if (quiet || E('setup_mode_enable').checked) {
		showSubGroup('setup_mode', 0);
		
		var mode = E('_wan1_ppp_mode').value * 1;
		if (mode) ok &= (E('_wan1_trig_interval').value=='0' || v_range('_wan1_trig_interval', quiet, 5, 1440))
									 && (E('_wan1_off_interval').value=='0' || v_range('_wan1_off_interval', quiet, 1, 60));

		elem.enable('_wan1_trig_data', '_wan1_trig_call', '_wan1_trig_sms', '_wan1_trig_interval', 
				'_wan1_off_interval', mode);
		//elem.enable('_dtu_trans_mode', E('_wmmp_enable').value=='1');
		
		if (!ok && quiet!=2) {
			return 0;
		}
	}
	
	/////////////////////////////////////////////////////////////////////////
	//3
	if (quiet || E('setup_wan1_enable').checked) {		
		showSubGroup('setup_wan1', 0);
		if (!v_range('_wan1_ppp_check_interval', quiet, 4, 3600)){
				ok = 0;
		}
		ok &= v_length('_wan1_ppp_callno', quiet, 1, 32) && v_length('_wan1_ppp_username', quiet, 0, 32)
				&& v_length('_wan1_ppp_passwd', quiet, 0, 32);
		if (!ok && quiet!=2) {
			return 0;
		}
	}
	//4
	if (quiet || E('setup_wmmp_enable').checked) {		
		showSubGroup('setup_wmmp', 0);
		var enable = E('_wmmp_enable').value=='1';
		
		elem.enable('_wmmp_id', '_wmmp_svr', '_wmmp_port', '_wmmp_proto', '_wmmp_hb_interval', 
							'_wmmp_sca', '_wmmp_sms_num', enable);
		if (enable) {
			ok &= v_length('_wmmp_id', quiet, 1, 16) 
					&& v_ipnz('_wmmp_svr', quiet)
					&& v_port('_wmmp_port', quiet)
					&& v_range('_wmmp_hb_interval', quiet, 4, 3600)
					&& v_length('_wmmp_sca', quiet, 0, 16)
					&& v_length('_wmmp_sms_num', quiet, 0, 16);	
			if (!ok && quiet!=2) {
				return 0;
			}		
		}		
	}	
	//5
	if (quiet || E('setup_app_enable').checked) {		
		showSubGroup('setup_app', 0);
		var enable = (E('_wmmp_enable').value=='0');
		//var enable = (E('_wmmp_enable').value=='0' || E('_dtu_trans_mode').value=='1');
		
		elem.enable('_app_id', '_app_svr', '_app_port', '_app_proto', '_app_hb_interval', 
							'_app_retries', enable);
		if (enable) {
			ok &= v_length('_app_id', quiet, 1, 11)
					&& v_ipnz('_app_svr', quiet)
					&& v_port('_app_port', quiet)
					&& v_range('_app_hb_interval', quiet, 1, 60)
					&& v_range('_app_retries', quiet, 0, 5)
					&& v_ip('_dns1', quiet)
					&& v_ip('_dns2', quiet);
			if (!ok && quiet!=2) {
				return 0;
			}
		}		
	}	
	//6
	if (quiet || E('setup_app_ext_enable').checked) {		
		showSubGroup('setup_app_ext', 0);
		var enable = (E('_wmmp_enable').value=='0');
		//var enable = (E('_wmmp_enable').value=='0' || E('_dtu_trans_mode').value=='1');
		
		elem.enable('_app1_svr', '_app1_port', '_app2_svr', '_app2_port', '_app3_svr', 
								'_app3_port', '_app4_svr', '_app4_port', enable);
		if (enable) {
			if (E('_app1_svr').value=='') E('_app1_svr').value = '0.0.0.0';
			if (E('_app2_svr').value=='') E('_app2_svr').value = '0.0.0.0';
			if (E('_app3_svr').value=='') E('_app3_svr').value = '0.0.0.0';
			if (E('_app4_svr').value=='') E('_app4_svr').value = '0.0.0.0';

			if (E('_app1_port').value=='') E('_app1_port').value = '0';
			if (E('_app2_port').value=='') E('_app2_port').value = '0';
			if (E('_app3_port').value=='') E('_app3_port').value = '0';
			if (E('_app4_port').value=='') E('_app4_port').value = '0';
			
			if (E('_app1_svr').value=='0.0.0.0') elem.enable('_app1_port', false);
			else ok &= v_ip('_app1_svr', quiet)&&v_port('_app1_port', quiet);
			if (E('_app2_svr').value=='0.0.0.0') elem.enable('_app2_port', false);
			else ok &= v_ip('_app2_svr', quiet)&&v_port('_app2_port', quiet);
			if (E('_app3_svr').value=='0.0.0.0') elem.enable('_app3_port', false);
			else ok &= v_ip('_app3_svr', quiet)&&v_port('_app3_port', quiet);
			if (E('_app4_svr').value=='0.0.0.0') elem.enable('_app4_port', false);
			else ok &= v_ip('_app4_svr', quiet)&&v_port('_app4_port', quiet);
			if (!ok && quiet!=2) {
				return 0;
			}		
		}		
	}	
	//7
	if (quiet || E('setup_misc_enable').checked) {		
		showSubGroup('setup_misc', 0);
		ok &= v_range('_max_login', quiet, 1, 255)
				&& v_length('_sms_passwd', quiet, 1, 16);
		if (!ok && quiet!=2) {
			return 0;
		}		
	}	
/*
	if (E('setup_ext_enable').checked) {
		ok &= v_length('_ext1', quiet, 1, 16)
					&& v_length('_ext2', quiet, 1, 16)
					&& v_length('_ext3', quiet, 1, 16)
					&& v_length('_ext4', quiet, 1, 16);
		if (!ok && quiet!=2) {
			showSubGroup('setup_ext', 0);
			return 0;
		}		
	}
*/	
	//8
	if (quiet || E('service_ovdp_enable').checked) {
		showSubGroup('service_ovdp', 0);
		var mode = E('_ovdp_mode').value;
		elem.enable('_f_sn', false);
		
		elem.display_and_enable(('_ovdp_vendor_id'), ('_ovdp_device_id'), ('_ovdp_trust_list'),('_ovdp_hb_interval'),
				mode!='0');
		elem.enable(('_ovdp_center'), ('_ovdp_center_port'),
				mode=='2');

		if (mode!=0) {
			elem.enable('_ovdp_device_id', false);
			
			if (mode==2 && !v_length('_ovdp_center', quiet, 1, 128)) ok = 0;
			else if (mode==2 && !v_port('_ovdp_center_port', quiet)) ok = 0;
			else if (mode==2 && !v_range('_ovdp_hb_interval', quiet, 30, 600)) ok = 0;
			else if (!verifyTrustList('_ovdp_trust_list',quiet)) ok = 0;
			else if (mode!=2 && !v_range('_ovdp_hb_interval', quiet, 30, 600)) ok=0;
		}
		
		if (!ok && quiet!=2) {
			
			return 0;
		}
	}
	
	showSubGroup(current_group, 0);
	return ok;	
}

// å½åéç½®æ¹æ¡
// TODO: éè¦ä»serverä¾§è·å
var default_scheme = {
	_setup_com_enable: '0',
	com0_baud: '0',
	com0_databit: '0',
	com0_parity: '0',
	com0_stopbit: '0',
	com0_interval: '10',
	com0_timeout: '5',
	
	_setup_mode_enable: '0',
	wmmp_enable: '0',
	wan1_ppp_mode: '0',
	wan1_trig_call: '1',
	wan1_trig_sms: '0',
	wan1_trig_data: '1',
	wan1_trig_interval: '0',
	wan1_off_interval: '0',
	dtu_trans_mode: '0',
	
	_setup_wan1_enable: '0',
	wan1_enable: '1',
	wan1_ppp_callno: '*99***1#',
	wan1_ppp_apn: 'cmnet',
	wan1_ppp_username: 'GPRS',
	wan1_ppp_passwd: 'GPRS',
	wan1_ppp_check_interval: '60',

	_setup_wmmp_enable: '0',
	wmmp_id: '',
	wmmp_svr: '219.239.26.166',
	wmmp_port: '54321',
	wmmp_proto: '0',
	wmmp_hb_interval: '60',
	wmmp_sca: '',
	wmmp_sms_num: '',	

	_setup_app_enable: '0',
	app_id: '',
	app_svr: '219.239.26.166',
	app_host: '',
	app_port: '54321',
	app_proto: '1',
	app_hb_interval: '2',
	app_retries: '0',
	dns1: '0.0.0.0',
	dns2: '0.0.0.0',

	_setup_app_ext_enable: '0',
	app1_svr: '0.0.0.0',
	app1_host: '',
	app1_port: '0',
	app1_proto: '0',
	app2_svr: '0.0.0.0',
	app2_host:'',
	app2_port: '0',
	app2_proto: '0',
	app3_svr: '0.0.0.0',
	app3_host: '',
	app3_port: '0',
	app3_proto: '0',
	app4_svr: '0.0.0.0',
	app4_host: '',
	app4_port: '0',
	app4_proto: '0',
/*
	_setup_ext_enable: '0',
	ext1: '',
	ext2: '',
	ext3: '',
	ext4: '',
*/
	_setup_misc_enable: '0',
	max_login: '3',
	sms_passwd: 'smsconfig',
	debug: '0',

	serialnum: '',
	_service_ovdp_enable: '0',
	ovdp_mode: '1',
	ovdp_vendor_id: '0003',
	ovdp_device_id: '',
	ovdp_center: '203.86.43.186',
	ovdp_center_port: '9000',
	//ovdp_login_retries: '3',
	ovdp_hb_interval: '600',
	//ovdp_rx_timeout: '30',
	//ovdp_tx_retries: '3',
	ovdp_trust_list: ''
};

function V(t)
{
	if (typeof(t)=='undefined') return 0;
	return 1;
}

function S(x, t)
{
	if (typeof(t)=='undefined') return;
	
	E('_' + x).value = t;
}

function C(x, t)
{
	if (typeof(t)=='undefined') return;
	
	E('_f_' + x).checked = (t=='1') ? 1 : 0;
}

function C2(x, t, v)
{
	if (typeof(t)=='undefined') return;
	
	E('_f_' + x).checked = (t==v) ? 1 : 0;
}

function C3(x, t)
{
		if(typeof(t) == 'undefined'){
           E(x).checked = false;
        }else{
           E(x).checked = (typeof(t)=='undefined' || t!='0');
        }
}

// åºç¨éç½®æ¹æ¡
function updateScheme(scheme)
{
	C3('setup_com_enable', scheme._setup_com_enable);	
	if (V(scheme.com0_baud) && scheme.com0_baud==0) scheme.com0_baud = '6';
	S('com0_baud', scheme.com0_baud);
	if (V(scheme.com0_databit) && scheme.com0_databit==0) scheme.com0_databit = '8';
	S('com0_databit', scheme.com0_databit);
	S('com0_parity', scheme.com0_parity);
	S('com0_stopbit', scheme.com0_stopbit);
	S('com0_interval', scheme.com0_interval);
	S('com0_timeout', scheme.com0_timeout);
	
	C3('setup_mode_enable', scheme._setup_mode_enable);	
	S('wmmp_enable', scheme.wmmp_enable);
	S('wan1_ppp_mode', scheme.wan1_ppp_mode);
	S('wan1_trig_call', scheme.wan1_trig_call);
	S('wan1_trig_sms', scheme.wan1_trig_sms);
	S('wan1_trig_data', scheme.wan1_trig_data);
	S('wan1_trig_interval', scheme.wan1_trig_interval);
	S('wan1_off_interval', scheme.wan1_off_interval);
	//S('dtu_trans_mode', scheme.dtu_trans_mode);
	
	///////////////////////////////////////////////////
	C3('setup_wan1_enable', scheme._setup_wan1_enable);
	C('wan1_enable', scheme.wan1_enable);
	S('wan1_ppp_callno', scheme.wan1_ppp_callno);
	S('wan1_ppp_apn', scheme.wan1_ppp_apn);
	S('wan1_ppp_username', scheme.wan1_ppp_username);
	S('wan1_ppp_passwd', scheme.wan1_ppp_passwd);
	S('wan1_ppp_check_interval', scheme.wan1_ppp_check_interval);

	///////////////////////////////////////////////////
	C3('setup_wmmp_enable', scheme._setup_wmmp_enable);
	S('wmmp_id', scheme.wmmp_id);
	S('wmmp_svr', scheme.wmmp_svr);
	S('wmmp_port', scheme.wmmp_port);
	S('wmmp_proto', scheme.wmmp_proto);
	S('wmmp_hb_interval', scheme.wmmp_hb_interval);
	S('wmmp_sca', scheme.wmmp_sca);
	S('wmmp_sms_num', scheme.wmmp_sms_num);

	///////////////////////////////////////////////////
	C3('setup_app_enable', scheme._setup_app_enable);
	S('app_id', scheme.app_id);
	S('app_svr', scheme.app_svr);
	S('app_host',scheme.app_host);
	S('app_port', scheme.app_port);
	S('app_proto', scheme.app_proto);
	S('app_hb_interval', scheme.app_hb_interval);
	S('app_retries', scheme.app_retries);
	S('dns1', scheme.dns1);
	S('dns2', scheme.dns2);

	C3('setup_app_ext_enable', scheme._setup_app_ext_enable);
	S('app1_svr', scheme.app1_svr);
	S('app1_host',scheme.app1_host);
	S('app1_port', scheme.app1_port);
	S('app1_proto',scheme.app1_proto);
	S('app2_svr', scheme.app2_svr);
	S('app2_host',scheme.app2_host);
	S('app2_port', scheme.app2_port);
	S('app2_proto',scheme.app2_proto);
	S('app3_svr', scheme.app3_svr);
	S('app3_host',scheme.app3_host);
	S('app3_port', scheme.app3_port);
	S('app3_proto',scheme.app3_proto);
	S('app4_svr', scheme.app4_svr);
	S('app4_host',scheme.app4_host);
	S('app4_port', scheme.app4_port);
	S('app4_proto',scheme.app4_proto);
/*
	C3('setup_ext_enable', scheme._setup_ext_enable);
	S('ext1', scheme.ext1);
	S('ext2', scheme.ext2);
	S('ext3', scheme.ext3);
	S('ext4', scheme.ext4);
*/
	C3('setup_misc_enable', scheme._setup_misc_enable);
	S('max_login', scheme.max_login);
	S('sms_passwd', scheme.sms_passwd);
	S('debug', scheme.debug);
	
	C3('service_ovdp_enable', scheme._service_ovdp_enable);
	S('f_sn', scheme.serialnum);
	S('ovdp_mode', scheme.ovdp_mode);
	S('ovdp_vendor_id', scheme.ovdp_vendor_id);
	S('ovdp_device_id', scheme.ovdp_device_id);
	S('ovdp_center', scheme.ovdp_center);
	S('ovdp_center_port', scheme.ovdp_center_port);
	S('ovdp_hb_interval', scheme.ovdp_hb_interval);
	S('ovdp_trust_list', scheme.ovdp_trust_list);

	verifyFields(null, 1);
}





function joinAddr(a) {
	var r, i, s;

	r = [];
	for (i = 0; i < a.length; ++i) {
		s = a[i];
		if ((s != '00:00:00:00:00:00') && (s != '0.0.0.0')) r.push(s);
	}
	return r.join(';');
}

// ä¿å­éç½®åå¤æäº¤ï¼å¯¹å½åéç½®è¿è¡æ ¡éªï¼çæå¾æäº¤çåå®¹
function savePage()
{
    var resultVerifyFd=verifyFields(null,0);
	if(resultVerifyFd==-1){ /**一个都没选中和元素校验返回结果现在被分为-1和0*/
		return -1;
	}
	else if(resultVerifyFd==0){
		return 0;
	}
	else if (!resultVerifyFd){ 
	return null;
    }
	var scheme = "";
	
	scheme += "_setup_com_enable=" + (E('setup_com_enable').checked ? '1' : '0');
	scheme += "\ncom0_baud=" + E('_com0_baud').value
				+ "\ncom0_databit=" + E('_com0_databit').value
				+ "\ncom0_parity=" + E('_com0_parity').value
				+ "\ncom0_stopbit=" + E('_com0_stopbit').value
				+ "\ncom0_interval=" + E('_com0_interval').value
				+ "\ncom0_timeout=" + E('_com0_timeout').value;
				
	scheme += "\n_setup_mode_enable=" + (E('setup_mode_enable').checked ? '1' : '0');
	scheme += "\nwmmp_enable=" + E('_wmmp_enable').value
				+ "\nwan1_ppp_mode=" + E('_wan1_ppp_mode').value
				+ "\nwan1_trig_call=" + E('_wan1_trig_call').value
				+ "\nwan1_trig_sms=" + E('_wan1_trig_sms').value
				+ "\nwan1_trig_data=" + E('_wan1_trig_data').value
				+ "\nwan1_trig_interval=" + E('_wan1_trig_interval').value
				+ "\nwan1_off_interval=" + E('_wan1_off_interval').value
				//+ "\ndtu_trans_mode=" + E('_dtu_trans_mode').value;
				+ "\ndtu_trans_mode=0";

	scheme += "\n_setup_wan1_enable=" + (E('setup_wan1_enable').checked ? '1' : '0');
	scheme += "\nwan1_enable=" + (E('_f_wan1_enable').checked ? '1' : '0')
		+ "\nwan1_ppp_callno=" + E('_wan1_ppp_callno').value 
		+ "\nwan1_ppp_apn=" + E('_wan1_ppp_apn').value 
		+ "\nwan1_ppp_username=" + E('_wan1_ppp_username').value 
		+ "\nwan1_ppp_passwd=" + E('_wan1_ppp_passwd').value 
		+ "\nwan1_ppp_check_interval=" + E('_wan1_ppp_check_interval').value;
		
	scheme += "\n_setup_wmmp_enable=" + (E('setup_wmmp_enable').checked ? '1' : '0');
	scheme += "\nwmmp_id=" + E('_wmmp_id').value
				+ "\nwmmp_svr=" + E('_wmmp_svr').value
				+ "\nwmmp_port=" + E('_wmmp_port').value
				+ "\nwmmp_proto=" + E('_wmmp_proto').value
				+ "\nwmmp_hb_interval=" + E('_wmmp_hb_interval').value
				+ "\nwmmp_sca=" + E('_wmmp_sca').value
				+ "\nwmmp_sms_num=" + E('_wmmp_sms_num').value;

	scheme += "\n_setup_app_enable=" + (E('setup_app_enable').checked ? '1' : '0');
	scheme += "\napp_id=" + E('_app_id').value
				+ "\napp_svr=" + E('_app_svr').value
				+ "\napp_host=" + E('_app_host').value
				+ "\napp_port=" + E('_app_port').value
				+ "\napp_proto=" + E('_app_proto').value
				+ "\napp_hb_interval=" + E('_app_hb_interval').value
				+ "\napp_retries=" + E('_app_retries').value
				+ "\ndns1=" + E('_dns1').value
				+ "\ndns2=" + E('_dns2').value;
				
	scheme += "\n_setup_app_ext_enable=" + (E('setup_app_ext_enable').checked ? '1' : '0');
	scheme += "\napp1_svr=" + E('_app1_svr').value
	            + "\napp1_host=" + E('_app1_host').value
				+ "\napp1_port=" + E('_app1_port').value
				+ "\napp1_proto=" + E('_app1_proto').value
				+ "\napp2_svr=" + E('_app2_svr').value
				+ "\napp2_host=" + E('_app2_host').value
				+ "\napp2_port=" + E('_app2_port').value
				+ "\napp2_proto=" + E('_app2_proto').value
				+ "\napp3_svr=" + E('_app3_svr').value
				+ "\napp3_host=" + E('_app3_host').value
				+ "\napp3_port=" + E('_app3_port').value
				+ "\napp3_proto=" + E('_app3_proto').value
				+ "\napp4_port=" + E('_app4_port').value
				+ "\napp4_svr=" + E('_app4_svr').value
				+ "\napp4_host=" + E('_app4_host').value
				+ "\napp4_proto=" + E('_app4_proto').value;
/*				
	scheme += "\n_setup_ext_enable=" + (E('setup_ext_enable').checked ? '1' : '0');
	scheme += "\next1=" + E('_ext1').value
				+ "\next2=" + E('_ext2').value
				+ "\next3=" + E('_ext3').value
				+ "\next4=" + E('_ext4').value;
*/
	scheme += "\n_setup_misc_enable=" + (E('setup_misc_enable').checked ? '1' : '0');
	scheme += "\nmax_login=" + E('_max_login').value
				+ "\nsms_passwd=" + E('_sms_passwd').value
				+ "\ndebug=" + E('_debug').value;

	scheme += "\n_service_ovdp_enable=" + (E('service_ovdp_enable').checked ? '1' : '0');
	scheme += "\novdp_mode=" + E('_ovdp_mode').value
		+ "\novdp_vendor_id=" + E('_ovdp_vendor_id').value 
		//+ "\novdp_device_id=" + E('_ovdp_device_id').value
		+ "\novdp_center=" + E('_ovdp_center').value
		+ "\novdp_center_port=" + E('_ovdp_center_port').value
		+ "\novdp_hb_interval=" + E('_ovdp_hb_interval').value
		+ "\novdp_trust_list=" + E('_ovdp_trust_list').value;

	return scheme;
}
