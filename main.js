var uagent = navigator.userAgent.toLowerCase();
var is_safari = (!(/chrome/i.test(uagent)) && /webkit|safari|khtml/i.test(uagent));
var is_ie = ((uagent.indexOf('msie') != -1) && (!is_opera) && (!is_safari) && (!is_webtv));
var is_ie4 = ((is_ie) && (uagent.indexOf("msie 4.") != -1));
var is_moz = /firefox/i.test(uagent);
var is_ns = ((uagent.indexOf('compatible') == -1) && (uagent.indexOf('mozilla') != -1) && (!is_opera) && (!is_webtv) && (!is_safari));
var is_ns4 = ((is_ns) && (parseInt(navigator.appVersion) == 4));
var is_opera = (uagent.indexOf('opera') != -1);
var is_kon = (uagent.indexOf('konqueror') != -1);
var is_webtv = (uagent.indexOf('webtv') != -1);
var is_win = ((uagent.indexOf("win") != -1) || (uagent.indexOf("16bit") != -1));
var is_mac = ((uagent.indexOf("mac") != -1) || (navigator.vendor == "Apple Computer, Inc."));
var is_chrome = (uagent.match(/Chrome\/\w+\.\w+/i)); if(is_chrome == 'null' || !is_chrome || is_chrome == 0) is_chrome = '';
var is_mobile = /iphone|ipod|ipad|opera mini|opera mobi|iemobile|android/i.test(uagent);
var ua_vers = parseInt(navigator.appVersion);
var req_href = location.href;
var scrollTopForFirefox = 0;
var url_next_id = 1;
var PeerConnection = window.mozRTCPeerConnection || window.webkitRTCPeerConnection, IceCandidate = window.mozRTCIceCandidate || window.RTCIceCandidate, SessionDescription = window.mozRTCSessionDescription || window.RTCSessionDescription;
navigator.getMedia = ( navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);

var cur = {destroy:[]};
cur.langs = {};
cur.Media = {};
var kjTimers = {};

function Scroller(id, opts){
	if(!opts) opts = {};

	this.bl = $('#'+id);
	this.cont = this.bl.children('.scroller_cont');

	this.bl.append('<div class="scroller_panel"><div class="slider"></div></div>').addClass('scroller');

	this.panel = this.bl.children('.scroller_panel');
	this.slider = this.panel.children('.slider');

	var _s = this;
	_s.state = {t: 0, h: 0};
    
    
    this.bl.bind( 'mousewheel DOMMouseScroll', function ( o ) {
    var e = o;
		o.preventDefault();
		
		if(!_s.state.visible) return;

		var top = e.wheelDelta > 0 ? true : false, t = _s.state.t;
		//if(top) t += 20;
		//else t -= 20;

		var delta = e.detail? (e.detail/3) * (-100) : e.wheelDelta;

		t += (delta);

		var max = _s.state.bl_h-_s.state.cont_h;
		t = Math.min(0, Math.max(max, t));
		if(_s.state.t != t){
			if(t <= max && opts.onBottom) opts.onBottom();
			_s.state.t = t;
			_s.cont.css('top', t+'px');
			_s.update_slider();
		}
});
    /*
	this.bl.bind((is_moz ? 'DOMMouseScroll' : 'mousewheel'), function(o){
		var e = o;
		o.preventDefault();
		
		if(!_s.state.visible) return;

		var top = e.wheelDelta > 0 ? true : false, t = _s.state.t;
		//if(top) t += 20;
		//else t -= 20;

		var delta = e.detail? (e.detail/3) * (-100) : e.wheelDelta;

		t += (delta);

		var max = _s.state.bl_h-_s.state.cont_h;
		t = Math.min(0, Math.max(max, t));
		if(_s.state.t != t){
			if(t <= max && opts.onBottom) opts.onBottom();
			_s.state.t = t;
			_s.cont.css('top', t+'px');
			_s.update_slider();
		}
	});*/
	var win = $(window);
	function slide(e){
		if(!_s.state.visible) return;
		e.preventDefault();

		var st = e.clientY, 
			gl_p = 100-(_s.state.bl_h/_s.state.cont_h)*100, 
			bl_pos = _s.bl.offset().top, 
			pos = _s.slider.offset().top-bl_pos,
			h = _s.slider.height(),
			bottom = _s.state.cont_h-_s.state.bl_h;

		function Move(e1){
			var nt = e1.clientY-st, r = Math.max(0, Math.min(_s.state.bl_h-h, (pos+(nt))));

			_s.slider.css('margin-top', r+'px');
			var p = r/_s.state.bl_h*100, top = p*_s.state.cont_h/100;
			if(_s.state.t != -top){
				if(top >= bottom && opts.onBottom) opts.onBottom();
				_s.cont.css('top', -top+'px');
				_s.state.t = -top;
			}
		}

		function Up(){
			win.unbind('mousemove', Move).unbind('mouseup', Up);
		}
		Up();
		win.bind('mousemove', Move).bind('mouseup', Up);
		Move(e);
	}
	this.slider.bind('mousedown', slide);
	this.panel.bind('mousedown', function(e){
		if(!_s.state.visible || e.target.className == 'slider') return;

		var bl_pos = _s.bl.offset().top, 
			h = _s.slider.height(), 
			move_slider = Math.max(0, Math.min(_s.state.bl_h-h, (e.clientY-bl_pos)-(h/2)));

		_s.slider.css('margin-top', move_slider+'px');
		slide(e);
	});
	this.check_scroll();
}

$.extend(Scroller.prototype, {
	check_scroll: function(opts){
		if(!opts) opts = {};
		var bl_h = this.bl.height(), cont_h = this.cont[0].scrollHeight;
		this.state.visible = false;
		if(!opts.no_top) this.cont.css('top', '0px');
		if(cont_h > bl_h){
			var p = Math.floor((bl_h/cont_h)*100), h = Math.min(bl_h, Math.round(p*bl_h/100));
			this.slider.css('height', h+'px').css('margin-top', '0px');
			this.panel.show();
			this.state.h = h;
			this.state.bl_h = bl_h;
			this.state.cont_h = cont_h;
			this.state.visible = true;
			this.update_slider();
		}else this.panel.hide();
	},
	update_slider: function(){
		var p = Math.round((Math.abs(this.state.t)/this.state.cont_h)*100), mtop = p*this.state.bl_h/100;
		mtop = Math.min(this.state.bl_h-30, mtop);
		this.slider.css('margin-top', mtop+'px');
	},
	toBottom: function(){
		var bl_h = this.bl.height(), cont_h = this.cont.get(0).scrollHeight, top = cont_h-bl_h;
		this.cont.css('top', '-'+top+'px');
		this.state.t = -top;
		this.update_slider();
	},
	toTop: function(){
		this.cont.css('top', '0px');
		this.state.t = 0;
		this.update_slider();
	},
	checklAndBottom: function(){
		this.check_scroll({no_top: 1});
		this.toBottom();
	}
});












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


if(!window.Kj) window.Kj = {};

Kj.Selector = {
	oldID: null,
	init: function(id, options, def, opts){
		var count = 0, liClass = '', defText = '';
		if(!opts) opts = {};
		$(id).html('');
		$(id).append('<div class="kjSelectorContainer"></div><div class="kjSelectorStrelkaBL"></div>');
		for(var i in options){
			if(def == options[i]) {
				liClass = 'class="kjSelectorLiHover"';
				defText = i;
				Kj.Selector.old_titles[id] = i;
			}else liClass = '';
			if(options[i] == 0) $(id+' .kjSelectorContainer').prepend('<li '+liClass+' value="'+options[i]+'" dir="auto">'+i+'</li>');
			else $(id+' .kjSelectorContainer').append('<li '+liClass+' value="'+options[i]+'" dir="auto">'+i+'</li>');
			count++;
		}
		if(!def) {
			var firstLi = $(id+' li:first');
			defText = firstLi.text();
			Kj.Selector.old_titles[id] = defText;
			def = firstLi.attr('value');
			firstLi.addClass('kjSelectorLiHover');
		}
		var editable = opts.search ? 'contenteditable="true" spellcheck="true"' : '';
		$(id).prepend('<div class="kjSelectorTop" '+editable+' dir="auto">'+defText+'</div>').val(def);
		if(opts.search) $(id+' .kjSelectorTop').bind('keypress', function(e){ Kj.Selector.keyPress(e, id); }).bind('keyup', function(e){ Kj.Selector.search(opts.type, $(this).text(), id, e); });
		$(id+' .kjSelectorTop, '+id+' .kjSelectorStrelkaBL').mousedown(function(){
			if(Kj.Selector.oldID != id){
				setTimeout(function(){
					//if(Kj.Selector.oldID != id) {
						var elPos = $(window).height()-($(id).offset().top+20), blContainer = $(id+' .kjSelectorContainer');
						if(blContainer.height() > elPos) blContainer.addClass('kjSelectorContBottom').removeClass('kjSelectorContTop').css('top', '-'+$(id+' .kjSelectorContainer').height()+'px');
						else blContainer.addClass('kjSelectorContTop').removeClass('kjSelectorContBottom');
						$(id+' .kjSelectorContainer').show().scrollTop(0);
						$(id+' .kjSelectorStrelkaBL').addClass('kjSelectorStrelkaHover');
						$(id+' li').removeClass('kjSelectorLiHover');
						$(id+' li[value='+$(id).val()+']').addClass('kjSelectorLiHover');
					//}
				});
				Kj.Selector.oldID = id;
			}else {
				$('.kjSelector .kjSelectorContainer').hide();
				$('.kjSelector .kjSelectorStrelkaBL').removeClass('kjSelectorStrelkaHover');
				Kj.Selector.oldID = null;
			}
		});
		$(id+' li').mouseover(function(){
			$(id+' li').removeClass('kjSelectorLiHover');
			$(this).addClass('kjSelectorLiHover');
		}).mousedown(function(){
			var val = $(this).attr('value'), text =  $(this).text();
			$(id).val(val);
			$(id+' .kjSelectorTop').html(text);
			Kj.Selector.old_titles[id] = text;
			$(id).change();
			Kj.Selector.oldID = null;
		});
		var contBL = $(id+' .kjSelectorContainer');
		contBL.width($(id).width());
		if(count > 10) contBL.addClass('kjSelectorScroll');
		$(window).mousedown(function(e){
			if ($(e.target).filter('.kjSelectorContainer:visible').length >= 1) return;
			$.each($('.kjSelector'), function(){
				var id = '#'+$(this).attr('id');
				$(id+' .kjSelectorTop').html(Kj.Selector.old_titles[id]);
				$(id+' .kjSelectorStrelkaBL').removeClass('kjSelectorStrelkaHover');
				$(id+' .kjSelectorContainer').hide();
			});
			Kj.Selector.oldID = null;
		});
	},
	keyPress: function(e, id){
		if(e.keyCode == 13) {
			e.preventDefault();
			$(id+' li.kjSelectorLiHover').trigger('mousedown');
		}
	},
	old_titles: {},
	search: function(type, val, id, e){
		removeTimer('search_select');
		addTimer('search_select', function(){
			if(e.keyCode == 40){
				e.preventDefault();
				var next = $(id+' li.kjSelectorLiHover').next();
				if(next.length == 0) next = $(id+' li:first');
				next.trigger('mouseover');
				return;
			}else if(e.keyCode == 38){
				e.preventDefault();
				var prev = $(id+' li.kjSelectorLiHover').prev();
				if(prev.length == 0) prev = $(id+' li:last');
				prev.trigger('mouseover');
				return;
			}else if(e.keyCode == 39 || e.keyCode == 37) return;
			var data = {query: val};
			if(type == 'country') {
				var url = '/edit?act=country';
				$('#country_preloader').show();
			}else if(type == 'city'){
				var url = '/edit?act=city';
				$('#city_preloader').show();
				data['id'] = $('#edit_country').val();
			}
			var first = 0;
			ajax.post(url, data, function(d){
				if(d){
					$(id+' .kjSelectorContainer').html('');
					options = JSON.parse(d);
					for(var i in options){
						var liClass = first ? '' : 'class="kjSelectorLiHover"';
						first = 1;
						if(options[i] == 0) $(id+' .kjSelectorContainer').prepend('<li '+liClass+' value="'+options[i]+'">'+i+'</li>');
						else $(id+' .kjSelectorContainer').append('<li '+liClass+' value="'+options[i]+'">'+i+'</li>');
					}
					$(id+' li').mouseover(function(){
						$(id+' li').removeClass('kjSelectorLiHover');
						$(this).addClass('kjSelectorLiHover');
					}).mousedown(function(){
						var val = $(this).attr('value'), text =  $(this).text();
						$(id).val(val);
						$(id+' .kjSelectorTop').html(text);
						Kj.Selector.old_titles[id] = text;
						$(id).change();
						Kj.Selector.oldID = null;
					});
					$(id+' .kjSelectorContainer').removeClass('kjSelectorScroll');
				}
				if(type == 'country') $('#country_preloader').hide();
				else if(type == 'city') $('#city_preloader').hide();
			});
		}, 200);
	}
};

Kj.dropMenu = {
	Init: function(p){
		$('#'+p.id).addClass('DropMenu').attr('onClick', 'Kj.dropMenu.Hover(\''+p.id+'\')').attr('onMouseOut', 'Kj.dropMenu.Out()');
		$('#'+p.id).html('<div onmouseover="Kj.dropMenu.over()" onMouseOut="Kj.dropMenu.Out()"><div id="titleDrop"></div><div class="DropMenuItems">'+$('#'+p.id).html()+'</div></div>');
		if(!p.nochange){
			if(!p.selected){
				var value = $('#'+p.id+' li:first').attr('value');
				$('#'+p.id+' #titleDrop').html($('#'+p.id+' li:first').html());
				$('#'+p.id).attr('value', value).val(value);
			}else var value = p.selected;
		}else $('#'+p.id+' #titleDrop').html(p.title);
		$.each($('#'+p.id+' li'), function() {
			var val = $(this).attr('value');
			$(this).addClass('DropMenuItem');
			if(!p.nochange) $(this).attr('onClick', 'Kj.dropMenu.Change(\''+p.id+'\', this, \''+val+'\')');
			if(val == value && !p.nochange){
				$('#'+p.id+' #titleDrop').html($(this).html());
				$('#'+p.id).attr('value', val).val(val);
				$(this).addClass('DropMenuItemSelected');
			}
		});
		$('#'+p.id+' .DropMenuItems').css('margin-left', '-1px');
		setTimeout(function(){
			window.objF = $('#'+p.id+' .DropMenuItems');
			$('#'+p.id).css('width', ($('#'+p.id+' .DropMenuItems').width()-2)+'px').after('<div class="clear"></div>');
		});
	},
	over: function(){
		removeTimer('dropmenu');
	},
	opened: 0,
	Hover: function(id){
		if(Kj.dropMenu.opened == id) {
			Kj.dropMenu.opened = 0;
			return;
		}
		setTimeout(function(){
			Kj.dropMenu.opened = id;
			removeTimer('dropmenu');
			$('.DropMenu').removeClass('DropMenuHover');
			$('#'+id).addClass('DropMenuHover');
			$('#'+id+' .DropMenuItems').show();
		}, 100);
	},
	Out: function(){
		removeTimer('dropmenu');
		addTimer('dropmenu', function(){
			Kj.dropMenu.opened = 0;
			$('.DropMenu').removeClass('DropMenuHover');
			$('.DropMenuItems').hide();
		}, 700);
	},
	Change: function(id, block, value){
		var bl = $(block);
		$('#'+id+' li').removeClass('DropMenuItemSelected');
		bl.addClass('DropMenuItemSelected');
		$('#'+id).attr('value', value).val(value);
		$('#'+id+' #titleDrop').html(bl.html());
		$('#'+id).change();
		Kj.dropMenu.opened = id;
		cancelEvent(window.event);
	},
	inputValues: {},
	callbacks: {},
	InitInput: function(p){
		if(!p.width) p.width = 400;
		if(!p.noAdd) p.noAdd = 15;
		$(p.id).addClass('DropInput').css('width', p.width+'px');
		Kj.dropMenu.inputValues[p.id] = {};
		$(p.id).html('<div class="DropInputBlock" onMouseDown="Kj.dropMenu.DownInput(\''+p.id+'\', '+p.noAdd+')"><div id="titleDrop"><div class="dropInputItems"><div id="items"></div><input type="text"/><div class="clear"></div></div></div><div class="DropInputStrelka"></div></div><div class="DropInputItem" style="width: '+($(p.id).width()-2)+'px">'+$(p.id).html()+'</div>');
		if(p.type == 'friends') var url = '/index.php?go=repost&act=loadFriends';
		else if(p.type == 'groups') var url = '/index.php?go=repost&act=loadGroups&not_id='+p.notID;
		else if(p.type == 'matirial') var url = '/edit?act=loadMatirial&male=1';
		else if(p.type == 'matirial2') var url = '/edit?act=loadMatirial';
		$(p.id+' input').attr('placeholder', p.text).keyup(function(){
			Kj.dropMenu.sershInput({id: p.id, url: url, query: $(p.id+' input').val(), noAdd: p.noAdd});
		});
		Kj.dropMenu.sershInput({id: p.id, url: url, query: '', noAdd: p.noAdd, sel: p.selected});
		$(p.id).after('<div class="clear"></div>');
		if(p.cb) this.callbacks[p.id] = p.cb;
		Kj.dropMenu.size_input(p.id);
	},
	size_input: function(id){
		var inp = $(id+' #titleDrop input'), w = $(id).width()-30, items = $(id+' #items') , items_w = items.width(), rw = Math.max(100, w-items_w);
		if(items_w >= w){
			var ww = 0;
			$(id+' #items li').each(function(){
				ww += $(this).width()+3;
			});
			var lines = Math.ceil(ww/w);
			rw = w*(ww/w)-ww;
			items.css('float', 'none');
		}else items.css('float', 'left');
		inp.css('width', rw+'px');
	},
	sershInput: function(p){
		$(p.id+' .DropInputItem').load(p.url, {query: p.query, values: JSON.stringify(Kj.dropMenu.inputValues[p.id]), sel: p.sel}, function(d){
			$.each($(p.id+' .DropInputItem li'), function() {
				var img = $(this).attr('data-img');
				var name = $(this).attr('data-name');
				var value = $(this).val();
				var traf = $(this).attr('data-traf') || '';
				$(this).html('<div class="fl_l"><img src="'+img+'" style="width: 30px; height: 30px"/></div><div class="fl_l" style="margin-left: 5px"><div class="uName">'+name+'</div><div style="color: #666; font-size: 10px; margin-top: 2px">'+traf+'</div></div><div class="clear"></div>').mouseover(function(){
					$(p.id+' .DropInputItem li').removeClass('DropInputItemsHover');
					$(this).addClass('DropInputItemsHover');
				}).mousedown(function(){
					Kj.dropMenu.insertItem({id: p.id, val: value, name: name, img: img, elem: this, traf: traf, noAdd: p.noAdd});
				});
				if(value == p.sel) Kj.dropMenu.insertItem({id: p.id, val: value, name: name, img: img, elem: this, traf: traf, noAdd: p.noAdd});
			});
		});
	},
	DownInput: function(id, noAdd){
		if($(id+' .dropInputItems #items li').length < noAdd){
			$(id+' .DropInputItem li').removeClass('DropInputItemsHover');
			$(id+' .DropInputItem li:first').addClass('DropInputItemsHover');
			$(id+' .DropInputItem').show();
			$(id+' input').focus().blur(function(){
				$(id+' .DropInputItem').hide();
			});
			Kj.dropMenu.size_input(id);
		}
	},
	insertItem: function(p){

		$(p.id+' input').hide().val('');
		$(p.elem).remove();
		var arrInp = Kj.dropMenu.inputValues[p.id];
		arrInp[p.val] = 1;
		if(Kj.dropMenu.callbacks[p.id]) Kj.dropMenu.callbacks[p.id](Kj.dropMenu.inputValues[p.id]);
		var ins_li = $('<li/>').appendTo(p.id+' .dropInputItems #items');
		ins_li.attr({
			'data-name': p.name,
			'data-img': p.img,
			value: p.val,
			'data-traf': p.traf
		}).html(p.name+' ');
		var clos_lnk = $('<span/>').appendTo(ins_li);
		clos_lnk.html('x').addClass('clos').mousedown(function(){
			ins_li.remove();
			delete arrInp[p.val];
			$(p.id+' .DropInputItem').hide();
			if($(p.id+' .dropInputItems #items li').length >= p.noAdd || !$(p.id+' .dropInputItems #items li').size()){
				$(p.id+' .dropInputItems #items #addbut').remove();
				$(p.id+' input').show();
				var height = $(p.id+' .dropInputItems').height()-8;
			}else var height = $(p.id+' .dropInputItems').height()+4;
			$(p.id+' .DropInputBlock').css('height', height+'px');
			var new_elem = $('<li/>').appendTo($(p.id+' .DropInputItem'));
			new_elem.attr({
				'data-name': p.name,
				'data-img': p.img,
				value: p.val,
				'data-traf': p.traf
			}).html('<div class="fl_l"><img src="'+p.img+'" style="width: 30px; height: 30px"/></div><div class="fl_l" style="margin-left: 5px"><div class="uName">'+p.name+'</div><div style="color: #666; font-size: 10px; margin-top: 2px">'+p.traf+'</div></div><div class="clear"></div>').mouseover(function(){
				$(p.id+' .DropInputItem li').removeClass('DropInputItemsHover');
				$(new_elem).addClass('DropInputItemsHover');
			}).mousedown(function(){
				Kj.dropMenu.insertItem({id: p.id, val: p.val, name: p.name, img: p.img, elem: new_elem, traf: p.traf, noAdd: p.noAdd});
			});
			$(p.id+' #addbut').trigger('mousedown');
			if(Kj.dropMenu.callbacks[p.id]) Kj.dropMenu.callbacks[p.id](Kj.dropMenu.inputValues[p.id]);
			Kj.dropMenu.size_input(p.id);
		});
		$(p.id+' .dropInputItems #items #addbut').remove();
		if($(p.id+' .dropInputItems #items li').length < p.noAdd){
			var add_li = $('<li/>').appendTo(p.id+' .dropInputItems #items');
			add_li.mousedown(function(){
				$(p.id+' .dropInputItems #items #addbut').remove();
				$(p.id+' input').show().val('');
				var height = $(p.id+' .dropInputItems').height()-8;
				$(p.id+' .DropInputBlock').css('height', height+'px');
				setTimeout(function(){
					Kj.dropMenu.DownInput(p.id, p.noAdd);
				}, 100);
			}).html(langs.media_video_add+' <span class="clos">+</span>').addClass('addItemDropInput').attr('id', 'addbut');
		}
		var height = $(p.id+' .dropInputItems').height()+4;
		$(p.id+' .DropInputBlock').css('height', height+'px');
		Kj.dropMenu.size_input(p.id);
	}
};

Kj.radioBtn = {
	radioInit: function(bl, def, cb){
		if(!def && arguments[0] == false) def = $(bl+' div:first').attr('value');
		$(bl).attr('value', def);
		$.each($(bl+' div'), function(){
			var val = $(this).attr('value');
			if(val == def) var classAdd = 'uiButtonBgActive';
			else var classAdd = '';
			$(this).html('<div class="ui_radioDiv" onmousedown="Kj.radioBtn.radioDown(this, \''+bl+'\', '+cb+')" value="'+val+'"><div class="uiButtonBg '+classAdd+'"></div><div class="fl_l">'+$(this).html()+'</div><div class="clear"></div></div>');
		});
	},
	radioDown: function(el, bl, cb){
		$(bl+' .uiButtonBg').removeClass('uiButtonBgActive');
		var elem = $(el).children('.uiButtonBg');
		elem.addClass('uiButtonBgActive');
		$(bl).val($(el).attr('value')).change();
		if(cb) cb();
	}
};
var kjSelectArea = {
	data: {},
	Init: function(id, p){
		var _s = this;
		_s.data[id] = p;
		var width = $(id).width(), height = $(id).height(), bright = width-p.sw-50, bbottom = height-p.sh-50;
		$(id).prepend('<div class="kjSelectAreaBL" style="border-width: 50px '+bright+'px '+bbottom+'px 50px; width: '+p.width+'px;height: '+p.height+'px;"></div><div class="dropAreaBlock" style="width: '+p.width+'px;height: '+p.height+'px;">\
		<div class="kjSelectAreaResize select_resize_1" onmousedown="return kjSelectArea.resize(\'rtl\', \''+id+'\');"></div>\
		<div class="kjSelectAreaResize select_resize_2" onmousedown="return kjSelectArea.resize(\'mt\', \''+id+'\');"></div>\
		<div class="kjSelectAreaResize select_resize_3" onmousedown="return kjSelectArea.resize(\'rtr\', \''+id+'\');"></div>\
		<div class="kjSelectAreaResize select_resize_4" onmousedown="return kjSelectArea.resize(\'mr\', \''+id+'\');"></div>\
		<div class="kjSelectAreaResize select_resize_5" onmousedown="return kjSelectArea.resize(\'rbr\', \''+id+'\');"></div>\
		<div class="kjSelectAreaResize select_resize_6" onmousedown="return kjSelectArea.resize(\'mb\', \''+id+'\');"></div>\
		<div class="kjSelectAreaResize select_resize_7" onmousedown="return kjSelectArea.resize(\'rbl\', \''+id+'\');"></div>\
		<div class="kjSelectAreaResize select_resize_8" onmousedown="return kjSelectArea.resize(\'ml\', \''+id+'\');"></div>\
		</div>');
		var bl = $(id+' .dropAreaBlock'), left = $(id).offset().left, top = $(id).offset().top, height = $(id).height(), width = $(id).width();
		if(p.hide) {
			bl.hide();
			$(id+' .kjSelectAreaBL').css('border-color', 'rgba(0,0,0,0)');
		}
		bl.bind('mousedown', function(e){
			if($(e.target).filter('.kjSelectAreaResize').length > 0) return;
			e.preventDefault();
			left = $(id).offset().left, top = $(id).offset().top;
			_s.data[id].dl = e.pageX-bl.offset().left, _s.data[id].dt = e.pageY-bl.offset().top;
			$(window).bind('mousemove', Move);
		});
		$(window).bind('mouseup', Up);
		function Move(e1){
			e1.preventDefault();
			if(_s.data[id].onStart) _s.data[id].onStart();
			var w1 = bl.width(), pos = e1.pageX-left-_s.data[id].dl, h1 = bl.height(), pos1 = e1.pageY-top-_s.data[id].dt;
			if((pos+w1) > width) pos = width-w1;
			if(pos < 0) pos = 0;
			if(pos1 < 0) pos1 = 0;
			if((pos1+h1) > height) pos1 = height-h1;
			var bb = height-bl.height()-pos1, br = width-(bl.width()+pos), bt = top;
			bl.css('margin', pos1+'px '+br+'px '+bb+'px '+pos+'px');
			$(id+' .kjSelectAreaBL').css('border-width', pos1+'px '+br+'px '+bb+'px '+pos+'px');
		}
		function Up(){
			$(window).unbind('mousemove', Move);
			if(_s.data[id].onEnd) _s.data[id].onEnd();
		}
		if(p.creator){
			var pos_creat = {};
			$(id +' .kjSelectAreaBL').bind('mousedown', function(e2){
				left = $(id).offset().left, top = $(id).offset().top;
				var b1 = e2.pageX-left, b2 = e2.pageY-top, br = width-b1, bb = height-b2;
				pos_creat = {x: e2.pageX, y: e2.pageY};
				bl.css({'margin': b2+'px '+br+'px '+bb+'px '+b1+'px', width: 0,height: 0}).show();
				$(id+' .kjSelectAreaBL').css({'border-width': b2+'px '+(br-bl.width())+'px '+(bb-bl.height())+'px '+b1+'px', width: 0,height: 0}).css('border-color', 'rgba(0,0,0,0.7)');
				$(window).bind('mousemove', moveCreat);
				$(window).bind('mouseup', upCreat);
			}).css('cursor', 'crosshair');
			function moveCreat(e3){
				e3.preventDefault();
				if(_s.data[id].onStart) _s.data[id].onStart();
				var p1 = e3.pageX, p2 = e3.pageY, l = bl.offset().left-left, t = bl.offset().top-top;
				var w_nav = (p1 > pos_creat.x) ? true : false;
				var h_nav = (p2 > pos_creat.y) ? true : false;
				if(w_nav) {
					var ml = pos_creat.x-left;
					var w = Math.min(p1-left-l, (width-ml));
				}else{
					var ml = Math.max(e3.pageX-left, 0);
					var w = Math.min(pos_creat.x-e3.pageX, (width-ml));
				}
				if(h_nav){
					var mt = pos_creat.y-top;
					var h = Math.min(p2-top-t, (height-mt));
				}else{
					var mt = Math.max(e3.pageY-top, 0);
					var h = Math.min(pos_creat.y-e3.pageY, (height-ml));
				}
				if(mt == 0) h = bl.height();
				if(ml == 0) w = bl.width();
				bl.css({width: w+'px', 'margin-left': ml+'px', height: h+'px', 'margin-top': mt+'px'});
				$(id+' .kjSelectAreaBL').css({'border-width': mt+'px '+((width-ml)-bl.width())+'px '+((height-mt)-bl.height())+'px '+ml+'px', width: w+'px', height: h+'px'});
			}	
			function upCreat(){
				$(window).unbind('mousemove', moveCreat);
				$(window).unbind('mouseup', upCreat);
				var h1 = bl.height();
				if(bl.width() < p.width) bl.css('width', p.width+'px');
				if(h1 < p.height) bl.css('height', p.height+'px');
				if(bl.width() > p.max_width) bl.css('width', p.max_width+'px');
				if(h1 > p.max_height) bl.css('height', p.max_height+'px');
				h1 = bl.height();
				if(((bl.offset().top-top)+h1) > height) bl.css('margin-top', (height-h1)+'px');
				var mt = bl.offset().top-top, ml = bl.offset().left-left;
				$(id+' .kjSelectAreaBL').css({'border-width': mt+'px '+((width-ml)-bl.width())+'px '+((height-mt)-bl.height())+'px '+ml+'px', width: bl.width()+'px', height: bl.height()+'px'});
				if(_s.data[id].onEnd) _s.data[id].onEnd();
			}
		}
	},
	resize: function(type, id){
		var width = $(id).width(), height = $(id).height(), bl = $(id+' .dropAreaBlock'), left = $(id).offset().left, top = $(id).offset().top, _s = kjSelectArea, Move = false;
		if(_s.data[id].onStart) _s.data[id].onStart();
		if(type == 'mt'){
			Move = function(e){
				e.preventDefault();
				var pos = Math.round(e.pageY-top), mt = bl.offset().top-top, h1 = bl.height();
				pos = Math.max(0, pos);
				var res = mt-pos, res_h = res+h1;
				if(res_h < _s.data[id].max_height && res_h > _s.data[id].height) {
					if(_s.data[id].sizes) {
						var prop = res_h/bl.width();
						if(prop > _s.data[id].sizeh) return;
					}
					bl.css({height: res_h+'px', 'margin-top': pos+'px'});
					$(id+' .kjSelectAreaBL').css({'border-top-width': pos+'px', height: res_h+'px'});
				}
			};
		}else if(type == 'mr'){
			Move = function(e){
				e.preventDefault();
				var pos = Math.round(e.pageX-left), ml = bl.offset().left-left, w1 = bl.width();
				pos = Math.min(pos, width);
				var res = pos-ml-w1, res_w = res+w1, dleft = width-(res_w+ml);
				if(res_w < _s.data[id].max_width && res_w > _s.data[id].width) {
					if(_s.data[id].sizes) {
						var prop = res_w/bl.height();
						if(prop > _s.data[id].sizew) return;
					}
					bl.css({width: res_w+'px', 'margin-right': dleft+'px'});
					$(id+' .kjSelectAreaBL').css({'border-right-width': dleft+'px', width: res_w+'px'});
				}
			};
		}else if(type == 'mb'){
			Move = function(e){
				e.preventDefault();
				var pos = Math.round(e.pageY-top), mt = bl.offset().top-top, h1 = bl.height();
				pos = Math.min(pos, height);
				var res = pos-(mt+h1), res_h = res+h1;
				if(res_h < _s.data[id].max_height && res_h > _s.data[id].height){
					if(_s.data[id].sizes) {
						var prop = res_h/bl.width();
						if(prop > _s.data[id].sizeh) return;
					}
					bl.css({height: res_h+'px', 'margin-bottom': (height-pos)+'px'});
					$(id+' .kjSelectAreaBL').css({'border-bottom-width': (height-(res_h*1)-mt)+'px', height: res_h+'px'});
				}
			};
		}else if(type == 'ml'){
			Move = function(e){
				e.preventDefault();
				var pos = Math.round(e.pageX-left), ml = bl.offset().left-left, w1 = bl.width();
				pos = Math.max(0, pos);
				var res = ml-pos, res_w = res+w1;
				if(res_w < _s.data[id].max_width && res_w > _s.data[id].width){
					if(_s.data[id].sizes) {
						var prop = res_w/bl.height();
						if(prop > _s.data[id].sizew) return;
					}
					bl.css({width: res_w+'px', 'margin-left': pos+'px'});
					$(id+' .kjSelectAreaBL').css({'border-left-width': pos+'px', width: res_w+'px'});
				}
			};
		}else if(type == 'rtl'){
			Move = function(e){
				e.preventDefault();
				var t1 = Math.round(e.pageY-top), l1 = Math.round(e.pageX-left), w1 = bl.width(), h1 = bl.height(), ml = bl.offset().left-left, mt = bl.offset().top-top;
				l1 = Math.max(0, l1);
				t1 = Math.max(0, t1);
				var res = ml-l1, res_w = res+w1, res1 = mt-t1, res_h = res1+h1;
				if(res_w < _s.data[id].max_width && res_w > _s.data[id].width) {
					bl.css({width: res_w+'px', 'margin-left': l1+'px'});
					$(id+' .kjSelectAreaBL').css({'border-left-width': l1+'px', width: res_w+'px'});
				}
				if(res_h < _s.data[id].max_height && res_h > _s.data[id].height) {
					bl.css({height: res_h+'px', 'margin-top': t1+'px'});
					$(id+' .kjSelectAreaBL').css({height: res_h+'px', 'border-top-width': t1+'px'});
				}
			};
		}else if(type == 'rtr'){
			Move = function(e){
				e.preventDefault();
				var t1 = Math.round(e.pageY-top), l1 = Math.round(e.pageX-left), w1 = bl.width(), h1 = bl.height(), ml = bl.offset().left-left, mt = bl.offset().top-top;
				l1 = Math.min(width, l1);
				t1 = Math.max(0, t1);
				var res = l1-ml-w1, res_w = res+w1, res1 = mt-t1, res_h = res1+h1;
				if(res_w < _s.data[id].max_width && res_w > _s.data[id].width) {
					bl.css({width: res_w+'px', 'margin-right': (width-res_w-ml)+'px'});
					$(id+' .kjSelectAreaBL').css({'border-right-width': (width-res_w-ml)+'px', width: res_w+'px'});
				}
				if(res_h < _s.data[id].max_height && res_h > _s.data[id].height) {
					bl.css({height: res_h+'px', 'margin-top': t1+'px'});
					$(id+' .kjSelectAreaBL').css({height: res_h+'px', 'border-top-width': t1+'px'});
				}
			}
		}else if(type == 'rbr'){
			Move = function(e){
				e.preventDefault();
				var t1 = Math.round(e.pageY-top), l1 = Math.round(e.pageX-left), w1 = bl.width(), h1 = bl.height(), ml = bl.offset().left-left, mt = bl.offset().top-top;
				l1 = Math.min(width, l1);
				t1 = Math.min(height, t1);
				var res = l1-ml-w1, res_w = res+w1, res1 = t1-(mt+h1), res_h = res1+h1;
				if(res_w < _s.data[id].max_width && res_w > _s.data[id].width) {
					bl.css({width: res_w+'px', 'margin-right': (width-res_w-ml)+'px'});
					$(id+' .kjSelectAreaBL').css({'border-right-width': (width-res_w-ml)+'px', width: res_w+'px'});
				}
				if(res_h < _s.data[id].max_height && res_h > _s.data[id].height) {
					bl.css({height: res_h+'px', 'margin-bottom': (height-t1)+'px'});
					$(id+' .kjSelectAreaBL').css({height: res_h+'px', 'border-bottom-width': (height-(res_h*1)-mt)+'px'});
				}
			};
		}else if(type == 'rbl'){
			Move = function(e){
				e.preventDefault();
				var t1 = Math.round(e.pageY-top), l1 = Math.round(e.pageX-left), w1 = bl.width(), h1 = bl.height(), ml = bl.offset().left-left, mt = bl.offset().top-top;
				l1 = Math.max(0, l1);
				t1 = Math.min(height, t1);
				var res = ml-l1, res_w = res+w1, res1 = t1-(mt+h1), res_h = res1+h1;
				if(res_w < _s.data[id].max_width && res_w > _s.data[id].width) {
					bl.css({width: res_w+'px', 'margin-left': l1+'px'});
					$(id+' .kjSelectAreaBL').css({'border-left-width': l1+'px', width: res_w+'px'});
				}
				if(res_h < _s.data[id].max_height && res_h > _s.data[id].height) {
					bl.css({height: res_h+'px', 'margin-bottom': (height-t1)+'px'});
					$(id+' .kjSelectAreaBL').css({height: res_h+'px', 'border-bottom-width': (height-(res_h*1)-mt)+'px'});
				}
			};
		}
		$(window).bind('mousemove', Move);
		$(window).bind('mouseup', Up);
		function Up(){
			if(_s.data[id].onEnd) _s.data[id].onEnd();
			$(window).unbind('mouseup', Up);
			$(window).unbind('mousemove', Move);
		}
	},
	getPos: function(id, img){
		var top1 = $(id).offset().top, left1 = $(id).offset().left;
		var bl = $(id+' .dropAreaBlock'), img = img ? img : $(id+' img'), top = bl.offset().top-top1, left = bl.offset().left-left1, width = img.width(), height = img.height(), w = bl.width(), h = bl.height();
		img.removeAttr('width').removeAttr('height').css({ width: '', height: ''});
	
		var o_width = img.width(), o_height = img.height();
		img.attr('width', width+'px').attr('height', height+'px')
		var p_width = 100-((width/o_width)*100), p_height = 100-((height/o_height)*100);
		var r_top = top+((p_height*top)/100), r_left = left+((p_width*left)/100), r_width = w+((p_width*w)/100), r_height = h+((p_height*h)/100);
		return {top: Math.round(r_top), left: Math.round(r_left), width: Math.round(r_width), height: Math.round(r_height)};
	}
};

function Selector(p){
	this.p = p;
	this.make();
	this.make_data();
}
$.extend(Selector.prototype, {
	make: function(){
		var _s = this;
		var readonly = this.p.no_write ? 'readonly' : '';
		$('#'+this.p.id).addClass('kj_selector').html('<div class="header">\
			<input type="text" class="title" value="- Not selected -" '+readonly+' dir="auto"/>\
			<div class="arrow_box"></div><div class="arrow"></div>\
		</div><div class="cont"></div>');
		$('#'+this.p.id+' .title').bind('keyup', function(e){
			if(e.keyCode == 40){
				e.preventDefault();
				var next = $('#'+_s.p.id+' .cont li.active').next();
				if(next.length == 0) next = $('#'+_s.p.id+' .cont li:first');
				next = next.get(0);
				_s.over_item(next, 1);
				return;
			}else if(e.keyCode == 38){
				e.preventDefault();
				var prev = $('#'+_s.p.id+' .cont li.active').prev();
				if(prev.length == 0) prev = $('#'+_s.p.id+' .cont li:last');
				prev = prev.get(0);
				_s.over_item(prev, 1);
				return;
			}else if(e.keyCode == 39 || e.keyCode == 37) return;
			else if(e.keyCode == 13) {
				var el = $('#'+_s.p.id+' .cont li.active').get(0);
				if(el) _s.down_item(el);
				return;
			}
			_s.search(this.value);
		});
		if(this.p.no_write){
			$('#'+this.p.id+' .title').bind('click', function(){
				if($('#'+_s.p.id+' .title').attr('disabled')) return;
				if($('#'+_s.p.id).hasClass('show')) $('#'+_s.p.id).removeClass('show');
				else _s.open_items();
			});
		}else{
			$('#'+this.p.id+' .title').bind('focus', function(){
				if($('#'+_s.p.id+' .title').attr('disabled')) return;
				if(_s.curent[0] == 0) this.value = '';
				_s.open_items();
			});
		}
		$('#'+this.p.id+' .arrow_box').bind('mousedown', function(){
			if($('#'+_s.p.id+' .title').attr('disabled')) return;
			if($('#'+_s.p.id).hasClass('show')) $('#'+_s.p.id).removeClass('show');
			else _s.open_items();
		});
		$('#'+this.p.id+' .cont').bind('mousewheel', function(e){
			e.preventDefault();
			var delta = e.deltaY, direct = delta / Math.abs(delta);
			if(direct == 1) $(this).scrollTop($(this).scrollTop()+15);
			else $(this).scrollTop($(this).scrollTop()-15);
		});
	},
	curent: false,
	make_data: function(){
		if(!this.p.data.length) return;
		$('#'+this.p.id+' .title').attr('placeholder', this.p.data[0][1]);
		if(!this.p.def){
			$('#'+this.p.id).val(this.p.data[0][0]);
			$('#'+this.p.id+' .title').val(this.p.data[0][1]);
			this.curent = this.p.data[0];
		}else{
			var d = this.p.data;
			for(var i = 0; i < d.length; i++){
				if(d[i][0] == this.p.def){
					$('#'+this.p.id).val(d[i][0]);
					$('#'+this.p.id+' .title').val(String(d[i][1]).replace(/<\/?[^>]+>/gi, ''));
					this.curent = d[i];
					break;
				}
			}
		}
	},
	open_items: function(r){
		var res = '', d = r ? r : this.p.data, _s = this;
		for(var i = 0; i < d.length; i++){
			if(d[i][0] == this.curent[0] && !r || r && i == 0) res += '<li class="active" value="'+d[i][0]+'" dir="auto">'+d[i][1]+'</li>';
			else res += '<li value="'+d[i][0]+'" dir="auto">'+d[i][1]+'</li>';
		}
		$('#'+this.p.id+' .cont').html(res);
		$('#'+this.p.id).addClass('show');
		$('#'+this.p.id+' .cont li').bind('mouseover', function() { _s.over_item.apply(_s, [this]); }).bind('mousedown', function(){ _s.down_item(this); });
		var wh = $(window).height()-($('#'+this.p.id).offset().top-$(window).scrollTop())-$('#'+this.p.id).height();
		if(wh < $('#'+this.p.id+' .cont').height()) $('#'+this.p.id).addClass('top');
		else $('#'+this.p.id).removeClass('top');
		if(!r) $('#'+this.p.id+' .cont').get(0).scrollTop = $('#'+this.p.id+' .cont li.active').position().top-50;
	},
	over_item: function(el, scroll){
		$('#'+this.p.id+' .cont li.active').removeClass('active');
		$(el).addClass('active');
		if(scroll) {
			var scroll1 = $('#'+this.p.id+' .cont').get(0).scrollTop, top = $(el).position().top, w = $(el).height();
			if(scroll1+w < top || top+w < scroll1) $('#'+this.p.id+' .cont').get(0).scrollTop = top;
		}
	},
	down_item: function(el, no_change){
		var val = (typeof el == 'number' || typeof el == 'string') ? el : el.value, d = this.p.data;
		for(var i = 0; i < d.length; i++){
			if(d[i][0] == val){
				$('#'+this.p.id+' .title').val(String(d[i][1]).replace(/<\/?[^>]+>/gi, ''));
				this.curent = d[i];
				$('#'+this.p.id).removeClass('show');
				if(!no_change) $('#'+this.p.id).val(val).change();
				break;
			}
		}
	},
	search: function(val){
		var res = '', d = this.p.data, r = [];
		for(var i = 1; i < d.length; i++) if(String(d[i][1]).toLowerCase().indexOf(val.toLowerCase()) != -1) r.push(d[i]);
		if(r.length) this.open_items(r);
		else $('#'+this.p.id+' .cont').html('<li class="disabled">'+langs.global_not_found+'</li>');
	},
	blur: function(){
		$('#'+this.p.id+' .title').val(String(this.curent[1]).replace(/<\/?[^>]+>/gi, ''));
	},
	change_data: function(data, current){
		try{ data = JSON.parse(data); } catch(e){ try{ data = eval(data); }catch(e){ } }
		this.p.data = data;
		if(current) this.down_item(current, true);
		else{
			$('#'+this.p.id).val(data[0][0]);
			$('#'+this.p.id+' .title').val(data[0][1]);
			$('#'+this.p.id+' .title').attr('placeholder', data[0][1]);
			this.curent = data[0];
		}
	},
	open: function(){
		var _s = this;
		setTimeout(function(){
			$('#'+_s.p.id+' .title').focus();
			$('#'+_s.p.id).addClass('show');
		}, 30);
	},
	disable: function(){
		$('#'+this.p.id+' .title').attr('disabled', 'true');
	},
	enable: function(){
		$('#'+this.p.id+' .title').removeAttr('disabled');
	}
});




function addTimer(name, callback, time){
	if(kjTimers[name]) removeTimer(name);
	kjTimers[name] = setTimeout(function(){
		callback();
		delete kjTimers[name];
	}, time);
}
function removeTimer(name){
	if(!kjTimers[name]) return;
	if(isArray(name)) {
		for(var i = 0; i <= name.length; i++) removeTimer(name[i]);
		return;
	}
	clearTimeout(kjTimers[name]);
	delete kjTimers[name];
}

function declOfNum(number, titles)  
{  
    cases = [2, 0, 1, 1, 1, 2];  
    return titles[ (number%100>4 && number%100<20)? 2 : cases[(number%10<5)?number%10:5] ];  
} 



function showTooltip(el, opt){
	if(el.ttTimer){
		clearTimeout(el.ttTimer);
		el.ttTimer = 0;
		return;
	}

	if(el.err_tip) return;

	if(el.tt){
		if(el.tt.showing || el.tt.load) return;
		if(el.tt.show_timer) {
			clearTimeout(el.tt.show_timer);
			el.tt.show_timer = 0;
		}
	}
	/* bad idea.
	$('.titleHtml').css({opacity:0, display: 'none'});
	*/
	try{
		el.tt.el.style.display = 'block';
		if(el.tt.el.scrollHeight > 0) var is_bl = true;
		else var is_bl = false;
		el.tt.el.style.display = 'none';
	}catch(e){
		var is_bl = false;
	}

	if(!is_bl){

		var tt = document.createElement('div');
		tt.className = 'titleHtml  no_center'+(opt.className ? ' '+opt.className : '');
		tt.innerHTML = '<div dir="auto" style="position: relative">'+opt.text+'<div class="black_strelka"></div></div>';
		document.body.appendChild(tt);

		el.tt = {};
		el.tt.opt = opt;
		el.tt.el = tt;
		if(!opt.shift) opt.shift = [0,0,0];
		el.tt.shift = opt.shift;
		el.tt.show = function(){
			if(this.tt.showing) return;
			this.tt.show_timer = 0;

			var ttobj = $(el.tt.el), ttw = ttobj.width(), tth = ttobj.height(), st = window.scrollY, obj = $(this), pos = obj.offset(), elh = obj.height();

			if((pos.top - tth - this.tt.opt.shift[1]) < st || el.tt.opt.onBottom){
				ttobj.addClass('down');
				var top = pos.top+(opt.shift[2])+elh, down = true;
			}else{
				ttobj.removeClass('down');
				var top = pos.top-(opt.shift[1])-tth, down = false;
			}

			ttobj.css({
				top: (top-10) + 'px',
				left: (pos.left+(opt.shift[0])) + 'px'
			}).fadeIn(100);
			if(this.tt.opt.slide){
				if(down) ttobj.css('margin-top', (this.tt.opt.slide+elh)+'px');
				else ttobj.css('margin-top', '-'+this.tt.opt.slide+'px');
				ttobj.animate({marginTop: 0}, this.tt.opt.atime);
			}
			this.tt.showing = true;
		}.bind(el);

		el.tt.destroy = function(){
			var obj = $(el);
			obj.unbind('mouseout');
			clearTimeout(el.ttTimer);
			clearTimeout(this.tt.show_timer);

			$(el.tt.el).remove();

			el.tt = false;
		}.bind(el);

		function tooltipout(e, fast){
			var hovered = $('div:hover');

			if(!fast && this.tt.opt.nohide && (hovered.index(this) != -1 || hovered.index(this.tt.el) != -1 || (this.tt.opt.check_parent && hovered.index($(this.parentNode)) != -1))) return;

			if(this.tt.show_timer){
				clearTimeout(this.tt.show_timer);
				this.tt.show_timer = false;
			}
			
			if(!this.tt.showing) return;
			
			var time = fast ? 0 : (this.tt.opt.hideWt || 0), _s = this;

			this.ttTimer = setTimeout(function(){
				var tt_el = $(_s.tt.el);
				tt_el.fadeOut(100);
				_s.tt.showing = false;
				_s.ttTimer = false;
			}, time);
		}
		el.tt.hide = tooltipout.bind(el,false);
		$(el).mouseout(tooltipout.bind(el,false));
		if(opt.nohide) $(el.tt.el).bind('mouseover', showTooltip.bind(el, el, opt)).mouseout(tooltipout.bind(el, false));

		if(opt.url){
			el.tt.load = true;
			$.post(opt.url, opt.data, function(d){
				if(d == 'fail'){
					el.tt.destroy();
					el.err_tip = true;
					return;
				}
				el.tt.el.innerHTML = d+'<div class="black_strelka"></div>';
				el.tt.load = false;
				if(el.tt.opt.complete) el.tt.opt.complete(el);
			});
			return;
		}
	}

	el.tt.show_timer = setTimeout(el.tt.show.apply(el), opt.showWt || 0);
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

function playNewAudio(id, event){
if($(event.target).parents('.tools, #no_play, .audioPlayer').length != 0 || $(event.target).filter('.text_avilable, #audio_text_res, #artist, #no_play').length != 0) return;
cancelEvent(event);
audio_player.playNew(id);

}

function isArray(obj) { return Object.prototype.toString.call(obj) === '[object Array]'; }

function a(a){
    console.log(audio_player);
}

var audio_player = {
    old_type: '',
	players: {},
	aID: 0,
	aInfo: false,
	aOwner: 0,
	aType: '',
	fullID: '',
	inited: false,
	player: false,
	play: false,
	cplay: false,
	pause: true,
	is_html5: false,
	time: 0,
	pr_click: false,
	curTime: 0,
	timeDir: 0,
	playList: false,
	playLists: {},
	currentPos: 0,
	vol: get_cookie('audioVol') || 1,
	loop: false,
	shuffle: false,
	curPL: false,
init: function(id){
var _a = audio_player;
_a.player = document.getElementById('audioplayer');
_a.player.addEventListener('canplay', _a.canPlay);
_a.player.addEventListener('progress', _a.load_progress);
_a.player.addEventListener('timeupdate', _a.play_progress);
_a.player.addEventListener('ended', _a.play_finish);
_a.player.addEventListener('error', function() {  _a.nextTrack(); _a.on_error;});
_a.inited = true;
_a.is_html5 = true;
_a.player.volume = _a.vol;
_a.playNew(id);
$(window).bind('keyup', function(e){
if(!e.keyCode) return;
if(e.keyCode == 179){
if(_a.pause) _a.command('play');
else _a.command('pause');
} else if(e.keyCode == 176) _a.nextTrack();
else if(e.keyCode == 177) _a.prevTrack();
});
},
addPlayer: function(d){
var _a = audio_player;
_a.players[d.id] = d;
if(!_a.inited) _a.init();
$(d.play_but).bind('click', function(e){
if($(this).hasClass('play')) _a.command('pause');
else _a.command('play');
});
$(d.prbl).bind('mousedown', function(e) { _a.progressDown(e, d.id); }).bind('mousemove', function(e) { _a.progressMove(e, d.id); }).bind('mouseout', function(){
$(_a.players[d.id].timeBl).hide();
});
$(d.prev).bind('click', _a.prevTrack);
$(d.next).bind('click', _a.nextTrack);
$(d.volume).bind('mousedown', _a.volumeDown);
$(d.add).bind('click', _a.addAudio);
_a.playLists = {};
for(var i in d.playList){
var pl = d.playList, pl_data = {data: [], pname: d.pname};
for(var j in pl) pl_data.data.push(pl[j]);
_a.playLists[d.playList[i][7]] = pl_data;
break;
}
if(!_a.aInfo){
for(var i in d.playList){
_a.aID = d.playList[i][1];
_a.aOwner = d.playList[i][0];
_a.aInfo = d.playList[i];
var type = d.playList[i][7];
_a.fullID = _a.aID+'_'+_a.aOwner+(type ? '_'+type : '');
_a.time = d.playList[i][5];
var s = parseInt(d.playList[i][5] % 60), m = parseInt((d.playList[i][5] / 60) % 60);
$(d.time).html(m+':'+s);
if(_a.is_html5) {
_a.player.src = d.playList[i][2];
_a.player.load();
}
_a.compilePlayList(d.playList[i][7]);
break;
}
$('#audio_'+_a.fullID+', #audio_'+_a.fullID+'_pad').addClass('play').addClass('preactiv');
_a.play = false;
_a.cplay = false;
} else {
if(_a.pause) $('#audio_'+_a.fullID+', #audio_'+_a.fullID+'_pad').addClass('preactiv');
else _a.command('play', {style_only: true});
}
_a.command('set_info', {player: d.id});
var vol_percent = _a.vol*100;
$(d.volume_line).css('width', vol_percent+'%');
$(d.loop).bind('click', _a.clickLoop);
$(d.shuffle).bind('click', _a.clickShuffle);
if(_a.loop) $(d.loop).addClass('active');
if(_a.shuffle) $(d.shuffle).addClass('active');
_a.check_add();
},
clickLoop: function(){
var _a = audio_player;
if(_a.loop) _a.command('off_loop');
else _a.command('on_loop');
},
clickShuffle: function(){
var _a = audio_player;
if(_a.shuffle) _a.command('off_shuffle');
else _a.command('on_shuffle');
},
play_pause: function(){
var _a = audio_player;
if(_a.pause) _a.command('play');
else _a.command('pause');
},
command: function(type, params){
		var _a = audio_player;
		if(!params) params = {};
       
		if(type == 'pause'){
			for(var i in _a.players) $(_a.players[i].play_but).removeClass('play');
			$('#audio_'+_a.fullID+', #audio_'+_a.fullID+'_pad').addClass('pause');
			$('#audioMP .playBtn').removeClass('icon-pause').addClass('icon-play-4');
			if(params.style_only) return;
			if(_a.inited){
				if(_a.is_html5) {
					_a.play = false;
					_a.player.pause();
				}else _a.player.pauseAudio();
			}
			_a.pause = true;
		}else if(type == 'play'){
			for(var i in _a.players) $(_a.players[i].play_but).addClass('play');
			$('#audio_'+_a.fullID+', #audio_'+_a.fullID+'_pad').removeClass('pause').removeClass('preactiv').addClass('play');
			$('#player'+_a.fullID).css('display', 'block');
            
   $('.player'+_a.fullID).css('display', 'block');
            
			$('#player'+_a.fullID+' #playerVolumeBar').css('width', (_a.vol*100)+'%');
			$('#audioMP .playBtn').removeClass('icon-play-4').addClass('icon-pause');
			_a.initMP();
			if(params.style_only) return;
			if(_a.inited){
				if(_a.cplay) {
					if(Math.round(_a.player.currentTime) == 0) _a.player.load();
					_a.player.play();
				}else _a.player.play();
			}
			_a.pause = false;
		}else if(type == 'set_info'){
			if(params.player) $(_a.players[params.player].names).html('<b>'+_a.aInfo[3]+'</b> – '+_a.aInfo[4]);
			else for(var i in _a.players) $(_a.players[i].names).html('<b>'+_a.aInfo[3]+'</b> – '+_a.aInfo[4]);
		}else if(type == 'load_progress'){
			for(var i in _a.players) $(_a.players[i].load).css('width', params.p+'%');
			$('#player'+_a.fullID+' .audioLoadProgress').css('width', params.p+'%');
		}else if(type == 'play_progress'){
			if(_a.pr_click) return;
			for(var i in _a.players) $(_a.players[i].pr).css('width', params.p+'%');
			$('#player'+_a.fullID+' #playerPlayLine').css('width', params.p+'%');
		}else if(type == 'update_time'){
			for(var i in _a.players) $(_a.players[i].time).html(params.time);
			$('#audio_time_'+_a.fullID+', #audio_time_'+_a.fullID+'_pad').html(params.time);
		}else if(type == 'off_loop'){
			_a.loop = false;
			for(var i in _a.players) $(_a.players[i].loop).removeClass('active');
		}else if(type == 'on_loop'){
			_a.loop = true;
			for(var i in _a.players) $(_a.players[i].loop).addClass('active');
		}else if(type == 'off_shuffle'){
			_a.shuffle = false;
			for(var i in _a.players) $(_a.players[i].shuffle).removeClass('active');
		}else if(type == 'on_shuffle'){
			_a.shuffle = true;
			for(var i in _a.players) $(_a.players[i].shuffle).addClass('active');
		}else if(type == 'show_add'){
			for(var i in _a.players) {
				$(_a.players[i].add).show();
				if(params.added) $(_a.players[i].add).addClass('icon-ok-3');
				else $(_a.players[i].add).removeClass('icon-ok-3');
			}
		}else if(type == 'hide_add'){
			for(var i in _a.players) $(_a.players[i].add).hide();
		}
	},
playNew: function(id){
var _a = audio_player;
if(!id) return;
if(!_a.inited) {
_a.init(id);
return;
}
id = id.replace('_pad', '');





    
    
    
    
    

/*
if(_a.old_type != _a.aInfo[7]){
$.post('/audio?act=load_play_list', {data: id}, function(d){
d = JSON.parse(d);
_a.playlist = {data: d.playList, name: d.pname};
});
}

_a.old_type = _a.aInfo[7];
*/

if(_a.fullID == id) _a.command(_a.pause ? 'play' : 'pause');
else {
    


    
    
if(_a.fullID){
$('#audio_'+_a.fullID+', #audio_'+_a.fullID+'_pad').removeClass('play').removeClass('pause').removeClass('preactiv');
_a.backTime(_a.fullID, _a.time);
}
_a.player.pause();
_a.player = null;
$('.audioPlayer').hide();
var adata = id.split('_');
_a.aID = adata[0];
_a.aOwner = adata[1];
_a.aType = adata[2] ? adata[2] : '';
_a.fullID = _a.aID+'_'+_a.aOwner+((adata[2] && adata[2] != 'pad') ? '_'+adata[2] : '');
_a.getInfoFromDom();
$('#audio_'+_a.fullID+', #audio_'+_a.fullID+'_pad').addClass('play');
_a.play = true;
_a.cplay = false;
_a.player = document.getElementById('audioplayer');
_a.command('play', {style_only: true});
_a.curTime = 0;
_a.player.src = _a.aInfo[2];
_a.player.load();
_a.command('set_info');
if(adata[3] != 'pad'){
_a.compilePlayList(_a.aInfo[7]);  
}

if(_a.aInfo[8] != 'page') _a.scrollToAudio();



try{
var pl = _a.playlist.data, cnt = 0;
for(var i in pl){
var id = pl[i][1]+'_'+pl[i][0]+(pl[i][7] ? '_'+pl[i][7] : '');
if(id == _a.fullID){
_a.currentPos = cnt;
}
cnt++;
}
} catch(e){}

_a.check_add();
}
},
	getInfoFromDom: function(){
		var _a = audio_player, aid = _a.fullID
		if($('#audio_url_'+aid).size()){
			var url = $('#audio_url_'+aid).val().split(',');
			_a.aInfo = [_a.aOwner, _a.aID, url[0], $('#audio_'+aid+' #artist').html(), $('#audio_'+aid+' #name').html(), url[1], $('#audio_time_'+aid).text(), _a.aType, url[2]];
			_a.time = url[1];
		}else if($('#audio_url_'+aid+'_pad').size()){
			var url = $('#audio_url_'+aid+'_pad').val().split(',');
			_a.aInfo = [_a.aOwner, _a.aID, url[0], $('#audio_'+aid+'_pad'+' #artist').html(), $('#audio_'+aid+'_pad'+' #name').html(), url[1], $('#audio_time_'+aid+'_pad').text(), _a.aType, url[2]];
			_a.time = url[1];
		}
	},
	canPlay: function(){
		var _a = audio_player;
		if(_a.play) {
			_a.player.play();
			_a.pause = false;
		}
		_a.cplay = true;
	},
	play_progress: function(curTime, totalTime){
		var _a = audio_player;
		if(_a.is_html5){
			curTime = Math.floor(_a.player.currentTime * 1000) / 1000;
			totalTime = Math.floor(_a.player.duration * 1000) / 1000;
		}else{
			if(isNaN(totalTime)) totalTime = _a.aInfo[5];
		}
		var percent = Math.ceil(curTime/totalTime*100);
		percent = Math.min(100, Math.max(0, percent));
		_a.command('play_progress', {p: percent});
		if(!_a.pause) _a.updateTime(curTime, totalTime);
	},
	play_finish: function(){
		var _a = audio_player;
		$('.audioPlayer').hide();
		if(_a.loop){
			if(_a.is_html5) _a.player.play();
			else _a.player.playAudio(0);
		}else if(!_a.loop && _a.shuffle){
			var i = Math.floor(Math.random() * _a.playlist.data.length);
			_a.playToPlayList(i);
		}else _a.nextTrack();
	},
	on_error: function(e){
		Box.Show('error', 400, 'Ошибка', '<div style="padding: 15px;" dir="auto">При загрузке аудиозаписи произошла ошибка, обновите страницу и попробуйте снова.</div>', 'Закрыть');
	},
	errorPL: function(){
		Box.Show('error', 400, 'Ошибка', '<div style="padding: 15px;" dir="auto">Идет загрузка плейлиста, попробуйте чуть позже..</div>', 'Закрыть');
	},
	end_load: function(){

	},
	load_progress: function(bufferedTime, totalTime){
		var _a = audio_player;
		if(_a.is_html5){
			totalTime = Math.floor(_a.player.duration * 1000) / 1000;
			try { bufferedTime = (Math.floor(_a.player.buffered.end(0) * 1000) / 1000) || 0; } catch (e) {}
		}
		var percent = (bufferedTime/totalTime)*100;
		_a.command('load_progress', {p: percent});
	},
	progressDown: function(e1, id){
		var _a = audio_player, el = typeof id == 'string' ? _a.players[id].prbl : id, left = $(el).offset().left, w = $(el).width(), percent;
		function Move(e){
			e.preventDefault();
			var l = Math.min(Math.max(0, e.pageX-left-1), w), p = (l/w)*100;
			percent = p;
			for(var i in _a.players) $(_a.players[i].pr).css('width', p+'%');
			$('#player'+_a.fullID+' #playerPlayLine').css('width', p+'%');
		}
		function Up(ev){
			cancelEvent(ev);
			$(window).unbind('mousemove', Move).unbind('mouseup', Up);
			var time = (_a.time*percent)/100;
			_a.setTime(time);
			_a.pr_click = false;
			if(typeof id == 'string') $(_a.players[id].slider).hide();
		}
		_a.pr_click = true;
		Move(e1);
		if(typeof id == 'string') $(_a.players[id].slider).show();
		$(window).bind('mousemove', Move).bind('mouseup', Up);
	},
	progressMove: function(e, id){
		var _a = audio_player, el = _a.players[id].prbl, left = $(el).offset().left, w = $(el).width(), l = Math.min(Math.max(0, e.pageX-left-1), w), p = (l/w)*100, time = (_a.time*p)/100;
		$(_a.players[id].timeBl).css('left', p+'%').show();
		var s = parseInt(time % 60), m = parseInt((time / 60) % 60);
		if(s < 10) s = '0'+s;
		$(_a.players[id].timeBl).children('.audioTAP_strlka').html(m+':'+s);
	},
	setTime: function(time){
		var _a = audio_player;
		if(_a.is_html5){
			_a.player.currentTime = time;
			if(!_a.pause) _a.player.play();
		}else{
			_a.player.playAudio(time);
			if(_a.pause) _a.player.pauseAudio();
		}
	},
	updateTime: function(cur, len){
		var _a = audio_player;
		if(_a.preloadUrl) return;
		_a.curTime = cur;
		var cur_time = _a.timeDir ? cur : (len - cur);
		var s = parseInt(cur_time % 60), m = parseInt((cur_time / 60) % 60);
		if(s < 10) s = '0'+s;
		var resTime = (_a.timeDir ? '' : '-')+m+':'+s;
if(parseFloat(resTime) != 'NaN') _a.command('update_time', {time: resTime});
	},
	backTime: function(id, time){
		var _a = audio_player, s = parseInt(time % 60), m = parseInt((time / 60) % 60);
if(parseFloat(m) != 'NaN' || parseFloat(s) != 'NaN') $('#audio_time_'+id+', #audio_time_'+_a.fullID+'_pad').html(m+':'+s);
	},
compilePlayList: function(type){
var _a = audio_player;
_a.curPL = type;



if(/*_a.aInfo[8] == 'page'*/type){
_a.startLoadPL = true;
if(type == 'search'){
var start = false, cnt = 0, res = [];

if($('#audios_res .audio').length){

$('#audios_res .audio').each(function(){
var aid = $(this).attr('id').replace('audio_', ''), adata = aid.split('_');
if(cnt < 60){
if(adata[0] == _a.aID) _a.currentPos = cnt;
var url = $('#audio_url_'+aid).val().split(',');
var inf = [adata[1], adata[0], url[0], $('#audio_'+aid+' #artist').html(), $('#audio_'+aid+' #name').html(), url[1], $('#audio_time_'+aid).text(), 'search', url[2]];
res.push(inf);
cnt++
} else return;
});

} else {


$('#page .audioPage').each(function(){
var aid = $(this).attr('id').replace('audio_', ''), adata = aid.split('_');
if(cnt < 60){
if(adata[0] == _a.aID) _a.currentPos = cnt;
var url = $('#audio_url_'+aid).val().split(',');
var inf = [adata[1], adata[0], url[0], $('#audio_'+aid+' #artist').html(), $('#audio_'+aid+' #name').html(), url[1], $('#audio_time_'+aid).text(), 'search', url[2]];
res.push(inf);
cnt++
} else return;
});

}

_a.playlist = {data: res, name: 'Сейчас играют результаты поиска'};
window.cur.audios = _a.playlist;
_a.startLoadPL = false;
} else if(type == 'attach'){
_a.playlist = {data: [_a.aInfo], name: ''};
_a.currentPos = 0;
_a.startLoadPL = false;
} else if(type == 'wall'){
var res = [], cur = 0, cnt = 0;
$('#audio_'+_a.fullID).parent().children('.audioPage').each(function(){
var aid = this.id.replace('audio_', ''), adata = aid.split('_');
if(aid == _a.fullID){
cur = cnt;
_a.currentPos = cnt;
}
cnt++;
var url = $('#audio_url_'+aid).val().split(',');
res.push([adata[1], adata[0], url[0], $('#audio_'+aid+' #artist').html(), $('#audio_'+aid+' #name').html(), url[1], $('#audio_time_'+aid).text(), 'wall', url[2]]);
});
_a.startLoadPL = false;
_a.playlist = {data: res, name: ''};
} else {
if(!kj.uid) return;
$.post('/audio?act=load_play_list', {data: _a.fullID}, function(d){
d = JSON.parse(d);
_a.playlist = {data: d.playList, name: d.pname};

var pl = d.playList, cnt = 0;
for(var i in pl) {
var id = pl[i][1]+'_'+pl[i][0]+(pl[i][7] ? '_'+pl[i][7] : '');
if(id == _a.fullID){
_a.currentPos = cnt;
}

cnt++;
}

_a.startLoadPL = false;
});
}
} /*else if(_a.playLists[type]){

 

var pl = _a.playLists[type].data, cnt = 0;
_a.playlist = {data: [], name: _a.playLists[type].pname};
for(var i in pl){
var id = pl[i][1]+'_'+pl[i][0]+(pl[i][7] ? '_'+pl[i][7] : '');
if(id == _a.fullID) _a.currentPos = cnt;
_a.playlist.data.push(pl[i]);
cnt++;
}
_a.startLoadPL = false;
window.cur.audios = _a.playlist;
     *    
			
		}*/
	},
nextTrack: function(){
var _a = audio_player;
if(_a.startLoadPL){
_a.errorPL();
return;
}
var nid = _a.currentPos+1;
if(!_a.playlist.data[nid]) nid = 0;
_a.playToPlayList(nid);
},
prevTrack: function(){
var _a = audio_player;
if(_a.startLoadPL){
_a.errorPL();
return;
}
var nid = _a.currentPos-1;
if(!_a.playlist.data[nid]) nid = _a.playlist.data.length-1;
_a.playToPlayList(nid);
},
	playToPlayList: function(i){
        
       
        
		var _a = audio_player;
		if(_a.fullID) {
			$('#audio_'+_a.fullID+', #audio_'+_a.fullID+'_pad').removeClass('play').removeClass('pause').removeClass('preactiv');
			_a.backTime(_a.fullID, _a.time);
		}
		$('.audioPlayer').hide();
        

        
		_a.currentPos = i;
		_a.aID = _a.playlist.data[i][1];
		_a.aOwner = _a.playlist.data[i][0];
		_a.aType = _a.playlist.data[i][7] ? _a.playlist.data[i][7] : '';
		_a.fullID = _a.aID+'_'+_a.aOwner+(_a.playlist.data[i][7] ? '_'+_a.playlist.data[i][7] : '');
		_a.aInfo = [_a.aOwner, _a.aID, _a.playlist.data[i][2], _a.playlist.data[i][3], _a.playlist.data[i][4], _a.playlist.data[i][5], _a.playlist.data[i][6], _a.aType, _a.playlist.data[i][7]];
		_a.time = _a.playlist.data[i][5];
		$('#audio_'+_a.fullID+', #audio_'+_a.fullID+'_pad').addClass('play');
		_a.play = true;
		_a.cplay = false;
		_a.command('play', {style_only: true});
		_a.curTime = 0;
		if(_a.is_html5) {
			_a.player.src = _a.aInfo[2];
			audio_player.player.load();
		}else {
			_a.player.loadAudio(_a.aInfo[2]);
			_a.pause = false;
		}
		_a.command('set_info');
		if(_a.aInfo[8] != 'page' && _a.aInfo[7] != 'wall') _a.scrollToAudio();
		_a.check_add();
	}, 
	scrollToAudio: function(){
		var _a = audio_player;
		if($('#audio_'+_a.fullID).size()){
			var top = $('#audio_'+_a.fullID).offset().top, h = ($(window).height()/2), r = top-h;
			$('body').animate({scrollTop: r}, 200);
		}
	},
	volumeDown: function(e1, elem){
		cancelEvent(e1);
		var _a = audio_player, el = elem ? elem : this, left = $(el).offset().left, w = $(el).width(), pbl = $(el).children('.audioTimesAP').get(0), pblstr = $(pbl).children('.audioTAP_strlka'), vol;
		pbl = $(pbl);
		function Move(e){
			e.preventDefault();
			var l = Math.min(Math.max(0, e.pageX-left-1), w), p = (l/w)*100;
			for(var i in _a.players) $(_a.players[i].volume_line).css('width', p+'%');
			$('#player'+_a.fullID+' #playerVolumeBar').css('width', p+'%');
			var str = Math.round(p);
			vol = p/100;
			_a.vol = vol;
			if(_a.is_html5) _a.player.volume = vol;
			else _a.player.setVolume(vol);
			var l1 = (p*w)/100-(pblstr.width()/2)-6+(elem ? 17 : 0);
			pbl.css('left', l1+'px');
			pblstr.html(str+'%');
		}
		function Up(ev){
			cancelEvent(ev);
			$(window).unbind('mousemove', Move).unbind('mouseup', Up);
			pbl.hide();
			var d = new Date(),  date = d.getDate()+5, month = d.getMonth(), year = d.getFullYear();
			set_cookie('audioVol', vol, year, month, date);
		}
		pbl.show();
		$(window).bind('mousemove', Move).bind('mouseup', Up);
		Move(e1);
	},
	playerPrMove: function(e, el){
		var _a = audio_player;
		_a.mouseoverProgress = true;
		var elem = $(el), pos = e.clientX, w = elem.width(), left = elem.offset().left;
		pos = pos - left;
		var val = (pos / w) * 100;
		var curTime = val / 100 * _a.time, prTP = elem.children('.audioTimesAP'), prTPtext = prTP.children('.audioTAP_strlka');
		$('.audioTimesAP').hide();
		var s = parseInt(curTime % 60), m = parseInt((curTime / 60) % 60);
		if(s < 10) s = '0'+s;
		prTPtext.html(m+':'+s);
		var left = val/100*w;
		prTP.css('left', (left-(prTPtext.width()/2))+'px').show();
	},
	playerPrOut: function(){
		var _a = audio_player;
		_a.mouseoverProgress = false;
		$('.audioTimesAP').hide();
	},
	//pad
	initedPad: false,
	initedMP: false,
	padScroll:false,
	initMP: function(){
		var _a = audio_player;
		if(!_a.initedMP){
			_a.initedMP = true;
			var content = '<div class="min_player_names"><span id="minPlayerArtist"></span> – <span id="minPlayerName"></span></div>\
			<div class="cButs"><div class="nextPrevBtn icon-fast-bw" id="no_play" onClick="audio_player.prevTrack();"></div>\
			<div class="playBtn icon-pause" id="no_play" onClick="audio_player.play_pause()"></div>\
			<div class="nextPrevBtn icon-fast-fw" id="no_play" onClick="audio_player.nextTrack();"></div><div class="clear"></div></div>';
			$('#audioMP').html(content).attr('onClick', 'audio_player.showPad(event)');
		}
		$('#audioMP').addClass('show');
		if(_a.aInfo){
			$('#minPlayerArtist').html(_a.aInfo[3]);
			$('#minPlayerName').html(_a.aInfo[4]);
		}
	},
showPad: function(e){
var _a = audio_player;
if(e && e.target.id == 'no_play') return;
if(!_a.initedPad){
_a.initedPad = true;
			var content = '<div class="audio_head">\
				<div class="bigPlay_but icon-play-1" id="pad_play"></div>\
				<div class="prevision icon-fast-bw" id="pad_prev"></div>\
				<div class="prevision next icon-fast-fw" id="pad_next"></div>\
				<div class="fl_l" style="width:268px;margin-left: 14px;margin-top: 2px;" id="pad_cont_progress">\
					<div>\
						<div class="names fl_l" id="pad_names"></div>\
						<div class="fl_r time" id="pad_time">0:00</div>\
						<div class="clear"></div>\
					</div>\
					<div class="audio_progres_bl" id="pad_progress_bl">\
						<div class="bg"></div>\
						<div class="play" id="pad_play_line"><div class="slider" id="pad_slider"></div></div>\
						<div class="load" id="pad_load_line"></div>\
						<div class="audioTimesAP" id="pad_time_bl"><div class="audioTAP_strlka">3:00</div></div>\
					</div>\
				</div>\
				<div class="volume_bar" id="pad_volume">\
					<div class="volume_bg"></div>\
					<div class="volume_line" id="pad_volume_line"><div class="slider"></div></div>\
					<div class="audioTimesAP"><div class="audioTAP_strlka">3:00</div></div>\
				</div>\
				<div class="fl_l plcontols_buts">\
					<li class="icon-plus-6" id="pad_add" onmouseover="showTooltip(this, {text: \'Добавить в мой список\', shift:[0,5,0]});"></li>\
					<li class="icon-loop-1" id="pad_loop" onmouseover="showTooltip(this, {text: \'Повторять эту композицию\', shift:[0,5,0]});"></li>\
					<li class="icon-shuffle-2" id="pad_shuffle" onmouseover="showTooltip(this, {text: \'Случайный порядок\', shift:[0,5,0]});"></li>\
					<div class="clear"></div>\
				</div>\
			</div><div style="position:relative;"><div class="rightStrelka"></div></div>\
			<div class="audios_scroll_bl" id="pad_scroll">\
				<div id="audios_scroll_cont" class="scroller_cont"><div id="audioPadRes"></div></div>\
			</div>\
			<div class="padFooter">\
				<div class="plName fl_l"></div>\
				<div class="button_div fl_r" style="margin-right: 5px;margin-top: 2px;"><button onClick="audio_player.showPad();">Закрыть</button></div>\
				</div><div></div><div></div></div>\
				<div class="clear"></div>\
			</div>';
			$('#audioPad').html(content);

			var data = {
				id: 'pad',
				play_but: $('#pad_play').get(0),
				names: $('#pad_names').get(0), 
				pr: $('#pad_play_line').get(0),
				load: $('#pad_load_line').get(0),
				prbl: $('#pad_progress_bl').get(0),
				slider: $('#pad_slider').get(0),
				timeBl: $('#pad_time_bl').get(0),
				time: $('#pad_time').get(0),
				prev: $('#pad_prev').get(0),
				next: $('#pad_next').get(0),
				volume: $('#pad_volume').get(0),
				volume_line: $('#pad_volume_line').get(0),
				loop: $('#pad_loop').get(0),
				shuffle: $('#pad_shuffle').get(0),
				add: $('#pad_add').get(0)
			};
			_a.addPlayer(data);

			_a.padScroll = new Scroller('pad_scroll');
			var _s = _a;
            

            
}

if($('#audioPad').hasClass('show')){
$('#audioPad').css('top', -($('#audioPad').height()+70)+'px').removeClass('show');
$('#audioMP').removeClass('active');



$('#audioPadRes').html('');


} else {
$('#audioPad').css('left', '745px').css('top', '50px').addClass('show');
$('#audioMP').addClass('active');


if(_a.aType == 'wall' || _a.aType == 'search' || _a.aType == 'attach'){
var pl = _a.playlist.data, res = '';
for(var i = 0; i < pl.length; i++) res += _a.compile_audio(pl[i]);
$('#audioPadRes').html(res);
$('.plName').html(_a.playlist.name);
if(_a.pause) $('#audio_'+_a.fullID+', #audio_'+_a.fullID+'_pad').addClass('preactiv');
else _a.command('play', {style_only: true});
if(_a.play) $('#audio_'+_a.fullID+', #audio_'+_a.fullID+'_pad').removeClass('preactiv');
if($('#pad_add').css('display') == 'none') $('#pad_cont_progress').css('width', '268px');
else $('#pad_cont_progress').css('width', '245px');
_a.padScroll.check_scroll();
} else {
$.post('/audio?act=load_play_list', {data: _a.fullID}, function(d){
d = JSON.parse(d);
_a.playlist = {data: d.playList, name: d.pname};
var pl = d.playList, cnt = 0, res = '';
for(var i in pl){
var id = pl[i][1]+'_'+pl[i][0]+(pl[i][7] ? '_'+pl[i][7] : '');
if(id == _a.fullID) _a.currentPos = cnt;
if(cnt > 50) break;
cnt++;

res += _a.compile_audio(pl[i]);

}

if(pl.length > 50) res += '<div onclick="audio_player.show_more('+cnt+'); return false;" class="public_wall_all_comm" id="audio_show_more">Показать больше аудиозаписей</div>';

_a.startLoadPL = false;
$('#audioPadRes').html(res);
$('.plName').html(_a.playlist.name);
if(_a.pause) $('#audio_'+_a.fullID+', #audio_'+_a.fullID+'_pad').addClass('preactiv');
else _a.command('play', {style_only: true});
if(_a.play) $('#audio_'+_a.fullID+', #audio_'+_a.fullID+'_pad').removeClass('preactiv');
if($('#pad_add').css('display') == 'none') $('#pad_cont_progress').css('width', '268px');
else $('#pad_cont_progress').css('width', '245px');
_a.padScroll.check_scroll();
});
}

}
_a.padScroll.check_scroll();
},
show_more: function(offset){
$('#audio_show_more').remove();
var _a = audio_player;
var pl = _a.playlist.data, cnt = 0,num = 0, res = '';
for(var i in pl){
cnt++;
if(cnt > offset && num < 51){
    num++;
    res += _a.compile_audio(pl[i]);
}
}
var q = parseInt(num) + parseInt(offset);
if(_a.playlist.data.length > q) res += '<div onclick="audio_player.show_more('+q+'); return false;" class="public_wall_all_comm" id="audio_show_more">Показать больше аудиозаписей</div>';
$('#audioPadRes').append(res);
_a.padScroll.check_scroll();
},
    
    
    
    
	compile_audio: function(d){
        
        if(d[1]){
        var _a = audio_player;
		var full_id = d[1]+'_'+d[0]+'_'+d[7]+'_pad';
		if(d[7] == 'audios'+kj.uid) var add = '', hclass = 'no_tools';
		else var add = '<li class="icon-plus-6 '+hclass+'" onclick="audio.add(\''+full_id+'\')" id="add_tt_'+full_id+'" onmouseover="titleHtml({text: \'Добавить аудиозапись\', id: this.id, top: 29, left: 12})"></li>', hclass = '';

    if(_a.fullID == d[1]+'_'+d[0]+'_'+d[7]){
           if(_a.play){
               hclass += ' play';
               _a.command('play', {style_only: true});
           } else {
               hclass += ' pause';
               _a.command('pause', {style_only: true});
           }
    }
		return '<div class="audio '+hclass+'" id="audio_'+full_id+'" onclick="playNewAudio(\''+full_id+'\', event);">\
			<div class="audio_cont">\
				<div class="play_btn icon-play-4"></div>\
				<div class="name"><span id="artist">'+d[3]+'</span> – <span id="name">'+d[4]+'</span></div>\
				<div class="fl_r">\
					<div class="time" id="audio_time_'+full_id+'">'+d[6]+'</div>\
					<div class="tools">'+add+'\
						<div class="clear"></div>\
					</div>\
				</div>\
				<input type="hidden" value="'+d[2]+','+d[5]+',pad" id="audio_url_'+full_id+'"/>\
				<div class="clear"></div>\
			</div>\
			<div id="audio_text_res"></div>\
		</div>';
        } else return '';

	},
	added: {},
	check_add: function(){
		var _a = audio_player, type = _a.fullID.split('_');
		if(type[2] == 'public'){
			if(!_a.added[_a.aID]) _a.command('show_add', {added: false});
			else if(_a.added[_a.aID]) _a.command('show_add', {added: true});
		}else{
			if(_a.aOwner != kj.uid && !_a.added[_a.aID]) _a.command('show_add', {added: false});
			else if(_a.aOwner != kj.uid && _a.added[_a.aID]) _a.command('show_add', {added: true});
			else _a.command('hide_add');
		}
	},
	addAudio: function(){
		var _a = audio_player;
		if(_a.added[_a.aID]) return;
		_a.added[_a.aID] = true;
        $('#pad_add, #pl_add').addClass('icon-ok-3').removeClass('icon-plus-6');
		$('#audio_'+_a.fullID+' .tools, #audio_'+_a.fullID+'_pad .tools').html('<li class="icon-ok-3" style="padding-top: 2px;font-size: 16px;"></li><div class="clear"></div>');
		$.post('/audio?act=add', {id: _a.aID});
		$('.titleHtml').remove();
	},
	get_text: function(id, el){
		if(el && !$(el).hasClass('text_avilable')) return;
		var tbl = $('#audio_'+id+' #audio_text_res');
		if(tbl.hasClass('opened')) tbl.removeClass('opened');
		else{
			tbl.addClass('opened');
			var html = tbl.html();
			if(html.length == 0){
				tbl.html('<div style="padding:20px 0;text-align:center;"><img src="/images/loading_mini.gif"></div>');
				$.post('/audio?act=get_text', {id: id}, function(d){
					tbl.html(d);
				});
			}
		}
	}
};







var audio = {
user_id: 0,
a_user_fid: 0,
init: function(d){
$.extend(d, {
play_but: $('#pl_play').get(0),
names: $('#pl_names').get(0),
pr: $('#pl_play_line').get(0),
load: $('#pl_load_line').get(0),
prbl: $('#pl_progress_bl').get(0),
slider: $('#pl_slider').get(0),
timeBl: $('#pl_time_bl').get(0),
time: $('#pl_time').get(0),
prev: $('#pl_prev').get(0),
next: $('#pl_next').get(0),
volume: $('#pl_volume').get(0),
volume_line: $('#pl_volume_line').get(0),
loop: $('#pl_loop').get(0),
shuffle: $('#pl_shuffle').get(0),
add: $('#pl_add').get(0)
});
audio_player.addPlayer(d);
audio.load_page = 1;
$(window).scroll(function(){
if(!audio.start_load && $(window).scrollTop()+$(window).height() >= $(document).height()){
if(audio.moreSaerch) audio.loadMoreSearch();
else audio.loadMore();
}
});
		var album = location.search.match(/\?album=([0-9]+)/);
		if(album){
			KJ('#mainSearchFrBl').hide();
			KJ('.audio_menu li, .menu_item.active, #friendBlockMain li').removeClass('active');
			KJ('#audio_albums').show();
			KJ('#album'+album[1]).addClass('active');
		}
	},
albumBox: function(id, name){
		if(KJ('#audio_album').length) return;
		var p = {
			id: 'audio_album',
			title: id > 0 ? langs.edit_album : langs.create_album,
			width: 400,
			data: '<div class="audio_edit_bg">\
				<div class="audio_edit_title">'+langs.edit_album+'</div>\
				<input type="text" class="audio_edit_inp" value="'+(name || '')+'" id="album_name_val" dir="auto">\
			</div>',
			bottom: 1,
			success: 1,
			suc_text: langs.global_save,
			suc_js: 'audio.sendAlbum('+id+')'
		};
		if(id) p.bottom_text = '<a href="javascript:audio.delAlbum('+id+')" class="audio_add_from_search">'+langs.del_album+'</a>';
		Box.Open(p);
	},
	sendAlbum: function(id){
		var title = KJ('#album_name_val').val() || '';
		if(title.length > 0){
			KJ.post('/audio?act=send_album', {
				title: title,
				id: id || 0
			}, function(r){
				Box.Clos('audio_album');
				if(r > 0){
					id = r;
					KJ('#audio_albums').prepend('<div class="menu_item" onclick="if(event.target.id != \'album_'+id+'\') audio.getAlbum('+id+');"><span>'+title+'</span>\
					<div class="al_audio_add_but icon-pencil-7 bsbb" onmouseover="showTooltip(this, {text: \''+langs.edit_album+'\', shift:[2,5,0]});" id="album_'+id+'" onclick="audio.albumBox('+id+', \''+title+'\')"></div>\
				</div>');
				} else
					KJ('#album_'+id).parent().find('span').text(title);
				$('#audio_album_btn').click();
			});
		}
	},
	getAlbum: function(id, uid){
		var url = '/audio?album='+id;
		history.pushState({link: url}, null, url);
		KJ('.al_audios_fixed_panel .menu_item.active').removeClass('active');
		KJ('#album_'+id).parent().addClass('active');
		KJ('#search_preloader').show();
		KJ.post('/audio', {
			album: id,
			doload: true
		}, function(r){
			d = JSON.parse(r);
			KJ('#atitle').html('');
			KJ('#audios_res').html(d.result);
			KJ('#load_but').html(d.but);
			KJ('#search_preloader').hide();
		});
	},
	delAlbum: function(id){
		var audio = KJ('#album_'+id);
		if(audio.length){
			audio.parent().remove();
			KJ.post('/audio?act=del_album', {
				id: id
			}, function(r){
				if(!KJ('#audio_albums').html().length)
					KJ('#my_music').click();
				Box.Clos('audio_album');
			});	
		}
	},
	getAlbums: function(uid){
		var albums = KJ('#audio_albums');
		if(albums.html().length > 0){
			KJ('#mainSearchFrBl, .audio_filters').hide();
			KJ('.audio_menu li, .menu_item.active, #friendBlockMain li').removeClass('active');
			KJ('#audio_album_btn').addClass('active');
			albums.show();
		} else
			audio.albumBox();
	},	
change_tab: function(type){
$('#mainSearchFrBl').show();
$('#audio_albums').hide().removeClass('active');	
$('#search_tab2').hide();
$('#search_preloader').show();
$('.audio_menu li').removeClass('active');
$('.menu_item.active').removeClass('active');
$('#friendBlockMain li').removeClass('audioFrActive');
$('#'+type).addClass('active');
var url = '/audio?type='+type;
history.pushState({link: url}, null, url);
this.load_page = 1;
this.start_load = false;
audio.tabType = type;
$('#search_audio_val').val('');
this.moreSaerch = false;
if(type == 'my_music' && kj.uid == audio.user_id && audio.loaded_len > 0){
$('#search_preloader').hide();
var text = kj.uid == audio.user_id ? 'У вас' : 'У '+audio.uname;
$('#atitle').html('<div class="audio_page_title">'+text+' '+declOfNum(audio.loaded_len, ['аудиозапись', 'аудиозаписи', 'аудиозаписей'])+'</div>');
var len = Math.min(40, audio.loaded_len), result = '', tpl, res = audio.audiosRes;
for(var i = 0; i < len; i++){
tpl = str_replace(['{id}', '{uid}', '{plname}', '{artist}', '{name}', '{stime}', '{time}', '{url}', '{is_text}'], [res[i][1], res[i][0], res[i][7], res[i][3], res[i][4], res[i][6], res[i][5], res[i][2], res[i][9] ? 'text_avilable' : ''], audio.tpl_audio);
tpl = tpl.replace(/\[tools\](.*?)\[\/tools\]/gim, kj.uid == audio.user_id ? '$1' : '');
tpl = tpl.replace(/\[add\](.*?)\[\/add\]/gim, kj.uid == audio.user_id ? '' : '$1');
result += tpl;
}
$('#audios_res').html(result);
var _a = audio_player;
_a.playLists = {};
_a.playLists['audios'+kj.uid] = {
data: res,
pname: 'Сейчас играют аудиозаписи '+audio.uname+' | '+declOfNum(audio.loaded_len, 'аудиозапись', 'аудиозаписи', 'аудиозаписей'),
};
} else {
$.post(url, {doload: 1}, function(d){
$('#search_preloader').hide();
d = JSON.parse(d);
$('#atitle').html(d.title);
$('#audios_res').html(d.result);
$('#load_but').html(d.but);
var _a = audio_player;
_a.playLists = {};
var type = audio.tabType == 'my_music' ? 'audios'+kj.uid : audio.tabType;
_a.playLists[type] = {data: [], pname: d.pname};
for(var i in d.playList) _a.playLists[type].data.push(d.playList[i]);
if(_a.pause) $('#audio_'+_a.fullID).addClass('preactiv');
else _a.command('play', {style_only: true});
audio.loadAll(kj.uid, 0);
});
}
audio.user_id = kj.uid;
audio.uname = kj.name;
},

openFriends: function(uid, fid){
$('#search_tab2').hide();
$('#search_preloader').show();
$('.audio_menu li').removeClass('active');
$('.menu_item.active').removeClass('active');
var url = '/audio'+uid, old_uid = this.user_id;
this.user_id = uid;
this.a_user_fid = fid;
history.pushState({link: url}, null, url);
this.load_page = 1;
this.start_load = false;
this.uname = $('#user_'+fid+' .audioFriendsBlockName').html();
$('#search_audio_val').val('');
this.moreSaerch = false;
$('#friendBlockMain li').removeClass('audioFrActive');
$('#friendBlockMain #user_'+fid).addClass('audioFrActive');
if(uid == old_uid){
var text = kj.uid == audio.user_id ? 'У вас' : 'У '+audio.uname;
$('#atitle').html('<div class="audio_page_title">'+text+' '+declOfNum(audio.loaded_len, ['аудиозапись', 'аудиозаписи', 'аудиозаписей'])+'</div>');
var len = Math.min(40, audio.loaded_len), result = '', tpl, res = audio.audiosRes;
for(var i = 0; i < len; i++){
tpl = str_replace(['{id}', '{uid}', '{plname}', '{artist}', '{name}', '{stime}', '{time}', '{url}', '{is_text}'], [res[i][1], res[i][0], res[i][7], res[i][3], res[i][4], res[i][6], res[i][5], res[i][2], res[i][9] ? 'text_avilable' : ''], audio.tpl_audio);
tpl = tpl.replace(/\[tools\](.*?)\[\/tools\]/gim, kj.uid == audio.user_id ? '$1' : '');
tpl = tpl.replace(/\[add\](.*?)\[\/add\]/gim, kj.uid == audio.user_id ? '' : '$1');
result += tpl;
}
$('#audios_res').html(result);
var _a = audio_player;
_a.playLists = {};
_a.playLists['audios'+uid] = { data: res, pname: 'Сейчас играют аудиозаписи '+audio.uname+' | '+declOfNum(audio.loaded_len, 'аудиозапись', 'аудиозаписи', 'аудиозаписей'), };
if(_a.pause) $('#audio_'+_a.fullID).addClass('preactiv');
else _a.command('play', {style_only: true});
$('#search_preloader').hide();
return;
}
$.post(url, {doload: 1}, function(d){
d = JSON.parse(d);
$('#search_preloader').hide();
$('#atitle').html(d.title);
$('#audios_res').html(d.result);
$('#load_but').html(d.but);
var _a = audio_player;
_a.playLists = {};
_a.playLists['audios'+uid] = {data: [], pname: d.pname};
for(var i in d.playList) _a.playLists['audios'+uid].data.push(d.playList[i]);
if(_a.pause) $('#audio_'+_a.fullID).addClass('preactiv');
else _a.command('play', {style_only: true});
audio.loadAll(audio.user_id, 0);
});
},
load_page: 1,
start_load: false,
loadMore: function(){
if(this.start_load) return;
this.start_load = true;
if(this.tabType != 'my_music') return this.moreOther();
if(!audio.searchResult) audio.searchResult = {cnt: audio.loaded_len, data: audio.audiosRes};
var offset = audio.load_page*40, len = Math.min(audio.searchResult.cnt, offset+40), result = '', res = audio.searchResult.data;
for(var i = offset; i < len; i++){
tpl = str_replace(['{id}', '{uid}', '{plname}', '{artist}', '{name}', '{stime}', '{time}', '{url}', '{is_text}'], [res[i][1], res[i][0], res[i][7], res[i][3], res[i][4], res[i][6], res[i][5], res[i][2], res[i][9] ? 'text_avilable' : ''], audio.tpl_audio);
tpl = tpl.replace(/\[tools\](.*?)\[\/tools\]/gim, kj.uid == audio.user_id ? '$1' : '');
tpl = tpl.replace(/\[add\](.*?)\[\/add\]/gim, kj.uid == audio.user_id ? '' : '$1');
result += tpl;
}
$('#audios_res').append(result);
audio.load_page++;
if(result) audio.start_load = false;
else $('#audio_more_but').remove();
},
moreOther: function(){
var but = $('#audio_more_but');
but.html('<img src="/images/loading_mini.gif">');
$.post(location.href, {doload: 1, more: 1, page: audio.load_page}, function(d){
d = JSON.parse(d);
audio.load_page++;
if(d.result){
but.html('Показать больше');
$('#audios_res').append(d.result);
audio.start_load = false;
} else but.remove();
});
},
	moreSaerch: false,
	search: function(val,pid){
        if(!pid) pid = 0;
		audio.searchClient(val,pid);
	},
	loadMoreSearch: function(){
		if(this.start_load) return;
		this.start_load = true;
		$('#audio_more_but').html('<img src="/images/loading_mini.gif"/>');
		var q = $('#search_audio_val').val();
		$.post('/audio?act=search_all', {doload: 1, page: this.load_page, q: q, more: 1}, function(d){
			audio.load_page++;
			d = JSON.parse(d);
			if(d.search){
                
				audio.start_load = false;
				$('#audios_res').append(d.search);
				$('#audio_more_but').html('Показать больше');
				var _a = audio_player, type = _a.aInfo[7];
				for(var i = 0; i < d.audios; i++){
					if(type == 'search') cur.audios.data.push(d.audios[i]);
					_a.playLists['search'].data.push(d.audios[i]);
				}
				_a.playList.data = cur.audios;
			}else $('#audio_more_but').remove();
		});
	},
edit_box: function(id){
Page.Loading('start');
$('.titleHtml').remove();
var q = id.split('_');


//if(q[2] == 'publicaudios'+q[1])

aid = q[0];
$.post('/audio?act=get_info', {id: aid}, function(d){
d = JSON.parse(d);
Page.Loading('stop');
if(d.error) addAllErr('Неизвестная ошибка');
else {
var content = '<div style="padding: 15px;background: #EEF0F2;">\
<div class="audioEditDescr">Исполнитель:</div><input type="text" class="audioEditInput" id="audio_artist" value="'+d.artist+'"/><div class="clear"></div>\
<div class="audioEditDescr">Название:</div><input type="text" class="audioEditInput" id="audio_name" value="'+d.name+'"/><div class="clear"></div>\
<a href="/" class="audio_edit_more_btn" onClick="audio.showMoreSettings(this); return false;">Дополнительно</a>\
<div id="audio_edit_more" class="no_display">\
<div class="audioEditDescr">Жанр:</div><div id="audio_genre" style="width: 281px;" class="kjSelector fl_l"></div><div class="clear"></div><br/>\
<div class="audioEditDescr">Текст:</div><textarea class="audioEditInput" id="audio_text">'+(d.text ? str_replace(['<br>','<br />'], ['\n', '\n'], d.text) : '')+'</textarea><div class="clear"></div>\
</div>\
<div class="audioEditDescr">&nbsp;</div><div class="button_div fl_l"><button onClick="audio.save_audio(\''+id+'\', '+aid+')" id="saveabutton">Сохранить</button></div><div class="clear"></div>\
</div>\
<style>#audio_genre .kjSelectorTop{padding: 10px 10px}#audio_genre li{padding: 6px 10px}</style>';
Box.Show('audio_edit', 440, 'Редактирование аудиозаписи', content, 'Закрыть');
cur.selects = {};
cur.selects['audio_genre'] = new Selector({id: 'audio_genre', data: d.genres, def: d.genre});
}
});
},
showMoreSettings: function(el){
$(el).remove();
$('#audio_edit_more').show();
},
save_audio: function(id, aid){
var artist = $('#audio_artist').val(), name = $('#audio_name').val(), genre = $('#audio_genre').val(), text = $('#audio_text').val();
if(!artist){ setErrorInputMsg('audio_artist'); return; }
if(!name){ setErrorInputMsg('audio_name'); return; }
$('#saveabutton').html('<img src="/images/loading_mini.gif"/>').attr('onClick', '');
$.post('/audio?act=save_edit', {id: aid, genre: genre, artist: artist, name: name, text: text}, function(){
Box.Close('audio_edit');
$('#audio_'+id+' #artist').html(artist);
$('#audio_'+id+' #name').html(name);
});
},
delete_box: function(id, pid){
    if(!pid) pid= 0;
$('.titleHtml').remove();
var aid = id.split('_');
aid = aid[0];
Box.Show('del', 400, 'Удаление аудиозаписи', '<div style="padding: 15px">Вы действительно хотите удалить эту аудиозапись?</div>', 'Отмена', 'Да, удалить', 'audio.start_delete(\''+id+'\', '+aid+', '+pid+')');
},
start_delete: function(id, aid, pid){
$('#box_del .button_div_gray').remove();
$('#box_del .button_div').html('<img src="/images/loading_mini.gif"/>');
$.post('/audio?act=del_audio', {id: aid}, function(d){
if(d == 'error') addAllErr('Неизвестная ошибка');
else if(pid) Page.Go('/public/audio'+pid);
else Page.Go('/audio');
});
},
albumBox: function(pid){
Page.Loading('start');
if(!pid) type = 'audio';
else type = '?go=public_audio&pid='+pid;
$.post('/'+type, {act: 'albumBox'}, function(d){
Box.Show('upload', 475, 'Добавление новой песни', d, 'Отмена');
Page.Loading('stop');
$(document).bind('drop', audio.onDropFile).bind('dragover', audio.dragOver);
$('.audio_drop_wrap').bind('dragenter', audio.dragOver).bind('dragleave', audio.dragOut);
});
},
uploadBox: function(pid){
Page.Loading('start');
if(!pid) type = 'audio';
else type = '?go=public_audio&pid='+pid;
$.post('/'+type, {act: 'upload_box'}, function(d){
Box.Show('upload', 475, 'Добавление новой песни', d, 'Отмена');
Page.Loading('stop');
$(document).bind('drop', audio.onDropFile).bind('dragover', audio.dragOver);
$('.audio_drop_wrap').bind('dragenter', audio.dragOver).bind('dragleave', audio.dragOut);
});
},
	onDropFile: function(e){
		e = e || window.event;

		cancelEvent(e);

		$('.audio_upload_drop').hide();
		$('.chat_tab').show();

		audio.onFile(e.dataTransfer.files);

		return false;
	},
	dragOver: function(e){
		e = e || window.event;

		$('.audio_upload_drop').show();
		$('.chat_tab').hide();

		cancelEvent(e);
		return false;
	},
	dragOut: function(e){
		e = e || window.event;

		$('.audio_upload_drop').hide();
		$('.chat_tab').show();

		cancelEvent(e);
		return false;
	},
	audioUploadErrorBox: function(str){
        Box.Show('err', 450, 'Ошибка', '<div style="padding:15px;line-height:160%;">'+str+'</div>', 'Закрыть');
	},
	onFile: function(e,pid){
        if(!pid) pid = 0;
		var _a = audio, files = e.files, len = files.length, maxlen = 500;

		if(!len) return;

		var queue = [];
		
		if(len > maxlen){
			var err_msg = 'За один раз Вы не можете загрузить более {name}'.replace('{name}', maxlen+' '+declOfNum(maxlen, [
				'аудиозапись', 'аудиозаписи', 'аудиозаписей'
			]));
			_a.audioUploadErrorBox(err_msg);
			e.value = '';
			return;
		}

		for(var i = 0; i < len; i++){
			var file = files[i];

			var ext = file.name.split('.');
			ext = ext[ext.length - 1];

			if(ext != 'mp3'){
				var err_msg = 'Аудиозапись <b>{name}</b> имеет не верный формат.<br>Выбирите аудиозаписи с форматом MP3!'.replace('{name}', file.name);
				_a.audioUploadErrorBox(err_msg);
				e.value = '';
				return;
			}

			if(file.size > 209715200){
				var err_msg = 'Аудиозапись <b>{name}</b> превышает максимально допустимый размер.<br>Выбирите аудиозапись размером не более 200 МБ'.replace('{name}', file.name);
				_a.audioUploadErrorBox(err_msg);
				e.value = '';
				return;
			}

			queue.push(file);
		}

		$('#audio_choose_wrap').hide();
		$('.audio_upload_progress').show();
		$('#box_upload #btitle').html('Идет загрузка..');
		$('#box_upload .box_bottom, #box_upload .box_close').remove();
		$('#box_upload').unbind('click');

		_a.upload_queue = queue;
		_a.uploaded_num = 0;
		_a.upload_total = len;
		_a.startUpload(queue[0],pid);
	},
	startUpload: function(file,pid){
		var _a = audio, queue = _a.upload_queue;
$('#audio_num_download').html('Загруженно {num} из {total}'.replace('{num}', _a.uploaded_num).replace('{total}', _a.upload_total));
		var xhr = new XMLHttpRequest();
			progress = $('.audio_upload_pr_line'),
			progress_str = $('.audio_upload_pr_line .str, #progress_str');

		xhr.upload.addEventListener('progress', function(e){
			if(e.lengthComputable){
				var p = (e.loaded / e.total) * 100;
				progress.css('width', p+'%');
				progress_str.html(parseInt(p)+'%');
			}
		});

		xhr.onreadystatechange = function(e){
			if(e.target.readyState == 4){
				if(e.target.status == 200){
					_a.uploaded_num++;
					//$('#box_upload #btitle').html('Загруженно {num} из {total}'.replace('{num}', _a.uploaded_num).replace('{total}', _a.upload_total));
                    
                    $('#audio_num_download').html('Загруженно {num} из {total}'.replace('{num}', _a.uploaded_num).replace('{total}', _a.upload_total));
                    
					_a.upload_queue = _a.upload_queue.slice(1);
					if(_a.upload_queue.length > 0) _a.startUpload(_a.upload_queue[0],pid);
					else{
						$('#box_upload #btitle').html('Информация');
						$('.audio_upload_cont').html('Загрузка завершена..');
						
                        
                        setTimeout(function(){
                            
                            
if(!pid) Page.Go('/audio');
else Page.Go('/public/audio'+pid);
                            
                            
						}, 3000);
                        
                        
                        
					}
				}
			}
		};
if(pid) url = '/index.php?go=public_audio&act=upload&pid='+pid;
else url = '/audio?act=upload';
		xhr.open('POST', url, true);
		var form = new FormData();
		form.append('file', file);
		xhr.send(form);
	},
add: function(id){
if(!id) id = audio_player.fullID;
$('.titleHtml').remove();
var aid = id.split('_');
aid = aid[0];
id = id.replace('_pad', '');
$('#audio_'+id+' .tools, #audio_'+id+'_pad .tools').html('<li class="icon-ok-3" style="padding-top: 2px;font-size: 16px;"></li><div class="clear"></div>');
$('#pad_add, #pl_add').addClass('icon-ok-3').removeClass('icon-plus-6');
$.post('/audio?act=add', {id: aid});
},
pageFriends: 1,
friend_tpl: '<li id="user_{fid}" onmousedown="{js}.openFriends({uid}, {fid})">\
<img src="{ava}"/>\
		<div class="fl_l" style="line-height: 130%;margin-left: 5px;">\
			<div class="audioFriendsBlockName">{name}</div>\
			<div class="cnt_music" dir="auto">{count}</div>\
		</div>\
		<div class="clear"></div>\
	</li>',
compile_friends: function(d){
var count = d.count+' '+declOfNum(d.count, ['аудиозапись', 'аудиозаписи', 'аудиозаписей']);
return str_replace(['{fid}', '{uid}', '{name}', '{ava}', '{js}', '{count}'], [d.fid, d.uid, d.name, d.ava, d.js, count], audio.friend_tpl);
},
LoadFriends: function(){
$.post('/audio?act=loadFriends', function(d){
d = JSON.parse(d);
audio.pageFriends = 1;
var res = '';
for(var i = 0; i < d.res.length; i++) res += audio.compile_friends(d.res[i]);
if(d.count > 6) res += '<div class="audioFrLoadBut" id="audioFrMainLoadBut" onClick="audio.nextFriends()">Показать следующие</div>';
$('#friendBlockMain').html(res);
audio.cssFr();
});
},
nextFriends: function(){
$('#audioFrMainLoadBut').html('Ждите, идёт загрузка...').attr('onClick', '');
var q = $('#mainFrSearch').val();
$.post('/audio?act=loadFriends', {q: q, page: audio.pageFriends}, function(d){
d = JSON.parse(d);
if(d.reset) audio.pageFriends = 0;
else audio.pageFriends++;
var res = '';
for(var i = 0; i < d.res.length; i++) res += audio.compile_friends(d.res[i]);
if(d.count > 6) res += '<div class="audioFrLoadBut" id="audioFrMainLoadBut" onClick="audio.nextFriends()">Показать следующие</div>';
$('#friendBlockMain').html(res);
audio.cssFr();
});
},
friendSearch:function(id, type){
                var name = $('#friendsearch').val();
                if(name == 0){
                        $('#friendBlockMain').hide();
                        $('.friends_onefriend').show();
                        $('#nav').show();
                }else{
                        $.post('/audio?act=search',{name:name, id: id, type:type},function(d){
                        audio.cssFr();
                        $('.friends_onefriend').hide();
                        $('#nav').hide();
                                $('#friendBlockMain').show();
                                $('#friendBlockMain').html(d);
                        });
                }
        },
	friendSearch1: function(){
		removeTimer('mainFrSearch');
		addTimer('mainFrSearch', function() {
			audio.pageFriends = 1;
			var q = $('#mainFrSearch').val();
			$.post('/audio?act=loadFriends', {q: q}, function(d){
				d = JSON.parse(d);
				var len = d.res.length;
				if(len > 0) {
					var res = '';
					for(var i = 0; i < len; i++) res += audio.compile_friends(d.res[i]);
					$('#friendBlockMain').html(res);
					audio.cssFr();
				}else $('#friendBlockMain').html('<div style="color: #666; margin-top: 20px; margin-bottom: 20px;text-align:center;">'+langs.global_not_found+'</div>');
				if(len == 8) $('#audioFrMainLoadBut').show();
				else $('#audioFrMainLoadBut').hide();
			});
		}, 300); 
	},
	cssFr: function(){
		$('#friendBlockMain #user_'+this.a_user_fid).addClass('audioFrActive');
		$('#audio_content_block').css('min-height', (parseInt($('.fixed_audio_right').height())+'px'));
	},
	loaded_len: 0,
	searchResult: 0,
	loadAll: function(uid, page){
		$.post('/audio'+uid+'?act=load_all', {page: page}, function(d){
			d = JSON.parse(d);
			page++;
			if(d.loaded == 1){
				audio.audiosRes = d.res;
				audio.loaded_len = d.res.length;
				audio.searchResult = {data: d.res, cnt: audio.loaded_len};
			}else audio.loadAll(uid, page);
			if(audio.loaded_len > 40){
				$('#load_but').html('<div class="audioLoadBut" style="margin-top:10px" onClick="audio.loadMore()" id="audio_more_but">Показать больше</div>');
			}
		});
	},
	searchClient: function(val,pid){
		if(val){
			var cnt = 0, a, res = [];
			val = String(val).toLowerCase();
			for(var i = 0; i < audio.loaded_len; i++){
				a = audio.audiosRes[i];
				if(String(a[3]).toLowerCase().indexOf(val) != -1 || String(a[4]).toLowerCase().indexOf(val) != -1){
					res.push(a);
					cnt++;
				}
			}
			audio.searchResult = {data: res, cnt: cnt};

			audio_player.playLists['audios'+audio.user_id] = {
				pname: 'Сейчас играют аудиозаписи '+audio.uname+' | '+declOfNum(cnt, 'аудиозапись', 'аудиозаписи', 'аудиозаписей'),
				data: res
			};

			//$('#atitle').html('');
            
			$('.audio_menu li').removeClass('active');
			
         
            
            $('#search_tab2').show().addClass('active');

			if(cnt > 0){
				var len = Math.min(40, cnt), result = '', tpl;
				for(var i = 0; i < len; i++){
					tpl = str_replace(['{id}', '{uid}', '{plname}', '{artist}', '{name}', '{stime}', '{time}', '{url}', '{is_text}'], [res[i][1], res[i][0], res[i][7], res[i][3], res[i][4], res[i][6], res[i][5], res[i][2], res[i][9] ? 'text_avilable' : ''], audio.tpl_audio);
					tpl = tpl.replace(/\[tools\](.*?)\[\/tools\]/gim, kj.uid == audio.user_id ? '$1' : '');
					tpl = tpl.replace(/\[add\](.*?)\[\/add\]/gim, kj.uid == audio.user_id ? '' : '$1');
					result += tpl;
				}
				$('#audios_res').html(result);
				if(audio_player.pause) $('#audio_'+audio_player.fullID).addClass('preactiv');
				else audio_player.command('play', {style_only: true});
				if(cnt < 15) audio.searchServer(val,pid);
			}else{
				$('#audios_res').html('');
				audio.searchServer(val,pid);
			}
		}else{
            

            if(audio.tabType == 'publicaudios'+audio.user_id) Page.Go('/public/audio'+audio.user_id);
			else if(kj.uid == audio.user_id) audio.change_tab('my_music');
			else audio.openFriends(audio.user_id, audio.a_user_fid);
			$('#search_preloader').hide();
		}
	},
searchServer: function(val,pid){


    
removeTimer('search');
addTimer('search', function(){
audio.start_load = false;
$('#search_preloader').show();
$.post('/audio?act=search_all', {q: val,pid:pid}, function(d){
audio.moreSaerch = true;
d = JSON.parse(d);
audio_player.playLists['search'] = {pname: 'Сейчас играют результаты поиска',data: d.audios};


    
$('#atitle').html('<div class="audio_page_title" style="margin: 15px 0;">В поиске найдено '+d.search_cnt+' '+declOfNum(d.search_cnt, ['аудиозапись', 'аудиозаписи', 'аудиозаписей'])+'</div>');
$('#audios_res').append(d.search);

if(d.search_cnt > 40) $('#load_but').html('<div class="audioLoadBut" style="margin-top:10px" onClick="audio.loadMoreSearch()" id="audio_more_but">Показать больше</div>');
else $('#load_but').html('');
$('#search_preloader').hide();
if(audio_player.pause) $('#audio_'+audio_player.fullID).addClass('preactiv');
else audio_player.command('play', {style_only: true});
});
});
},
	tpl_audio: '<div class="audio" id="audio_{id}_{uid}_{plname}" onclick="playNewAudio(\'{id}_{uid}_{plname}\', event);">\
		<div class="audio_cont">\
			<div class="play_btn icon-play-4"></div>\
			<div class="name"><span id="artist" onClick="Page.Go(\'/?go=search&query=&type=5&q={artist}\')">{artist}</span> – <span id="name" class="{is_text}" onClick="audio_player.get_text(\'{id}_{uid}_{plname}\', this);">{name}</span></div>\
			<div class="fl_r">\
				<div class="time" id="audio_time_{id}_{uid}_{plname}">{stime}</div>\
				<div class="tools">\
					[tools]<li class="icon-pencil-7" onclick="audio.edit_box(\'{id}_{uid}_{plname}\')" id="edit_tt_{id}_{uid}_{plname}" onmouseover="showTooltip(this, {text: \'Редактировать аудиозапись\', shift:[0,7,0]});"></li>\
					<li class="icon-cancel-3" onclick="audio.delete_box(\'{id}_{uid}_{plname}\')" id="del_tt_{id}_{uid}_{plname}" onmouseover="showTooltip(this, {text: \'Удалить аудиозапись\', shift:[0,5,0]});"></li>[/tools]\
					[add]<li class="icon-plus-6" onclick="audio.add(\'{id}_{uid}_{plname}\')" id="add_tt_{id}_{uid}_{plname}" onmouseover="showTooltip(this, {text: \'Добавить аудиозапись\', shift:[0,7,0]});"></li>[/add]\
					<div class="clear"></div>\
				</div>\
			</div>\
			<input type="hidden" value="{url},{time},user_audios" id="audio_url_{id}_{uid}_{plname}"/>\
			<div class="clear"></div>\
		</div>\
		<div id="audio_text_res"></div>\
	</div>'
};

//download.js v3.0, by dandavis; 2008-2014. [CCBY2] see http://danml.com/download.html for tests/usage
// v1 landed a FF+Chrome compat way of downloading strings to local un-named files, upgraded to use a hidden frame and optional mime
// v2 added named files via a[download], msSaveBlob, IE (10+) support, and window.URL support for larger+faster saves than dataURLs
// v3 added dataURL and Blob Input, bind-toggle arity, and legacy dataURL fallback was improved with force-download mime and base64 support

// data can be a string, Blob, File, or dataURL

		 
						 
						 
function download(data, strFileName, strMimeType) {
	
	var self = window, // this script is only for browsers anyway...
		u = "application/octet-stream", // this default mime also triggers iframe downloads
		m = strMimeType || u, 
		x = data,
		D = document,
		a = D.createElement("a"),
		z = function(a){return String(a);},
		
		
		B = self.Blob || self.MozBlob || self.WebKitBlob || z,
		BB = self.MSBlobBuilder || self.WebKitBlobBuilder || self.BlobBuilder,
		fn = strFileName || "download",
		blob, 
		b,
		ua,
		fr;

	//if(typeof B.bind === 'function' ){ B=B.bind(self); }
	
	if(String(this)==="true"){ //reverse arguments, allowing download.bind(true, "text/xml", "export.xml") to act as a callback
		x=[x, m];
		m=x[0];
		x=x[1]; 
	}
	
	
	
	//go ahead and download dataURLs right away
	if(String(x).match(/^data\:[\w+\-]+\/[\w+\-]+[,;]/)){
		return navigator.msSaveBlob ?  // IE10 can't do a[download], only Blobs:
			navigator.msSaveBlob(d2b(x), fn) : 
			saver(x) ; // everyone else can save dataURLs un-processed
	}//end if dataURL passed?
	
	try{
	
		blob = x instanceof B ? 
			x : 
			new B([x], {type: m}) ;
	}catch(y){
		if(BB){
			b = new BB();
			b.append([x]);
			blob = b.getBlob(m); // the blob
		}
		
	}
	
	
	
	function d2b(u) {
		var p= u.split(/[:;,]/),
		t= p[1],
		dec= p[2] == "base64" ? atob : decodeURIComponent,
		bin= dec(p.pop()),
		mx= bin.length,
		i= 0,
		uia= new Uint8Array(mx);

		for(i;i<mx;++i) uia[i]= bin.charCodeAt(i);

		return new B([uia], {type: t});
	 }
	  
	function saver(url, winMode){
		
		
		if ('download' in a) { //html5 A[download] 			
			a.href = url;
			a.setAttribute("download", fn);
			a.innerHTML = "downloading...";
			D.body.appendChild(a);
			setTimeout(function() {
				a.click();
				D.body.removeChild(a);
				if(winMode===true){setTimeout(function(){ self.URL.revokeObjectURL(a.href);}, 250 );}
			}, 66);
			return true;
		}
		
		//do iframe dataURL download (old ch+FF):
		var f = D.createElement("iframe");
		D.body.appendChild(f);
		if(!winMode){ // force a mime that will download:
			url="data:"+url.replace(/^data:([\w\/\-\+]+)/, u);
		}
		 
	
		f.src = url;
		setTimeout(function(){ D.body.removeChild(f); }, 333);
		
	}//end saver 
		

	if (navigator.msSaveBlob) { // IE10+ : (has Blob, but not a[download] or URL)
		return navigator.msSaveBlob(blob, fn);
	} 	
	
	if(self.URL){ // simple fast and modern way using Blob and URL:
		saver(self.URL.createObjectURL(blob), true);
	}else{
		// handle non-Blob()+non-URL browsers:
		if(typeof blob === "string" || blob.constructor===z ){
			try{
				return saver( "data:" +  m   + ";base64,"  +  self.btoa(blob)  ); 
			}catch(y){
				return saver( "data:" +  m   + "," + encodeURIComponent(blob)  ); 
			}
		}
		
		// Blob but not URL:
		fr=new FileReader();
		fr.onload=function(e){
			saver(this.result); 
		};
		fr.readAsDataURL(blob);
	}	
	return true;
} /* end download() */

function isObject(obj) { return Object.prototype.toString.call(obj) === '[object Object]'; }
var cur = {};
cur.langs = {};
cur.Media = {};
if(!window.kj) var kj = {};

if(window.Notification) cur.Notification = Notification;


$(document).ready(function(){
	onBodyResize();
	$('.update_code').click(function(){
		var rndval = new Date().getTime(); 
		$('#sec_code').html('<img src="/antibot/antibot.php?rndval=' + rndval + '" alt="" title="'+lang_152+'" width="120" height="50" />');
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
		cur.lazy = new LazyLoad();
		document.addEventListener('visibilitychange', function(e) {
			if(window.IM) IM.visibilityChange(document.visibilityState);
			if(document.visibilityState.toLowerCase() == 'visible'){
				cur.visible = true;
				onVisible();
			}else cur.visible = false;
		}, false);
		var match = location.href.match(/\/(news|feed)/);
		if(match) Notifier.follow_news_onload = true;
	}
	kj.loaded = true;
});
function onVisible(){
	KJ('.feed_item.new').removeClass('new');
	if(!cur.updateLVTimer && KJ.now() - cur.lastUpTs < 300000) Notifier.startUpdateLV(true);
}
function initClick(){
	$(window).click(function(e){
		if(Kj.dropMenu.opened){
			Kj.dropMenu.opened = 0;
			var dropmenu = $('.DropMenu');
			if(dropmenu.length){
				dropmenu.removeClass('DropMenuHover');
				$('.DropMenuItems').hide();
				removeTimer('dropmenu');
			}
		}
		var target = KJ(e.target), target_p = target.parents();
		if(cur.openedReply){
			if(target.filter('.post_reply_form, .box_pos').length == 0 && target.parents('.post_reply_form, .box_pos').length == 0){
				Wall.hideReplyFrom();
			}
		}
		if(cur.notifyPad){
			if(target.filter('.notify_pad, #notify_pad_but').length == 0 && target.parents().filter('.notify_pad, #notify_pad_but').length == 0) NotifyPad.hide();
		}
		/*if(cur.chat_friends_opened){
			if(target.filter('#chat0').length == 0 && target_p.filter('#chat0').length == 0){
				Chat.expand(0);
			}
		}*/
		if(cur.postTools && target.filter('.post_tools_but').length == 0) Wall.hide_tools();
		if($('.fast_search_bg:visible').length){
			if(target.filter('.fast_search_bg, #query').length == 0 && target_p.filter('.fast_search_bg, #query').length == 0) $('.fast_search_bg').hide();
		}
		if(window.wallReply && wallReply.opened_form){
			var id = wallReply.opened_form, txt_obj = $('#reply_text'+id);
			if(txt_obj.length == 0){
				wallReply.opened_form = 0;
			}else{
				var txt = txt_obj.val(), for_user = $('#reply_user_data'+id).val(), exp_for = for_user ? for_user.split('|') : ['',''];
				if((txt && txt != exp_for[1]+', ') || (attach_all.obj['reply_'+id] && attach_all.obj['reply_'+id].num)){ }
				else{
					if(target.filter('#reply_from'+id).length == 0 && target_p.filter('#reply_from'+id).length == 0){
						KJ('#reply_from'+id).hide();
						var cnt = $('#reply_com_num'+id).val(), is_hide_short = KJ('#reply_hidden_short'+id).val();
						if(cnt > 0 || is_hide_short == 0) $('#reply_open_input'+id).show();
						else $('#comm_but_show'+id).show();
						$('#reply_user_data'+id).val('');
						$('#reply_user_name'+id).html('');
						wallReply.opened_form = 0;
					}
				}
			}
		}
		if($('.chat_smile_box.active').length){
			$.each($('.chat_smile_box.active'), function(){
				var id = $(this).attr('id').replace('smile_box_', '');
				if(target_p.filter('#smile_box_'+id+', #smile_open_but_'+id).length == 0 && target.filter('#smile_box_'+id+', #smile_open_but_'+id).length == 0){
					KJ(this).removeClass('active');
					KJ('#chat'+id+' .chat_smile_but').removeClass('active');
				}
			});
		}
		if($('#audioMP.active').length){
			if(target.filter('#audioPad, #audioMP').length == 0 && target_p.filter('#audioPad, #audioMP').length == 0) audio_player.showPad(e);
		}
		if($('#qnotifications_box121').length){
			if(target.filter('#audioPad, #qnotifications_box2121').length == 0 && target_p.filter('#audioPad, #qnotifications_box').length == 0) QNotifications21.box(e);
		}
		if($('.kj_selector.show').length){
			$.each($('.kj_selector.show'), function(){
				var id = $(this).attr('id');
				if(target_p.filter('#'+id).length == 0 && target.filter('#'+id).length == 0){
					KJ(this).removeClass('show');
					cur.selects[id].blur();
				}
			});
		}
	});
}

//old logo lggg.PNG
/*function newYearLogos(){
	var d = new Date(),  date = d.getDate()+5, month = d.getMonth(), year = d.getFullYear(), index = 1;
	var ng_index = get_cookie('newYearIndex');
	if(ng_index){
		index = (ng_index*1)+1;
		if(index > 4) index = 1;
	}
	var res_indx = (index*1)-1;
	var arr = ['2', '-30', '-62', '-95'];
	$('.site_head .logo').css({
		'background-position-y': arr[res_indx]+'px'
	});
	set_cookie('newYearIndex', index, year, month, date);
}*/


function rand(mi, ma) { return Math.floor(Math.random() * (ma - mi + 1)) + mi; }

var kjTimers = {};
function addTimer(name, callback, time){
	if(kjTimers[name]) removeTimer(name);
	kjTimers[name] = setTimeout(function(){
		callback();
		delete kjTimers[name];
	}, time);
}
function removeTimer(name){
	if(!kjTimers[name]) return;
	if(isArray(name)) {
		for(var i = 0; i <= name.length; i++) removeTimer(name[i]);
		return;
	}
	clearTimeout(kjTimers[name]);
	delete kjTimers[name];
}
function isArray(obj) { return Object.prototype.toString.call(obj) === '[object Array]'; }

if(CheckRequestVideo(req_href)){
	$(document).ready(function(){
		var video_id = req_href.split('_');
		var section = req_href.split('sec=');
		var fuser = req_href.split('wall/fuser=');
		if(fuser[1])
			var close_link = '/u'+fuser[1];
		else
			var close_link = '';
		if(section[1]){
			var xSection = section[1].split('/');
			if(xSection[0] == 'news')
				var close_link = 'news';
			if(xSection[0] == 'msg'){
				var msg_id = xSection[1].split('id=');
				var close_link = '/messages/show/'+msg_id[1];
			}
		}
		videos.show(video_id[1], req_href, close_link);
	});
}

window.onload = function(){ 
	window.setTimeout(function(){ 
			window.addEventListener('popstate', function(e){
					e.preventDefault();
					if(e.state && e.state.link) Page.Go(e.state.link, {no_change_link: 1});
				},  
			false); 
		}, 
	1); 
}
function CheckRequestVideo(request){
	var pattern = new RegExp(/video[0-9]/i);
 	return pattern.test(request);
}
var last_win_w = 0;
function onBodyResize(){
	var ww = window.innerWidth;

	if(ww == last_win_w) return;
	last_win_w = ww;

	var obj = KJ('.content'), contw = obj.width(), res = (ww - contw) / 2;
	res = Math.max(res, 30);
	obj.css('margin', '40px '+res+'px 0px');
	KJ('.head_cont').css('margin', '0px '+res+'px');
	KJ('.kj_top_button');
	KJ('.site_menu_fix').css('left', res + 'px');
	KJ('#ads_block').css('left', (res + 829) + 'px');
}

var nav = {
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
	go: function(h, params){
		if(!h) return;

		if(!kj.logged && (h == 'http://kabuljan.af/' || h == '/')) return location.href = '/';

		h = h.replace('http://kabuljan.af', '');
		nav.new_url = h;

		if(!params) params = {};

		if(nav.destroy){
			nav.last_url = {h: h, p: params};
			var ret = nav.destroy(1);
			if(ret == 1) return;
			nav.destroy = null;
		}

		nav.clear();

		if(!params.no_change_link) history.pushState({link:h}, null, h);

		h += (h.indexOf('?') != -1 ? '&' : '?')+'al=-1';

		nav.clean = false;
		nav.static_start = false;
		nav.cont_queue = {};
		nav.init_js = null;
		nav.end = false;

		h += '&rnd_='+(new Date().getTime());

		nav.cur_load_link = h;

		var h_data = nav.getStaticFiles(h);
		if(h_data.files.length > 0){
			nav.static_start = true;
			if(!h_data.loaded){
				stManager.add(h_data.files, function(){
					navTree[h_data.i].loaded = true;
					if(nav.cur_load_link != h) return;
					nav.loaded_st = true;
					for(var i in nav.cont_queue){
						KJ('#'+i).html(nav.cont_queue[i]);
						delete nav.cont_queue[i];
					}
					if(nav.frame_loaded) nav.page_loaded();
				});
			}else nav.loaded_st = true;
		}else nav.loaded_st = true;

		KJ('body').append('<iframe id="navigation_frame"></iframe>');
		KJ('#navigation_frame').attr('src', h);
	},
	clear: function(h){
		if(kj.uid){
			if(cur.attach_all) cur.attach_all.obj = {};
			wallReply.opened_form = 0;
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
		Emoji.inited = {};

		nav.start_load_st = false;
		nav.loaded_st = false;
		nav.frame_loaded = false;

		voicesPlayer.curVoice = null;
		if(voicesPlayer.playing){
			voicesPlayer.endVoice();
			KJ('#voice_song')[0].pause();
		}
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
		initClick();
		if(window.audio_player && !audio_player.pause) audio_player.command('play', {style_only: true});
		cur.lazy.searchImages(1);
		if(nav.resize_win){
			onBodyResize();
			nav.resize_win = null;
		}

		window.scrollTo(0,0);
	}
};


var Page = {
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
	go: function(h, params){
		return nav.go.apply(false, arguments);
	},
	Go: function(h, params){
		return nav.go.apply(false, arguments);
	}
}



//PROFILE FUNC
var Profile = {
	ShangeName: function(){
		$('.js_titleRemove').remove();
		viiBox.start();
		$.post('/index.php?go=editprofile&act=shange_name_page', function(d){
			viiBox.win('shange', d);
		});
	},
	ratingBox: function(){
		$.post('/index.php?go=editprofile&act=rating_box', function(d){
			Box.Open({id: 'rating', title: 'Рейтинг', data: d});
		});
	}
}
//MODAL BOX
var Box21 = {
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
			var clos_but = '<div class="fl_l"><button class="button red" onClick="Box.Clos(\''+p.id+'\', '+p.cache+', 1);">'+(p.clos_text ? p.clos_text : lang_msg_close)+'</button></div>';
			var succes = p.success ? '<div class="fl_l" style="margin-right: 8px;"><button class="button '+(p.suc_class ? p.suc_class : '')+'" onClick="'+p.suc_js+'">'+(p.suc_text ? p.suc_text : lang_11)+'</button></div>' : '';
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
		'</div><div class="box_top_but" onClick="$(\'#box_'+p.id+'\').scrollTop(0);"><div class="box_top_strelka"><div class="icon-up-dir-1" style="font-size: 30px;"></div><div>'+up+'</div></div></div></div></div>');
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
	},
	Clos: function(id, cache, force){
		var cbdatas = $('#box_'+id).attr('cb-datas');
		if(cache) $('#box_'+id).hide();
		else $('#box_'+id).remove();
		if($('.box_pos, #wiki_wall, .video_box, .photoViewBox, #wiki_view').length == 0) $('body').css('overflow-y', 'auto');
		$('.video_box, .photoViewBox, #wiki_view').css('overflow-y', 'auto');
		if(Box.cb[id]){
			Box.cb[id](force);
			delete Box.cb[id];
		}
	},
	Page: function(url, data, name, width, title, cancel_text, func_text, func, height, overflow, bg_show, bg_show_bottom, input_focus, cache){
		if(cache)
			if(ge('box_'+name)){
				Box.Close(name, cache);
				$('#box_'+name).show();
				$('#box_content_'+name).scrollTop(0);
				if(is_moz && !is_chrome)
					scrollTopForFirefox = $(window).scrollTop();
				$('body').css('overflow-y', 'hidden');
				if(is_moz && !is_chrome)
					$(window).scrollTop(scrollTopForFirefox);
				return false;
			}

		$.post(url, data, function(html){
			if(!CheckRequestVideo(location.href))
				Box.Close(name, cache);
			Box.Show(name, width, title, html, cancel_text, func_text, func, height, overflow, bg_show, bg_show_bottom, cache);
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
			var func_but = '<button onClick="'+func+'" id="box_butt_create" style="margin-right:10px;" class="button fl_r">'+func_text+'</button>';
		else
			var func_but = '';
		var close_but = '<button onClick="Box.Close(\''+name+'\', '+cache+'); return false;" class="button red fl_r">'+close_text+'</button>';
		
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

		$('body').append('Проверить что тут код скопирован под номером 1');
		
		$('#box_'+name).show();
		if(is_moz && !is_chrome)
			scrollTopForFirefox = $(window).scrollTop();
		$('body').css('overflow-y', 'hidden');
		if(is_moz && !is_chrome)
			$(window).scrollTop(scrollTopForFirefox);
		$(window).keydown(function(event){
			if(event.keyCode == 27) {
				Box.Close(name, cache);
			} 
		});
		autoMarginTop('#box_'+name+' .box_bg');
		/*$(window).mousedown(function(e){
			if ($(e.target).parents().filter('.box_bg:visible').length != 1) {
				Box.Close(name, cache);
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
		setTimeout("Box.InfoClose()", tout);
		$(window).keydown(function(event){
			if(event.keyCode == 27) {
				Box.InfoClose();
			} 
		});
		$('.box_info').mousedown(Box.InfoClose);
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
				stManager.add(['al/wiki_view.js?3', 'al/wiki_view.css?1'], function(){
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
function ge(el){
	return (typeof el == 'string' || typeof el == 'number') ? document.getElementById(el) : el;
}

function but_loading(opts){
	var el = KJ('#'+opts.el);
	if(opts.show){
		var cont = el.attr('old-cont');
		el.html(cont).css('height', 'auto');
		el.attr('old-cont', '');
		el[0].disabled = false;
	}else{
		if(el[0].disabled) return;
		var cont = el.html(), w = el[0].scrollWidth;
		el.html('<div style="text-align:center;"><img src="/images/loading_mini.gif" alt="" /></div>').css('width', w+'px');
		el.attr('old-cont', cont);
		el[0].disabled = true;
	}
}
function textLoad(i){
	$('#'+i).html('<img src="/images/loading_mini.gif" alt="" />').attr('onClick', '').attr('href', '#');
}
function updateNum(i, type){
	if(type)
		$(i).text(parseInt($(i).text())+1);
	else
		$(i).text($(i).text()-1);
}
function setErrorInputMsg(i){
	var el = typeof i == 'string' ? KJ('#'+i) : KJ(i);
	el.css('background', '#ffefef');
	el.focus();
	setTimeout(function(){
		el.css('background', '#fff').focus();
	}, 700);
}
function langNumric(id, num, text1, text2, text3, text4, text5, prefix){
	if(!prefix) prefix = '';
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
	
	$('#'+id).html(prefix+gram_num_record);
}

//VII BOX
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
		$('body').css('overflow-y', 'hidden');
		if(is_moz && !is_chrome) $(window).scrollTop(scrollTopForFirefox);
		$('body').append('<div class="vii_box" id="newbox_miniature'+i+'">'+d+'</div>');
		$(window).keydown(function(event){
			if(event.keyCode == 27) 
				viiBox.clos(i, o, h);
		});
		/*$(window).mousedown(function(e){
			if ($(e.target).parents().filter('.miniature_box:visible').length != 1) {
				viiBox.clos(i, o, h);
			}
		});*/
	},
	clos: function(i, o, h){
		Page.PL('stop');
		$('#newbox_miniature'+i).remove();
		if(o) $('body').css('overflow-y', 'auto');
		if(h) history.pushState({link:h}, null, h);
	}
}

//LANG
var trsn = {
  	box: function(){
   	 	$('.js_titleRemove').remove();
   	 	viiBox.start();
		$.post('/index.php?go=lang', function(d){
	  		viiBox.win('vii_lang_box', d);
		});
  	},
  	setLgn: function(id){
  		var loc = location.href;
  		Page.PL('start');
  		KJ.post('/?act=chage_lang&id='+id, function(){
  			location.reload();	
  		});
  	}
}
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
function AntiSpam(type, callblack, p1, p2, p3){
	Page.Loading('stop');
	var rndval = new Date().getTime(); 
	Box.Show('sec_code', 280, lang_274, '<div style="padding:20px;text-align:center"><div class="cursor_pointer" onClick="updateCode(); return false"><div id="sec_code"><img src="/antibot/antibot.php?rndval=' + rndval + '" alt="" title="'+lang_152+'" width="120" height="50" /></div></div><div id="code_loading"><input type="text" id="val_sec_code" class="inpst" maxlength="6" style="margin-top:10px;width:110px" /></div></div>', lang_box_canсel, lang_album_create, 'AntiSpamCheckCode('+type+', '+callblack+', '+p1+','+p2+','+p3+'); return false;');
	$('#val_sec_code').focus();
}

var antiSpamDone = antiSpamFail = null;
function anti_spam(done, fail){
	Page.Loading('stop');
	var rndval = new Date().getTime();

	antiSpamDone = function(){
		antiSpamDone = antiSpamFail = null;
		antiSpamOk(done);
	};
	antiSpamFail = function(f){ 
		antiSpamDone = antiSpamFail = null;
		if(f) fail();
	};

	Box.Open({
		id: 'sec_code',
		width: 280,
		title: lang_274,
		data: '<div style="padding:20px;text-align:center"><div class="cursor_pointer" onClick="updateCode(); return false"><div id="sec_code"><img src="/antibot/antibot.php?rndval=' + rndval + '" alt="" title="'+lang_152+'" width="120" height="50" /></div></div><div id="code_loading"><input type="text" id="val_sec_code" class="inpst" maxlength="6" style="margin-top: 13px;width: 120px;padding: 7px;margin-bottom:0px;" /></div></div>',
		success: true,
		suc_js: 'antiSpamDone()',
		suc_text: lang_11,
		bottom: true,
		cb: antiSpamFail
	});
	KJ('#val_sec_code').focus();
	KJ('#box_sec_code .button.red').remove();
}

function antiSpamOk(cb){
	var val_sec_code = $("#val_sec_code").val();
	cb(val_sec_code);
	updateCode();
	$('#code_loading').html('<input type="text" id="val_sec_code" class="inpst" maxlength="6" style="margin-top:10px;width:110px" />');
	$('#val_sec_code').val('');
	$('#val_sec_code').focus();
}

function updateCode(){
	var rndval = new Date().getTime(); 
	$('#sec_code').html('<img src="/antibot/antibot.php?rndval=' + rndval + '" alt="" title="'+lang_14+'" width="120" height="50" />');
}

function AntiSpamCheckCode(type, callblack, p1, p2, p3){
	var val_sec_code = $("#val_sec_code").val();
	$('#code_loading').html('<img src="'+template_dir+'/images/loading_mini.gif" style="margin-top:21px" />');
	$.get('/antibot/sec_code.php?user_code='+val_sec_code, function(data){
		if(data == 'ok'){
			callblack(val_sec_code, p1, p2, p3);
		} else {
			updateCode();
			$('#code_loading').html('<input type="text" id="val_sec_code" class="inpst" maxlength="6" style="margin-top:10px;width:110px" />');
			$('#val_sec_code').val('');
			$('#val_sec_code').focus();
		}
	});
}
var ajax = {
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
var opened_title_html = 0;
function titleHtml(p){
	return showTooltip(document.getElementById(p.id), {text: p.text});
}
function showTooltip(el, opt){
	if(el.ttTimer){
		clearTimeout(el.ttTimer);
		el.ttTimer = 0;
		return;
	}

	if(el.err_tip) return;

	if(el.tt){
		if(el.tt.showing || el.tt.load) return;
		if(el.tt.show_timer) {
			clearTimeout(el.tt.show_timer);
			el.tt.show_timer = 0;
		}
	}

	KJ('.titleHtml').css({opacity:0, display: 'none'});

	try{
		el.tt.el.style.display = 'block';
		if(el.tt.el.scrollHeight > 0) var is_bl = true;
		else var is_bl = false;
		el.tt.el.style.display = 'none';
	}catch(e){
		var is_bl = false;
	}

	if(!is_bl){

		var tt = document.createElement('div');
		tt.className = 'titleHtml no_center'+(opt.className ? ' '+opt.className : '');
		tt.innerHTML = '<div dir="auto" style="position: relative">'+opt.text+'<div class="black_strelka"></div></div>';
		document.body.appendChild(tt);

		el.tt = {};
		el.tt.opt = opt;
		el.tt.el = tt;
		if(!opt.shift) opt.shift = [0,0,0];
		el.tt.shift = opt.shift;
		el.tt.show = function(){
			if(this.tt.showing) return;
			this.tt.show_timer = 0;

			var ttobj = KJ(el.tt.el), ttw = ttobj.width(), tth = ttobj.height(), st = window.scrollY, obj = KJ(this), pos = obj.offset(), elh = obj.height();

			if((pos.top - tth - this.tt.opt.shift[1]) < st){
				ttobj.addClass('down');
				var top = pos.top+(opt.shift[2])+elh, down = true;
			}else{
				ttobj.removeClass('down');
				var top = pos.top-(opt.shift[1])-tth, down = false;
			}

			ttobj.css({
				top: top + 'px',
				left: (pos.left+(opt.shift[0])) + 'px'
			}).fadeIn(100);
			if(this.tt.opt.slide){
				if(down) ttobj.css('margin-top', (this.tt.opt.slide+elh)+'px');
				else ttobj.css('margin-top', '-'+this.tt.opt.slide+'px');
				ttobj.animate({marginTop: 0}, this.tt.opt.atime);
			}
			this.tt.showing = true;
		}.bind(el);

		el.tt.destroy = function(){
			var obj = KJ(el);
			obj.unbind('mouseout');
			clearTimeout(el.ttTimer);
			clearTimeout(this.tt.show_timer);

			KJ(el.tt.el).remove();

			el.tt = false;
		}.bind(el);

		function tooltipout(e, fast){
			var hovered = KJ('div:hover');
			if(!fast && this.tt.opt.nohide && (hovered.index(this) != -1 || hovered.index(this.tt.el) != -1 || (this.tt.opt.check_parent && hovered.index(this.parentNode) != -1))) return;

			if(this.tt.show_timer){
				clearTimeout(this.tt.show_timer);
				this.tt.show_timer = false;
			}
			
			if(!this.tt.showing) return;
			
			var time = fast ? 0 : (this.tt.opt.hideWt || 0), _s = this;

			this.ttTimer = setTimeout(function(){
				var tt_el = KJ(_s.tt.el);
				tt_el.fadeOut(100);
				_s.tt.showing = false;
				_s.ttTimer = false;
			}, time);
		}
		el.tt.hide = tooltipout.bind(el);
		KJ(el).mouseout(tooltipout);
		if(opt.nohide) KJ(el.tt.el).bind('mouseover', showTooltip.bind(el, el, opt)).mouseout(tooltipout.bind(el, false));

		if(opt.url){
			el.tt.load = true;
			KJ.post(opt.url, opt.data, function(d){
				if(d == 'fail'){
					el.tt.destroy();
					el.err_tip = true;
					return;
				}
				el.tt.el.innerHTML = d+'<div class="black_strelka"></div>';
				el.tt.load = false;
				if(el.tt.opt.complete) el.tt.opt.complete(el);
			});
			return;
		}
	}

	el.tt.show_timer = setTimeout(el.tt.show.apply(el), opt.showWt || 0);
}


function in_array(find, arr) {
	for(var i = 0; i <= arr.length; i++) if(arr[i] == find) return true;
	return false;
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
function nextObjectItem(arr, key){
	var tr = false;
	for(var i in arr){
		if(tr) return i;
		if(i == key) tr = true;
	}
}
function firstObjectItem(arr){ for(var i in arr) return i; }
function prevObjectItem(arr, key){
	var prevKey = '';
	for(var i in arr){
		if(i == key) return prevKey;
		prevKey = i;
	}
}
function lastObjectItem(arr){
	var res_arr = Object.keys(arr);
	return res_arr[(res_arr.length-1)];
}
function autoMarginTop(id){
	var top = (($(window).height()-$(id).height())/2)-200;
	if(top < 30) top = 30;
	$(id).css('margin-top', top+'px');
}

function str_replace(search, replace, string){
	search = [].concat(search);
	replace = [].concat(replace);
	var len = replace.length - search.length;
	var p_last = search[search.length - 1];
	for (var i = 0; i < len; i++) search.push(p_last);
	for (var i = 0; i < -len; i++) replace.push('');
	var result = string;
	for (var i = 0; i < search.length; i++) result = result.split(search[i]).join(replace[i]);
	return result;
}
function indexOf(arr, value, from) {
	for (var i = from || 0, l = (arr || []).length; i < l; i++) {
		if (arr[i] == value) return i;
	}
	return -1;
}

function clean(str) { return str ? str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;') : ''; }

var LS = {
	set: function(k, v){
		LS.remove(k);
		try { localStorage.setItem(k, v); }catch(e){}
	},
	get: function(k){
		try { return localStorage.getItem(k); }catch (e){ return false; };
	},
	remove: function(k){
		try { localStorage.removeItem(k); }catch(e){};
	}
};
function isValidAdres(adres){
	var check_1 = new RegExp(/^[a-zA-Z0-9\_\.]+$/);
	if(check_1.test(adres)){
		var noLogin = ['friends', 'albums', 'settings', 'reg', 'news', 'balance', 'invite', 'im', 'region', 'catalog', 'background', 'blacklist', 'privacy', 'users', 'public', 'grpupds'];
		if(!in_array(adres, noLogin)) return true;
		else return false;
	}else return false;
}
function stripHTML(text) { return text ? text.replace(/<(?:.|\s)*?>/g, '') : ''; }
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

function checkbox(el){
	var obj = KJ(el);
	if(obj.hasClass('selected')) obj.removeClass('selected').val(0);
	else obj.addClass('selected').val(1);
}

function checkbox_select(el){
	if(!el) return;
	if(KJ.isArray(el)){
		for(var i = 0; i < el.length; i++) checkbox_select(el[i]);
		return;
	}
	KJ('#'+el).addClass('selected').val(1);
}

function gram(number, titles, no_number){
	cases = [2, 0, 1, 1, 1, 2];  
	return (!no_number ? number+' ' : '')+(titles[ (number%100>4 && number%100<20)? 2 : cases[(number%10<5)?number%10:5]]);
}

var kjTopBut = {
	up: function(){
		this.old = window.scrollY;
		window.scrollTo(0,0);
		KJ('#scroll_up').hide();
		KJ('#scroll_down').show();
		KJ('.kj_top_button').attr('onClick', 'kjTopBut.down();').addClass('nobg');
		kjTopBut.show = false;
	},
	down: function(e){
		window.scrollTo(0,this.old);
		KJ('#scroll_up').show();
		KJ('#scroll_down').hide();
		KJ('.kj_top_button').attr('onClick', 'kjTopBut.up();').removeClass('nobg');
		kjTopBut.show = true;
	}
};
function topButton(){
	kjTopBut.show = false;
	KJ(window).scroll(function(){
		var st = window.scrollY;

		if(st > 60 && !kjTopBut.show){
			kjTopBut.show = true;
			KJ('#scroll_up').show();
			KJ('#scroll_down').hide();
			KJ('.kj_top_button').attr('onClick', 'kjTopBut.up();').show().removeClass('nobg');
		}else if(st < 60 && kjTopBut.show){
			KJ('#scroll_up, #scroll_down').hide();
			KJ('.kj_top_button').attr('onClick', '').hide();
			kjTopBut.show = false;
		}
	});
}
