/**
 * Created by kenkozheng on 2015/7/10.
 */
define(['angular', 'text!module/facilitator/supplierall.html'], function (angular, tpl) {

    //angular会自动根据controller函数的参数名，导入相应的服务
    return {
        controller: ['$scope', '$routeParams', '$http', '$modal', 'alertSrv', function ($scope, $routeParams, $http, $modal, alertSrv) {
																			  
			//获取角色列表
			$scope.bind = function(){

				var sm = new SimpleModal({
					width:'20%',
					center:true,
					show:true,
					overlayOpacity:0.1,
					clickBgClose:false,
					keyEsc:false,
					loading_icon:'../images/loading.gif',
					skinClassName:'loading'
				});
				sm.show({
					model:'modal-loading'
				});

			    $http.get('../webapi/facilitator/servicesuppliers.ashx?act=all')
				.success(function (response) {
				    if (response.result != undefined && response.result == "9999") {
				        window.location.href = "/userlogin.aspx";
				        return false;
				    }
					$scope.list = response.all;
				})
				['finally'](function(){
					sm.hide();
				});
			};
			//移除
			$scope.remove = function(id){

				var sm = new SimpleModal({
					width:300,
					center:true,
					btn_ok:'确定',
					btn_cancel:'取消',
					callback:function(){
						sm.on('hidden',function(){

						    $http.post('../webapi/facilitator/servicesuppliers.ashx?act=del', {
								suppliersId:id
							})
							.success(function (response) {
							    if (response.result != undefined && response.result == "9999") {
							        window.location.href = "/userlogin.aspx";
							        return false;
							    }
								$scope.bind();
							});

						}).hide();
					}
				});

				sm.show({
					model:'modal-confirm',
					title:'确认操作',
					contents:'您确认要删除这条记录吗？'
				});

			};
			
  			$scope.bind();
			
  			/////////////////////////////////////////////////////////////////
			
			
  			//模态窗
			$scope.open = function(item){
				var modalInstance = $modal.open({
					templateUrl: 'myModalContent.html',
					controllerAs: 'vm',
					controller:['$modalInstance',function($modalInstance){

						var vm = this;
						
						vm.entity = angular.extend({
						    suppliersId: 0,
						    suppliersAddr: "",
						    suppliersCode: "",
						    suppliersDesc: "",
						    suppliersEmail: "",
						    suppliersMan: "",
						    suppliersName: "",
						    suppliersPhone: "",
						    suppliersTax: ""
						}, item || {});

						vm.alerts = alertSrv.alerts = [];

						//获取管理员信息
					    $http.get('../webapi/facilitator/servicesuppliers.ashx?act=entity&suppliersId=' + vm.entity.suppliersId)
						.success(function (data) {
						    if (data.result != undefined && data.result == "9999") {
						        window.location.href = "/userlogin.aspx";
						        return false;
						    }
							angular.extend(vm.entity,data.entity);
						});
						//取消
						vm.cancel = function () {
							$modalInstance.dismiss('cancel');
						};
						//保存
						vm.save = function(id){
							
							vm.button = true;

						    $http.post('../webapi/facilitator/servicesuppliers.ashx?act=save', vm.entity)
							.success(function (resp) {
							    if (resp.result != undefined && resp.result == "9999") {
							        window.location.href = "/userlogin.aspx";
							        return false;
							    }
								if(resp.result > 0)
									alertSrv.addAlert('success','保存成功',function(){
										$modalInstance.close();
									});
								else
									alertSrv.addAlert('warning',resp.msg);
							})
							.error(function(resp){
								alertSrv.addAlert('danger',resp);
							})
							['finally'](function(){
								vm.button = false;
							});
						};
					}]
				});

				modalInstance.closed.then(function(){
					$scope.bind();
			    });
			};
        }],
        tpl: tpl
    };
});