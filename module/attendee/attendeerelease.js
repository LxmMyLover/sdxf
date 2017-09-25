/**
 * Modify by baitl on 2017/7/17.
 */
define(['angular', 'text!module/attendee/attendeerelease.html'], function (angular, tpl) {

    //angular会自动根据controller函数的参数名，导入相应的服务
    return {
        controller: ['$scope', '$routeParams', '$http', '$modal','publicSrv', 'alertSrv', function ($scope, $routeParams, $http, $modal,publicSrv, alertSrv) {		
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

			    $http.get('../webapi/attendee/services.ashx?act=all&getFlag=0')
				.success(function(response){
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

            //服务状态
			$scope.serviceStatus = [
                { "text": "草稿", "value": "0" },
                { "text": "发布中", "value": "1" },
                { "text": "待审核", "value": "2" },
                { "text": "已评标", "value": "3" },
                { "text": "完成", "value": "4" },
                { "text": "作废", "value": "5" },
			    { "text": "审核退回", "value": "6" },
			    { "text": "待评标", "value": "7" },
			    { "text": "中标通知", "value": "8" }, { "text": "待应标", "value": "9" }];
			
			$scope.info = function (msg) {
			    var sm1 = new SimpleModal({
			        width: 300,
			        center: true,
			        btn_ok: "确定",
			        callback: function () {
			            sm1.hide();
			        }
			    }).show({
			        model: 'modal-alert',
			        title: '提示消息',
			        contents: msg
			    });
			};

			//移除
			$scope.remove = function (id, s) {
			    if (s != "0")
			    {
			        $scope.info('只能删除草稿状态的服务！');
			        return;
			    }
				var sm = new SimpleModal({
					width:300,
					center:true,
					btn_ok:'确定',
					btn_cancel:'取消',
					callback:function(){
						sm.on('hidden',function(){

						    $http.post('../webapi/attendee/services.ashx?act=del', {
								servicesId:id
							})
							.success(function(response){
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

			$scope.upAudit = function (id, status) {
			    if (status != "0")
			    {			        
			        $scope.info("只能提交[草稿]状态的服务！");
			        return;
			    }
			    var sm = new SimpleModal(
                    {
                        width: 300,
                        center: true,
                        btn_ok: "确定",
                        btn_cancel: "取消",
                        callback:function()
                        {
                            sm.on("hidden", function () {
                                $http.post("../webapi/attendee/services.ashx?act=audit", { servicesId: id }).success(function (reponse) {
                                    $scope.bind();
                                });
                            }).hide();
                        }
                    });

			    sm.show(
                    {
                        model: "modal-confirm",
                        title: "确认操作",
                        contents:"您确认要提交吗？"
                    });
			};

			$scope.rollAudit = function (id, status) {
			    if (status != "2") {
			        $scope.info("只能撤回[待审核]状态的服务！");
			        return;
			    }
			    var sm = new SimpleModal(
                    {
                        width: 300,
                        center: true,
                        btn_ok: "确定",
                        btn_cancel: "取消",
                        callback: function () {
                            sm.on("hidden", function () {
                                $http.post("../webapi/attendee/services.ashx?act=backAudit", { servicesId: id }).success(function (reponse) {
                                    $scope.bind();
                                });
                            }).hide();
                        }
                    });

			    sm.show(
                    {
                        model: "modal-confirm",
                        title: "确认操作",
                        contents: "您确认要撤回审核吗？"
                    });
			};

            //获取服务商列表
			$http.post('../webapi/admin/servicesuppliers.ashx?act=all', {
			    suppliersId: 0
			})
            .success(function (response) {
                $scope.sslist = response.all || [];
            });			
            //获取服务分类
			$scope.sclist = [];
            $http.post('../webapi/admin/servicecategory.ashx?act=all', {
                categoryID:0
            })
            .success(function (response)
            {
                //$scope.sclist = response.all || [];
                publicSrv.bulidTree(response.all, 0, -1, $scope.sclist, {
                    id: 'categoryID',
                    text: 'categoryName',
                    pid: 'categoryParent'
                });
            }
            );
            //服务分类结束

            $scope.defaultC = {
                cur: {
                    categoryID: 0,
                    categoryName: "所有服务分类"
                }
            };
            $scope.defaultS = {
                cur: {
                    sCSSupplier: 0,
                    cSSuppliersName: "所有服务商"
                }
            };
			
  			$scope.bind();
			
  			/////////////////////////////////////////////////////////////////
			
			
  			//模态窗
  			$scope.open = function (item) {
  			    var modalInstance = $modal.open({
  			        backdrop: "static",
					templateUrl: 'myModalContent.html',
					controllerAs: 'vm',
					controller:['$modalInstance',function($modalInstance){
						var vm = this;						
						vm.entity = angular.extend({
						    servicesID: 0,
						    servicesMode: "1",
						    servicesMax: 0,
						    servicesBegin: "",
						    servicesCategory: 0,
						    servicesCode: "",
						    servicesCompareDesc: "",
						    servicesCreateTime: "",
						    servicesCreator: "",
						    servicesDesc: "",
						    servicesEnd: "",
						    servicesMan: "",
						    servicesName: "",
						    servicesPhone: "",
						    servicesStatus: "0",
						    servicesSupplier: 0,
						    servicesTimeDesc: "",
						    servicesDay: 0,
						    servicesPriceCompare: "1",
						    servicesDayCompare: "0",
						    servicesEnsureCompare: "0",
						    servicesEnsure: 0,
						    servicesLastDay: "",
						    servicesLastTime:""
						}, item || {});

						vm.alerts = alertSrv.alerts = [];
						vm.sslist = angular.copy($scope.sslist);
						vm.sclist = angular.copy($scope.sclist);
						vm.sclist.unshift($scope.defaultC.cur);
						vm.sclist[0].categoryName = '请选择服务分类';
					    //获取服务信息		
						if (vm.entity.servicesID != 0) {
						    $http.get('../webapi/attendee/services.ashx?act=entity&servicesId=' + vm.entity.servicesID)
                            .success(function (data) {
                                angular.extend(vm.entity, data.entity);
                                vm.entity.servicesBegin = $scope.getLocalTime(vm.entity.servicesBegin);
                                vm.entity.servicesEnd = $scope.getLocalTime(vm.entity.servicesEnd);
                                if(vm.entity.servicesLastDay!="")
                                    vm.entity.servicesLastDay = $scope.getLocalTime(vm.entity.servicesLastDay);
                            });
						};
					    //分类信息
						vm.cEntity = {
						    categoryID: 0,
						    categoryMax: 0,
						    categoryMax1: 0,
						    categoryType:1
						}
					    //获取服务商信息
						vm.sslist = [];
						vm.sslist.unshift($scope.defaultS.cur);
						vm.sslist[0].cSSuppliersName = "请选择服务商";
						vm.bindSuppliers = function () {
						    if (vm.entity.servicesCategory != 0) {
						        $http.get('../webapi/admin/categorysuppliers.ashx?act=all&categoryID=' + vm.entity.servicesCategory)
                                    .success(function (data) {
                                        vm.sslist = [];
                                        angular.extend(vm.sslist, data.all);
                                        vm.sslist.unshift($scope.defaultS.cur);
                                        vm.sslist[0].cSSuppliersName = "请选择服务商";
                                        vm.entity.servicesSupplier = 0;
                                    });
						        //获取分类的信息
						        $http.get('../webapi/admin/servicecategory.ashx?act=entity&categoryID=' + vm.entity.servicesCategory)
						            .success(function (data) {
						                angular.extend(vm.cEntity, data.entity);
						                MaxCheck();
						            });
						    }
						};
						vm.bindSuppliers();
					    //工程预算
						MaxCheck = function ()
						{
						    if (vm.entity.servicesMax / 10000 >= vm.cEntity.categoryMax1)
						    {
						        if (vm.entity.servicesMode == "0")
						            vm.entity.servicesMode = "1";
						    }
						    if (vm.entity.servicesMax / 10000 < vm.cEntity.categoryMax1)
						    {
						        //自主
						        if (vm.entity.servicesMode == "1")
						            vm.entity.servicesMode = "0";
						    }
						}
					    //工期
						EnsureCheck = function ()
						{
						    if (vm.entity.servicesEnsure > 0) {
						        vm.entity.servicesEnsureCompare = "1";
						    }
						    else
						        vm.entity.servicesEnsureCompare = "0";
						}
					    //质保
						DayCheck =function()
						{
						    if (vm.entity.servicesDay > 0) {
						        vm.entity.servicesDayCompare = "1";
						    }
						    else
						        vm.entity.servicesDayCompare = "0";
						}
						//取消
						vm.cancel = function () {
							$modalInstance.dismiss('cancel');
						};					    
						vm.dateComputer = function () {
						    //获取开始日期和结束日期
						    var beginDate = vm.entity.servicesBegin;
						    var endDate = vm.entity.servicesEnd;
						    if (beginDate != "" && endDate != "") {
						        var time1 = Date.parse(beginDate);
						        var time2 = Date.parse(endDate);
						        //讲两个时间相减，求出相隔的天数  
						        vm.entity.servicesDay = (Math.abs(time2 - time1)) / 1000 / 60 / 60 / 24;
						    }
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

						//保存
						vm.save = function (id) {
						    if (vm.entity.servicesCategory == 0)
						    {
						        $scope.info("请选择服务分类！");
						        return;
						    }
						    if (vm.entity.servicesMode == "0" && vm.entity.servicesSupplier == 0)
						    {
						        $scope.info("非竞标模式下请指定服务商！");
						        return;
						    }
						    if (vm.entity.servicesMode == "1" &&(vm.entity.servicesPriceCompare=="0" && vm.entity.servicesEnsureCompare=="0" && vm.entity.servicesDayCompare=="0"))
						    {
						        $scope.info("竞标模式下请指定评标规则！");
						        return;
						    }

						    vm.button = true;
						    vm.entity.servicesBegin = Date.parse(vm.entity.servicesBegin);
						    vm.entity.servicesEnd = Date.parse(vm.entity.servicesEnd);
						    vm.entity.servicesCreateTime = Date.parse(vm.entity.servicesCreateTime);                            
						    if (vm.entity.servicesLastDay != "")
						        vm.entity.servicesLastDay = Date.parse(vm.entity.servicesLastDay);
						    else
						        vm.entity.servicesLastDay = "";                            
						    $http.post('../webapi/attendee/services.ashx?act=save', vm.entity)
							.success(function(resp){
								if(resp.result > 0)
									alertSrv.addAlert('success','保存成功',function(){
										$modalInstance.close();
									});
								else
									alertSrv.addAlert('warning',resp.msg);
							})
							.error(function(resp){
							    alertSrv.addAlert('danger', resp);
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