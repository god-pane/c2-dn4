define(function(require){
	require("cloud/base/cloud");
	var Button=require("cloud/components/button");
	var html=require("text!./normalEditor.html");
    var validator = require("cloud/components/validator");
	var NormalEditor=Class.create(cloud.Component,{
		initialize:function($super,options){
			$super(options);
			this.container=$(options.container);
			this.container.html(html);
			//this.varibleDetailElement=this.container.find("#varible-detail-wrapper");
			this.options=options;
			this.json=options.json||[];
			this.boxCollection=[];
			this.iterateBox=null;
			this.idCollection=[];
			this.varibleDetailElement=this.container.find("#varible-detail-wrapper");
			this.varibleDetailElement.attr("tabIndex","1");
			this.wrapperElement=$("#varible-detail-wrapper");
			this.render();
			this.renderCss();
			this.varibleDetailElement.css("display","none");
			this.setDefaultClickedBoxItem();
			this.initValidator();
//			this.bindInputChange();
			this.getJQueryObj();
			locale.render({element:$(options.container)});
		},
		initValidator:function(){
			validator.render("#varible-detail-form",{
				promptPosition:"bottomLeft",
//				scroll:false
			})
		},
		getJQueryObj:function(){
			this.alarmDescEle=this.varibleDetailElement.find("#varible-limit-alarmdesc");
			this.alarmLvlEle=this.varibleDetailElement.find("#varible-limit-alarmlvl");
			this.minValueEle=this.varibleDetailElement.find("#varible-limit-minvalue");
			this.maxValueEle=this.varibleDetailElement.find("#varible-limit-maxvalue");
			this.paramValueEle=this.varibleDetailElement.find("#varible-param-value");
//			this.paramNameEle=this.varibleDetailElement.find("#varible-param-name");
			this.varibleIdEle=this.varibleDetailElement.find("input#varible-id");
			this.varibleNameEle=this.varibleDetailElement.find("input#varible-name");
//			this.groupNameEle=this.varibleDetailElement.find("input#group-name");
		},
		set:function(json){
			var self=this;
			$("#varible-list").empty();
			self.boxCollection=[];
			self.varNumber=0;
			self.json=json;
			self.json.each(function(one){
				self.varNumber=one.vars.length+self.varNumber;
			});
			for(var i=0;i<self.varNumber;i++){
				self.drawVaribleItem();
			};
			self.renderVaribleItem();
			self.showVaribleItem();
			locale.render({element:$(self.options.container)});
		},
		get:function(){
			var self=this;
			self.wrapperElement.trigger("blur");
			return self.varInfo;
		},
		render:function(){
			var self=this;
			this.drawToolbar();
			this.renderVaribleCheckBox();
			this.varNumber=0;
			this.json.each(function(one){
				self.varNumber=one.vars.length+self.varNumber;
			});
			for(var i=0;i<self.varNumber;i++){
				this.drawVaribleItem();
			};
			self.renderVaribleItem();
			self.showVaribleItem();
			self.saveBoxVaribleDetailWhenBlur();
		},
		setDefaultClickedBoxItem:function(){
			var self=this;
			if(self.json.length!=0){
				//self.boxCollection[0].trigger("click");
			}
		},
		drawVaribleItem:function(){
			var self=this;
			var box=$("<div>").css({
				"width":"97%",
				"height":"45px",
				"border-top":"1px solid #dde1e4",
				"border-left":"1px solid #dde1e4",
				"border-bottom":'2px solid #888888',
				"border-right":"2px solid #888888",
				"margin-left":"3px",
				"margin-top":"3px",
				"position":"relative",
				"background-color":"#E3E6EA",
				"-moz-box-shadow":"2px 3px 5px #888888", /* 老的 Firefox */
				"box-shadow":"2px 3px 5px #888888"
//				"z-index":"99",
				//"cursor":"pointer",
			});

			var sonBox=$("<div>").css({
				"width":"99%",
				"height":"45px",
				"position":"absolute",
				"left":"0px",
				"top":"0px",
//				"z-index":"9999",
			});
			sonBox.mouseover(function(e){
				if(self.tempDeleteItem && self.tempDeleteItem[0]!=deleteItem[0]){
					self.tempDeleteItem.hide();
				}
					self.tempDeleteItem=deleteItem;
					$(this).css("cursor","pointer");
					self.tempDeleteItem.show("line-near");
					//box.addClass("varible-item-mouseover");
			}).mousedown(function(e){
				//box.removeClass("varible-item-mouseover");
				box.css({
					"border-bottom":'2px solid #FFFFFF',
//					"border-right":"2px solid #FFFFFF",
					"background-color":"#FFFFFF"
				});
			});
			var varibleName=$("<div><label lang='text:varible_name+:'></label><input type='text' id='varible-name' /></div>");
			var varibleId=$("<div><label lang='text:varible_id+:'></label><input type='text' id='varible-id' /></div>");
			var deleteItem=$("<div></div>");
			box.mouseover(function(){
				$(this).css({
					"cursor":"pointer"
				});
				deleteItem.css({
					"cursor":"pointer"
				});
				varibleId.css({
					"cursor":"pointer"
				});
				varibleName.css({
					"cursor":"pointer"
				});
			});
			deleteItem.mouseover(function(){
				$(this).css({
					"cursor":"pointer",
					"font-weight":"bold",
					"font-size":"13px"
				});
//					sdeleteItem.show("line-near");
			}).mouseout(function(e){
				$(this).css({
					//"cursor":"pointer",
					"font-weight":"normal",
					"font-size":"12px"
				});
				//box.removeClass("varible-item-mouseover");
			});
			varibleName.find("input").attr("disabled",true).css({
				"cursor":"pointer"
			});
			varibleName.css({
				"margin-top":"3px"				
			});
			varibleId.find("input").attr("disabled",true).css({
				"cursor":"pointer"
			});
			
			deleteItem.css({
				"position":"absolute",
				"left":"75%",
				"top":"15px",
				"width":"42px",
				"height":"15px",
				"border":"1px solid #FFFFFF",
				"border-radius":"8px",
				"text-align":"center",
				"display":"none",
				"background-color":"#FFFFFF"
			});
			deleteItem[0].addEventListener("click",function(e){
		        if ( e && e.stopPropagation )
		            //因此它支持W3C的stopPropagation()方法
		            e.stopPropagation();
		        else
		            //否则，我们需要使用IE的方式来取消事件冒泡
		            window.event.cancelBubble = true;
				box.empty();
//				box.css("border","0");
//				var clickedClassName="varible-item-clicked";
//				var classCollection=box.attr("class");
//				var contain=-1;
//				if(classCollection){
//					contain=classCollection.indexOf(clickedClassName);
//				}										
//				if(contain!=-1){
				var display=self.varibleDetailElement.css("display");
				if(display!="none"){
//					var wrapperElement=$("#varible-detail-wrapper");
					self.wrapperElement.trigger("blur");
					self.varibleDetailElement.fadeOut("500",function(){
						//self.varibleDetailElement.css("display","none");
						self.iterateBox.css({
							"background-color":"#E3E6EA",
							"border-bottom":'2px solid #888888',
						});
						self.iterateBox.deleteItem.css({
							"background-color":"#FFFFFF"
						});
						self.iterateBox.removeClass("varible-item-clicked");
					});
				}
//				}	
				box.animate({"width":"0px","height":"0px","border":"0px"},"500",function(){
					self.varNumber--;
					self.container.find("#total-varible-number").text(locale.get("total")+":"+self.varNumber);
					var index=self.boxCollection.indexOf(box);
					self.boxCollection.splice(index,1);
					box.remove();
				});	
			});
			deleteItem.text(locale.get("delete1"));
			box.append(varibleName);
			box.append(varibleId);
			box.append(deleteItem);
			box.prepend(sonBox);
			box.varibleName=varibleName;
			box.varibleId=varibleId;
			box.deleteItem=deleteItem;
			box.sonBox=sonBox;
			box.find("input").css({
				"width":"90px",
				"height":"15px"
			});
			box.find("label").parent().css({
				"width":"80%"
			});
			box.click(function(){
				var display;
				validator.hideAll();
				$("input#varible-id").trigger("blur");
				$("input#varible-name").trigger("blur");
				var target=self.varibleDetailElement;
				display=target.css("display");	
				box.css({
					"background-color":"#FFFFFF"
				});
				deleteItem.css({
					"background-color":"#E3E6EA"
				});
				if(self.iterateBox&&(self.iterateBox[0]===box[0])){
					self.updateBoxAndVaribleDetail();
					if(display=="none"){
						self.renderVaribleDetail(self.iterateBox);
						target.fadeIn("500");
					}else{
						target.fadeOut("500",function(){
							self.renderVaribleDetail(self.iterateBox);
							target.fadeIn("500");
						});
					}
					box=self.iterateBox;
				}
				else{
					self.updateBoxAndVaribleDetail();
					if(self.iterateBox){
						self.iterateBox.css({
							"background-color":"#E3E6EA",
							"border-bottom":'2px solid #888888',
//							"border-right":"2px solid #888888",
						});
						self.iterateBox.deleteItem.css({
							"background-color":"#FFFFFF"
						})
						self.iterateBox.removeClass("varible-item-clicked");
//						console.log("之前:",self.iterateBox);
					};					
					self.iterateBox=box;
//					console.log("当前:",self.iterateBox[0]);
					if(display=="none"){					
						
						target.css({
							"display":"block"
						});
					}else if(display="block"){
						target.css({
							"display":"none"
						});
						target.fadeIn("500");
					}
					self.renderVaribleDetail(self.iterateBox);
//						target.hide("0",function(){						
							
//							target.show();
//						});
					
				}				
				self.iterateBox.addClass("varible-item-clicked");				
			});
			box.varibleDetail={
				name:"",
				_id:"",
				nativeName:"",
				nativeDesc:"",
				nativeUnit:"",
				type:0,
				storeType:0,
				vType:0,
				paramName:"",
				paramValue:"",
				precision:2,
				level:1,
				version:"3.0",
				defaultValue:0,
				timeLevel:3,
				sample:600,
				storage:5201314,
				statType:0,
				prio:1,
				value:0,
				limit:{
					maxAlert:false,
					minAlert:false,
					maxValue:0,
					minValue:0,
					maxEqual:false,
					minEqual:false,
					alarmDesc:"",
					nativeAlarmDesc:"",
					alarmType:1,
					alarmLvl:1
				}	
			};
			box.groupName="";
			box.groupNativeName="";
			self.boxCollection.push(box);
			return box;
		},
		renderVaribleItem:function(){
			var self=this;
			var count=0;
			self.json.each(function(group){				
				group.vars.each(function(one){
					self.boxCollection[count].find("input#varible-name").val(one.name);
					if(!one._id&&one.bakId){
						self.boxCollection[count].find("input#varible-id").val(one.bakId);
					}else{
						self.boxCollection[count].find("input#varible-id").val(one._id);
					}					
					if(one.limit){
						self.boxCollection[count].varibleDetail=one;
					}else{
						one.limit={};
						self.boxCollection[count].varibleDetail=one;
					}
					self.boxCollection[count].groupName=group.name;
					self.boxCollection[count].groupNativeName=group.nativeName;
					count++;
				});
			});
			self.container.find("#total-varible-number").text(locale.get("total")+":"+self.varNumber);
		},
		showVaribleItem:function(){
			var self=this;
			self.boxCollection.each(function(one){
				one.appendTo("#varible-list");
			});
		},
		dealWithOurId:function(ourId){
			var preNum=ourId.slice(0,1);
			var lastNum=ourId.slice(2);
			var newIdString=preNum+lastNum;
			return newIdString;
		},
		varDetailSetBean:function(box){
            var self=this;
			var detail=box.varibleDetail;
			//var element=box.varibleDetailElement;	
//			this.groupNameEle.val(box.groupName).text(box.groupName);
			//console.log(this.varibleDetailElement.find("input#group-name"));
			this.varibleNameEle.val(detail.name).text(detail.name);
			var idString=detail._id;
//			if(idString.length!=6&&detail.bakId){
//				this.varibleIdEle.val(detail.bakId).text(detail.bakId);
//			}else{
//				idString=this.dealWithOurId(idString);
//				this.varibleIdEle.val(idString).text(idString);
//			};
            this.varibleIdEle.val(idString).text(idString);
			var optionElements=this.varibleDetailElement.find("#varible-type option");
			optionElements.each(function(){
				var option=$(this);
				if(option.val()==detail.type){
					option.attr("selected",true);
					//one.selected='selected';
				}
			});
			optionElements=this.varibleDetailElement.find("#varible-stat-type option");
			optionElements.each(function(){
				var option=$(this);
				if(option.val()==detail.statType){
					option.attr("selected",true);
					//one.selected='selected';
				}
			});
			//this.container.find("#varible-stat-type").val(detail.statType);
			//this.container.find("#varible-precision").val(detail.precision);
			optionElements=this.varibleDetailElement.find("#varible-precision option");
			var tempPrecision=parseInt(detail.precision);
			if(tempPrecision<0){
				optionElements[0].selected="selected";
			}else if(tempPrecision>2){
				optionElements[2].selected="selected";
			}else{
				optionElements.each(function(){
					var option=$(this);
					var temp=parseInt(option.val());
					if(temp==tempPrecision){
						option.attr("selected",true);
						//one.selected='selected';
					}
				});
			};
//			this.paramNameEle.val(detail.paramName);
			this.paramValueEle.val(detail.paramValue);
			//this.container.find("#varible-value-type").val(detail.vType);
			optionElements=this.varibleDetailElement.find("#varible-value-type option");
			optionElements.each(function(){
				var option=$(this);
				if(option.val()==detail.vType){
					option.attr("selected",true);
					//one.selected='selected';
				}
			});
			if(detail.limit=="undefined"){
				detail.limit={};
			}
//			if(detail.limit){
				if(isNaN(detail.limit.maxValue)){
					this.maxValueEle.val("");
				}else{
					this.maxValueEle.val(detail.limit.maxValue);
				}
				if(isNaN(detail.limit.minValue)){
					this.minValueEle.val("");
				}else{
					this.minValueEle.val(detail.limit.minValue);
				}
				
				//this.container.find("#varible-limit-maxalert").val(detail.limit.maxAlert);
				if(detail.limit.maxAlert===true){
					this.maxalertButtonYes.setSelect(true);
					this.maxalertButtonNo.setSelect(false);
                    $("#maxequal_row").show();
                    maxEqualFnc();
				}else if(detail.limit.maxAlert===false){
					this.maxalertButtonYes.setSelect(false);
					this.maxalertButtonNo.setSelect(true);
                    $("#maxequal_row").hide();
                }else{
					this.maxalertButtonYes.setSelect(true);
					this.maxalertButtonNo.setSelect(false);
                    $("#maxequal_row").show();
                    maxEqualFnc();
                }
				
				//this.container.find("#varible-limit-minalert").val(detail.limit.minAlert);
				if(detail.limit.minAlert===true){
					this.minalertButtonYes.setSelect(true);
					this.minalertButtonNo.setSelect(false);
                    $("#minequal_row").show();
                    minEqualFnc();
				}else if(detail.limit.minAlert===false){
					this.minalertButtonYes.setSelect(false);
					this.minalertButtonNo.setSelect(true);
                    $("#minequal_row").hide();
				}else{
					this.minalertButtonYes.setSelect(true);
					this.minalertButtonNo.setSelect(false);
                    $("#minequal_row").show();
                    minEqualFnc();
				}
				
				//this.container.find("#varible-limit-maxequal").val(detail.limit.maxEqual);
            function maxEqualFnc(){
                if(detail.limit.maxEqual===true){
                    self.maxeuqualButtonYes.setSelect(true);
                    self.maxeuqualButtonNo.setSelect(false);
                }else if(detail.limit.maxEqual===false){
                    self.maxeuqualButtonYes.setSelect(false);
                    self.maxeuqualButtonNo.setSelect(true);
                }else{
                    self.maxeuqualButtonYes.setSelect(true);
                    self.maxeuqualButtonNo.setSelect(false);
                }
            }
				//this.container.find("#varible-limit-minequal").val(detail.limit.minEqual);
            function minEqualFnc(){
                if(detail.limit.minEqual===true){
                    self.mineuqualButtonYes.setSelect(true);
                    self.mineuqualButtonNo.setSelect(false);
                }else if(detail.limit.minEqual===false){
                    self.mineuqualButtonYes.setSelect(false);
                    self.mineuqualButtonNo.setSelect(true);
                }else{
                    self.mineuqualButtonYes.setSelect(true);
                    self.mineuqualButtonNo.setSelect(false);
                };
            }

				this.alarmLvlEle.val(detail.limit.alarmLvl);
				this.alarmDescEle.val(detail.limit.alarmDesc);
//			}else{
//				this.maxalertButtonYes.setSelect(true);
//				this.maxalertButtonNo.setSelect(false);
//				this.minalertButtonYes.setSelect(true);
//				this.minalertButtonNo.setSelect(false);
//				this.maxeuqualButtonYes.setSelect(true);
//				this.maxeuqualButtonNo.setSelect(false);
//				this.mineuqualButtonYes.setSelect(true);
//				this.mineuqualButtonNo.setSelect(false);
//				this.varibleDetailElement.find("#varible-limit-alarmlvl").val(1);
//				this.varibleDetailElement.find("#varible-limit-alarmdesc").val("默认");
//			}		
		},
		dealWithIdReal:function(realId){
            var newIdString="";
            if(realId.length==5){
                var preNum=realId.slice(0,1);
                var lastNum=realId.slice(1);
                newIdString=preNum+"0"+lastNum;
            }
            else if(realId.length<5){
                var length=realId.length;
                var normalRule=6;
                var iteratorString="";
                for(var i=0;i<(normalRule-length);i++){
                    iteratorString=iteratorString+0;
                }
                newIdString=iteratorString+realId;
            }
			return newIdString;
		},
		varDetailGetBean:function(){
			var tempObject={};
//			tempObject.groupName=this.groupNameEle.val();
			tempObject.name=this.varibleNameEle.val();
			var realId=this.varibleIdEle.val();
			if(realId&&(realId.length<=5)){
				tempObject._id=this.dealWithIdReal(realId);
			}
			else{
				tempObject._id=realId/*realId*/;
				tempObject.bakId=realId;
			}
			tempObject.type=parseInt(this.varibleDetailElement.find("#varible-type").val());
			tempObject.storeType=tempObject.type;
			tempObject.statType=parseInt(this.varibleDetailElement.find("#varible-stat-type").val());
			tempObject.precision=parseInt(this.varibleDetailElement.find("#varible-precision").val());
			tempObject.paramName=tempObject.name;
			tempObject.paramValue=this.paramValueEle.val();
			tempObject.vType=parseInt(this.varibleDetailElement.find("#varible-value-type").val());
				tempObject.limit={};
				tempObject.limit.maxValue=parseInt(this.maxValueEle.val());
				tempObject.limit.minValue=parseInt(this.minValueEle.val());
				var judge=this.maxalertButtonYes.isSelected();
				if(judge){
					tempObject.limit.maxAlert=true;
				}else{
					tempObject.limit.maxAlert=false;
				}				
				judge=this.minalertButtonYes.isSelected();
				if(judge){
					tempObject.limit.minAlert=true;
				}
				else{
					tempObject.limit.minAlert=false;
				}				
				//this.container.find("#varible-limit-maxequal").val(detail.limit.maxEqual);
				judge=this.maxeuqualButtonYes.isSelected();
				if(judge){
					tempObject.limit.maxEqual=true;
				}
				else{
					tempObject.limit.maxEqual=false;
				}
				//this.container.find("#varible-limit-minequal").val(detail.limit.minEqual);
				judge=this.mineuqualButtonYes.isSelected();
				if(judge){
					tempObject.limit.minEqual=true;
				}
				else{
					tempObject.limit.minEqual=false;
				}
				tempObject.limit.alarmLvl=parseInt(this.alarmLvlEle.val());
				tempObject.limit.alarmDesc=this.alarmDescEle.val();
				tempObject.limit.nativeAlarmDesc=tempObject.limit.alarmDesc;
				this.compareRealAndDefault(tempObject);
				return tempObject;
		},
		compareRealAndDefault:function(tempObject){
			var self=this;
			//self.iterateBox.groupName;
			//self.iterateBox.varibleDetail.nativeName;
			//self.iterateBox.varibleDetail.storeType;
			if(self.iterateBox.varibleDetail.level!=1 && self.iterateBox.varibleDetail.level){
				tempObject.level=self.iterateBox.varibleDetail.level;
			}else{
				tempObject.level=1;
			};
			if(self.iterateBox.varibleDetail.version!="3.0" && self.iterateBox.varibleDetail.version){
				tempObject.version=self.iterateBox.varibleDetail.version;
			}else{
				tempObject.version="3.0"
			};
			//self.iterateBox.varibleDetail.version;
			if(self.iterateBox.varibleDetail.defaultValue!=0&&self.iterateBox.varibleDetail.defaultValue){
				tempObject.defaultValue=self.iterateBox.varibleDetail.defaultValue;
			}else{
				tempObject.defaultValue=0;
			};
			if(self.iterateBox.varibleDetail.timeLevel!=3&&self.iterateBox.varibleDetail.timeLevel){
				tempObject.timeLevel=self.iterateBox.varibleDetail.timeLevel;
			}else{
				tempObject.timeLevel=3;
			};
			if(self.iterateBox.varibleDetail.sample){
				tempObject.sample=self.iterateBox.varibleDetail.sample;
			}else{
				tempObject.sample=600;
			};
			//self.iterateBox.varibleDetail.sample;
			if(self.iterateBox.varibleDetail.storage){
				tempObject.storage=self.iterateBox.varibleDetail.storage;
			}else{
				tempObject.storage=5201314;
			};
			//self.iterateBox.varibleDetail.storage;
			if(self.iterateBox.varibleDetail.prio&&self.iterateBox.varibleDetail.prio!=1){
				tempObject.prio=self.iterateBox.varibleDetail.prio;
			}else{
				tempObject.prio=1;
			};
			if(self.iterateBox.varibleDetail.value){
				tempObject.value=self.iterateBox.varibleDetail.value;
			}else{
				tempObject.value="";
			};
			if(self.iterateBox.varibleDetail.limit.alarmType){
				tempObject.limit.alarmType=self.iterateBox.varibleDetail.limit.alarmType;
			}else{
				tempObject.limit.alarmType=1;
			};
			if(self.iterateBox.varibleDetail.nativeUnit){
				tempObject.nativeUnit=self.iterateBox.varibleDetail.nativeUnit;
			}else{
				tempObject.nativeUnit="";
			};
			if(self.iterateBox.varibleDetail.nativeName!=self.iterateBox.varibleDetail.name&&self.iterateBox.varibleDetail.nativeName){
				tempObject.nativeName=self.iterateBox.varibleDetail.nativeName;
			}else if(!self.iterateBox.varibleDetail.name){
				tempObject.nativeName="";
			}else{
				tempObject.nativeName=self.iterateBox.varibleDetail.name;
			};
			if(self.iterateBox.groupNativeName!=self.iterateBox.groupName&&self.iterateBox.groupNativeName){
				tempObject.groupNativeName=self.iterateBox.groupNativeName;
			}else{
				tempObject.groupNativeName=self.iterateBox.groupName;
			}
		},
		renderVaribleDetail:function(box){
			var self=this;
//			self.clearData();
			self.varDetailSetBean(box);
		},
//		clearData:function(){
//			this.varibleDetailElement.trigger("click");
//		},
		renderCss:function(){
			$("#varible-list").css({
				"overflow-y":"scroll",
				"height":"530px",
				"overflow-x": "hidden"
			});
			$("#normal-editor-toolbar #varible-search-blanket").css({
				"width":"30%",
				"height":"15px",
				"position":"absolute",
				"left":"5px",
				"top":"3px",
				"display":"none"
			});
			//1
			$("#varible-detail-wrapper input").css({
				"float":"right",
				"width":"154px",
			});
			//2
			$("#varible-detail-wrapper #varible-limit-alarmdesc").css({
				"width":"224px",
				"height":"110px",
				"resize":"none"
			});
			//3
			$("#varible-detail-wrapper select").css({
				"float":"right",
				"width":"154px"
			});
			//4
			$(".limit-alarm-checkbox").css({
				"float":"right",
				"width":"124px",
				"height":"27px",
				"position":"relative"
			});
			
			$(".varible-info-row").css({
				"width":"100%",
				"height":"27px",
				"position":"relative"
			});
			$(".varible-info-row label").css({
				"position":"absolute",
				"left":"0px",
				"top":"10px"
			});
			$("#normal-editor-toolbar").css({
				"widht":"100%",
				"height":"30px",
				"border-bottom":"1px solid rgb(227, 230, 234)",
				"border-top":"1px solid rgb(227, 230, 234)",
				"position":'relative'
			});
//			$("#normal-editor-wrapper").css({
//				"height":"100%",
//				"widht":"100%"
//			});
			$("#normal-editor-content").css({
				"height":"94%",
				"width":"100%",
				"positioin":"relative"
			});
			$("#varible-list-wrapper").css({
				"width":"40%",
				"height":"100%",
				//"border":"1px solid black",
				"float":"left",
				"-moz-box-shadow":"2px 3px 5px #888888", /* 老的 Firefox */
				"box-shadow":"2px 3px 5px #888888"
			});
			$("#varible-detail-wrapper").css({
				"clear":"both",
				"width":"57%",
				"height":"85%",
				"border":"1px solid rgb(227, 230, 234)",
				//"float":"right",
				"position":"absolute",
				"left":"41%",
				"padding-left":"4px",
				"padding-right":"4px",
				"-moz-box-shadow":"2px 3px 5px #888888", /* 老的 Firefox */
				"box-shadow":"2px 3px 5px #888888"
			});
			$(".varible-info-leveldesc").css({
				"height":"30px",
				"position":"relative"
			});
			$(".varible-limit-alarm-leveldesc").css({
				"position":"absolute",
				"top":"4px",
				"left":"160px"
			});
			$(".varible-limit-alarm-desc").css({
				"left":"90px"
			});
			$("div#varible-toolbar").css({
				"width":"100%",
				"height":"20px",
				"border-left":"2px solid rgb(227, 230, 234)",
				"border-top":"2px solid rgb(227, 230, 234)",
				"border-bottom":"2px solid rgb(227, 230, 234)",
				"border-right":"2px solid rgb(227, 230, 234)",
//				"border":"1px solid black",
				"position":"relative"
			});
			$("label#total-varible-number").css({
				"display":"inline-block",
				"width":"50%",
				"height":"15px",
				"position":"absolute",
				"left":"3px",
				"top":"1px",
				//"border":"1px solid black"
			});
		},
		drawToolbar:function(){
			this.renderToolButton();
		},
		renderToolButton:function(box){
			var self=this;
			this.addButton=new Button({
				container:$("#varible-toolbar"),
				id:"varible-add",
				imgCls:"cloud-icon-add1",
				title:locale.get({lang:"add"}),
				events:{
					click:function(){
						//TODO
						var newBox=self.drawVaribleItem();
						newBox.css({
						"width":"0px",
						"height":"0px",
						"border":"0px",
						"margin-left":"1px",
						"margin-top":"3px",
						"position":"relative"
						});
						locale.render({element:newBox});
						$("#varible-list").prepend(newBox);
						newBox.animate({"width":"98%","height":"45px"},"500",function(){
							newBox.css("border","1px solid #dde1e4");
							self.varNumber++;
							self.container.find("#total-varible-number").text(locale.get("total")+":"+self.varNumber);
						});
						newBox.trigger("click");
						setTimeout(function(){validator.hideAll()},"100");
					}
				}
			});
			$("#varible-add").css({
				"position":"absolute",
				"left":"87%",
				"top":"-3px"
			});
			this.saveButton=new Button({
				container:$("#normal-editor-toolbar"),
				id:"normal-editor-save",
				text:locale.get({lang:"save1"}),
				events:{
					click:function(){
						//TODO
//						var wrapperElement=$("#varible-detail-wrapper");
						self.wrapperElement.trigger("blur");
						//self.mergeVarInfo();
						var tempCollection=[];
            			var tempFinal=[];
            			var idCollection=self.idCollection;
            			var prelength=idCollection.length;
            			var aftlength=0;
            			while(prelength!=aftlength){
            				tempBelow=[];
            				tempCollection=idCollection;
            				prelength=idCollection.length;
            				idCollection=idCollection.uniq();
            				aftlength=idCollection.length;
            				if(prelength!=aftlength){
            					for(var i=0;i<idCollection.length;i++){
            						var index=tempCollection.indexOf(idCollection[i]);
            						tempCollection.splice(index, 1);         					
            					}                  				
                				tempFinal=tempCollection;
            				}
            			};
            			tempFinal=tempFinal.uniq();
						if(tempFinal.length!=0){
							var idstring=tempFinal.join(",");
							dialog.render({
								content:[{lang:"varidshouldbeuniq"},{html:"<br />"},{text:idstring}]
							});
						}else{
							self.fire("editorClose",self.varInfo);
						}		
					},
					scope:this
				}
			});
			$("#normal-editor-save").css({"position":"absolute","top":"3px","left":"90%"});
		},
		mergeVarInfo:function(){
			var self=this;
			self.idCollection=[];
			var tempVarInfo=[];
			var sameGroup=[];
			var differentGroup=[];
			var iterateVar=self.boxCollection[0];
			var iterateGroup=self.boxCollection;
			var i/*,count=0*/;
			for(i=0;i<iterateGroup.length;i++){
				if(iterateVar.groupName==iterateGroup[i].groupName){
					sameGroup.push(iterateGroup[i]);
				}else{
					differentGroup.push(iterateGroup[i]);
				}
				if(i==(iterateGroup.length-1)){
					tempVarInfo.push(sameGroup);
//					console.log(sameGroup);
					sameGroup=[];
					iterateGroup=differentGroup;
					iterateVar=differentGroup[0];
					i=-1;
//					count++;
					differentGroup=[];
//					console.log("第",count,"次");
				}
			};
			var varInfo=[];
			var varGroup={};
			varGroup.vars=[];
			var groupName="";
			var groupNativeName="";
			tempVarInfo.each(function(two){
				two.each(function(one){
					groupName=one.groupName;
					groupNativeName=one.groupNativeName;
					varGroup.vars.push(one.varibleDetail);
					self.idCollection.push(one.varibleDetail._id);
				});
				varGroup.name=groupName;
				varGroup.nativeName=groupNativeName;
				varInfo.push(varGroup);
				varGroup={};
				varGroup.vars=[];
			});
			self.varInfo=varInfo;
		},
        //
        showOrHideAlertRow:function(bool,row,buttonGroup){
            var self=this;
            if(bool){
                row.show();
            }else{
                row.hide();
            }
            buttonGroup["yes"].setSelect(false);
            buttonGroup["no"].setSelect(false);
        },
		renderVaribleCheckBox:function(){
			var self=this;
			self.maxalertButtonYes=new Button({
				container:$("#varible-limit-maxalert"),
				checkbox:true,
				cls:"button-for-yes",
				id:"varible-limit-maxalert-yes",
				text:locale.get("yes"),
				events:{
					click:function(){
						self.maxalertButtonCollection.no.setSelect(false);
                        self.showOrHideAlertRow(self.maxalertButtonYes.isSelected(),$("#maxequal_row"),self.maxeuqualButtonCollection);
					}
				}
			});
			
			self.maxalertButtonNo=new Button({
				container:$("#varible-limit-maxalert"),
				checkbox:true,
				cls:"button-for-no",
				id:"varible-limit-maxalert-no",
				text:locale.get("no"),
				events:{
					click:function(){
						self.maxalertButtonCollection.yes.setSelect(false);
                        self.showOrHideAlertRow(self.maxalertButtonYes.isSelected(),$("#maxequal_row"),self.maxeuqualButtonCollection);
                    }
				}
			});
			self.maxalertButtonCollection={"yes":self.maxalertButtonYes,"no":self.maxalertButtonNo};
			self.minalertButtonYes=new Button({
				container:$("#varible-limit-minalert"),
				checkbox:true,
				cls:"button-for-yes",
				id:"varible-limit-minalert-yes",
				text:locale.get("yes"),
				events:{
					click:function(){
						self.minalertButtonCollection.no.setSelect(false);
                        self.showOrHideAlertRow(self.minalertButtonYes.isSelected(),$("#miniequal_row"),self.mineuqualButtonCollection);
					}
				}
			});
			self.minalertButtonNo=new Button({
				container:$("#varible-limit-minalert"),
				checkbox:true,
				cls:"button-for-no",
				id:"varible-limit-minalert-no",
				text:locale.get("no"),
				events:{
					click:function(){
						self.minalertButtonCollection.yes.setSelect(false);
                        self.showOrHideAlertRow(self.minalertButtonYes.isSelected(),$("#miniequal_row"),self.mineuqualButtonCollection);
                    }
				}
			});
			self.minalertButtonCollection={"yes":self.minalertButtonYes,"no":self.minalertButtonNo};
			self.maxeuqualButtonYes=new Button({
				container:$("#varible-limit-maxequal"),
				checkbox:true,
				cls:"button-for-yes",
				id:"varible-limit-maxequal-yes",
				text:locale.get("yes"),
				events:{
					click:function(){
						self.maxeuqualButtonCollection.no.setSelect(false);
					}
				}
			});
			self.maxeuqualButtonNo=new Button({
				container:$("#varible-limit-maxequal"),
				checkbox:true,
				cls:"button-for-no",
				id:"varible-limit-maxequal-no",
				text:locale.get("no"),
				events:{
					click:function(){
						self.maxeuqualButtonCollection.yes.setSelect(false);
					}
				}
			});
			self.maxeuqualButtonCollection={"yes":self.maxeuqualButtonYes,"no":self.maxeuqualButtonNo};
			self.mineuqualButtonYes=new Button({
				container:$("#varible-limit-minequal"),
				checkbox:true,
				cls:"button-for-yes",
				id:"varible-limit-minequal-yes",
				text:locale.get("yes"),
				events:{
					click:function(){
						self.mineuqualButtonCollection.no.setSelect();
					}
				}
			});
			self.mineuqualButtonNo=new Button({
				container:$("#varible-limit-minequal"),
				checkbox:true,
				cls:"button-for-no",
				id:"varible-limit-minequal-no",
				text:locale.get("no"),
				events:{
					click:function(){
						self.mineuqualButtonCollection.yes.setSelect(false);
					}
				}
			});
			self.mineuqualButtonCollection={"yes":self.mineuqualButtonYes,"no":self.mineuqualButtonNo};
			$(".button-for-yes").css({
				"position":"absolute",
				"top":"8px",
				"left":"0px"
			});
			$(".button-for-no").css({
				"position":"absolute",
				"top":"8px",
				"left":"60px"
			});
		},
		saveBoxVaribleDetailWhenBlur:function(){
			var self=this;
//			var wrapperElement=$("#varible-detail-wrapper");
			self.wrapperElement.blur(function(){	
				self.updateBoxAndVaribleDetail();			
			});
		},
		updateBoxAndVaribleDetail:function(){
			var self=this;
			if(self.iterateBox){
				var newVaribleDetail=self.varDetailGetBean();
				self.iterateBox.groupName=newVaribleDetail.groupName;
				self.iterateBox.groupNativeName=newVaribleDetail.groupNativeName;
				if(isNaN(newVaribleDetail.limit.minValue)){
//					newVaribleDetail.limit.minValue=0;
				};
				if(isNaN(newVaribleDetail.limit.maxValue)){
//					newVaribleDetail.limit.maxValue=0;
				}
				delete newVaribleDetail.groupName;
				delete newVaribleDetail.groupNativeName;
				self.iterateBox.varibleDetail=newVaribleDetail;
				var trueId=newVaribleDetail._id;
//				delete newVaribleDetail.bakId;
				if(newVaribleDetail._id){
					self.iterateBox.varibleId.find("input").val(newVaribleDetail._id);
				}else{
					self.iterateBox.varibleId.find("input").val(newVaribleDetail.bakId);	
				}
				
				self.iterateBox.varibleName.find("input").val(newVaribleDetail.name);
				//self.fire("normalEditorSaveWhenBlur",self.varInfo);
			};
			self.mergeVarInfo();
		}
	});
	return NormalEditor;
});