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
	e = E(e);
	if (e.value == '' || e.value == '0.0.0.0'){
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
var ike_default_policies = [['3des-md5-modp768', '3DES-MD5-DH1'], ['3des-md5-modp1024', '3DES-MD5-DH2'], ['3des-md5-modp1536', '3DES-MD5-DH5'], ['3des-sha1-modp768', '3DES-SHA1-DH1'], ['3des-sha1-modp1024', '3DES-SHA1-DH2'], ['3des-sha1-modp1536', '3DES-SHA1-DH5'], ['aes128-md5-modp768', 'AES128-MD5-DH1'], ['aes128-md5-modp1024', 'AES128-MD5-DH2'], ['aes128-md5-modp1536', 'AES128-MD5-DH5'], ['aes128-sha1-modp768', 'AES128-SHA1-DH1'], ['aes128-sha1-modp1024', 'AES128-SHA1-DH2'], ['aes128-sha1-modp1536', 'AES128-SHA1-DH5']];
var ipsec_default_policies = [['3des-md5-96', '3DES-MD5-96'], ['3des-sha1-96', '3DES-SHA1-96'], ['aes128-md5-96', 'AES128-MD5-96'], ['aes128-sha1-96', 'AES128-SHA1-96']];

//var ipsec_auth_types = [['0', ipsec.shared_key],['1', ipsec.cert],['2', ipsec.rsasig]];
var ipsec_auth_types = [['0', ipsec.shared_key],['1', ipsec.cert]];
var ipsec_id_types = [['0', ui.ip],['1', 'User FQDN'], ['2', 'FQDN']];
var ipsec_startup_modes = [['0', ipsec.auto],['1', ipsec.dod],['2', ipsec.passive],['3', ipsec.manual]];
var ipsec_neg_modes = [['0', ipsec.main_mode],['1', ipsec.agg_mode]];
var ipsec_ipsec_protos = [['0', 'ESP']];
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
	name : 'IR711GS39',
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
       var enable_system=E('system_enable');
       var section_system=E('system_section');
       
       var enable_network=E('network_enable');
       var section_network=E('network_section');
       
       var enable_services=E('services_enable');
       var section_services=E('services_section');
       
       var enable_fw=E('fw_enable');
       var section_fw=E('fw_section');
       
       if (checkAll.checked){
          enable_system.checked=1;
          enable_network.checked=1;
          enable_services.checked=1;
          enable_fw.checked=1;
		  for (i=0; i<section_system.childNodes.length; i+=1){
			 E(section_system.childNodes[i].id + '_enable').checked = 1;
		  }
		  for (i=0; i<section_network.childNodes.length; i+=1){
			 E(section_network.childNodes[i].id + '_enable').checked = 1;
		  }
		  for (i=0; i<section_services.childNodes.length; i+=1){
			 E(section_services.childNodes[i].id + '_enable').checked = 1;
		  }
		  for (i=0; i<section_fw.childNodes.length; i+=1){
			 E(section_fw.childNodes[i].id + '_enable').checked = 1;
		  }
	   }else{
	      enable_system.checked=0;
          enable_network.checked=0;
          enable_services.checked=0;
          enable_fw.checked=0;
		  for (i=0; i<section_system.childNodes.length; i+=1){
			 E(section_system.childNodes[i].id + '_enable').checked = 0;
		  }
		  for (i=0; i<section_network.childNodes.length; i+=1){
			 E(section_network.childNodes[i].id + '_enable').checked = 0;
		  }
		  for (i=0; i<section_services.childNodes.length; i+=1){
			 E(section_services.childNodes[i].id + '_enable').checked = 0;
		  }
		  for (i=0; i<section_fw.childNodes.length; i+=1){
			 E(section_fw.childNodes[i].id + '_enable').checked = 0;
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
   var show_system=E('system_show');
   var icon_system=E('system_icon');
   var section_system=E('system_section');
   
   show_system.value=show_system.value=='1' ? '0' : '1';
   
   var show_network=E('network_show');
   var icon_network=E('network_icon');
   var section_network=E('network_section');
   
   show_network.value=show_network.value=='1' ? '0' : '1';
   
   var show_services=E('services_show');
   var icon_services=E('services_icon');
   var section_services=E('services_section');
   
   show_services.value=show_services.value=='1' ? '0' : '1';
   
   var show_fw=E('fw_show');
   var icon_fw=E('fw_icon');
   var section_fw=E('fw_section');
   
   show_fw.value=show_fw.value=='1' ? '0' : '1';
   
   if(show_system.value == '0' & (show_network.value == '1'|show_network.value=='0') & (show_services.value == '1'|show_services.value=='0') & (show_fw.value =='1'|show_fw.value=='0')){
      checkbox.src="images/task-up.png";
      icon_system.src = "images/task-up.png";
	  icon_system.alt = "<<<";
	  section_system.style.display = "";
	  
	  icon_network.src = "images/task-up.png";
	  icon_network.alt = "<<<";
	  section_network.style.display = ""; 
	  
	  icon_services.src = "images/task-up.png";
	  icon_services.alt = "<<<";
	  section_services.style.display = ""; 
	  
	  icon_fw.src = "images/task-up.png";
	  icon_fw.alt = "<<<";
	  section_fw.style.display = ""; 
	 
   }else{
      checkbox.src="images/task-down.png";
      icon_system.src = "images/task-down.png";
	  icon_system.alt = "<<<";
	  section_system.style.display = "none";
	  
	  icon_network.src = "images/task-down.png";
	  icon_network.alt = "<<<";
	  section_network.style.display = "none"; 
	  
	  icon_services.src = "images/task-down.png";
	  icon_services.alt = "<<<";
	  section_services.style.display = "none"; 
	  
	  icon_fw.src = "images/task-down.png";
	  icon_fw.alt = "<<<";
	  section_fw.style.display = "none"; 
	  
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
			W("<img border=0 style='text-aligh:right' onclick='toggleGroup(\"" + groupId + "\")' id='" + groupId + "_icon' src='images/task-up.png' alt='<<<'>" );
		W("</div>");
	W("</div>");
	W("<div class='section' id='" + groupId + "_section' >");
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

var groupShow = 'setup_system';

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

// Global vars
var svrs = [ 'http', 'https', 'telnet', 'sshd' ];
var have_ssh = 1;
var have_https = 1;
var ddns_num = 2;

var provider_data_list=[
	['China Mobile (GPRS/EDGE)',	'EDGE', 'cmnet',	'*99#', '', ''],
	['China Mobile (Public Beijing APN for GPRS/EDGE)', 'EDGE', 'public-vpn.bj', '*99#', '', ''],
	['China Mobile (TD-SCDMA)',	'TD-SCDMA', 'cmnet',	'*98*1#', 'gprs', 'gprs'],
	['Vodafone UK',	'HSDPA', 'internet', 	'*99#',	'web', 	'web'],
	['Airtel-Vodafone','HSDPA', 'airtel-ci-gprs.com', '*99#', '', ''],
	['China Telecom(CDMA)','CDMA 1x', '', '#777', 'CARD', 'CARD'],
	['China Telecom(EVDO)','EVDO', '', '#777', 'CARD', 'CARD'],
	['China Unicom(HSUPA)',	'HSUPA', 'uninet', '*99#', 'gprs', 'gprs']
	];
var services = [
	['', ui.disable, '', ''],
	['qdns', 'QDNS(3322) - Dynamic', 'wmb', 'http://www.3322.org/'],
	['qdns-static', 'QDNS(3322) - Static', 'wmb', 'http://www.3322.org/'],
	['dyndns', 'DynDNS - Dynamic', 'wmb', 'http://www.dyndns.com/'],
	['dyndns-static', 'DynDNS - Static', 'wmb', 'http://www.dyndns.com/'],
	['dyndns-custom', 'DynDNS - Custom', 'wmb', 'http://www.dyndns.com/'],
	['custom', ui.custom, 'C', '', '', 'HTTP Request']];

///////////////////////////////////////////////////////////////////////////
var mip = new webGrid();

mip.verifyFields = function(row, quiet) {
	var f = fields.getAll(row);

	if (f[1].value.length==0) f[1].value = '255.255.255.0';
	f[2].value = f[2].value.replace(';', '_');

	return v_ip(f[0], quiet) && v_netmask(f[1], quiet);
//	if (f[2].value.length==0) f[2].value = '0.0.0.0';
//	f[3].value = f[3].value.replace(';', '_');
//	return v_ip(f[0], quiet) && v_netmask(f[1], quiet) && v_ipz(f[2], quiet);
}

mip.setup = function() {
	this.init('mip-grid', '', 8, [
		{ type: 'text', maxlen: 15 }, { type: 'text', maxlen: 15 }, { type: 'text', maxlen: 64 }]);
//		{ type: 'text', maxlen: 15 }, { type: 'text', maxlen: 15 }, { type: 'text', maxlen: 15 }, { type: 'text', maxlen: 32 }]);
//	this.headerSet([ui.ip, ui.netmask, ui.gateway, ui.desc]);
	this.headerSet([ui.ip, ui.netmask, ui.desc]);
	this.showNewEditor();
	this.resetNewEditor();
}
///////////////////////////////////////////////////////////////////////////
var route = new webGrid();
var ifaces = [['lan0','LAN']];

route.verifyFields = function(row, quiet) {
	var f = fields.getAll(row);
	if (f[1].value.length==0) f[1].value = '255.255.255.0';
	if (f[2].value.length==0) f[2].value = '0.0.0.0';
	f[4].value = f[4].value.replace(';', '_');
	return v_ip(f[0], quiet) && v_netmask(f[1], quiet) && v_ip(f[2], quiet);
}

route.resetNewEditor = function() {
	var f, c;

	f = fields.getAll(this.newEditor);
	ferror.clearAll(f);
	
	f[0].value = '0.0.0.0';
	f[1].value = '255.255.255.0';
	f[2].value = '0.0.0.0';
	f[3].value = '0';
	f[4].selectedIndex = 0;
}

route.setup = function() {
	this.init('route-grid', 'move', 20, [
		{ type: 'text', maxlen: 15 }, { type: 'text', maxlen: 15 }, { type: 'text', maxlen: 15 },
		{ type: 'select', options: ifaces }, { type: 'text', maxlen: 32 }]);
	this.headerSet([ui.dst, ui.netmask, ui.gateway, ui.iface, ui.desc]);
	this.showNewEditor();
	this.resetNewEditor();
}
///////////////////////////////////////////////////////////////////////////
var aclg = new webGrid();

aclg.dataToView = function(data) {
	return [(data[0] != '0') ? ui.yes : ui.no, ['TCP', 'UDP', 'ICMP', ui.al][data[1] - 1], (data[2].match(/(.+)-(.+)/)) ? (RegExp.$1 + ' -<br>' + RegExp.$2) : data[2], data[3], (data[4].match(/(.+)-(.+)/)) ? (RegExp.$1 + ' -<br>' + RegExp.$2) : data[4], data[5], [fw.accept, fw.drop][data[6]*1 - 1], (data[7] != '0') ? ui.yes : ui.no, data[8]];
}

aclg.fieldValuesToData = function(row) {
	var f = fields.getAll(row);
	return [f[0].checked ? 1 : 0, f[1].value, f[2].value, f[3].value, f[4].value, f[5].value, f[6].value, f[7].checked ? 1 : 0, f[8].value];
}

aclg.verifyFields = function(row, quiet) {
	var f = fields.getAll(row);
	var s;

	f[2].value = f[2].value.trim();
	ferror.clear(f[2]);
	if ((f[2].value.length) && (!v_iptip(f[2], 0))) return 0;

	if (f[1].value <= 2){
		ferror.clear(f[3]);
		f[3].value = f[3].value.trim();
		if (f[3].value.length && !v_iptport(f[3], quiet)) return 0;
		f[3].disabled = 0;
	}else{
		f[3].disabled = 1;
	}
		
	ferror.clear(f[4]);
	if ((f[4].value.length) && (!v_iptip(f[2], 0))) return 0;
	
	if (f[1].value <= 2){
		ferror.clear(f[5]);
		f[5].value = f[5].value.trim();
		if (f[5].value.length && !v_iptport(f[5], quiet)) return 0;
		f[5].disabled = 0;
	}else{
		f[5].disabled = 1;
	}
			
	f[8].value = f[8].value.replace(/>/g, '_');
	return 1;
}

aclg.resetNewEditor = function() {
	var f = fields.getAll(this.newEditor);
	f[0].checked = 1;
	f[1].selectedIndex = 3;
	f[2].value = '0.0.0.0/0';
	f[3].value = '';
	f[4].value = '';
	f[5].value = '';
	f[6].selectedIndex = 0;
	f[7].checked = 0;
	
	f[3].disabled = 1;
	f[5].disabled = 1;
		
	ferror.clearAll(fields.getAll(this.newEditor));
}

aclg.setup = function() {
	this.init('acl-grid', 'move', 50, [
		{ type: 'checkbox' },
		{ type: 'select', options: [[1, 'TCP'],[2, 'UDP'],[3,'ICMP'],[4, ui.al ]] },
		{ type: 'text', maxlen: 32 },
		{ type: 'text', maxlen: 16 },
		{ type: 'text', maxlen: 32 },
		{ type: 'text', maxlen: 16 },
		{ type: 'select', options: [[1, fw.accept],[2, fw.drop]] },
		{ type: 'checkbox' },
		{ type: 'text', maxlen: 32 }]);
	this.headerSet([ui.enable, fw.proto, fw.src_ip, fw.src_port, fw.dst, fw.dst_port, fw.act, fw.log, ui.desc]);

	aclg.showNewEditor();
	this.resetNewEditor();
}
///////////////////////////////////////////////////////////////////////////
var pmg = new webGrid();

pmg.dataToView = function(data) {
	return [(data[0] != '0') ? ui.yes : ui.no, ['TCP', 'UDP', 'TCP &amp; UDP'][data[1]*1-1], (data[2].match(/(.+)-(.+)/)) ? (RegExp.$1 + ' -<br>' + RegExp.$2) : data[2], data[3], data[4], data[5], (data[6] != '0') ? ui.yes : ui.no, data[7]];
}

pmg.fieldValuesToData = function(row) {
	var f = fields.getAll(row);
	return [f[0].checked ? 1 : 0, f[1].value, f[2].value, f[3].value, f[4].value, f[5].value, f[6].checked ? 1 : 0, f[7].value];
}

pmg.verifyFields = function(row, quiet) {
	var f = fields.getAll(row);
	var s;

	f[2].value = f[2].value.trim();
	ferror.clear(f[2]);
	if ((f[2].value.length) && (!v_iptip(f[2], quiet))) return 0;

	ferror.clear(f[3]);
	if (!v_iptport(f[3], quiet)) return 0;
	
	ferror.clear(f[5]);
	if (!v_iptport(f[5], quiet)) return 0;
/*	
	if (f[3].value.search(/[-:,]/) != -1) {
		f[5].value = f[3].value;
		f[5].disabled = true;
	}
	else {
		f[5].disabled = false;
		f[5].value = f[5].value.trim();
		if (f[5].value != '') {
			if (!v_port(f[5], quiet)) return 0;
		}
	}
*/	
	ferror.clear(f[4]);
	if (!v_ip(f[4], quiet, 1)) return 0;
	//local ip should be in lan
	 //FIXME: todo!
	if (!v_ip_in_net(f[4], _type_info.lan0_ip, _type_info.lan0_netmask)
			&& !v_ip_in_mip(dip, _type_info.lan0_mip)){
				return 0;
	}
	
	f[7].value = f[7].value.replace(/>/g, '_');
	return 1;
}

pmg.resetNewEditor = function() {
	var f = fields.getAll(this.newEditor);
	f[0].checked = 1;
	f[1].selectedIndex = 0;
	f[2].value = '0.0.0.0/0';
	f[3].value = '8080';
	f[4].value = '';
	f[5].value = '8080';
	f[6].checked = 0;
	f[7].value = '';
	ferror.clearAll(fields.getAll(this.newEditor));
}

pmg.setup = function() {
	this.init('portmap-grid', 'move', 50, [
		{ type: 'checkbox' },
		{ type: 'select', options: [[1, 'TCP'],[2, 'UDP'],[3,'TCP&UDP']] },
		{ type: 'text', maxlen: 32 },
		{ type: 'text', maxlen: 16 },
		{ type: 'text', maxlen: 15 },
		{ type: 'text', maxlen: 16 },
		{ type: 'checkbox' },
		{ type: 'text', maxlen: 32 }]);
	this.headerSet([ui.enable, fw.proto, fw.src_ip, fw.svr_port, fw.int_ip, fw.int_port, fw.log, ui.desc]);
	this.showNewEditor();
	this.resetNewEditor();
}

///////////////////////////////////////////////////////////////////////////
var vipg = new webGrid();

vipg.dataToView = function(data) {
	return [(data[0] != '0') ? ui.yes : ui.no, data[1], data[2], (data[3] != '0') ? ui.yes : ui.no, data[4]];
}

vipg.fieldValuesToData = function(row) {
	var f = fields.getAll(row);
	return [f[0].checked ? '1' : '0', f[1].value, f[2].value, f[3].checked ? '1' : '0', f[4].value];
}

vipg.verifyFields = function(row, quiet) {
	var f = fields.getAll(row);
	var s;

	f[1].value = f[1].value.trim();
	ferror.clear(f[1]);
	if (!v_ip(f[1], quiet)) return 0;

	f[2].value = f[2].value.trim();
	ferror.clear(f[2]);
	if (!v_ip(f[2], quiet)) return 0;
	
	f[4].value = f[4].value.replace(/>/g, '_');
	
	return 1;
}

vipg.resetNewEditor = function() {
	var f = fields.getAll(this.newEditor);
	f[0].checked = 1;
	f[1].value = '';
	f[2].value = '';
	f[3].checked = 0;
	f[4].value = '';
	ferror.clearAll(fields.getAll(this.newEditor));
}

vipg.setup = function() {
	this.init('vip-grid', 'move', 50, [
		{ type: 'checkbox' },
		{ type: 'text', maxlen: 15 },
		{ type: 'text', maxlen: 15 },
		{ type: 'checkbox' },
		{ type: 'text', maxlen: 128 }]);
	this.headerSet([ui.enable, fw.virtual_ip, fw.real_ip, fw.log, ui.desc]);
	this.showNewEditor();
	this.resetNewEditor();
}
///////////////////////////////////////////////////////////////////////////
var sg = new webGrid();

sg.exist = function(f, v)
{
	var data = this.getAllData();
	for (var i = 0; i < data.length; ++i) {
		if (data[i][f] == v) return true;
	}
	return false;
}

sg.existMAC = function(mac)
{
	if (mac == "00:00:00:00:00:00") return false;
	return this.exist(0, mac);
}

sg.existName = function(name)
{
	return this.exist(2, name);
}

sg.inStatic = function(n)
{
	return this.exist(1, n);
}
/*
sg.inDynamic = function(n)
{
	return (n >= (nvram.dhcpd_start * 1)) && (n < ((nvram.dhcpd_start * 1) + (nvram.dhcpd_num * 1)));
}
*/
sg.dataToView = function(data) {
//	return [data[0], (data[1].indexOf('.') == -1) ? (ipp + data[1]) : data[1], data[2]];
	return [data[0], data[1], data[2]];
}

sg.sortCompare = function(a, b) {
	var da = a.getRowData();
	var db = b.getRowData();
	var r = 0;
	switch (this.sortColumn) {
	case 0:
		r = cmpText(da[0], db[0]);
		break;
	case 1:
		r = cmpInt(da[1], db[1]);
		break;
	}
	if (r == 0) r = cmpText(da[2], db[2]);
	return this.sortAscending ? r : -r;
}

sg.verifyFields = function(row, quiet)
{
	var ok = 1;
	var f = fields.getAll(row);
	var s;
	
	quiet = 0;

	if (v_macz(f[0], quiet)) {
		if (this.existMAC(f[0].value)) {
			ferror.set(f[0], errmsg.bad_name2, quiet);
			ok = 0;
		}
	}
	else ok = 0;

	if (!v_ip(f[1])) ok = 0;
	else{
		if (!v_ip_in_net(f[1], _type_info.lan0_ip, _type_info.lan0_netmask)
				&& !v_ip_in_mip(f[1], _type_info.lan0_mip)){
					ok = 0;
		}
	}

	s = f[2].value.trim().replace(/\s+/g, ' ');
	if (s.length > 0) {
		if (s.search(/^[.a-zA-Z0-9_\- ]+$/) == -1) {
			ferror.set(f[2], errmsg.bad_name, quiet);
			ok = 0;
		}
	}
	
	s = f[0].value.trim().replace(/\s+/g, ' ');
	if (s.length > 0) {
		if (this.existName(s)) {
			ferror.set(f[0], errmsg.bad_name2, quiet);
			ok = 0;
		}
		if (ok) f[0].value = s;
	}else{
		ferror.set(f[0], errmsg.bad_name3, quiet);
		ok = 0;
	}

	if (ok) {
		if (f[0].value == '00:00:00:00:00:00') {
			s = errmsg.bad_name3;
			ferror.set(f[0], s, 1);
			ferror.set(f[0], s, quiet);
			ok = 0;
		}
	}

	return ok;
}

sg.resetNewEditor = function() {
	var f, c;

	f = fields.getAll(this.newEditor);
	ferror.clearAll(f);
	
	if ((c = cookie.get('addstatic')) != null) {
		cookie.set('addstatic', '', 0);
		c = c.split(',');
		if (c.length == 3) {
			f[0].value = c[0];
			f[1].value = c[1];
			f[2].value = c[2];
			return;
		}
	}

	f[0].value = '00:00:00:00:00:00';
	f[1].value = '';
	f[2].value = '';

	var data = sg.getAllData();
	
	if (data.length)
		f[1].value = ip_increase(data[data.length-1][1], 1);
	else
		f[1].value = ip_increase(_type_info.lan0_ip, 1);	
}

sg.setup = function()
{
	this.init('bs-grid', ['sort', 'move'], 20,
		[{ type: 'text', maxlen: 17 }, { type: 'text', maxlen: 15 }, { type: 'text', maxlen: 32 }]);
	this.headerSet([ui.mac, ui.ip, ui.desc]);
	this.sort(2);
	this.showNewEditor();
	this.resetNewEditor();
}
///////////////////////////////////////////////////////////////////////////
var gre = new webGrid();

gre.exist = function(f, v)
{
	var data = this.getAllData();
	for (var i = 0; i < data.length; ++i) {
		if (data[i][f] == v) return true;
	}
	return false;
}

gre.existName = function(name)
{
	return this.exist(1, name);
}

gre.dataToView = function(data) {
	return [(data[0] != '0') ? ui.yes : ui.no, data[1], data[2], data[3], data[4], data[5], data[6], data[7],
	(data[8] != '0') ? ui.yes : ui.no, data[9]];
}

gre.fieldValuesToData = function(row) {
	var f = fields.getAll(row);
	return [f[0].checked ? 1 : 0, f[1].value, f[2].value, f[3].value, f[4].value, f[5].value, f[6].value, f[7].value, 
				  f[8].checked ? 1 : 0, f[9].value];
}

gre.verifyFields = function(row, quiet) {
	if (quiet) return 1;
	
	var f = fields.getAll(row);
	
	f[1].value = f[1].value.replace(';', '_');
	f[1].value = f[1].value.replace(',', '_');	
	if (this.existName(f[1].value)) {
		ferror.set(f[1], errmsg.bad_name4, quiet);
		return 0;
	}
	
	if (f[7].value!='') {
		if (!v_ip(f[7], 1) && !v_range(f[7], 1, 0, 4294967295)) {
			ferror.set(f[7], errmsg.bad_gre_key, quiet);
			return 0;
		}
		ferror.clear(f[7]);
	}	
	f[9].value = f[9].value.replace(';', '_');
	
	return v_ipnz(f[2], quiet) && v_ipnz(f[3], quiet) && v_ipnz(f[4], quiet) 
			&& v_ip(f[5], quiet) && v_netmask(f[6], quiet);
}

gre.resetNewEditor = function() {
	var f, c;

	f = fields.getAll(this.newEditor);
	ferror.clearAll(f);
	
	f[0].checked = 1;
	f[1].value = 'tun' + this.getAllData().length;
	
	var data = gre.getAllData();
	
	if (data.length){
		f[2].value = ip_increase(data[data.length-1][2], 1);
		f[3].value = ip_increase(data[data.length-1][3], 1);
		f[4].value = ip_increase(data[data.length-1][4], 1);
		f[5].value = net_increase(data[data.length-1][5], data[data.length-1][6]);
//		f[5].value = data[data.length-1][5]; //remote net
		f[6].value = data[data.length-1][6]; //remote mask
		f[7].value = data[data.length-1][7]; 				//key
		f[8].checked = data[data.length-1][8]=='0' ? 0 : 1;
	}else{
		f[2].value = '0.0.0.0'; //local vip
		f[3].value = '0.0.0.0'; //peer
		f[4].value = '0.0.0.0'; //remote vip
		f[5].value = '0.0.0.0'; //remote net
		f[6].value = '255.255.255.0'; //remote mask
		f[7].value = ''; 				//key
		f[8].checked = 0;
	}
		
	f[9].value = '';
}

gre.setup = function() {
	this.init('gre-grid', 'move', 100, [
		{ type: 'checkbox' }, 
		{ type: 'text', maxlen: 8 }, 
		{ type: 'text', maxlen: 15 },	
		{ type: 'text', maxlen: 15 },	
		{ type: 'text', maxlen: 15 },	
		{ type: 'text', maxlen: 15 }, 
		{ type: 'text', maxlen: 15 }, 
		{ type: 'text', maxlen: 15 }, 
		{ type: 'checkbox' }, 
		{ type: 'text', maxlen: 32 }]);
	this.headerSet([ui.enable, ui.nam, 
	  gre_tun.local_vip, ui.peer, gre_tun.remote_vip, ipsec.dst_net, ipsec.dst_mask, 
		ipsec.auth_key, 'NAT', ui.desc]);
	this.showNewEditor();
	this.resetNewEditor();
}
///////////////////////////////////////////////////////////////////////////
var _ipsec_tunnels = [];
var _ipsec_tunnel_idx = -1;
var ipsecg = new webGrid();

ipsecg.dataToView = function(data) {
	return data;
}

ipsecg.verifyFields = function(row, quiet) {
	return 1;
}

//ipsecg.onClick = function(cell) {
//	alert("click " + cell + ' ' + PR(cell).getRowData()[1]);
	
//	E('_ipsec_tunnel_name').value = PR(cell).getRowData()[1];
//	E('_ipsec_tunnel_action').value = 'edit';
//	E('_fom').submit();
//	form.submit('_fom', 0);
//}


ipsecg.setup = function() {
	this.init('ipsec-grid', ['readonly'], 4, [
		{ type: 'text', maxlen: 8 }, 
		{ type: 'text', maxlen: 64 }, 
		{ type: 'text', maxlen: 256 }, 
		{ type: 'text', maxlen: 64 }, 
		{ type: 'text', maxlen: 64 }, 
		{ type: 'text', maxlen: 64 },
		{ type: 'text', maxlen: 64 }
		]);
	this.headerSet([' ', ui.nam, ipsec.tunnel_desc, ipsec.p1, ipsec.p2, ipsec.detection, '']);	
	r = ipsecg.footerSet(['','<input type="button" value="' + ui.add + '" onclick="TGO(this).addEntry()" id="ipsec-add">', '', '', '', '']);
}
ipsecg.updateEntries = function(ipsec_tunnels){
	var i, r, x;
	var n = 0;			
	var v = ipsec_tunnels.split(';');
	var tunnels = [];
	
	ipsecg.removeAllData();
	n = 0;
	for (i = 0; i < v.length; ++i) {		
		if (r = v[i].split(',')) {
			if (r[0]=='') continue;
			tunnels[n] = r;

			var k = 0;
			
			tunnel_name = tunnels[n][k++];
			tunnel_iface = tunnels[n][k++];
			tunnel_dst = tunnels[n][k++];
			tunnel_startup_mode = tunnels[n][k++];
			tunnel_neg_mode = tunnels[n][k++];
			tunnel_ipsec_proto = tunnels[n][k++];
			tunnel_ipsec_mode = tunnels[n][k++];
			tunnel_type = tunnels[n][k++];
			tunnel_src_net = tunnels[n][k++];
			tunnel_src_mask = tunnels[n][k++];
			tunnel_dst_net = tunnels[n][k++];
			tunnel_dst_mask = tunnels[n][k++];
			tunnel_ike_policy = tunnels[n][k++];
			tunnel_ike_lifetime = tunnels[n][k++];
			tunnel_src_id_type = tunnels[n][k++];
			tunnel_src_id = tunnels[n][k++];
			tunnel_dst_id_type = tunnels[n][k++];
			tunnel_dst_id = tunnels[n][k++];
			tunnel_auth_type = tunnels[n][k++];
			tunnel_auth_key = tunnels[n][k++];
			tunnel_ipsec_policy = tunnels[n][k++];
			tunnel_ipsec_lifetime = tunnels[n][k++];
			tunnel_pfs = tunnels[n][k++];

			tunnel_dpd_interval = tunnels[n][k++];
			tunnel_dpd_timeout = tunnels[n][k++];			
			tunnel_icmp_host = tunnels[n][k++];
			tunnel_icmp_interval = tunnels[n][k++];
			tunnel_icmp_timeout = tunnels[n][k++];
			tunnel_icmp_retries = tunnels[n][k++];	
					
			if (k < tunnels[i].length) tunnel_restart_wan = tunnels[i][k++];			
			else tunnel_restart_wan = 'N';
				
			if (k < tunnels[i].length) tunnel_icmp_local = tunnels[i][k++];			
			else tunnel_icmp_local = '';
				
			if (k < tunnels[i].length) tunnel_others = tunnels[i][k++];			
			else tunnel_others = '';

			tunnel_desc = "";
			tunnel_p1 = ipsec.auth_type + ": " + ipsec_auth_types[tunnel_auth_type * 1][1] + "<br>"
									+ ipsec.policy + ": " + tunnel_ike_policy + "<br>"
									+ ipsec.lifetime + ": " + tunnel_ike_lifetime + ui.seconds + "<br>"
									+ (ipsec_tunnel_pfs=='1' ? ui.enable : ui.disable) + ui.sep + ipsec.pfs;
			tunnel_p2 = ipsec.policy + ": " + tunnel_ipsec_policy + "<br>"
									+ ipsec.lifetime + ": " + tunnel_ipsec_lifetime + ui.seconds + "<br>";
			
			if(tunnel_dpd_interval=='0' || tunnel_dpd_interval==''){
				tunnel_detection = ui.disable + " DPD" + "<br>";
			}else{
				tunnel_detection = ui.enable + " DPD" + ", " + ui.interval + ": " + tunnel_dpd_interval + ui.seconds + ", " 
					+ ui.timeout + ": " + tunnel_dpd_timeout + ui.seconds + "<br>";
			}
			
			if(tunnel_icmp_host==''){
				tunnel_detection += ui.disable + " " + ui.icmp_detect;
			}else{
				tunnel_detection += ui.icmp_host + ": " + tunnel_icmp_host + ", "
					+ ui.interval + ": " + tunnel_icmp_interval + ui.seconds + ", " 
					+ ui.timeout + ": " + tunnel_icmp_timeout + ui.seconds + ", "
					+ ui.retry + ": " + tunnel_icmp_retries + "<br>";
			}

			if(tunnel_type!='0' && tunnel_type!='1'){
				tunnel_desc += tunnel_src_net + "/" + tunnel_src_mask;
				tunnel_desc += "===";
			}
			
			tunnel_desc += "router";
			
			if(tunnel_src_id_type!="0" && tunnel_src_id){
				tunnel_desc += "[" + tunnel_src_id + "]";
			}else{
				tunnel_desc += "";
			}
			
			tunnel_desc += "..." + tunnel_dst;
			
			if(tunnel_dst_id_type!="0" && tunnel_dst_id){
				tunnel_desc += "[" + tunnel_dst_id + "]";
			}
			
			if(tunnel_type!='0' && tunnel_type!='2'){
				tunnel_desc += "===";
				tunnel_desc += tunnel_dst_net + "/" + tunnel_dst_mask;
			}
			tunnel_desc += "<br>";
				
			tunnel_desc += ipsec_ipsec_protos[tunnel_ipsec_proto * 1][1];
			tunnel_desc += '; ' + ipsec_ipsec_modes[tunnel_ipsec_mode * 1][1];
			tunnel_desc += '; ' + ipsec_neg_modes[tunnel_neg_mode * 1][1];
			tunnel_desc += '; ' + ipsec_startup_modes[tunnel_startup_mode * 1][1];
			
		  tunnel_op = "<input type='button' style='width:60px' value='" + ui.edit + "' id='ipsec-edit' onclick='TGO(this).editEntry(\"" + tunnel_name + "\")'/>";
		  tunnel_op += "<input type='button' style='width:60px' value='" + ui.del + "' id='ipsec-delete' onclick='TGO(this).removeEntry(\"" + tunnel_name + "\")'/>";
			ipsecg.insertData(-1, ['', tunnel_name, tunnel_desc, tunnel_p1, tunnel_p2, tunnel_detection, tunnel_op]);
			
			n++;
		}
	}
	
	_ipsec_tunnels = tunnels;
	E('ipsec-add').disabled = (n>=4);
}

ipsecg.saveData = function(name) {
	var s = "";
	for (i=0; i<_ipsec_tunnels.length; i++){
		if (_ipsec_tunnels[i][0]==name) continue;
		s += _ipsec_tunnels[i].join(',');
		s += ';';
	}
	return s;
}

ipsecg.addEntry = function() {
	E('ipsec-edit-section').children[0].innerHTML = ui.add + ' ' + menu.ipsec_tunnels;
	elem.display('ipsec-edit-section', true);
	_ipsec_tunnel_idx = -1;
	updateIPSecTunnel('IPSec_tunnel_' + (this.getAllData().length+1), []);
	verifyIPSecTunnel(null, 1);
}

ipsecg.editEntry = function(name) {
	E('ipsec-edit-section').children[0].innerHTML = ui.edit + ' ' + menu.ipsec_tunnels;
	elem.display('ipsec-edit-section', true);
	_ipsec_tunnel_idx = -1;
	for (i=0; i<_ipsec_tunnels.length; i++){
		if (_ipsec_tunnels[i][0]==name) {
			_ipsec_tunnel_idx = i;
			break;
		}
	}
	updateIPSecTunnel(name, _ipsec_tunnels[i]);
	verifyIPSecTunnel(null, 1);
}

ipsecg.removeEntry = function(name){
	if (!confirm(ipsec.confm_del)) return;
	
	this.updateEntries(this.saveData(name));
}
///////////////////////////////////////////////////////////////////////////

//å¨æå®çä½ç½®åå»ºææéç½®é¡¹ç®
function createPage()
{	
	W("<table><tr><td width='20%' valign='top'>");
	W("<div id='menu-area'>");
	
	groupBegin('system', menu.system); //列表-系统 

	subGroup('setup_system', menu.setup_system,  //列表-系统-基本设置 
		createFieldTableBuf('', [
			{ title: ui.langu, name: 'language', type: 'select', options: 
				[['auto', 'Auto (' + ui.auto + ')'],['English','English'],['Chinese',ui.zh]],
				value: 'auto'},
			{ title: ui.timezone, name: 'tzone', type: 'select', options: [
				['custom',ui.custom],	
				['UTC12','UTC-12:00 ' + tm.utc_n12],
				['UTC11','UTC-11:00 ' + tm.utc_n11],
				['UTC10','UTC-10:00 ' + tm.utc_n10],
				['NAST9NADT,M3.2.0/2,M11.1.0/2','UTC-09:00 ' + tm.utc_n9],
				['PST8PDT,M3.2.0/2,M11.1.0/2','UTC-08:00 ' + tm.utc_n8],
				['UTC7','UTC-07:00 ' + tm.utc_n7],
				['MST7MDT,M3.2.0/2,M11.1.0/2','UTC-07:00 ' + tm.utc_n7_2],
				['UTC6','UTC-06:00 ' + tm.utc_n6],
				['CST6CDT,M3.2.0/2,M11.1.0/2','UTC-06:00 ' + tm.utc_n6_2],		
				['UTC5','UTC-05:00 ' + tm.utc_n5],
				['EST5EDT,M3.2.0/2,M11.1.0/2','UTC-05:00 ' + tm.utc_n5_2],
				['UTC4','UTC-04:00 ' + tm.utc_n4],
				['AST4ADT,M3.2.0/2,M11.1.0/2','UTC-04:00 ' + tm.utc_n4_2],
				['BRWST4BRWDT,M10.3.0/0,M2.5.0/0','UTC-04:00 ' + tm.utc_n4_3],
				['NST3:30NDT,M3.2.0/0:01,M11.1.0/0:01','UTC-03:30 ' + tm.utc_n3_30],
				['WGST3WGDT,M3.5.6/22,M10.5.6/23','UTC-03:00 ' + tm.utc_n3],
				['BRST3BRDT,M10.3.0/0,M2.5.0/0','UTC-03:00 ' + tm.utc_n3_2],
				['UTC3','UTC-03:00 ' + tm.utc_n3_3],
				['UTC2','UTC-02:00 ' + tm.utc_n2],
				['STD1DST,M3.5.0/2,M10.5.0/2','UTC-01:00 ' + tm.utc_n1],
				['UTC0','UTC+00:00 ' + tm.utc_0],
				['GMT0BST,M3.5.0/2,M10.5.0/2','UTC+00:00 ' + tm.utc_0_2],
				['UTC-1','UTC+01:00 ' + tm.utc_p1],
				['STD-1DST,M3.5.0/2,M10.5.0/2','UTC+01:00 ' + tm.utc_p1_2],
				['UTC-2','UTC+02:00 ' + tm.utc_p2],
				['STD-2DST,M3.5.0/2,M10.5.0/2','UTC+02:00 ' + tm.utc_p2_2],
				['UTC-3','UTC+03:00 ' + tm.utc_p3],
				['EET-2EEST-3,M3.5.0/3,M10.5.0/4','UTC+03:00 ' + tm.utc_p3_2],
				['UTC-4','UTC+04:00 ' + tm.utc_p4],
				['UTC-5','UTC+05:00 ' + tm.utc_p5],
				['UTC-5:30','UTC+05:30 ' + tm.utc_p5_30],
				['UTC-6','UTC+06:00 ' + tm.utc_p6],
				['UTC-7','UTC+07:00 ' + tm.utc_p7],
				['UTC-8','UTC+08:00 ' + tm.utc_p8],
				['UTC-9','UTC+09:00 ' + tm.utc_p9],
				['CST-9:30CST,M10.5.0/2,M3.5.0/3', 'UTC+09:30 ' + tm.utc_p9_30],
				['UTC-10','UTC+10:00 ' + tm.utc_p10],
				['STD-10DST,M10.5.0/2,M3.5.0/2','UTC+10:00 ' + tm.utc_p10_2],
				['UTC-11','UTC+11:00 ' + tm.utc_p11],
				['UTC-12','UTC+12:00 ' + tm.utc_p12],
				['STD-12DST,M10.5.0/2,M3.5.0/2','UTC+12:00 ' + tm.utc_p12_2]
			], value: 'custom' },
			{ title: ui.hname, name: 'hostname', type: 'text', maxlen: 32, size: 34, value: '' }
		])
	);

    subGroup('fw_acl', menu.fw_acl,  //列表-系统-访问控制
		createFieldTableBuf('', [
			{ title: fw.telnet_form, indent: 2, multi: [
			    { name: 'f_telnet_on', type: 'checkbox', value: 0 } ]},
			{ title: fw.telnet_m_port, name: 'telnet_port', type: 'text', maxlen: 32, size: 17},	
			{ title: fw.telnet_wan_m, indent: 2, multi: [
			    { name: 'f_telnet_from_wan', type: 'checkbox', value: 0 } ]},
			{ title: fw.alow_web_m, indent: 2, multi: [
				{ name: 'f_web_on', type: 'checkbox', value: 0 } ]},
			{ title: fw.web_m_port, name: 'web_port', type: 'text', maxlen: 32, size: 17},
			{ title: fw.alow_wan_m, indent: 2, multi: [
				{ name: 'f_web_from_wan', type: 'checkbox', value: 0 } ]}
		])
    );
	
	subGroup('admin_log', menu.admin_log,   //列表-系统-远程日志服务器
		createFieldTableBuf('', [
            { title: menu.admin_log_add, name: 'log_server_host', type: 'text', maxlen: 32, size: 17}
		])
	);

	groupEnd('system');  //列表-系统-结束

	groupBegin('network', menu.network); //列表-网络
	
	subGroup('setup_lan0', menu.setup_lan0,  //列表-网络-LAN设置
		createFieldTableBuf('', [
			{ title: ui.ip, name: 'local_ip', type: 'text', maxlen: 15, size: 17},
			{ title: ui.netmask, name: 'local_mask', type: 'text', maxlen: 15, size: 17}
		])
	);
	
	subGroup('setup_dns', menu.setup_dns,  //列表-网络-DNS设置(域名服务器)
		createFieldTableBuf('', [
			{ title: ui.dns1, name: 'dns1', type: 'text', maxlen: 15, size: 17},
			{ title: ui.dns2, name: 'dns2', type: 'text', maxlen: 15, size: 17}
		])
	);
	
		subGroup('setup_wan1', menu.setup_wan1,  //列表-网络-拨号设置
		createFieldTableBuf('', [
			{ title: menu.ac_num, name: 'modem_phone', type: 'text', maxlen: 15, size: 17},
			{ title: menu.ac_ID, name: 'modem_account', type: 'text', maxlen: 15, size: 17},
			{ title: menu.ac_pass ,name: 'modem_password', type: 'password', maxlen: 15, size: 17},
			{ title: menu.APN, name: 'modem_APN', type: 'text', maxlen: 15, size: 17},                                       
			{ title: menu.con_che_t, name: 'modem_detect_interval', type: 'text', maxlen: 15, size: 17},
			{ title: menu.con_che_maxfaile, name: 'modem_max_failure', type: 'text', maxlen: 15, size: 17},
			{ title: menu.max_rebo, name: 'modem_max_retry', type: 'text', maxlen: 15, size: 17},
			{ title: menu.keep_con_server, name: 'heartBeat_host', type: 'text', maxlen: 15, size: 17},
			{ title: menu.keep_con_inte, name: 'heartBeat_interval', type: 'text', maxlen: 15, size: 17},
			{ title: menu.keep_con_timeout, name: 'heartBeat_timeout', type: 'text', maxlen: 15, size: 17},
			{ title: menu.keep_con_maxfail, name: 'heartBeat_retries', type: 'text', maxlen: 15, size: 17}
		])
	);
	groupEnd('network');  //列表-网络-结束


    groupBegin('fw', menu.fw); //列表-防火墙
    
	subGroup('fw_dmz', menu.fw_dmz, //列表-防火墙-DMZ设置
		createFieldTableBuf('', [
		{ title: menu.dmz_server, name: 'fw_vserver', type: 'text', maxlen: 15, size: 17}
		])
	);
	groupEnd('fw'); //列表-防火墙-结束


	groupBegin('services', menu.services); //列表-服务 
	subGroup('service_ovdp', menu.service_ovdp,  //列表-服务-网管平台(DeviceManager) 
		createFieldTableBuf('', [
			{ title: ui.sn, name: 'inhand_serialnum', type: 'text', maxlen: 15, size: 32},                                                       
			{ title: ovdp.start_on, name: 'on', type: 'select', options: [
				['Y',"YES"],['N',"NO"]]},
			//{ title: ovdp.vender_id, name: 'vendor_id', type: 'text', maxlen: 10, size: 32},
			{ title: ovdp.vendor, name: 'vendor_id', type: 'select', options: [
				['0003',ui.deflt],['0004',"GJJ"]]},	
			{ title: ovdp.device_id, name: 'device_id', type: 'text', maxlen: 15, size: 32},
			{ title: ui.server, name: 'center_ip', type: 'text', maxlen: 128, size: 20},
			{ title: ui.prt, name: 'center_port', type: 'text', maxlen: 10, size: 10}
			//{ title: ovdp.trust_list, name: 'ovdp_trust_list', type: 'text', maxlen: 128, size: 60}
		])
	);
	groupEnd('services'); //列表-防火墙-结束
	
	
	W("</div>");
	
	W("</td><td  width='80%' valign='top'>");
	
	W("<div id='show-area'>" + subGroups + "</div>");
	subGroups = "";

	W("</td></tr></table>");
	
	//æ¾ç¤ºé»è®¤é¡µé¢
	showSubGroup('setup_system', 0); // 登录进来首页
   /*	
	if (_type_info.model>=700 && _type_info.model < 800) elem.display('title-ddns-wan-0', 'ddns-wan-0', false);
	else elem.display('title-ddns-wan-1', 'ddns-wan-1', false);
	*/
	/////////////////////////////////////////////////////
	/*if (_type_info.model>=700){
		ifaces = [['lan0','LAN']];
	}else{
		ifaces = [['lan0','LAN'],['wan0','WAN']];
	}*/
	
	

	//route.setup();
	//aclg.setup();
	//pmg.setup();
	//vipg.setup();
	//sg.setup();
	//mip.setup();
	//gre.setup();
	//ipsecg.setup();
	
	//elem.display('ipsec-edit-section', false);
	
	toggleGroup('network');
	toggleGroup('fw');
	toggleGroup('services');
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
function verifyFields(focused, quiet) //校验
{
	if(!E('setup_system_enable').checked&&!E('fw_acl_enable').checked&&!E('admin_log_enable').checked&&!E('setup_lan0_enable').checked&&!E('setup_dns_enable').checked&&
		!E('setup_wan1_enable').checked&&!E('fw_dmz_enable').checked&&!E('service_ovdp_enable').checked){
		return -1;
	}
	var ok = 1;
	var current_group = groupShow;
	if (focused) quiet = 2;
	//在最后的savepage()中 参数传来的 focused 是null 则 quiet 
	//////////////////////////////////////////////////
	//verify system basic settings	
	//1
	if (quiet || E('setup_system_enable').checked) {
		showSubGroup('setup_system', 0);
		if (_single_mode){
			ok = v_length('_hostname', quiet, 1, 32);		
		}
		if (!ok && quiet!=2) {
			return 0;
		}
	}
	
	//////////////////////////////////////////////////
	//verify fw_acl settings	
	//2
	if (quiet || E('fw_acl_enable').checked) {
		showSubGroup('fw_acl', 0);
		if (_single_mode){
			if (!v_port('_telnet_port', quiet)) ok = 0;
			if (!v_port('_web_port', quiet)) ok = 0;
		}
	}	
	
	//////////////////////////////////////////////////
	//verify admin_log settings	
	//3
	if (quiet || E('admin_log_enable').checked) {
		showSubGroup('admin_log', 0);
		a = ['_log_server_host'];
		for (i = a.length - 1; i >= 0; --i){
			if (!v_ipz(a[i], quiet)) ok = 0;
		}
		if (!ok && quiet!=2) {		
			return 0;
		}
	}  	
	
	//////////////////////////////////////////////////
	//verify setup_lan0 settings	
	//4
	if (quiet || E('setup_lan0_enable').checked) {
		showSubGroup('setup_lan0', 0);
		a = ['_local_ip','_local_mask'];
		for (i = a.length - 1; i >= 0; --i){
			if (!v_ipz(a[i], quiet)) ok = 0;
		}
		if (!ok && quiet!=2) {		
			return 0;
		}
	}  	
	
	//////////////////////////////////////////////////
	//verify setup_lan0 settings	
	//5
	if (quiet || E('setup_dns_enable').checked) {
		showSubGroup('setup_dns', 0);
		a = ['_dns1','_dns2'];
		for (i = a.length - 1; i >= 0; --i){
			if (!v_ipz(a[i], quiet))
			{
				ok = 0;
			} 
		}
	} 	
	
	
	/////////////////////////////////////////////////////////////////////////
	//verify setup_wan1 settings	
	//6
	if (quiet || E('setup_wan1_enable').checked) {
		showSubGroup('setup_wan1', 0);	
		// --- verify ---	
						
			if (!v_range('_modem_detect_interval', quiet, 0, 9999)){
					elem.display2(('_modem_detect_interval'), 1);	
					ok = 0;
			}
	
			if (!v_range('_modem_max_failure', quiet, 1, 9999)){
					elem.display2(('_modem_max_failure'), 1);	
					ok = 0;
			}
			
			if (!v_range('_modem_max_retry', quiet, 1, 99999)){
					elem.display2(('_modem_max_retry'), 1);	
					ok = 0;
			}
	/*
			if (!v_range('_heartBeat_host', quiet, 1, 99999)){
					elem.display2(('_heartBeat_host'), 1);	
					ok = 0;
			}
			
			if (!v_range('_heartBeat_interval', quiet, 1, 99999)){
					elem.display2(('_heartBeat_interval'), 1);	
					ok = 0;
			}
			
			if (!v_range('_heartBeat_timeout', quiet, 1, 99999)){
					elem.display2(('_heartBeat_timeout'), 1);	
					ok = 0;
			}
			
			if (!v_range('_heartBeat_retries', quiet, 1, 99999)){
					elem.display2(('_heartBeat_retries'), 1);	
					ok = 0;
			}
			*/
		
		}
		
	//////////////////////////////////////////////////
	//verify fw_dmz settings	
	//7
	if (quiet || E('fw_dmz_enable').checked) {
		showSubGroup('fw_dmz', 0);
		a = ['_fw_vserver'];
		for (i = a.length - 1; i >= 0; --i){
			if (!v_ipz(a[i], quiet)) ok = 0;
		}
		if (!ok && quiet!=2) {	
			return 0;
		}
	} 	

	//////////////////////////////////////////////////
	//verify fw_dmz settings	
	//8
	if (quiet || E('service_ovdp_enable').checked) {
		showSubGroup('service_ovdp', 0);
		a = ['_center_ip'];
		for (i = a.length - 1; i >= 0; --i){
			if (!v_ipz(a[i], quiet)) ok = 0;
		}
		   if (!v_port('_center_port', quiet)) ok = 0;		
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
//system
	_setup_system_enable: '0',
	_fw_acl_enable: '0',
	_admin_log_enable: '0',
	
//network	
	_setup_lan0_enable: '0',
	_setup_dns_enable: '0',
	_setup_wan1_enable: '0',

//fw
   _fw_dmz_enable: '0',
	
//services   	
  _service_ovdp_enable: '0',
			
			
	language: "Chinese",
	tzone: "custom",
	hostname: "MyRouter",

    telnet_on: 'N',
    telnet_port: '80',
    telnet_from_wan: 'N',
   	web_on: 'N',
    web_port: '80',
    web_from_wan: 'N',
    
    log_server_host: '192.168.1.200',
    
    local_ip: '192.168.2.1',
    local_mask: '255.255.255.0',
    
    dns1: '0.0.0.0',
    dns2: '0.0.0.0',
    
    modem_phone: '',
    modem_account: '',
    modem_password: '',
    modem_APN: '',
    modem_detect_interval: '55',
    modem_max_failure: '3',
    modem_max_retry: '5',
    heartBeat_host: '',
    heartBeat_interval: '',
    heartBeat_timeout: '',
    heartBeat_retries: '',
    
    fw_vserver: '0.0.0.0',
    
    inhand_serialnum: '',
    on: 'Y',
    vendor_id: '0003',
    device_id: '',
    center_ip: '203.86.43.186',
    center_port: '9000'
   // ovdp_trust_list: ''
};

function V(t)
{
	if (typeof(t)=='undefined') return 0;
	return 1;
}

function S(x, t) //t value -->_x
{
	if (typeof(t)=='undefined') return;
	
	E('_' + x).value = t;
}

function C(x, t)
{
	
	if (typeof(t)=='undefined') return;
	
	E('_f_' + x).checked = (t=='1') ? 1 : 0;
}

function C_check(x, t)
{
	
	if (typeof(t)=='undefined') return;
	
	E('_f_' + x).checked = (t=='Y'||t=='y') ? 1 : 0;
}

function C2(x, t, v)
{
	if (typeof(t)=='undefined') return;
	
	E('_f_' + x).checked = (t==v) ? 1 : 0;
}

function C3(x, t) //每个子项
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
    C3('setup_system_enable', scheme._setup_system_enable);
        S('language', scheme.language);
        S('tzone', scheme.tzone);
        S('hostname', scheme.hostname);
    C3('fw_acl_enable', scheme._fw_acl_enable);
        C_check('telnet_on', scheme.telnet_on);
        S('telnet_port', scheme.telnet_port);
        C_check('telnet_from_wan', scheme.telnet_from_wan);
        C_check('web_on', scheme.web_on);
        S('web_port', scheme.web_port);
        C_check('web_from_wan', scheme.web_from_wan);
    C3('admin_log_enable', scheme._admin_log_enable);
        S('log_server_host', scheme.log_server_host);
    C3('setup_lan0_enable', scheme._setup_lan0_enable);
        S('local_ip', scheme.local_ip);
        S('local_mask', scheme.local_mask);
    C3('setup_dns_enable', scheme._setup_dns_enable);
        S('dns1', scheme.dns1);
        S('dns2', scheme.dns2);
    C3('setup_wan1_enable', scheme._setup_wan1_enable);	
        S('modem_phone', scheme.modem_phone);
        S('modem_account', scheme.modem_account);
        S('modem_password', scheme.modem_password);
        S('modem_APN', scheme.modem_APN);
        S('modem_detect_interval', scheme.modem_detect_interval);
        S('modem_max_failure', scheme.modem_max_failure);
        S('modem_max_retry', scheme.modem_max_retry);
        S('heartBeat_host', scheme.heartBeat_host);
        S('heartBeat_interval', scheme.heartBeat_interval);
        S('heartBeat_timeout', scheme.heartBeat_timeout);
        S('heartBeat_retries', scheme.heartBeat_retries);
    C3('fw_dmz_enable', scheme._fw_dmz_enable);	
        S('fw_vserver', scheme.fw_vserver);
    C3('service_ovdp_enable', scheme._service_ovdp_enable);	
	    S('inhand_serialnum', scheme.inhand_serialnum);
	    S('on', scheme.on);
	    S('vendor_id', scheme.vendor_id);
	    S('device_id', scheme.device_id);
	    S('center_ip', scheme.center_ip);
	    S('center_port', scheme.center_port);
	    //S('ovdp_trust_list', scheme.ovdp_trust_list);
	verifyFields(null, 1);
	findChild(scheme);
}

function findChild(scheme){
    if(scheme._setup_system_enable == 1 | scheme._setup_time_enable==1 | scheme._setup_com_enable==1 | scheme._admin_access_enable==1 | scheme._admin_log_enable==1){
       E('system_enable').checked=1;
    }
    if(scheme._setup_wan1_enable == 1 | scheme._setup_lan0_enable== 1 | scheme._setup_dns_enable==1 | scheme._setup_ddns_enable==1 | scheme._routes_static_enable==1){
       E('network_enable').checked=1;
    }
    if(scheme._service_ovdp_enable == 1 | scheme._service_dtu_enable == 1){
       E('services_enable').checked=1;
    }
    if(scheme._fw_basic_enable == 1 | scheme._fw_acl_enable==1 | scheme._fw_portmap_enable==1 | scheme._fw_vip_enable == 1 | scheme._fw_dmz_enable == 1 | scheme._fw_mac_rules_enable == 1){
       E('fw_enable').checked=1;
    }
}


function updateIPSecTunnel(name, tunnel)
{
	var k = 1;
	var m = (_ipsec_tunnel_idx==-1);
	
	elem.enable('_ipsec_tunnel_name', m ? true : false);

	S('ipsec_tunnel_name', name);
	S('f_tunnel_iface', m ? '*' : tunnel[k++]);
	S('f_tunnel_dst', m ? '0.0.0.0' : tunnel[k++]);
	S('f_tunnel_startup_mode', m ? '0' : tunnel[k++]);
	S('f_tunnel_neg_mode', m ? '0' : tunnel[k++]);
	S('f_tunnel_ipsec_proto', m ? '0' : tunnel[k++]);
	S('f_tunnel_ipsec_mode', m ? '0' : tunnel[k++]);
	S('f_tunnel_type', m ? '3' : tunnel[k++]);
	S('f_tunnel_src_net', m ? _type_info.lan0_ip : tunnel[k++]);
	S('f_tunnel_src_mask', m ? _type_info.lan0_netmask : tunnel[k++]);
	S('f_tunnel_dst_net', m ? '0.0.0.0' : tunnel[k++]);
	S('f_tunnel_dst_mask', m ? '255.255.255.0' : tunnel[k++]);
	
	S('f_tunnel_ike_policy', m ? ike_default_policies[1][0] : tunnel[k++]);
	S('f_tunnel_ike_lifetime', m ? '86400' : tunnel[k++]);
	S('f_tunnel_src_id_type', m ? '0' : tunnel[k++]);
	S('f_tunnel_src_id', m ? '' : tunnel[k++]);
	S('f_tunnel_dst_id_type', m ? '0' : tunnel[k++]);
	S('f_tunnel_dst_id', m ? '' : tunnel[k++]);
	S('f_tunnel_auth_type', m ? '0' : tunnel[k++]);
	S('f_tunnel_auth_key', m ? '' : tunnel[k++]);
	
	S('f_tunnel_ipsec_policy', m ? ipsec_default_policies[0][0] : tunnel[k++]);
	S('f_tunnel_ipsec_lifetime', m ? '3600' : tunnel[k++]);
	S('f_tunnel_pfs', m ? '0' : tunnel[k++]);
	S('f_tunnel_dpd_interval', m ? '60' : tunnel[k++]);
	S('f_tunnel_dpd_timeout', m ? '180' : tunnel[k++]);
	S('f_tunnel_icmp_host', m ? '' : tunnel[k++]);
	S('f_tunnel_icmp_interval', m ? '60' : tunnel[k++]);
	S('f_tunnel_icmp_timeout', m ? '5' : tunnel[k++]);
	S('f_tunnel_icmp_retries', m ? '10' : tunnel[k++]);
	C('tunnel_restart_wan', m ? '0' : tunnel[k++]);
	S('f_tunnel_icmp_local', m ? '' : tunnel[k++]);
	S('f_tunnel_others', m ? '' : tunnel[k++]);
}

function v_ipsec_id(v, quiet)
{
	var id_type = E(v + '_type').value;
	var x = E(v).value;
	
	elem.display(PR(v), id_type!='0');
	
	if(id_type!='0'){
		ferror.clear(v);
		if(x=="@") E(v).value="";
		if(!v_length(v, quiet, 1, 64)){
			return 0;
		}else{
			if(id_type=='2'){//FQDN
				if(x.substr(0,1)!='@'){
					E(v).value = '@' + x;
				}
			}else{//User FQDN
				x = x.split('@');
				if(x.length!=2 || x[0]=='' || x[1]==''){
					ferror.set(v, errmsg.bad_ufqdn, quiet);
					return 0;
				}
			}
		}
	}
	
	return 1;
}

function verifyIPSecTunnel(focus, quiet)
{
	var ok = 1;
	var i;
	var a;
	var auth = E('_f_tunnel_auth_type').value;
	var advanced = E('_f_advanced').checked;
	var typ = E('_f_tunnel_type').value;
	var ipsec_mode = E('_f_tunnel_ipsec_mode').value;

	if (_ipsec_tunnel_idx==-1){
		for (i=0; i<_ipsec_tunnels.length; i++){
			if (_ipsec_tunnels[i][0]==E('_ipsec_tunnel_name').value){
				ferror.set('_ipsec_tunnel_name', ipsec.dup_name, quiet);
				ok = 0;
			}
		}
	}
	
	elem.display_and_enable(('_f_tunnel_auth_key'), auth=='0');
	
	if(ipsec_mode=='1'){//transport mode
		elem.display_and_enable(('_f_tunnel_type'), ('_f_tunnel_src_net'), ('_f_tunnel_src_mask'), ('_f_tunnel_dst_net'), ('_f_tunnel_dst_mask'), 0);
	}else{//tunnel mode
		elem.display_and_enable(('_f_tunnel_type'), ('_f_tunnel_src_net'), ('_f_tunnel_src_mask'), ('_f_tunnel_dst_net'), ('_f_tunnel_dst_mask'), 1);
		switch(typ){
			case '0':
					elem.display_and_enable(('_f_tunnel_src_net'), ('_f_tunnel_src_mask'), ('_f_tunnel_dst_net'), ('_f_tunnel_dst_mask'), 0);
					break;
			case '1':
				elem.display_and_enable(('_f_tunnel_src_net'), ('_f_tunnel_src_mask'), 0);
				break;
			case '2':
				elem.display_and_enable(('_f_tunnel_dst_net'), ('_f_tunnel_dst_mask'), 0);
				break;
		}
	}
	
	elem.display(
		//PR('_f_tunnel_restart_wan'), 
		PR('_f_tunnel_ipsec_proto'), 
		PR('_f_tunnel_ipsec_mode'), 
		PR('_f_tunnel_pfs'), 
		PR('_f_tunnel_dpd_interval'), 
		PR('_f_tunnel_dpd_timeout'), 
		PR('_f_tunnel_icmp_host'), 
		PR('_f_tunnel_icmp_local'), 
		PR('_f_tunnel_icmp_interval'), 
		PR('_f_tunnel_icmp_timeout'), 
		PR('_f_tunnel_icmp_retries'), 
		advanced);

	if(!v_ipsec_id('_f_tunnel_src_id', quiet)) ok = 0;
	if(!v_ipsec_id('_f_tunnel_dst_id', quiet)) ok = 0;
		
	//elem.display(PR('_f_tunnel_detection'), advanced);
	E('_f_tunnel_detection').style.display = advanced ? '' : 'none';
	

	if (E('_ipsec_tunnel_name').value==''){
		E('_ipsec_tunnel_name').value = 'IPSec_tunnel_' + (_ipsec_tunnels.length+1);
	}
	
	if (E('_f_tunnel_dst').value==''){
				
	}
	
	return ok;
}

function cancelIPSecEdit()
{
	_ipsec_tunnel_idx = -1;
	elem.display('ipsec-edit-section', false);
}

function saveIPSecTunnel()
{
	if (!verifyFields(null, false)) return;
	
	var tunnel = [
		E('_ipsec_tunnel_name').value,
		E('_f_tunnel_iface').value,
		E('_f_tunnel_dst').value,
		
		E('_f_tunnel_startup_mode').value,
		E('_f_tunnel_neg_mode').value,
		E('_f_tunnel_ipsec_proto').value,
		E('_f_tunnel_ipsec_mode').value,
		E('_f_tunnel_type').value,
		E('_f_tunnel_src_net').value,
		E('_f_tunnel_src_mask').value,
		E('_f_tunnel_dst_net').value,
		E('_f_tunnel_dst_mask').value,
		
		E('_f_tunnel_ike_policy').value,
		E('_f_tunnel_ike_lifetime').value,
		E('_f_tunnel_src_id_type').value,
		E('_f_tunnel_src_id').value,
		E('_f_tunnel_dst_id_type').value,
		E('_f_tunnel_dst_id').value,
		E('_f_tunnel_auth_type').value,
		E('_f_tunnel_auth_key').value,
		
		E('_f_tunnel_ipsec_policy').value,
		E('_f_tunnel_ipsec_lifetime').value,
		E('_f_tunnel_pfs').value,
		E('_f_tunnel_dpd_interval').value,
		E('_f_tunnel_dpd_timeout').value,
		E('_f_tunnel_icmp_host').value.replace(',', '&'),
		E('_f_tunnel_icmp_interval').value,
		E('_f_tunnel_icmp_timeout').value,
		E('_f_tunnel_icmp_retries').value,
		E('_f_tunnel_restart_wan').checked ? "1" : "0",
		E('_f_tunnel_icmp_local').value,
		E('_f_tunnel_others').value
	];	
	
	if (_ipsec_tunnel_idx==-1){
		_ipsec_tunnel_idx = _ipsec_tunnels.length;
	}
	
	_ipsec_tunnels[_ipsec_tunnel_idx] = tunnel;

	_ipsec_tunnel_idx = -1;
	elem.display('ipsec-edit-section', false);	
	
	ipsecg.updateEntries(ipsecg.saveData(''));	
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

function savePage()
{	
	if(verifyFields(null,0)==0){return 0;}
	else if(verifyFields(null,0)==-1) /**一个都没选中和元素校验返回结果现在被分为-1和0*/
	{
		return -1;
	}
	var scheme = "";
// spelled setup_system	
	scheme += "_setup_system_enable=" + (E('setup_system_enable').checked ? '1' : '0');
	scheme += "\nlanguage=" + E('_language').value 
		         + "\ntzone=" + E('_tzone').value
		         + "\nhostname=" + E('_hostname').value;

//spelled fw_acl
    scheme += "\n_fw_acl_enable=" + (E('fw_acl_enable').checked ? '1' : '0');
   	scheme += "\ntelnet_on=" + (E('_f_telnet_on').checked ? 'Y' : 'N')
		         + "\ntelnet_port=" + E('_telnet_port').value
		         + "\ntelnet_from_wan=" + (E('_f_telnet_from_wan').checked ? 'Y' : 'N')
		         + "\nweb_on=" +(E('_f_web_on').checked ? 'Y' : 'N')
				 + "\nweb_port=" + E('_web_port').value
				 + "\nweb_from_wan=" +(E('_f_web_from_wan').checked ? 'Y' : 'N');
   
//spelled  admin_log
    scheme += "\n_admin_log_enable=" + (E('admin_log_enable').checked ? '1' : '0');
	scheme += "\nlog_server_host=" + E('_log_server_host').value;
   
//spelled setup_lan0
    scheme += "\n_setup_lan0_enable=" + (E('setup_lan0_enable').checked ? '1' : '0');
	scheme += "\nlocal_ip=" + E('_local_ip').value 
				 + "\nlocal_mask=" + E('_local_mask').value;

//spelled setup_dns		
	scheme += "\n_setup_dns_enable=" + (E('setup_dns_enable').checked ? '1' : '0');
	scheme += "\ndns1=" + E('_dns1').value 
				 + "\ndns2=" + E('_dns2').value;
  
//spelled setup_wan1
  	scheme += "\n_setup_wan1_enable=" + (E('setup_wan1_enable').checked ? '1' : '0');
	scheme += "\nmodem_phone=" + E('_modem_phone').value 
		         + "\nmodem_account=" + E('_modem_account').value
		         + "\nmodem_password=" + E('_modem_password').value
		         + "\nmodem_APN=" + E('_modem_APN').value
		         + "\nmodem_detect_interval=" + E('_modem_detect_interval').value
		         + "\nmodem_max_failure=" + E('_modem_max_failure').value
		         + "\nmodem_max_retry=" + E('_modem_max_retry').value
		         + "\nheartBeat_host=" + E('_heartBeat_host').value
		         + "\nheartBeat_interval=" + E('_heartBeat_interval').value
		         + "\nheartBeat_timeout=" + E('_heartBeat_timeout').value
		         + "\nheartBeat_retries=" + E('_heartBeat_retries').value;
   		
//spelled fw_dmz
	scheme += "\n_fw_dmz_enable=" + (E('fw_dmz_enable').checked ? '1' : '0');
	scheme += "\nfw_vserver=" + E('_fw_vserver').value;

//spelled service_ovdp
  	scheme += "\n_service_ovdp_enable=" + (E('service_ovdp_enable').checked ? '1' : '0');
	scheme += "\ninhand_serialnum=" + E('_inhand_serialnum').value 
		         + "\non=" + E('_on').value
		         + "\nvendor_id=" + E('_vendor_id').value
		         + "\ndevice_id=" + E('_device_id').value
		         + "\ncenter_ip=" + E('_center_ip').value
		         + "\ncenter_port=" + E('_center_port').value;
		         //+ "\novdp_trust_list=" + E('_ovdp_trust_list').value;
	return scheme;
}
