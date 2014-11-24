/**
 * @author PANJC
 * 
 */
define(function(require) {
    require("cloud/base/cloud");
    var Service = Class.create({
        initialize: function(){
        	this.type = "onlineReport";
            this.resourceType = 23;
        },

        loadChartByResIds : function(resourceIds, startTime, endTime, callback, context){
            resourceIds = cloud.util.makeArray(resourceIds);
            var param = {};
            if (startTime){
                param.start_time = startTime
            }
            if (endTime){
                param.end_time = endTime
            }
            if (resourceIds.length > 0){
                cloud.Ajax.request({
                    url: "api/reports/online_tendency",
                    type: "post",
                    parameters : param,
                    data: {
                        resourceIds: resourceIds
                    },
                    success: function(data) {
                        //data = {"result":[{"deviceId":"51b8f48770e725ed1f680cc6","onlineRate":[0.0,0.97727275,0.97727275,1.0,0.97727275,1.0,0.97727275,1.0,0.97727275,1.0,0.8863636,0.0,0.0,0.0,0.0,0.0,0.4318182,1.0,0.97727275,1.0,0.97727275,1.0,0.97727275,1.0],"timestamps":[1371075729,1371075772,1371075815,1371075859,1371075902,1371075946,1371075989,1371076033,1371076076,1371076120,1371076163,1371076207,1371076250,1371076294,1371076337,1371076381,1371076424,1371076468,1371076511,1371076555,1371076598,1371076642,1371076685,1371076729]}]}
//                      console.log(data, "data")
                        if (data.result){
                            var result = $A(data.result);
                            result.each(function(one){
                                var dataArr = $A();
                                $A(one.onlineRate).each(function(rate, i){
                                    var pointData = [1000 * one.timestamps[i], rate];
                                    dataArr.push(pointData);
                                })
                                one.data = dataArr;
                                one.resourceId = one.deviceId;
                            });
                        }   
                        
                        callback && (callback.call(context || this, data.result));
                    }
                });
            }
        },
        
    });

    return new Service();
    
});