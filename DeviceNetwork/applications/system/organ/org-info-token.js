define(function(require){
	require("cloud/base/cloud");
	var orghtml=require("text!./org-info-token.html");
	var Button=require("cloud/components/button");
	var validator=require("cloud/components/validator");
	var OrganInfomation=Class.create(cloud.Component,{
		initialize:function($super,options){
			$super(options);
			var self = this;
			permission.judge(["_organ","read"],function(){
				self.options=options;
				//规定的每个机构token的数量，与html中token行数对应
				self.listSize=5;
				self.element.html(orghtml);
				self._renderCss();
				self._render();
				self.permission();
				locale.render({element:self.element});
			});
		},
		_renderCss:function(){
			$(".org_info_token_wrapper").css({
				"background-color":"#FFFFFF",
				"border":"2px solid #dddddd",
				"width":"1400px",
				"height":"450px",
				"position":"relative",
				"margin":"10px auto",
				"border-radius":"1em"
			});
			$(".info_row").css({
				"margin":"8px 0px"
			});
			$(".org_info_wrapper").css({
				"background-color":"#FFFFFF",
				"width":"300px",
				"border":"2px solid #dddddd",
				"border-radius":"1em",
				"padding-left":"20px",
				"padding-bottom":"20px",
				"position":"absolute",
				"top":"60px",
				"left":"100px"
			});
			$(".token-info-wrapper").css({
				"background-color":"#FFFFFF",
				"width":"510px",
				"border":"2px solid #dddddd",
				"border-radius":"1em",
				"padding-left":"20px",
				"position":"absolute",
				"top":"60px",
				"left":"500px"
			});
			$(".info_row .info_form_text").css({
				"text-align":"left",
				"margin-left":"30px",
				"width":"150px"
			});
			$(".info_row .token_code_content").css({
				"text-align":"left",
				"margin-left":"30px",
				"width":"270px"
			});
			$(".organ_button_wrapper_bottom").css({
				"text-align":"center",
				"margin-top":"10px"
			});
			$(".organ_button_wrapper_top").css({
				"text-align":"right"
			});
			$(".organ_info_label").css({
				"display":"inline-block",
				"width":"110px"
			});
			$(".token_info_label").css({
				"display":"inline-block",
				"width":"100px"
			});
			$(".token_info_div span").css({
				"display":"inline-block",
				"float":"right"
			});
		},
		_render:function(){
			this._renderButtons();
			this.loadOrganInfo();
			this.initValidate();
			this.hideButtons();
		},
		verifyRole:function(roleData){
			var self=this;
			var type=roleData.roleType;
			if(type=="51"){
				return true;
			}
			else{
				return false;
			}
		},
		permission:function(){
			var self = this;
			if(!(permission.app("_organ"))["write"]){
				self.editBtn.hide();
				self.submitBtn.hide();
				self.cancelBtn.hide();
				self.aplBtn.hide();
				self.resBtn.hide();
			}
			if((permission.getInfo())["roleType"] >= 52){
				$("#token-info-wrapper").hide();
			}
		},
		loadKeyList:function(){
			var self=this;
			cloud.Ajax.request({
				url:"api/api_key",
				type:"GET",
				parameters:{
					verbose:100
				},
				success:function(keys){
					cloud.util.unmask("#user-content");
					var data=keys.result;
					if(Object.isArray(data)){
						for(var i=0;i<self.listSize;i++){
							if(data[i]){
								$("#token_code_"+(i+1)).val(data[i].keyCode);
								if(/*self.roleType*/self.write){
									self.resTokenBtn[i].show();
								}
							}else{
								if(/*self.roleType*/self.write){
									self.aplTokenBtn[i].show();
								}
							}							
						}
					}
				}
			})
		},
		initValidate:function(){
        	validator.render("#organ_info_form",{
        		promptPosition:"bottomLeft"
        	});
        },
        hideButtons:function(){
//        	this.editBtn.hide();
        	this.submitBtn.hide();
        	this.cancelBtn.hide();
        },
		_renderButtons:function(){
			var self=this;
			 this.editBtn=new Button({
				container:$(".organ_button_edit"),
				id:"organ_info_edit",
				imgCls:"cloud-icon-edit",
				lang:"{title:edit}",
				events:{
					click:function(){
						self.enableOrg();
					}
				}
			});
			 this.submitBtn=new Button({
				container:$("#organ_button_submit"),
				id:"organ_info_submit",
				imgCls:"cloud-icon-yes",
				text:locale.get("submit"),
				lang:"{title:submit,text:submit}",
				events:{
					click:function(){
			        		self.submit();			        							
					}
				}
			});
			 this.cancelBtn=new Button({
				container:$("#organ_button_cancel"),
				id:"organ_info_cancel",
				imgCls:"cloud-icon-no",
				text:locale.get("cancel"),
				lang:"{title:cancel,text:cancel}",
				events:{
					click:function(){
						self.cancelEdit();
					}
				}
			});
			 this.aplTokenBtn=[];
			 this.resTokenBtn=[];
			 for(var i=1;i<(this.listSize+1);i++){
				 var apl="apply_token_"+i;
				 var ret="reset_token_"+i;
				 $("<span></span>").insertAfter($("#token_code_"+i)).attr({'id':apl});
				 var btn;
				 this.aplTokenBtn.push(self.aplBtn=new Button({
					 container:$("#"+apl),
					 id:"apply_token_button_"+i,
					 text:locale.get("apply_token"),
					 lang:"{title:apply_token,text:applay_token}",
					 events:{
						 click:function(target){
							 self.applyToken(target.id);
						 }
					 }
				 }));
				 self.aplBtn.hide();
				 $("<span></span>").insertAfter($("#token_code_"+i)).attr({'id':ret});
				 this.resTokenBtn.push(self.resBtn=new Button({
					 container:$("#"+ret),
					 id:"reset_token_button_"+i,
					 text:locale.get("reset_token"),
					 lang:"{title:reset_token,text:reset_token}",
					 events:{
						 click:function(target){
							 self.resetToken(target.id);
						 }
					 }
				 }));
				 self.resBtn.hide();
			 };
		},
		resetToken:function(domId){
			var num=domId.slice(domId.length-domId.lastIndexOf("reset_token_button_")-1);
			try{
				var token_code=$("#token_code_"+parseInt(num)).val();
			}catch(e){				
			}
			cloud.util.mask("#token-info-wrapper");			
			cloud.Ajax.request({
				url:"api/api_key/"+token_code,
				type:"PUT",
				parameters:{
					sn:parseInt(num)
				},
				success:function(returnData){
					var data=returnData.result;
					try{
						$("#token_code_"+parseInt(num)).val(data.keyCode);
						cloud.util.unmask("#token-info-wrapper");
					}
					catch(e){
					}
				}
			})
		},
		applyToken:function(domId){
			var self=this;
			var num=domId.slice(domId.length-domId.lastIndexOf("apply_token_button_")-1);
			cloud.util.mask("#token-info-wrapper");
			cloud.Ajax.request({
				url:"api/api_key",
				type:"POST",
				parameters:{
					verbose:100,
					sn:parseInt(num)
				},
				success:function(key){
					cloud.util.unmask("#token-info-wrapper");
					var data=key.result;
					try{
						$("#token_code_"+parseInt(num)).val(data.keyCode);
						self.aplTokenBtn[num-1].hide();
						self.resTokenBtn[num-1].show();
					}
					catch(e){
					}
				}
			})
		},
		loadOrganInfo:function(){
			var self=this;
			cloud.util.mask("#user-content");
			Model.organ({
				method:"query_current",
				param:{
					verbose:100
				},
				success:function(organData){
					var data=organData.result;
					self.currentOrganInfo=data;
					self.renderOrgForm(data);
				}
			});
//			Model.role({
//				method:"query_current",
//				param:{
//					verbose:100
//				},
//				success:function(roleData){
//					var data=roleData.result;
//					self.roleType=self.verifyRole(data);
//					if(self.roleType){
//						self.editBtn.show();
//					};
//					self.loadKeyList();
//				}
//			})
			var roleInfo=permission.getInfo();
			self.roleType=self.verifyRole(roleInfo);
			self.write=permission.app("_organ")["write"];
			if(/*self.roleType||*/ self.write){
				self.editBtn.show();
			}else{
				self.editBtn.hide();
			};
			self.loadKeyList();
		},
		renderOrgForm:function(organData){
			$(".org_info_wrapper input").attr({'disabled':'disabled'});
			$("input#organ_name").val(organData.name);
//			if(!organData.website){
//				$("input#organ_website").parent().hide();
//			}
//			else{
				$("input#organ_website").val(organData.website);
//			}
			$("input#organ_address").val(organData.address);
			$("input#organ_telephone").val(organData.phone);
//			if(!organData.fax){
//				$("input#organ_fax").parent().hide();
//			}
//			else{
				$("input#organ_fax").val(organData.fax);
//			}			
			$("input#organ_email").val(organData.email);
			$("span#organ_creator").text(organData.creator);
			$("span#organ_createtime").text(
					cloud.util.dateFormat(new Date(organData.createTime),"yyyy-MM-dd hh:mm:ss")
					);
			$("span#organ_updatetime").text(
					cloud.util.dateFormat(new Date(organData.updateTime),"yyyy-MM-dd hh:mm:ss")
					);
		},
		enableOrg:function(){
			this.editBtn.hide();
			this.submitBtn.show();
			this.cancelBtn.show();
			$(".org_info_wrapper input").removeAttr('disabled');
			$(".org_info_wrapper input#organ_email").attr({'disabled':'disabled'});
		},
		disableOrg:function(){
			this.editBtn.show();
			this.submitBtn.hide();
			this.cancelBtn.hide();
			$(".org_info_wrapper input").attr({'disabled':'disabled'});
		},
		submit:function(){
			var bool=validator.result("#organ_info_form");
        	if (!bool){
        		this.element.find("#organ_info_form input").trigger("blur");
        		//this.element.find("#info-name").trigger("blur");
        		return false;
        	};
//        	else{
    			var self=this;
    			var data={};
    			data.name=$("input#organ_name").val();
    			data.address=$("input#organ_address").val();
    			data.website=$("input#organ_website").val();
    			data.phone=$("input#organ_telephone").val();
    			data.fax=$("input#organ_fax").val();
    			data.email=$("input#organ_email").val();
    			cloud.util.mask("#org_info_wrapper");
    			Model.organ({
    				method:"update_current",
    				param:{
    					verbose:100
    				},
    				data:data,
    				success:function(organData){
    					cloud.util.unmask("#org_info_wrapper");
    					self.renderOrgForm(organData.result);
    					self.disableOrg();
    				}
    			});
//        	}

		},
		cancelEdit:function(){
			this.disableOrg();
			this.renderOrgForm(this.currentOrganInfo);
		},
		destroy:function(){
			this.element.empty();
			if(this.editBtn){
				this.editBtn.destroy();
			}
			if(this.submitBtn){
				this.submitBtn.destroy();
			}
			if(this.cancelBtn){
				this.cancelBtn.destroy();
			}
			this.aplTokenBtn=[];
			this.resTokenBtn=[];
		}
	});
	return OrganInfomation;
})