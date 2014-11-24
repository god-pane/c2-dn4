define(function(require) {
    require("cloud/base/cloud");
    var maps = require("cloud/components/map");
    var Button = require("cloud/components/button");
    var template = require("text!./info.html");
    var service = require("cloud/service/service");
    var validator = require("cloud/components/validator");
    var InfoModule = Class.create(cloud.Component, {

        initialize: function($super, options) {
            $super(options);
            this.customerId = null;
            this.element.html(template).addClass("customer-info");
            this.infoForm = this.element.find(".info-form");
            this.renderMap();
            this.renderButtons();
            this.renderCustomers();
//            this.validateForm();
//            validator.render("#customer-info-form",{
//            	promptPosition:"topLeft",
//            	scroll: false
//			  });
            this.validate();
			locale.render({element:this.element});
        },
        validate:function(){
			var self = this;
			validator.render("#info-wrapper",{
					promptPosition:"bottomLeft",
			        scroll: false
			});
		},
        renderButtons: function() {
            var self = this;

            this.editButton = new Button({
            	 container: this.element.find(".info-header-btn"),
                id: "module-info-tag-edit",
                imgCls: "cloud-icon-edit",
//                text: "编辑",
                lang:"{title:edit}",
                events: {
                    click: self.enable.bind(this)
                }
            });
            
//            this.deleteButton = new Button({
//                container: this.element.find(".info-buttonset"),
//                id: "module-info-tag-delete",
//                imgCls: "cloud-icon-delete",
//                text: "删除",
//                events: {
//                    click: function(){
//                    	var alertItem = $("<p id = \"alertText\">").text("确认删除？");
//                    	alertItem.dialog({
//                    		title : "提示",
//                    		modal:true,
//                    		minHeight : 120,
//                    		buttons:{
//                    			"yes" : function(){
//                    				self["delete"].call(self);
//                    				$(this).dialog( "close" );
//                    			},
//                    			"no" : function(){
//                    				$(this).dialog( "close" );
//                    			}
//                    		},
//                    		close : function(){
//                    			$(this).dialog( "destroy" );
//        						alertItem.remove();
//                    		}
//                    	});
//                    }//self.deleteFile.bind(this)
//                }
//            });

            this.submitButton = new Button({
            	 container: this.element.find(".info-buttonset-bottom"),
                id: "module-info-tag-submit",
                imgCls: "cloud-icon-yes",
                text: "提交",
                events: {
                    click: function() {
            			if(validator.result()){
            				self.submit();
            			}
                    }.bind(this)
                }
            });

            this.cancelButton = new Button({
            	 container: this.element.find(".info-buttonset-bottom"),
                id: "module-info-tag-cancel",
                imgCls: "cloud-icon-no",
                text: "取消",
                events: {
                    click: self.cancelEdit.bind(this)
                }
            });
            this.favorBtn = new Button({
//            	 container: this.element.find(".info-device-favor"),
//                id: "module-info-tag-favor",
//                checkboxCls: "cloud-icon-star",
//                checkbox: true,
//				events : {
//						 click: self.submitFavor.bind(self)
//				}
            container: this.element.find(".info-device-favor"),
            // id : "div.module-info-tag-favor",
            title: "favor",
            lang:"{title:favor}",
            checkboxCls: "cloud-icon-star",
            checkbox: true,
            events: {
                click: self.submitFavor.bind(self)
            }
			});
        },

        renderCustomers: function() {
            this.loadCustomers(function(customers) {
                var $select = this.element.find("#info-customer-customer");
                customers.each(function(customer) {
                    $("<option>").val(customer._id).text(customer.name).appendTo($select);
                }, this);
            });
        },

        render: function(id) {
            this.customerId = id;
            if (this.customerId) {
                this.mask();
                this.loadcustomerInfo();
            } else {
                this.clear();
                this.enable();
            }
        },

        setcustomerInfo: function(data) {
        	
            if (data.result) {
                data = data.result;
            }
            this.element.find("#info-name").val(data.name);
            this.element.find("#info-customer-email").val(data.email);
            
            this.element.find("#info-customer-address").val(data.address);
            this.element.find("#info-customer-website").val(data.website);
            
            this.element.find("#info-customer-phone").val(data.phone);
            if(data.contact){
	            this.element.find("#info-customer-contact").val(data.contact.name);
	            this.element.find("#info-customer-contact-phone").val(data.contact.phone);
            }else{
            	this.element.find("#info-customer-contact").val("");
                this.element.find("#info-customer-contact-phone").val("");
            }
            if(this.customerId == null){
                this.favorBtn.setSelect(false);
            }else{
                service.verifyFavorites([this.customerId], function(data) {
                    this.favorBtn.setSelect(data.result.first() == 1);
                }, this);
            }
        },

        clear: function(){
            this.customerId = null;
            this.setcustomerInfo({
                name: "",
                address: "",
                website:"",
                phone: "",
                contact:{
            		name:"",
            		phone:""
               }
               
            });

        },

        setcustomerModel: function(id) {
            this.element.find("#info-model option").each(function() {
                var option = $(this);
                if (option.val() == id) {
                    option.attr("selected", true);
                } else {
                    option.removeAttr("selected");
                }
            });
        },

        getcustomerModel: function() {
          
        },

        setcustomerName: function(name) {
           
        },

        getcustomerName: function() {
           
        },

        setBusinessState: function(status) {
            
        },

        getBusinessState: function() {
            
        },

        loadcustomerInfo: function() {
            cloud.Ajax.request({
                url: "api/customers/" + this.customerId,
                parameters: {
                    verbose: 50
                },
                type: "get",
                success: function(data) {
                	this.customerInfo = data.result;
                    this.setcustomerInfo(data.result);
                    this.disable();
                    this.unmask();
                }.bind(this)
            });
        },

        loadCustomers: function(callback) {

        },

        enable: function() {
            this.editButton.hide();
            this.favorBtn.hide();
//            this.deleteButton.hide();
            this.submitButton.show();
            this.cancelButton.show();
            
            // this.deleteButton.
            this.infoForm.find("input, select").removeAttr("disabled");
            this.element.find("#info-name").removeAttr("disabled");
        },

        disable: function() {
            this.editButton.show();
            this.favorBtn.show();
//            this.deleteButton.show();
            this.submitButton.hide();
            this.cancelButton.hide();

            this.infoForm.find("input, select").attr("disabled", true);
            this.element.find("#info-name").attr("disabled", true);
        },

        cancelEdit: function() {
            if (this.customerId) {
                this.loadcustomerInfo();
            } else {
            	this.fire("cancelCreate");
            	this.clear();
            }
            this.disable();
        },
        "delete" : function(){
        	this.disable();
            this.fire("afterInfoDeleted", this.customerInfo);
        },

        submit: function() {
        	
            var customer = {}, self = this;
            customer.name = this.element.find("#info-name").val();
            customer.email= this.element.find("#info-customer-email").val();
            customer.address = this.element.find("#info-customer-address").val();
            customer.website=this.element.find("#info-customer-website").val();
            customer.phone=this.element.find("#info-customer-phone").val();
            customer.contact={ 
                             "name": this.element.find("#info-customer-contact").val(),
                             "phone": this.element.find("#info-customer-contact-phone").val()
                             };
            
            self.url = "api/customers/";
            self.type = "POST";
            self.fireMed = "afterInfoCreated";
            
            if (customer.name.trim() == "") {
                return;
            }
            if(customer.email==""){
                return;
            }
            if(self.customerId != null){
            	self.url="api/customers/"+self.customerId;
            	self.type="PUT";
            	self.fireMed="afterInfoUpdated";
            }

			cloud.Ajax.request( {
				url : self.url,
				type : self.type,
				data : {
					name : customer.name,
					email : customer.email,
					address : customer.address,
					website : customer.website,
					phone : customer.phone,
					contact : customer.contact
				},
				success : function(data) {
					self.fire(self.fireMed, data.result._id);
					self.disable();
				}
			});
        },
        validateForm:function(){
        	validator.render('#customer-info-form',{
            	promptPosition:"topLeft",
            	scroll: false
			});
        },

        submitFavor: function() {
        	var self = this;
            if (this.favorBtn.isSelected()) {
            	this.addFavorite();
            } else {
            	this.removeFavorite();
            }
        },
        addFavorite : function(){
        	var self = this;
        	if(this.customerId){
        		service.addFavorites(this.customerId, function(data) {
                	if (data.result == "ok"){
                		self.fire("afterInfoUpdated", self.customerId);
                	}
                }, this);
        	}
        },
        
        removeFavorite : function(){
        	var self = this;
        	if(this.customerId){
        		service.removeFavorites(this.customerId, function(data) {
        			if (data.result.id){
                		self.fire("afterInfoUpdated", self.customerId);
                	}
                }, this);
        	}
        },
        renderMap: function() {
            this.map = new maps.Map({
                selector: this.element.find("#info-map"),
                zoomControl: false,
                panControl: false
            });
        },

        destroy: function() {
            this.element.html(template).removeClass("customer-info");
            if(this.map){
                if(this.map.destroy){
                    this.map.destroy();
                }
            }
            this.editButton.destroy();
            this.submitButton.destroy();
            this.cancelButton.destroy();
            this.element.html("");

            //一系列的清除动作

        }
    });
    return InfoModule;
});