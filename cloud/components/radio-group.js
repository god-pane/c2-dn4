/**
 * Copyright (c) 2007-2014, InHand Networks All Rights Reserved
 * @author Qinjw
 * @filename radio-group
 * @filetype {class}
 * @filedescription "权限控制工具组件"
 * @filereturn {function}
 */
define(function(require) {
	require("cloud/base/cloud");
	require("./radio-group.css");
	var Button = require("cloud/components/button");
	var RadioGroup = Class.create(cloud.Component, {
		initialize: function($super, options) {
			//var defaultCls = "cloud-button-body";
			cloud.util.defaults(options, {
				items: [],
				vertical: false,
				events: {}
			});
			this.moduleName = "radio-group";
			$super(options);
			this.buttonItems = $A();
			this.element.addClass("radio-group");
			this.draw();
		},
		
		/*
		 * Draw radio group
		 */
		draw: function () {
			var options = this.options;
			this.element.addClass(options.vertical ? "radio-group-vertical" : "radio-group-horizontal");
			//default select the first radio.
			if(!options.items.pluck("select").any()){
				options.items.first().select = true;
			}
			options.items.each(this.renderItem, this);
		},
		
		/*
		 * Render item
		 * @param {Object} item
		 */
		renderItem: function (item) {
			this.buttonItems.push(new Button({
				container: item.renderTo || this.element,
				checkbox: true,
				text: item.text,
				extraClass: "radio-group-item",
				value: item.value,
				selected: item.select,
				events: {
					scope: this,
					click: function(button){
						if(button.isSelected()){
							this.buttonItems.invoke("unSelect");
							button.select();
						}else{
							button.select();
						}

						this.fire("select", item.value);
					}
				}
			}));
		},
		
		/*
		 * get item value
		 * @return {String}
		 */
		getValue: function () {
			return this.buttonItems.find(function(button){
				return button.isSelected();
			}).options.value;
		},
		
		/*
		 * select button
		 * @param {String} value
		 * 
		 */
		select: function(value){
			this.buttonItems.each(function(button){
				if(button.options.value === value){
					button.select();
				}else{
					button.unSelect();
				}
			});
		},
		
		/*
		 * disable the button
		 */
		disable: function(){
			this.options.disable = true;
			this.buttonItems.invoke("disable");
		},
		
		/*
		 * enable the button
		 */
		enable: function(){
			this.options.disable = false;
			this.buttonItems.invoke("enable");
		}
	});
	cloud.RadioGroup = cloud.RadioGroup || RadioGroup;
	return RadioGroup;
});