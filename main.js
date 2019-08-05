// BROWSER CLIENT
var uagent = navigator.userAgent.toLowerCase();
var is_safari = ((uagent.indexOf('safari') != -1) || (navigator.vendor == "Apple Computer, Inc."));
var is_ie = ((uagent.indexOf('msie') != -1) && (!is_opera) && (!is_safari) && (!is_webtv));
var is_ie4 = ((is_ie) && (uagent.indexOf("msie 4.") != -1));
var is_edge = /Edge\/\d./i.test(navigator.userAgent);
var is_moz = (navigator.product == 'Gecko');
var is_ns = ((uagent.indexOf('compatible') == -1) && (uagent.indexOf('mozilla') != -1) && (!is_opera) && (!is_webtv) && (!is_safari));
var is_ns4 = ((is_ns) && (parseInt(navigator.appVersion) == 4));
var is_opera = (uagent.indexOf('opera') != -1);
var is_kon = (uagent.indexOf('konqueror') != -1);
var is_webtv = (uagent.indexOf('webtv') != -1);
var is_win = ((uagent.indexOf("win") != -1) || (uagent.indexOf("16bit") != -1));
var is_mac = ((uagent.indexOf("mac") != -1) || (navigator.vendor == "Apple Computer, Inc."));
var is_chrome = (uagent.match(/Chrome\/\w+\.\w+/i)); if(is_chrome == 'null' || !is_chrome || is_chrome == 0) is_chrome = '';
var ua_vers = parseInt(navigator.appVersion);
var req_href = location.href;
var vii_interval = false;
var vii_interval_im = false;
var scrollTopForFirefox = 0;
var url_next_id = 1;

var PeerConnection = window.mozRTCPeerConnection || window.webkitRTCPeerConnection, IceCandidate = window.mozRTCIceCandidate || window.RTCIceCandidate, SessionDescription = window.mozRTCSessionDescription || window.RTCSessionDescription;
navigator.getMedia = ( navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);

function isObject(obj) { return Object.prototype.toString.call(obj) === '[object Object]'; }
var cur = {destroy:[]};
cur.langs = {};
cur.Media = {};
if(!window.kj) var kj = {};

if(window.Notification) cur.Notification = Notification;
function changeHeadCnt(){
	var friends_req = parseInt($('#new_requests').html()) || 0;
	console.log(friends_req);
	$('.new').html(friends_req ? friends_req : '');
}
function debugLog(new_msg){
	try{
		var args = Array.prototype.slice.call(arguments);
		args.unshift('['+((new Date().getTime())/1000)+'] ');
		console.log.apply(console, args);
	}catch(e){
		console.log('['+((new Date().getTime())/1000)+'] '+new_msg);
	}
}
function viewsVideo(f){
        stManager._add(['al/view_video1.css'], function(){
        videos.show(f);
        });
}


	function showUserSubcsr (i, page_num){
		stManager._add(['al/subscriptions.css'], function(){
		  });
		Box.Clos('pages_groups_user');
		  if(page_num)
    page = '&page='+page_num;
  else {
    page = '';
    page_num = 1;
  }
		$.post('/index.php?go=subscriptions&act=all_user_subscr',{uid: +i+page}, function(d){
			Box.Open({
				id: 'pages_showUserSubcsr',
				title: lang_250,
				data: d,
				width: 600,
				cb: function(){ history.pushState({link:location.pathname}, null, location.pathname); }});
		});
	}

function showUserSubcsr12(i, page_num){
  if(page_num)
    page = '&page='+page_num;
  else {
    page = '';
    page_num = 1;
  }
  Box.Page('/index.php?go=subscriptions&act=all_user_subscr', 'uid='+i+page, 'all_subscr_users_'+i+page_num, 620, 'Подписчики', lang_msg_close, 0, 0, 345, 1, 1, 1, 0, 1);
}
function autoDir(){
	function checkDir(a){
		if(new RegExp(
			"^[\u0000-\u0040\u005B-\u0060\u007B-\u00BF\u00D7\u00F7\u02B9-\u02FF\u2000-\u2BFF\u2010-\u2029\u202C\u202F-\u2BFF]*?[\u0591-\u07FF\u200F\u202B\u202E\uFB1D-\uFDFD\uFE70-\uFEFC]"
		).test(a.value || a.innerHTML)) a.dir = 'rtl';
		else a.dir = 'ltr';
	}
	$('[dir="auto"]').each(function(a,b){
		var l = $(b);
		if((b.type == 'text' || b.hasAttribute('contenteditable')) && !b.hasAttribute('ie-fix')){
			l.attr('ie-fix', true);
			l.bind('keyup paste', function(){
				checkDir(this);
			})
		}
		checkDir(b);
	});
}
function set_cookie( name, value, exp_y, exp_m, exp_d){
	var cookie_string = name + "=" + escape ( value );
	if (exp_y){
		var expires = new Date ( exp_y, exp_m, exp_d );
		cookie_string += "; expires=" + expires.toGMTString();
	}
	document.cookie = cookie_string;
}
function get_cookie(cookie_name){
	var results = document.cookie.match ( '(^|;) ?' + cookie_name + '=([^;]*)(;|$)' );
	if(results) return (unescape(results[2]));
	else return false;
}
function delete_cookie(cookie_name){
	var cookie_date = new Date (); 
	cookie_date.setTime ( cookie_date.getTime() - 1 );
	document.cookie = cookie_name += "=; expires=" + cookie_date.toGMTString();
}

function str_replace ( search, replace, subject ) {	// Replace all occurrences of the search string with the replacement string
	// 
	// +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	// +   improved by: Gabriel Paderni

	if(!(replace instanceof Array)){
		replace=new Array(replace);
		if(search instanceof Array){//If search	is an array and replace	is a string, then this replacement string is used for every value of search
			while(search.length>replace.length){
				replace[replace.length]=replace[0];
			}
		}
	}

	if(!(search instanceof Array))search=new Array(search);
	while(search.length>replace.length){//If replace	has fewer values than search , then an empty string is used for the rest of replacement values
		replace[replace.length]='';
	}

	if(subject instanceof Array){//If subject is an array, then the search and replace is performed with every entry of subject , and the return value is an array as well.
		for(k in subject){
			subject[k]=str_replace(search,replace,subject[k]);
		}
		return subject;
	}

	for(var k=0; k<search.length; k++){
		var i = subject.indexOf(search[k]);
		while(i>-1){
			subject = subject.replace(search[k], replace[k]);
			i = subject.indexOf(search[k],i);
		}
	}

	return subject;

}

function cancelEvent(event) {
  	event = (event || window.event);
  	if (!event) return false;
  	while (event.originalEvent)  event = event.originalEvent;
  	if (event.preventDefault) event.preventDefault();
  	if (event.stopPropagation) event.stopPropagation();
  	event.cancelBubble = true;
  	event.returnValue = false;
  	return false;
}
function playAudio(){
	var args = arguments;
	//stManager.add(['al/player.js', 'al/player.css'], function(){
		audio_player.prepare.apply(null, args);
	//});
}
// READY PAGE
$(document).ready(function(){
	onBodyResize();
	$('.update_code').click(function(){
		var rndval = new Date().getTime(); 
		$('#sec_code').html('<img src="/antibot/antibot.php?rndval=' + rndval + '" alt="" title="'+langs.global_show_other_code+'" width="120" height="50" />');
		return false;
	});
	topButton();
	initClick();
	if(kj.uid > 0){
		//newYearLogos();
		$(window).resize(function(){
			if(window.IM && IM.resize) IM.resize();
			if(cur.notifyPad) NotifyPad.resize();
		});
		window.onblur = function(){
			cur.visible = false;
			cur.lastUpTs = KJ.now();
		};
		window.onfocus = function(){
			cur.visible = true;
			cur.lastUpTs = KJ.now();
			onVisible();
		};
		window.onclick = function(){
			cur.visible = true;
			if(!cur.updateLVTimer && KJ.now() - cur.lastUpTs < 300000) Notifier.startUpdateLV(true);
			cur.lastUpTs = KJ.now();
		};
		var match = location.href.match(/\/(news|feed)/);
		if(match) Notifier.follow_news_onload = true;
	}
	cur.lazy = new LazyLoad();
	document.addEventListener('visibilitychange', function(e) {
		if(window.IM) IM.visibilityChange(document.visibilityState);
		if(document.visibilityState.toLowerCase() == 'visible'){
			cur.visible = true;
			onVisible();
		}else cur.visible = false;
	}, false);
	kj.loaded = true;
	if(is_edge || is_ie){
		document.addEventListener("DOMSubtreeModified", autoDir);
		autoDir();	
	}
});

// CHECK PHOTO
if(CheckRequestPhoto(req_href)){
	$(document).ready(function(){
		Photo.Show(req_href);
	});
}

//AJAX PAGES
window.onload = function(){ 
	window.setTimeout(function(){ 
			window.addEventListener('popstate', function(e){
					e.preventDefault();
					if(e.state && e.state.link) Page.Go(e.state.link, {no_change_link: 1});
				},  
			false); 
		}, 
	1); 
	history.pushState({link:location.href}, null, location.href);
}

// CHECK PHOTO LINK
function CheckRequestPhoto(request){
	var pattern = new RegExp(/photo[0-9]/i);
 	return pattern.test(request);
}

// CHECK VIDEO LINK
function CheckRequestVideo(request){
	var pattern = new RegExp(/video[0-9]/i);
 	return pattern.test(request);
}

        function ReSize(){
                var h = window.innerHeight-40;
                $('#im_left_bl, #im_right_bl').css('height', h+'px');

                var tabs = document.getElementById('im_tabs').scrollHeight, search = document.getElementById('im_search').scrollHeight;
                $('#im_dialogs_cont').css('height', (h-(tabs+search))+'px');

                var history = document.getElementById('im_history').scrollHeight, footer = document.getElementById('im_footer').scrollHeight;

                var history_h = h-40-footer, mtop = history_h > history ? (history_h-history)-2 : 0;

                $('.im_messages_res').css('padding-bottom', footer+'px');
                $('#im_history').css('margin-top', mtop+'px');
        }

// AUTO RESIZE PAGE
function onBodyResize12(){
		            var h = window.innerHeight-40;
                $('#im_left_bl, #im_right_bl').css('height', h+'%');

	var mw = ($('html, body').innerWidth()-800)/2;
	$('.autowr').css('padding-left', mw+'px').css('padding-right', mw+'px');
}
var last_win_w = 0;
function onBodyResize(){
	var ww = window.innerWidth;

	if(ww == last_win_w) return;
	last_win_w = ww;
    var h = window.innerHeight-40;
    KJ('#im_left_bl, #im_right_bl').css('height', h+'%');
	var obj = KJ('.content'), contw = obj.width(), res = (ww - contw) / 2;
	res = Math.max(res, 30);
	obj.css('margin', '40px '+res+'px 0px');
	KJ('.head_cont').css('margin', '0px '+res+'px');
	KJ('.kj_top_button');
	KJ('.site_menu_fix').css('left', res + 'px');
}
function destroyCur(l){ 
	if(cur.destroy.length != 0){
	  for (var i in cur.destroy) {
	    try {
	      cur.destroy[i](l);
	      delete cur.destroy[i];
	    } catch(e) {
	      addAllErr(e.stack,150);
	    }
	  }
	}
}


function getStaticFiles(h){
		KJ('body').append('<div id=""></div>');
	}

var stManager = {

	waiters: [],
	_add: function(){
		return this.add.apply(this, arguments);
	},
	add: function(files, onDone, onFail){
		var _s = stManager;

		if(!KJ.isArray(files)) files = [files];

		var i, n, v, e, st_list = [], t;

		for(i = 0; i < files.length; i++){
			e = files[i].split('?');
			n = e[0];
			v = e[1] ? e[1] : 1;

			if(!kj_static[n]) {
				st_list.push([n, v]);
				var t = n.indexOf('.css') != -1 ? 'css' : 'js';
				kj_static[n] = {v: v, l: 0, t: t, c: 0};
				if(t == 'css'){
					var bl_n = n.replace(/[\/\.]/g, '_');
					kj_static[n].n = bl_n;
					KJ('#noDisplayBL').append('<div id="'+bl_n+'"></div>');
					KJ('<link/>').attr({
						href: '/css/'+n+'?'+v,
						type: 'text/css',
						rel: 'stylesheet'
					}).appendTo('head');
				}else{
					KJ('<script/>').attr({
						src: '/js/'+n+'?'+v,
						type: 'text/javascript'
					}).appendTo('head');
				}
			}else{
				if(kj_static[n].v != v){
				addAllErr('Error loading static file <b>'+n+'</b><br>Bad version file. Current version <b>'+kj_static[n].v+'</b> but new version <b>'+v+'</b><br>Please <a href="/" onClick="location.reload(); return false;">repload browser page</a> and clear cache', 8000);
					return;
				}
			}
		}

		if(st_list.length > 0){
			_s.waiters.push([st_list, onDone, onFail]);
			if(!_s.waitId){
				_s.waitId = setInterval(_s.wait, 100);
			}
		}else{
			if(onDone) onDone();
		}
	},
	limit: 150,
	max_limit: 900,
	wait: function(){
		var _s = stManager, l = _s.waiters.length, checked = {}, handlers = [], wait, j, lw, f, c;
		if(!l){
			clearInterval(_s.waitID);
			_s.waitID = false;
			return;
		}
		for(var i = 0; i < l; i++){
			wait = _s.waiters[i][0];
			for(j = 0; lw = wait.length, j < lw; j++){
				f = wait[j][0];
				if(!checked[f]){
					try{
						if(!kj_static[f].l && kj_static[f].t == 'css' && getComputedStyle(document.getElementById(kj_static[f].n)).display == 'none') {
							_s.done(f);
							KJ('#'+kj_static[f].n).remove();
						}
					}catch(e){
						location.reload();
						return;
					}
					if(kj_static[f].l) {
						checked[f] = 1;
						_s.waiters[i][3] = 'done';
					}else{
						if(kj.loaded){
							c = ++kj_static[f].c;
							if (c > _s.limit){
								addAllErr('<b>Error:</b> Could not load <b>'+f+'</b>', 5000);
								kj_static[f].l = 1;
          						checked[f] = 1;
          						_s.waiters[i][3] = 'fail';
							}
						}
					}
				}
				if(checked[f] > 0){
      				wait.splice(j, 1);
      				--j; --lw;
    			}
			}
			if(!wait.length) {
				var d = _s.waiters.splice(i, 1)[0];
        		handlers.push(d[3] == 'done' ? d[1] : d[2]);
        		--i; --l;
      		}
		}
		for (j = 0; j < handlers.length; ++j){
  			if(handlers[j]) handlers[j]();
		}
	},
	done: function(file){
		kj_static[file].l = 1;
	}
};
var nav = {
	init: function(){
		KJ('body').append('<div class="feedback_button" onClick="FeedBack.open();">ytyttytytytyyt</div>');
	},
	getStaticFiles: function(h){
		if(h){
			if(h.substr(0, 1) == '/') h = h.substr(1);
			var h = h.split('/');
			h = h[0];
			for(var i in navTree) {
				var m = h.match(new RegExp('^' + i, 'i'));
				if(m) return {files: navTree[i].files, i: i, loaded: navTree[i].loaded};
									
			}
		}
		return {files: []};
	},
		clear: function(h){
		if(kj.uid){
			if(cur.attach_all) cur.attach_all.obj = {};
		}
		if(KJ('.photoViewBox').length) Photos.opened = Photos.marking = null;

		//chrome bug fix, destroy ajax request
		if(KJ('#im_frame').length) KJ('#im_frame')[0].contentWindow.stop();

		KJ('#im_frame, .photo_view, .box_pos, .box_info, .vii_box, .zoomWall, .photoViewBox, .titleHtml, #addStyleClass, .like_users_bl, .js_titleRemove, .tag_user_bl, #navigation_frame').remove();
		KJ('body').attr('ondrop', '');
		KJ([window, document]).unbind();
		KJ('.kj_top_button').attr('onClick', '').hide();
		if(KJ('#wiki_wall').length != 0) wiki_wall.close();
		cur.langs = {};
		if(kj.uid && KJ('#query').val().length > 0){
			KJ('.fast_search_bg').hide();
			KJ('#fs_scroll_cont').html('');
			KJ('#query').val('');
		}
		if(window.user_id) user_id = 0;
		cur.Media = {};
		if(cur.wikiOpened) WikiView.destroy();
		if(cur.notifyPad) NotifyPad.hide();
		if(window.MediaObjs) MediaObjs = {};
		cur.EmojiInited = [];

		nav.start_load_st = false;
		nav.loaded_st = false;
		nav.frame_loaded = false;

		voicesPlayer.curVoice = null;
		if(voicesPlayer.playing){
			voicesPlayer.endVoice();
			KJ('#voice_song')[0].pause();
		}
		destroyCur(h);
	},
	frame_data: function(type, data){
		switch(type){
			case 'nav_js':
				eval('(function(){' + data + ';})()');
			break;
			case 'cont':
				data.cont = String(data.cont.replace('</AjaxScript>', '</script>'));
				if(nav.static_start) nav.cont_queue[data.id] = data.cont;
				else KJ('#'+data.id).html(data.cont);
			break;
			case 'static':
				var files = data.split(',');
				nav.static_start = true;
				if(nav.start_load_st) return;
				stManager.add(files, function(){
					nav.static_start = false;
					for(var i in nav.cont_queue){
						KJ('#'+i).html(nav.cont_queue[i]);
						delete nav.cont_queue[i];
					}
					if(nav.init_js){
						eval(nav.init_js);
						nav.init_js = null;
					}
					if(nav.end){
						KJ('#navigation_frame').remove();
						if(nav.loaded_st) nav.page_loaded();
					}
				});
			break;
			case 'init_js':
				//if(nav.static_start) nav.init_js = data;
				//else eval(data);
				nav.init_js = data;
			break;
			case 'end':
				nav.end = true;
				nav.frame_loaded = true;
				if(nav.static_start) return;
				KJ('#navigation_frame').remove();
				if(nav.loaded_st) nav.page_loaded();
			break;
			case 'counts':
				eval(data);
			break;
			case 'runtime':
				if(kj.uid != 11 && kj.uid != 1) return;
				KJ('#runtime').remove();
				KJ('body').append(data);
			break;
		}
	},
	page_loaded: function(){
		KJ.each($('#page script'), function(){
			var src = KJ(this).attr('src');
			if(src){
				src = src.replace('/js/', '');
				stManager._add([src]);
			}else{
				window.eval.apply(window, [KJ(this).html()]);
			}
		});

		if(nav.init_js){
			eval(nav.init_js);
			nav.init_js = null;
		}

		KJ('#navigation_frame').remove();

		topButton();
		KJ('body').css('overflow-y', 'auto').scrollTop(0);
		findInputs();
		initClick();
		if(window.audio_player && !audio_player.pause) audio_player.command('play', {style_only: true});
		cur.lazy.searchImages(1);
		if(nav.resize_win){
			onBodyResize();
			nav.resize_win = null;
		}

		window.scrollTo(0,0);
	},
	go: function(h, pref, params){


		if(!pref) history.pushState({link:h}, null, h);
		clearInterval(vii_interval);
		clearInterval(vii_interval_im);
		KJ('.kj_top_button').attr('onClick', '').hide();
		$('.js_titleRemove, .vii_box').remove();
		 Page.Load('start');
		$.post(h, {ajax: 'yes'}, function(res){
		d = JSON.parse(res);
		$('#page').html(d.content).css('min-height', '0px');
		Page.Load('stop');
			$('html, body').scrollTop(0);
			$('#qnotifications_box').hide();
			$('#css').html(d.css);	
			$('.ladybug_ant').imgAreaSelect({remove: true});
			$('#addStyleClass').remove();
			$('.photo_view, .box_pos, .box_info, .titleHtml, #navigation_frame').remove();
			$('html').css('overflow-y', 'auto');
			document.title = d.title;
			$('#new_msg').html(d.user_pm_num);
			$('#css').html(d.css);	
			$('#ubm_link').attr('href', d.gifts_link);
			$('#new_requests').html(d.demands);
			$('#new_photos').html(d.new_photos);
			$('#requests_link_new_photos').attr('href', '/albums/'+d.new_photos_link);
			$('#new_groups').html(d.new_groups);
			$('#new_groups_lnk').attr('href', d.new_groups_lnk);
			});
	}
}
function findInputs(){
	$('input, textarea').autoDir();
}
function autoDir(){
	function checkDir(a){
		if(new RegExp(
			"^[\u0000-\u0040\u005B-\u0060\u007B-\u00BF\u00D7\u00F7\u02B9-\u02FF\u2000-\u2BFF\u2010-\u2029\u202C\u202F-\u2BFF]*?[\u0591-\u07FF\u200F\u202B\u202E\uFB1D-\uFDFD\uFE70-\uFEFC]"
		).test(a.value || a.innerHTML)) a.dir = 'rtl';
		else a.dir = 'ltr';
	}
	$('[dir="auto"]').each(function(a,b){
		var l = $(b);
		if((b.type == 'text' || b.hasAttribute('contenteditable')) && !b.hasAttribute('ie-fix')){
			l.attr('ie-fix', true);
			l.bind('keyup paste', function(){
				checkDir(this);
			})
		}
		checkDir(b);
	});
}
var Page45 = {
	PL:function(f){
		var top_pad = $(window).height()/2-50;
		if(f == 'start'){
			KJ('#site_loader').remove();
			KJ('body').append('<div id="site_loader"><div class="figure"><div class="i1"></div><div class="i2"></div><div class="i3"></div></div></div>');
		}
		if(f == 'stop'){
			$('#site_loader').remove();
		}
	},
	Loading: function(f){
		Page.PL(f);
	},
	go: function(h, params){
		return nav.go.apply(false, arguments);
	},
	Go: function(h, params){
		return nav.go.apply(false, arguments);
	},
	paste: function(e, t){
		var items = (e.clipboardData  || e.originalEvent.clipboardData).items, files = [];
		for(var i = 0; i < items.length; i++){
			if(items[i].type.indexOf("image") === 0){
				e.preventDefault();
				var file = items[i].getAsFile();
				file.name = 'file '+(i+1);
				files.push(file);
			}
		}
		console.log(files);
		attach_all.photoGet(files, t, 'false');
	}
}
var eajax = {
	init: function(){
		var xhr = false;
		try {
			xhr = new ActiveXObject("Msxml2.XMLHTTP");
		}catch(e){
			try {
				xhr = new ActiveXObject("Microsoft.XMLHTTP");
			}catch(E){
				xhr = false;
			}
		}
		if (!xhr && typeof XMLHttpRequest != 'undefined') {
			xhr = new XMLHttpRequest();
		}
		ajax.req = xhr;
	},
	req: false,
	post: function(url, query, callback){
		if(!ajax.req) ajax.init();
		var xhr = ajax.req;
		var ts = new Date().getTime(), data = 'ts='+ts;
		if(typeof query == 'object'){
			for(var i in query) data += '&'+i+'='+encodeURIComponent(query[i]);
		}else if(typeof query == 'function') callback = query;
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4){
				if(xhr.status == 200){
					if(callback) callback(xhr.responseText);
				}
			}
		};
		xhr.open('POST', url, true);
		xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		xhr.send(data);
	}
}
// PAGE AJAX+JSON
var Page = {
		PL: function(f){
		var top_pad = $(window).height()/2-50;
		if(f == 'start'){
			$('#loading').remove();
			$('html, body').append('<div id="loading" style="margin-top:0px"><div id="site_loader"><div class="figure"><div class="i1"></div><div class="i2"></div><div class="i3"></div></div></div></div>');
			$('#loading').show();
		}
		if(f == 'stop'){
			$('#loading').remove();
		}
	},
	Loading: function(f){
 cur.lazy.searchImages(1);
 topButton();
		var top_pad = $(window).height()/2-50;
		if(f == 'start'){
			$('#loading').remove();
			$('html, body').append('<div id="loading" style="margin-top:'+top_pad+'px"><div id="site_loader"><div class="figure"><div class="i1"></div><div class="i2"></div><div class="i3"></div></div></div></div>');
			$('#loading').show();
		}
		if(f == 'stop'){
			$('#loading').remove();
		}
	},

	Load: function(f){
        cur.lazy.searchImages(1);
        topButton();
        var top_pad = $(window).height()/2-50;
		if(f == 'start'){
			$('#loading').remove();
			$('html, body').append('<div id="loading" style="margin-top:'+top_pad+'px"><div class="loadstyle"></div></div>');
			$('#loading').show();
		}
		if(f == 'stop'){
			$('#loading').remove();
		}
	},
	Go: function(h, pref, params){	
		return nav.go.apply(false, arguments);

		
	}
}

// SCRIPT DOLOAD
var doLoad = {
	data: function(i){
		doLoad.js(i);
	},
	js: function(i){
		var arr = ['audio_player', 'rating', 'payment'];
		var check = $('#dojs'+arr[i]).length;
		if(!check) $('#doLoad').append('<div id="dojs'+arr[i]+'"><script type="text/javascript" src="'+template_dir+'/js/'+arr[i]+'.js"></script></div>');
	}
}

// VII BOX
var viiBox = {
	start: function(){
		Page.Loading('start');
	},
	stop: function(){
		Page.Loading('stop');
	},
	win: function(i, d, o, h){
		viiBox.stop();
		if(is_moz && !is_chrome) scrollTopForFirefox = $(window).scrollTop();
		$('html, body').css('overflow-y', 'hidden');
		if(is_moz && !is_chrome) $(window).scrollTop(scrollTopForFirefox);
		$('body').append('<div class="vii_box" id="newbox_miniature'+i+'">'+d+'</div>');
		$(window).keydown(function(event){
			if(event.keyCode == 27) 
				viiBox.clos(i, o, h);
		});
	},
	clos: function(i, o, h){
		$('#newbox_miniature'+i).remove();
		if(o) $('html').css('overflow-y', 'auto');
		if(h) history.pushState({link:h}, null, h);
	}
}

// MODAL BOX
var Box = {
	cb: {},
	Open: function(p){

		if(p.st_files){
			stManager._add(p.st_files, function(){
				delete p.st_files;
				Box.Open(p);
			});
			return;
		}

		if($('#box_'+p.id).size()) {
			$('#box_'+p.id).show();
			return;
		}
		if(!p.top) p.top = 100;
		if(!p.width) p.width = 600;
		if(!p.cache) p.cache = 0;
		if(!p.cbdatas) p.cbdatas = '';
		if(p.cb) Box.cb[p.id] = p.cb;
		if(p.bottom){
			var clos_but = '<div class="fl_l"><button class="button red" onClick="Box.Clos(\''+p.id+'\', '+p.cache+', 1);">'+(p.clos_text ? p.clos_text : lang_113)+'</button></div>';
			var succes = p.success ? '<div class="fl_l" style="margin-right: 8px;"><button class="button '+(p.suc_class ? p.suc_class : '')+'" onClick="'+p.suc_js+'">'+(p.suc_text ? p.suc_text : lang_113)+'</button></div>' : '';
			var bottom = '<div class="box_bottom">\
			<div class="fl_l">'+(p.bottom_text ? p.bottom_text : '')+'</div>\
			<div class="fl_r">'+succes+clos_but+'</div>\
			<div class="clear"></div>\
			</div>';
		}else var bottom = '';

		p.data = p.data.replace(/[\r\n]/g, ' ');

		var matches = p.data.match(/<!js>(.*)<!\/js>/), exec_js = false;
		if(matches && matches[1]){
			exec_js = matches[1];
			p.data = p.data.replace(matches[0], '');
		}

		$('body').append('<div id="box_'+p.id+'" class="box_pos" cb-datas="'+p.cbdatas+'" style="display: block"><div class="box_bg" style="width:'+p.width+'px;margin-top:'+p.top+'px;">'+
		'<div class="box_title"><span id="btitle" dir="auto">'+p.title+'</span><i class="box_close icon-cancel-3" onClick="Box.Clos(\''+p.id+'\', '+p.cache+', 1); return false;"></i></div>'+
		'<div class="box_conetnt">'+p.data+'</div>'+bottom+
		'</div><div class="box_top_but" onClick="$(\'#box_'+p.id+'\').scrollTop(0);"><div class="box_top_strelka"><div class="icon-up-dir-1" style="font-size: 30px;"></div><div>Вверх</div></div></div></div></div>');
		$('#box_'+p.id).bind('keydown',function(event){
			if(event.keyCode == 27) {
				Box.Clos(p.id, p.cache, 1);
			}
		}).bind('click', function(e){
			if($('#box_'+p.id+':visible').length == 0) return;

			var x = e.clientX, wh = window.innerWidth;
			if(x >= wh-15) return;
			if ($(e.target).parents().filter('.box_bg').length == 0 && $(e.target).filter('.box_top_but, .icon-cancel-7').length == 0) {
				Box.Clos(p.id, p.cache, 1);
			}
		}).scroll(function(){
			if($(this).scrollTop() > 100) $('.box_top_but').fadeIn('slow');
			else $('.box_top_but').fadeOut('slow');
		});
		autoMarginTop('#box_'+p.id+' .box_bg');
		$('body, .video_box, .photoViewBox, #wiki_view').css('overflow-y', 'hidden');
		Page.PL('stop');

		if(exec_js) eval(exec_js);
		KJ(document).bind('keydown',function(event){
			if(event.keyCode == 27){
				cancelEvent(event);
				Box.Clos(p.id, p.cache, 1);
			}
		});
	},
	Page: function(url, data, name, width, title, cancel_text, func_text, func, height, overflow, bg_show, bg_show_bottom, input_focus, cache){
	
		//url - ссылка которую будем загружать
		//data - POST данные
		//name - id окна
		//width - ширина окна
		//title - заголовк окна
		//content - контент окна
		//close_text - текст закрытия
		//func_text - текст который будет выполнять функцию
		//func - функция текста "func_text"
		//height - высота окна
		//overflow - постоянный скролл
		//bg_show - тень внтури окна сверху
		//bg_show_bottom - "1" - с тенью внтури, "0" - без тени внутри
		//input_focus - ИД текстового поля на котором будет фиксация
		//cache - "1" - кешировоть, "0" - не кешировать

		if(cache)
			if(ge('box_'+name)){
				Box.Close(name, cache);
				$('#box_'+name).show();
				$('#box_content_'+name).scrollTop(0);






				if(is_moz && !is_chrome)
					scrollTopForFirefox = $(window).scrollTop();
				
				$('html').css('overflow', 'hidden');

				if(is_moz && !is_chrome)
					$(window).scrollTop(scrollTopForFirefox);
				return false;
			}



		
		Page.Loading('start');
		$.post(url, data, function(html){
			if(!CheckRequestVideo(location.href))
				Box.Close(name, cache);
			Box.Show(name, width, title, html, cancel_text, func_text, func, height, overflow, bg_show, bg_show_bottom, cache);
			Page.Loading('stop');
			if(input_focus)
				$('#'+input_focus).focus();
		});
	},
	Show: function(name, width, title, content, close_text, func_text, func, height, overflow, bg_show, bg_show_bottom, cache){
		
		//name - id окна
		//width - ширина окна
		//title - заголовк окна
		//content - контент окна
		//close_text - текст закрытия
		//func_text - текст который будет выполнять функцию
		//func - функция текста "func_text"
		//height - высота окна
		//overflow - постоянный скролл
		//bg_show - тень внтури окна сверху
		//bg_show_bottom - тень внтури внтури снизу
		//cache - "1" - кешировоть, "0" - не кешировать
		
		if(func_text)
			var func_but = '<div class="button_div fl_r" style="margin-right:10px;" id="box_but"><button onClick="'+func+'" id="box_butt_create">'+func_text+'</button></div>';
		else
			var func_but = '';
			
		var close_but = '<div class="button_div_gray fl_r"><button onClick="Box.Close(\''+name+'\', '+cache+'); return false;"  id="box_butt_otm">'+close_text+'</button></div>';
		
		var box_loading = '<img id="box_loading" style="display:none;padding-top:8px;padding-left:5px;" src="/theme/Default/images/loading_mini.gif" alt="" />';
		
		if(height)
			var top_pad = ($(window).height()-150-height)/2;
			if(top_pad < 0)
				top_pad = 100;
			
		if(overflow)
			var overflow = 'overflow-y:scroll;';
		else
			var overflow = '';
			
		if(bg_show)
			if(overflow)
				var bg_show = '<div class="bg_show" style="width:'+(width-19)+'px;"></div>';
			else
				var bg_show = '<div class="bg_show" style="width:'+(width-2)+'px;"></div>';
		else
			var bg_show = '';
		
		if(bg_show_bottom)
			if(overflow)
				var bg_show_bottom = '<div class="bg_show_bottom" style="width:'+(width-17)+'px;"></div>';
			else
				var bg_show_bottom = '<div class="bg_show_bottom" style="width:'+(width-2)+'px;"></div>';
		else
			var bg_show_bottom = '';
			
		if(height)
			var sheight = 'height:'+height+'px';
		else
			var sheight = '';

		$('body').append('<div id="modal_box"><div id="box_'+name+'" class="box_pos"><div class="box_bg" style="width:'+width+'px;margin-top:'+top_pad+'px;"><div class="box_title" id="box_title_'+name+'"><div style="width: 100%;float: left;">'+title+'</div><div style="margin-left: 0px;"><a onclick="Box.Close(\''+name+'\', '+cache+'); return false;" class="dark_box_close fl_r" style="padding: 1px 10px 18px;background: url(../images/notifier_close.gif) no-repeat;"></a></div></div><div class="box_conetnt" id="box_content_'+name+'" style="'+overflow+'">'+bg_show+content+'<div class="clear"></div></div>'+bg_show_bottom+'<div class="box_footer"><div id="box_bottom_left_text" class="fl_l">'+box_loading+'</div>'+close_but+func_but+'</div></div></div></div></div></div>');
		
		$('#box_'+name).show();
	

		if(is_moz && !is_chrome)
			scrollTopForFirefox = $(window).scrollTop();
		
		$('html').css('overflow', 'hidden');

		if(is_moz && !is_chrome)
			$(window).scrollTop(scrollTopForFirefox);
		
		$(window).keydown(function(event){
			if(event.keyCode == 27) {
				Box.Close(name, cache);
			} 
		});
	},
	Close: function(name, cache){
		if(!cache)
			$('.box_pos').remove();
		else
			$('.box_pos').hide();
		if(CheckRequestVideo(location.href) == false && CheckRequestPhoto(location.href) == false)
			$('html').css('overflow-y', 'auto');
		if(CheckRequestVideo(location.href))
			$('#video_object').show();
		if(is_moz && !is_chrome)
			$(window).scrollTop(scrollTopForFirefox);
	},
		Clos: function(name, cache){
		if(!cache)
			$('.box_pos').remove();
		else
			$('.box_pos').hide();
		if(CheckRequestVideo(location.href) == false && CheckRequestPhoto(location.href) == false)
			$('html').css('overflow-y', 'auto');
		if(CheckRequestVideo(location.href))
			$('#video_object').show();
		if(is_moz && !is_chrome)
			$(window).scrollTop(scrollTopForFirefox);
	},
	GeneralClose: function(){
		$('#modal_box').hide();
	},
	Info: function(bid, title, content, width, tout){
		var top_pad = ($(window).height()-115)/2;
		$('body').append('<div id="'+bid+'" class="box_info"><div class="box_info_margin" style="width: '+width+'px; margin-top: '+top_pad+'px"><b><span>'+title+'</span></b><br /><br />'+content+'</div></div>');
		$(bid).show();
		if(!tout)
			var tout = 1400;
		setTimeout("Box.InfoClose()", tout);
		$(window).keydown(function(event){
			if(event.keyCode == 27) {
				Box.InfoClose();
			} 
		});
	},
	InfoClose: function(){
		$('.box_info').fadeOut();
	}
}
//MODAL BOX
var AJAX = {
	cb: {},
	Open: function(p){

		if(p.st_files){
			stManager._add(p.st_files, function(){
				delete p.st_files;
				AJAX.Open(p);
			});
			return;
		}

		if($('#box_'+p.id).size()) {
			$('#box_'+p.id).show();
			return;
		}
		if(!p.top) p.top = 100;
		if(!p.width) p.width = 600;
		if(!p.cache) p.cache = 0;
		if(!p.cbdatas) p.cbdatas = '';
		if(p.cb) AJAX.cb[p.id] = p.cb;
		if(p.bottom){
			var clos_but = '<div class="fl_l"><button class="button red" onClick="AJAX.Clos(\''+p.id+'\', '+p.cache+', 1);">'+(p.clos_text ? p.clos_text : langs.global_close)+'</button></div>';
			var succes = p.success ? '<div class="fl_l" style="margin-right: 8px;"><button class="button '+(p.suc_class ? p.suc_class : '')+'" onClick="'+p.suc_js+'">'+(p.suc_text ? p.suc_text : langs.global_continue)+'</button></div>' : '';
			var bottom = '<div class="box_bottom">\
			<div class="fl_l">'+(p.bottom_text ? p.bottom_text : '')+'</div>\
			<div class="fl_r">'+succes+clos_but+'</div>\
			<div class="clear"></div>\
			</div>';
		}else var bottom = '';

		p.data = p.data.replace(/[\r\n]/g, ' ');

		var matches = p.data.match(/<!js>(.*)<!\/js>/), exec_js = false;
		if(matches && matches[1]){
			exec_js = matches[1];
			p.data = p.data.replace(matches[0], '');
		}

		$('body').append('<div id="box_'+p.id+'" class="box_pos" cb-datas="'+p.cbdatas+'" style="display: block"><div class="box_bg" style="width:'+p.width+'px;margin-top:'+p.top+'px;">'+
		'<div class="box_title"><span id="btitle" dir="auto">'+p.title+'</span><i class="box_close icon-cancel-3" onClick="AJAX.Clos(\''+p.id+'\', '+p.cache+', 1); return false;"></i></div>'+
		'<div class="box_conetnt">'+p.data+'</div>'+bottom+
		'</div><div class="box_top_but" onClick="$(\'#box_'+p.id+'\').scrollTop(0);"><div class="box_top_strelka"><div class="icon-up-dir-1" style="font-size: 30px;"></div><div>Вверх</div></div></div></div></div>');
		$('#box_'+p.id).bind('keydown',function(event){
			if(event.keyCode == 27) {
				AJAX.Clos(p.id, p.cache, 1);
			}
		}).bind('click', function(e){
			if($('#box_'+p.id+':visible').length == 0) return;

			var x = e.clientX, wh = window.innerWidth;
			if(x >= wh-15) return;
			if ($(e.target).parents().filter('.box_bg').length == 0 && $(e.target).filter('.box_top_but, .icon-cancel-7').length == 0) {
				AJAX.Clos(p.id, p.cache, 1);
			}
		}).scroll(function(){
			if($(this).scrollTop() > 100) $('.box_top_but').fadeIn('slow');
			else $('.box_top_but').fadeOut('slow');
		});
		autoMarginTop('#box_'+p.id+' .box_bg');
		$('body, .video_box, .photoViewBox, #wiki_view').css('overflow-y', 'hidden');
		Page.PL('stop');

		if(exec_js) eval(exec_js);
		KJ(document).bind('keydown',function(event){
			if(event.keyCode == 27){
				cancelEvent(event);
				AJAX.Clos(p.id, p.cache, 1);
			}
		});
	},
	Clos: function(id, cache, force){
		var cbdatas = $('#box_'+id).attr('cb-datas');
		if(cache) $('#box_'+id).hide();
		else $('#box_'+id).remove();
		if($('.box_pos, #wiki_wall, .video_box, .photoViewBox, #wiki_view').length == 0) $('body').css('overflow-y', 'auto');
		$('.video_box, .photoViewBox, #wiki_view').css('overflow-y', 'auto');
		if(AJAX.cb[id]){
			AJAX.cb[id](force);
			delete AJAX.cb[id];
		}
	},
	Page: function(url, data, name, width, title, cancel_text, func_text, func, height, overflow, bg_show, bg_show_bottom, input_focus, cache){
		if(cache)
			if(ge('box_'+name)){
				AJAX.Close(name, cache);
				$('#box_'+name).show();
				$('#box_content_'+name).scrollTop(0);
				if(is_moz && !is_chrome)
					scrollTopForFirefox = $(window).scrollTop();
				$('body').css('overflow-y', 'hidden');
				if(is_moz && !is_chrome)
					$(window).scrollTop(scrollTopForFirefox);
				return false;
			}
		Page.Loading('start');
		$.post(url, data, function(html){
			if(!CheckRequestVideo(location.href))
				AJAX.Close(name, cache);
			AJAX.Show(name, width, title, html, cancel_text, func_text, func, height, overflow, bg_show, bg_show_bottom, cache);
			Page.Loading('stop');
			if(input_focus)
				$('#'+input_focus).focus();
		});
	},
	Show: function(name, width, title, content, close_text, func_text, func, height, overflow, bg_show, bg_show_bottom, cache){
		
		//name - id окна
		//width - ширина окна
		//title - заголовк окна
		//content - контент окна
		//close_text - текст закрытия
		//func_text - текст который будет выполнять функцию
		//func - функция текста "func_text"
		//height - высота окна
		//overflow - постоянный скролл
		//bg_show - тень внтури окна сверху
		//bg_show_bottom - тень внтури внтури снизу
		//cache - "1" - кешировоть, "0" - не кешировать
		
		if(func_text)
			var func_but = '<button onClick="'+func+'" id="box_butt_create" class="button fl_r">'+func_text+'</button>';
		else
			var func_but = '';
		var close_but = '<button onClick="AJAX.Close(\''+name+'\', '+cache+'); return false;" id="box_butt_otm" class="button red fl_r">'+close_text+'</button>';
		
		var box_loading = '<img id="box_loading" style="display:none;padding-top:8px;padding-left:5px;" src="/images/loading_mini.gif" alt="" />';
		
		if(height)
			var top_pad = ($(window).height()-150-height)/2;
			if(top_pad < 0)
				top_pad = 100;
			
		if(overflow)
			var overflow = 'overflow-y:scroll;';
		else
			var overflow = '';
		if(bg_show)
			if(overflow)
		var bg_show = '<div class="bg_show" style="width:'+(width-19)+'px;"></div>';
			else
		var bg_show = '<div class="bg_show" style="width:'+(width-2)+'px;"></div>';
		else
			var bg_show = '';
		
		if(bg_show_bottom)
			if(overflow)
		var bg_show_bottom = '<div class="bg_show_bottom" style="width:'+(width-17)+'px;"></div>';
					else
		var bg_show_bottom = '<div class="bg_show_bottom" style="width:'+(width-2)+'px;"></div>';
		else
			var bg_show_bottom = '';
		if(height)
			var sheight = 'height:'+height+'px';
		else
			var sheight = '';

		$('body').append('<div id="modal_box"><div id="box_'+name+'" class="box_pos"><div class="box_bg" style="width:'+width+'px;margin-top:'+top_pad+'px;"><div class="box_title" id="box_title_'+name+'">'+title+'<i class="box_close icon-cancel-3" onClick="AJAX.Close(\''+name+'\', '+cache+'); return false;"></i></div><div class="box_conetnt" id="box_content_'+name+'" style="'+sheight+';'+overflow+'">'+bg_show+content+'<div class="clear"></div></div>'+bg_show_bottom+'<div class="box_footer"><div id="box_bottom_left_text" class="fl_l">'+box_loading+'</div>'+close_but+func_but+'</div></div></div></div>');
		
		$('#box_'+name).show();
		if(is_moz && !is_chrome)
			scrollTopForFirefox = $(window).scrollTop();
		$('body').css('overflow-y', 'hidden');
		if(is_moz && !is_chrome)
			$(window).scrollTop(scrollTopForFirefox);
		$(window).keydown(function(event){
			if(event.keyCode == 27) {
				AJAX.Close(name, cache);
			} 
		});
		autoMarginTop('#box_'+name+' .box_bg');
		/*$(window).mousedown(function(e){
			if ($(e.target).parents().filter('.box_bg:visible').length != 1) {
				AJAX.Close(name, cache);
			}
		});*/
	},
	Close: function(name, cache){
	
		if(!cache)
			$('#box_'+name).remove();
		else
			$('#box_'+name).hide();

		if(CheckRequestVideo(location.href) == false)
			$('body').css('overflow-y', 'auto').css('height', '100%');
		if(CheckRequestVideo(location.href))
			$('#video_object').show();
		if(is_moz && !is_chrome)
			$(window).scrollTop(scrollTopForFirefox);
		
	},
	GeneralClose: function(){
		$('#modal_box').hide();
	},
	Info: function(bid, title, content, width, tout){
		var top_pad = ($(window).height()-115)/2;
		$('body').append('<div id="'+bid+'" class="box_info"><div class="box_info_margin" style="width: '+width+'px; margin-top: '+top_pad+'px"><b><span>'+title+'</span></b><div class="box_info_msg">'+content+'</div></div></div>');
		$(bid).show();
		if(!tout)
			var tout = 1400;
		setTimeout("AJAX.InfoClose()", tout);
		$(window).keydown(function(event){
			if(event.keyCode == 27) {
				AJAX.InfoClose();
			} 
		});
		$('.box_info').mousedown(AJAX.InfoClose);
	},
	InfoClose: function(){
		$('.box_info').remove();
	},
	Wiki: function(query){
		//if(!cur.wikiOpened) 
			Page.PL('start');

		KJ.post('/?go=wiki_view', query).done(function(d){
			if(cur.WikiView){
				WikiView.init(d);
			}else{
				stManager.add(['al/wiki_view.js', 'al/wiki_view.css'], function(){
					Page.PL('stop');
					WikiView.init(d);
				}, function(){
					Page.PL('stop');
				});
			}
		}).fail(function(){
			Page.PL('stop');
		}).toJson = true;
	}
}
// GET ID
function ge(i){
	return document.getElementById(i);
}
function gee(el){
	return (typeof el == 'string' || typeof el == 'number') ? document.getElementById(el) : el;
}
// BUTTON LOADING
function butloading(i, w, d, t){
	if(d == 'disabled'){
		$('#'+i).html('<div style="width:'+w+'px;text-align:center;"><img src="/theme/Default/images/loading_mini.gif" alt="" /></div>');
		ge(i).disabled = true;
	} else {
		$('#'+i).html(t);
		ge(i).disabled = false;
	}
}

// TEXTLOAD
function textLoad(i){
	$('#'+i).html('<img src="/theme/Default/images/loading_mini.gif" alt="" />').attr('onClick', '').attr('href', '#');
}

// UPDATE NUM
function updateNum(i, type){
	if(type)
		$(i).text(parseInt($(i).text())+1);
	else
		$(i).text($(i).text()-1);
}

// ERROR ANIMMATION INPUT
function setErrorInputMsg(i){
	$("#"+i).css('background', '#ffefef');
	$("#"+i).focus();
	setTimeout("$('#"+i+"').css('background', '#fff').focus()", 700);
}

// ADD ERR
function addAllErr(text, tim) {
	if (!tim) var tim = 2500;
	$('.privacy_err').remove();
	$('body').append('<div class="privacy_err"><div class="talker_message">' + text + '</div></div>');
	$('.privacy_err').fadeIn('fast');
	setTimeout("$('.privacy_err').fadeOut('fast')", tim);
}
function addAllOk(text, tim) {
	if (!tim) var tim = 2500;
	$('.privacy_err').remove();
	$('body').append('<div class="privacy_err"><div class="talker_messages">' + text + '</div></div>');
	$('.privacy_err').fadeIn('fast');
	setTimeout("$('.privacy_err').fadeOut('fast')", tim);
}
function addAllAlert(text, tim) {
	if (!tim) var tim = 2500;
	$('.privacy_err').remove();
	$('body').append('<div class="privacy_err"><div class="talker_messages_alert">' + text + '</div></div>');
	$('.privacy_err').fadeIn('fast');
	setTimeout("$('.privacy_err').fadeOut('fast')", tim);
}
var radiobtn = {
	select: function(j,i){
		$('#'+j).val(i);
		$('.settings_reason').removeClass('on');
		$(event.target).addClass('on');
	}
}
// LANG NUM
function langNumric(id, num, text1, text2, text3, text4, text5){
	strlen_num = num.length;
	if(num <= 21){
		numres = num;
	} else if(strlen_num == 2){
		parsnum = num.substring(1,2);
		numres = parsnum.replace('0','10');
	} else if(strlen_num == 3){
		parsnum = num.substring(2,3);
		numres = parsnum.replace('0','10');
	} else if(strlen_num == 4){
		parsnum = num.substring(3,4);
		numres = parsnum.replace('0','10');
	} else if(strlen_num == 5){
		parsnum = num.substring(4,5);
		numres = parsnum.replace('0','10');
	}
	if(numres <= 0)
		var gram_num_record = text5;
	else if(numres == 1)
		var gram_num_record = text1;
	else if(numres < 5)
		var gram_num_record = text2;
	else if(numres < 21)
		var gram_num_record = text3;
	else if(numres == 21)
		var gram_num_record = text4;
	else
		var gram_num_record = '';
	$('#'+id).html(gram_num_record);
}

// LANG BOX
var trsn = {
  box: function(){
    $('.js_titleRemove').remove();
    viiBox.start();
	$.post('/?go=lang', function(d){
	  viiBox.win('vii_lang_box', d);
	});
  }
}

// ANTISPAM
function AntiSpam(act){
  Page.Loading('stop');
  var max_friends = 40;
  var max_msg = 40;
  var max_wall = 500;
  var max_comm = 2000;
  if(act == 'friends'){
    Box.Info('antispam_'+act, lang_11, lang_12.replace('{max_friends}', max_friends), 300, 4000);
  } else if(act == 'messages'){
    Box.Info('antispam_'+act, lang_11, lang_12.replace('{max_msg}', max_msg), 350, 5000);
  } else if(act == 'wall'){
    Box.Info('antispam_'+act, lang_11, lang_14.replace('{max_wall}', max_wall), 350, 4000);
  } else if(act == 'comm'){
    Box.Info('antispam_'+act, lang_11, lang_15.replace('{max_comm}', max_comm), 350, 4000);
  } else if(act == 'groups'){
    Box.Info('antispam_'+act, lang_11, lang_16, 350, 3000);
  }
}
// DEL USER PAGE BOX
function delMyPage(){
  Box.Show('del_page', 400, lang_17, '<div style="padding:15px;">'+lang_18+'</div>', lang_box_canсel, lang_19, 'startDelpage()');
}

// DEL USER PAGE
function startDelpage(){
  $('#box_loading').fadeIn('fast');
  $('.box_footer .button_div, .box_footer .button_div_gray').fadeOut('fast');
  $.post('/?go=del_my_page', function(){
    window.location.href = '/';
  });
}