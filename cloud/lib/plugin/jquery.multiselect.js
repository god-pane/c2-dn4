/* jshint forin:true, noarg:true, noempty:true, eqeqeq:true, boss:true, undef:true, curly:true, browser:true, jquery:true */
/*
 * jQuery MultiSelect UI Widget 1.14pre
 * Copyright (c) 2012 Eric Hynds
 *
 * http://www.erichynds.com/jquery/jquery-ui-multiselect-widget/
 *
 * Depends:
 *   - jQuery 1.4.2+
 *   - jQuery UI 1.8 widget factory
 *
 * Optional:
 *   - jQuery UI effects
 *   - jQuery UI position utility
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 */
(function($,undefined){
	var multiselectID=0;
	var $doc=$(document);
	$.widget("ech.multiselect",{
								options:{
										header:true,height:175,minWidth:225,classes:"",checkAllText:"Check all",uncheckAllText:"Uncheck all",noneSelectedText:"Select options",selectedText:"# selected",selectedList:0,show:null,hide:null,autoOpen:false,multiple:true,position:{}
										},
								_create:function(){
									var el=this.element.hide();
									var o=this.options;
									this.speed=$.fx.speeds._default;
									this._isOpen=false;
									this._namespaceID=this.eventNamespace||("multiselect"+multiselectID);
									var button=(this.button=$('<button type="button"><span class="ui-icon ui-icon-triangle-2-n-s"></span></button>')).addClass("ui-multiselect ui-widget ui-state-default ui-corner-all").addClass(o.classes).attr({"title":el.attr("title"),"aria-haspopup":true,"tabIndex":el.attr("tabIndex")}).insertAfter(el),
										buttonlabel=(this.buttonlabel=$("<span />")).html(o.noneSelectedText).appendTo(button),
										menu=(this.menu=$("<div />")).attr("id","multiselectId").addClass("ui-multiselect-menu ui-widget ui-widget-content ui-corner-all").addClass(o.classes).appendTo(document.body),
										header=(this.header=$("<div />")).addClass("ui-widget-header ui-corner-all ui-multiselect-header ui-helper-clearfix").appendTo(menu),
										headerLinkContainer=(this.headerLinkContainer=$("<ul />")).addClass("ui-helper-reset").html(function(){if(o.header===true){return'<li><a class="ui-multiselect-all" href="#"><span class="ui-icon ui-icon-check"></span><span>'+o.checkAllText+'</span></a></li><li><a class="ui-multiselect-none" href="#"><span class="ui-icon ui-icon-closethick"></span><span>'+o.uncheckAllText+"</span></a></li>"}else{if(typeof o.header==="string"){return"<li>"+o.header+"</li>"}else{return""}}}).append('<li class="ui-multiselect-close"><a href="#" class="ui-multiselect-close"><span class="ui-icon ui-icon-circle-close"></span></a></li>').appendTo(header),
										checkboxContainer=(this.checkboxContainer=$("<ul />")).addClass("ui-multiselect-checkboxes ui-helper-reset").appendTo(menu);this._bindEvents();this.refresh(true);if(!o.multiple){menu.addClass("ui-multiselect-single")}multiselectID++},
								_init:function(){
									if(this.options.header===false){
										this.header.hide()
										}
									if(!this.options.multiple){
										this.headerLinkContainer.find(".ui-multiselect-all, .ui-multiselect-none").hide()
										}
									if(this.options.autoOpen){
										this.open()
										}
									if(this.element.is(":disabled")){
										this.disable()
										}
									},
								refresh:function(init){
									var el=this.element;
									var o=this.options;
									var menu=this.menu;
									var checkboxContainer=this.checkboxContainer;
									var optgroups=[];
									var html="";
									var id=el.attr("id")||multiselectID++;
									var cnt=0;
									var array_option=el.find("option");
									array_option.each(function(i){
										cnt++;
										var $this=$(this);
										var parent=this.parentNode;
										var title=this.innerHTML;
										var description=this.title;
										var value=this.value;
										var inputID="ui-multiselect-"+(this.id||id+"-option-"+i);
										var isDisabled=this.disabled;
										var isSelected=this.selected;
										var labelClasses=["ui-corner-all"];
										var liClasses=(isDisabled?"ui-multiselect-disabled ":" ")+this.className;
										var optLabel;
										if(parent.tagName==="OPTGROUP"){
											optLabel=parent.getAttribute("label");
											if($.inArray(optLabel,optgroups)===-1){
												html+='<li class="ui-multiselect-optgroup-label '+parent.className+'"><a href="#">'+optLabel+"</a></li>";
												optgroups.push(optLabel)
												}
											}
										if(isDisabled){
											labelClasses.push("ui-state-disabled")
											}
										if(isSelected&&!o.multiple){
											labelClasses.push("ui-state-active")
											}
										if(array_option[i].id.indexOf("alarm_level")!==-1||array_option[i].id.indexOf("log_level")!==-1/*||array_option[i].id.indexOf("taskStatus")!==-1*/){
											labelClasses.push("ui-state-static-"+cnt);
										}										
										html+='<li class="'+liClasses+'">';
										html+='<label for="'+inputID+'" title="'+description+'" class="'+labelClasses.join(" ")+'">';
										html+='<input id="'+inputID+'" name="multiselect_'+id+'" type="'+(o.multiple?"checkbox":"radio")+'" value="'+value+'" title="'+title+'"';
										if(isSelected){
											html+=' checked="checked"';
											html+=' aria-selected="true"'
											}
										if(isDisabled){
											html+=' disabled="disabled"';
											html+=' aria-disabled="true"'
											}
										html+=" /><span>"+title+"</span></label></li>"
										});
checkboxContainer.html(html);this.labels=menu.find("label");this.inputs=this.labels.children("input");this._setButtonWidth();this._setMenuWidth();this.button[0].defaultValue=this.update();if(!init){this._trigger("refresh")}},update:function(){var o=this.options;var $inputs=this.inputs;var $checked=$inputs.filter(":checked");var numChecked=$checked.length;var value;if(numChecked===0){value=o.noneSelectedText}else{if($.isFunction(o.selectedText)){value=o.selectedText.call(this,numChecked,$inputs.length,$checked.get())}else{if(/\d/.test(o.selectedList)&&o.selectedList>0&&numChecked<=o.selectedList){value=$checked.map(function(){return $(this).next().html()}).get().join(", ")}else{value=o.selectedText.replace("#",numChecked).replace("#",$inputs.length)}}}this._setButtonValue(value);return value},_setButtonValue:function(value){this.buttonlabel.text(value)},_bindEvents:function(){var self=this;var button=this.button;function clickHandler(){self[self._isOpen?"close":"open"]();return false}button.find("span").bind("click.multiselect",clickHandler);button.bind({click:clickHandler,keypress:function(e){switch(e.which){case 27:case 38:case 37:self.close();break;case 39:case 40:self.open();break}},
	mouseenter:function(){if(!button.hasClass("ui-state-disabled")){$(this).addClass("ui-state-hover")}},
	mouseleave:function(){$(this).removeClass("ui-state-hover")},
	focus:function(){if(!button.hasClass("ui-state-disabled")){$(this).addClass("ui-state-focus")}},
	blur:function(){$(this).removeClass("ui-state-focus")}});this.header.delegate("a","click.multiselect",function(e){if($(this).hasClass("ui-multiselect-close")){self.close()}else{self[$(this).hasClass("ui-multiselect-all")?"checkAll":"uncheckAll"]()}e.preventDefault()});this.menu.delegate("li.ui-multiselect-optgroup-label a","click.multiselect",function(e){e.preventDefault();var $this=$(this);var $inputs=$this.parent().nextUntil("li.ui-multiselect-optgroup-label").find("input:visible:not(:disabled)");var nodes=$inputs.get();var label=$this.parent().text();if(self._trigger("beforeoptgrouptoggle",e,{inputs:nodes,label:label})===false){return}self._toggleChecked($inputs.filter(":checked").length!==$inputs.length,$inputs);self._trigger("optgrouptoggle",e,{inputs:nodes,label:label,checked:nodes[0].checked})}).delegate("label","mouseenter.multiselect",function(){if(!$(this).hasClass("ui-state-disabled")){self.labels.removeClass("ui-state-hover");$(this).addClass("ui-state-hover").find("input").focus()}}).delegate("label","keydown.multiselect",function(e){e.preventDefault();switch(e.which){case 9:case 27:self.close();break;case 38:case 40:case 37:case 39:self._traverse(e.which,this);break;case 13:$(this).find("input")[0].click();break}}).delegate('input[type="checkbox"], input[type="radio"]',"click.multiselect",function(e){var $this=$(this);var val=this.value;var checked=this.checked;var tags=self.element.find("option");if(this.disabled||self._trigger("click",e,{value:val,text:this.title,checked:checked})===false){e.preventDefault();return}$this.focus();$this.attr("aria-selected",checked);tags.each(function(){if(this.value===val){this.selected=checked}else{if(!self.options.multiple){this.selected=false}}});if(!self.options.multiple){self.labels.removeClass("ui-state-active");$this.closest("label").toggleClass("ui-state-active",checked);self.close()}self.element.trigger("change");setTimeout($.proxy(self.update,self),10)});$doc.bind("mousedown."+this._namespaceID,function(e){if(self._isOpen&&!$.contains(self.menu[0],e.target)&&!$.contains(self.button[0],e.target)&&e.target!==self.button[0]){self.close()}});$(this.element[0].form).bind("reset.multiselect",function(){setTimeout($.proxy(self.refresh,self),10)})},_setButtonWidth:function(){var width=this.element.outerWidth();var o=this.options;if(/\d/.test(o.minWidth)&&width<o.minWidth){width=o.minWidth}this.button.outerWidth(width)},_setMenuWidth:function(){var m=this.menu;m.outerWidth(this.button.outerWidth())},_traverse:function(which,start){var $start=$(start);var moveToLast=which===38||which===37;$next=$start.parent()[moveToLast?"prevAll":"nextAll"]("li:not(.ui-multiselect-disabled, .ui-multiselect-optgroup-label)")[moveToLast?"last":"first"]();if(!$next.length){var $container=this.menu.find("ul").last();this.menu.find("label")[moveToLast?"last":"first"]().trigger("mouseover");$container.scrollTop(moveToLast?$container.height():0)}else{$next.find("label").trigger("mouseover")}},_toggleState:function(prop,flag){return function(){if(!this.disabled){this[prop]=flag}if(flag){this.setAttribute("aria-selected",true)}else{this.removeAttribute("aria-selected")}}},_toggleChecked:function(flag,group){var $inputs=(group&&group.length)?group:this.inputs;var self=this;$inputs.each(this._toggleState("checked",flag));$inputs.eq(0).focus();this.update();var values=$inputs.map(function(){return this.value}).get();this.element.find("option").each(function(){if(!this.disabled&&$.inArray(this.value,values)>-1){self._toggleState("selected",flag).call(this)}});if($inputs.length){this.element.trigger("change")}},_toggleDisabled:function(flag){this.button.attr({"disabled":flag,"aria-disabled":flag})[flag?"addClass":"removeClass"]("ui-state-disabled");var inputs=this.menu.find("input");var key="ech-multiselect-disabled";if(flag){inputs=inputs.filter(":enabled").data(key,true)}else{inputs=inputs.filter(function(){return $.data(this,key)===true}).removeData(key)}inputs.attr({"disabled":flag,"arial-disabled":flag}).parent()[flag?"addClass":"removeClass"]("ui-state-disabled");this.element.attr({"disabled":flag,"aria-disabled":flag})},open:function(e){var self=this;var button=this.button;var menu=this.menu;var speed=this.speed;var o=this.options;var args=[];if(this._trigger("beforeopen")===false||button.hasClass("ui-state-disabled")||this._isOpen){return}var $container=menu.find("ul").last();var effect=o.show;if($.isArray(o.show)){effect=o.show[0];speed=o.show[1]||self.speed}if(effect){args=[effect,speed]}$container.scrollTop(0).height(o.height);this.position();$.fn.show.apply(menu,args);this.labels.eq(0).trigger("mouseover").trigger("mouseenter").find("input").trigger("focus");button.addClass("ui-state-active");this._isOpen=true;this._trigger("open")},close:function(){if(this._trigger("beforeclose")===false){return}var o=this.options;var effect=o.hide;var speed=this.speed;var args=[];if($.isArray(o.hide)){effect=o.hide[0];speed=o.hide[1]||this.speed}if(effect){args=[effect,speed]}$.fn.hide.apply(this.menu,args);this.button.removeClass("ui-state-active").trigger("blur").trigger("mouseleave");this._isOpen=false;this._trigger("close")},enable:function(){this._toggleDisabled(false)},disable:function(){this._toggleDisabled(true)},checkAll:function(e){this._toggleChecked(true);this._trigger("checkAll")},uncheckAll:function(){this._toggleChecked(false);this._trigger("uncheckAll")},getChecked:function(){return this.menu.find("input").filter(":checked")},destroy:function(){$.Widget.prototype.destroy.call(this);$doc.unbind(this._namespaceID);this.button.remove();this.menu.remove();this.element.show();return this},isOpen:function(){return this._isOpen},widget:function(){return this.menu},getButton:function(){return this.button},position:function(){var o=this.options;if($.ui.position&&!$.isEmptyObject(o.position)){o.position.of=o.position.of||this.button;this.menu.show().position(o.position).hide()}else{var pos=this.button.offset();this.menu.css({top:pos.top+this.button.outerHeight(),left:pos.left})}},_setOption:function(key,value){var menu=this.menu;switch(key){case"header":menu.find("div.ui-multiselect-header")[value?"show":"hide"]();break;case"checkAllText":menu.find("a.ui-multiselect-all span").eq(-1).text(value);break;case"uncheckAllText":menu.find("a.ui-multiselect-none span").eq(-1).text(value);break;case"height":menu.find("ul").last().height(parseInt(value,10));break;case"minWidth":this.options[key]=parseInt(value,10);this._setButtonWidth();this._setMenuWidth();break;case"selectedText":case"selectedList":case"noneSelectedText":this.options[key]=value;this.update();break;case"classes":menu.add(this.button).removeClass(this.options.classes).addClass(value);break;case"multiple":menu.toggleClass("ui-multiselect-single",!value);this.options.multiple=value;this.element[0].multiple=value;this.refresh();break;case"position":this.position()}$.Widget.prototype._setOption.apply(this,arguments)}})})(jQuery);
