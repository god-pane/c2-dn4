/**
 * @author PANJC
 * 
 */
define(function(require){
	var ContentTableModule = require("../applications/template/table");
	var businessService = require("cloud/service/business-service");
	var contentTable = new ContentTableModule({
		businessType: "user",
		tagElement: "#table-tag",
		contentElement:"#table-content",
		infoElement:"#table-info"
	});
});