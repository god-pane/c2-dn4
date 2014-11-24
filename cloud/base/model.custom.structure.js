define(["cloud/base/model"],function(__){
	
	var root = window;
	
	Model = root.Model = (root.Model||{});
	
	var _ = Model._;
	
	var customStructure = {
			
			user:{
				
				login:{
					param:{
						 _required:true,
						 language:[true,_.number]
					},
					data:{
						_required:true,
						username:[true,_.string],
						password:[true,_.string]
					},
					_desc:{
						zh:{
							name:"用户登录"
						}
					},
					_custom:true
				},
				
				logout:{
					_desc:{
						zh:{
							name:"用户退出"
						}
					},
					_custom:true
				}
	
			},
			
//			tag:{
//				
//				query_type:{
//					param:{
//						_required:false,
//						verbose:[false,_.number]
//					},
//					resourceType:[true,_.string],
//					_desc:{
//						zh:{
//							name:"查询标签类型的标签"
//						}
//					},
//					_custom:true
//				}
//				
//			},
			
			role:{
			
				query_current:{
					_desc:{
						zh:{
							name:"查询当前角色"
						}
					},
					_custom:true
				}
				
			},
			
			organ:{
				
				query_with_stat:{
					part:[true,_.string],
					param:{
						_required:false,
						verbose:[false,_.number]
					},_desc:{
						zh:{
							name:"查询机构详细信息"
						}
					},
					_custom:true
				}
				
			}
			
	}
	
	return customStructure;
	
})