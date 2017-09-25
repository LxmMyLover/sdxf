/**
 * Modify by baitl on 2017/7/27.
 */
define(['angular', 'text!module/facilitator/myservices.html'], function (angular, tpl) {

    //angular会自动根据controller函数的参数名，导入相应的服务
    return {
        controller: ['$scope', '$routeParams', '$http', '$modal', 'alertSrv', function ($scope, $routeParams, $http, $modal, alertSrv) {		
			//获取服务列表
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

			    $http.get('../webapi/facilitator/services.ashx?act=all&getFlag=84&getMode=0')
				.success(function (response) {
				    if (response.result != undefined && response.result == "9999") {
				        window.location.href = "/userlogin.aspx";
				        return false;
				    }
				    $scope.list = response.all;
				    angular.forEach($scope.list, function (item) {
				        item.servicesBegin = $scope.getLocalTime(item.servicesBegin);
				        item.servicesEnd = $scope.getLocalTime(item.servicesEnd);
				        item.servicesCreateTime = $scope.getLocalTime(item.servicesCreateTime);
				    });
				})
				['finally'](function(){
					sm.hide();
				});
			};
			$scope.getLocalTime = function (nS) {
			    nS = nS.replace("/Date(", "").replace(")/", "")
			    var strDate = new Date(parseInt(nS)).toLocaleString();
			    return strDate.substr(0, strDate.indexOf(" ") + 1);
			};            
  			$scope.bind();
			
  			/////////////////////////////////////////////////////////////////
			
			
  			//模态窗
			$scope.open = function(item){
				var modalInstance = $modal.open({
					templateUrl: 'myModalContent.html',
					controllerAs: 'vm',
					size:'lg',
					controller:['$modalInstance',function($modalInstance){
						var vm = this;
						
						vm.entity = angular.extend({
						    servicesID: 0,
						    servicesMode: "1"						    
						}, item || {});
						vm.alerts = alertSrv.alerts = [];
					    //获取服务信息
						if (vm.entity.servicesID != 0) {
						    $http.get('../webapi/facilitator/services.ashx?act=entity&servicesId=' + vm.entity.servicesID)
                            .success(function (data) {
                                if (data.result != undefined && data.result == "9999") {
                                    window.location.href = "/userlogin.aspx";
                                    return false;
                                }
                                angular.extend(vm.entity, data.entity);
                                vm.entity.servicesBegin = $scope.getLocalTime(vm.entity.servicesBegin);
                                vm.entity.servicesEnd = $scope.getLocalTime(vm.entity.servicesEnd);
                            });
						};						
						vm.cancel = function () {
						    $modalInstance.dismiss("cancel");
						};
						vm.refuse = function (id) {
						    var sm1 = new SimpleModal({
						        width: 300,
						        center: true,
						        btn_ok: "确定",
						        btn_cancel: "取消",
						        callback: function () {
						            vm.refuseService(id);
						            sm1.hide();
						        }
						    }).show({
						        model: 'modal-confirm',
						        title: '确认',
						        contents: "确认拒绝?"
						    });
						};
						vm.refuseService = function (id) {
						    $http.post('../webapi/facilitator/services.ashx?act=refuseService&servicesId=' + id + "&getMode=0")
							.success(function (resp) {
							    if (resp.result != undefined && resp.result == "9999") {
							        window.location.href = "/userlogin.aspx";
							        return false;
							    }
							    if (resp.result > 0)
							        alertSrv.addAlert('success', '操作成功', function () {
							            $modalInstance.close();
							        });
							    else
							        alertSrv.addAlert('warning', resp.msg);
							})
							.error(function (resp) {
							    alertSrv.addAlert('danger', resp);
							})
                            ['finally'](function () {
                            });
						};
						vm.accept = function (id) {
						    var sm1 = new SimpleModal({
						        width: 300,
						        center: true,
						        btn_ok: "确定",
						        btn_cancel: "取消",
						        callback: function () {
						            vm.acceptService(id);
						            sm1.hide();
						        }
						    }).show({
						        model: 'modal-confirm',
						        title: '确认',
						        contents: "确认接受?"
						    });
						};
						vm.acceptService = function (id) {
						    vm.button = true;
						    $http.post('../webapi/facilitator/services.ashx?act=acceptService&servicesId=' + id + "&getMode=0")
							.success(function (resp) {
							    if (resp.result != undefined && resp.result == "9999") {
							        window.location.href = "/userlogin.aspx";
							        return false;
							    }
							    if (resp.result > 0)
							        alertSrv.addAlert('success', '操作成功', function () {
							            $modalInstance.close();
							        });
							    else
							        alertSrv.addAlert('warning', resp.msg);
							})
							.error(function (resp) {
							    alertSrv.addAlert('danger', resp);
							})
                            ['finally'](function () {
                                vm.button = false;
                            });
						};
					    //初始化日期选择器
						vm.format = 'yyyy/MM/dd';
						vm.popup = {
						    opened: [false, false]
						};

						vm.open = function ($event, index) {
						    $event.preventDefault();
						    $event.stopPropagation();

						    vm.popup.opened[index] = true;
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