define(['angular', 'text!module/user/collection.html'], function (angular, tpl) {

    //angular会自动根据controller函数的参数名，导入相应的服务
    return {
        controller: ['$scope', '$rootScope', '$routeParams', '$http', '$cookieStore', 'ScrollPagination', function ($scope, $rootScope, $routeParams, $http, $cookieStore, ScrollPagination) {

        	var params = {
			    pageSize:20
			};

			var init = function(){

				var sp = new ScrollPagination({
					url:function(page){
						return 'webapi/shop/collectGoods.ashx?act=list&pageIndex=' + page;
					},
					postData:params,
					beforeLoad: function(){
						$scope.noMore = true;
			            $scope.loadMore = false;
			        },
					afterLoad:function(data,pageIndex,totalItems){
						$scope.loadMore = true;
						if($scope.list.length){
							angular.forEach(data.list,function(item){
								$scope.list.push(item);
							});
						}else{
							$scope.list = data.list;
						}
						!totalItems && sp.reset({totalItems:data.totalItems});
					},
					finished:function(){
						$scope.noMore = false;
					},
					pageSize:params.pageSize,
					offset:10
				});

			};

			$scope.list = [];

			$scope.del = function(i){
				var sm = new SimpleModal({
					width:300,
					center:true,
					btn_ok:'确定',
					btn_cancel:'取消'
				});
				sm.show({
					model:'modal-confirm',
					title:'确认操作',
					contents:'是否确认将该商品从收藏夹移除？',
					callback:function(){

						sm.on('hidden',function(){

							var sm_loading = new SimpleModal({
								width:'20%',
								center:true,
								show:true,
								overlayOpacity:0.1,
								clickBgClose:false,
								keyEsc:false,
								loading_icon:'/images/loading.gif',
								skinClassName:'loading'
							});

							sm_loading.show({
								model:'modal-loading'
							});

							var sm2 = new SimpleModal({
								width:300,
								center:true,
								hideFooter:true
							});

							$http.post('webapi/shop/collectGoods.ashx?act=del',{
								recId:$scope.list[i].recId
							})
							.success(function(data){
								if(data.result){
									$scope.list.splice(i,1);
								}else{
									sm2.show({
										title:'提示消息',
										contents:'删除数据失败了！'
									});
								}
							})
							.error(function(data){
								sm2.show({
									title:'提示消息',
									contents:'删除数据失败了！'
								});
							})
							['finally'](function(){   // .finally的写法在IE8报错
								sm_loading.hide();
							});

						}).hide();
					}
				});
			};

      $http.get('webapi/shop/users.ashx?act=checkLogin').success(function(response) {
        //检测是否登录
        if (response.result != undefined && response.result == "9999") {
          window.location.href = "/userlogin.aspx";
          return false;
        } else {
          $scope.$parent.setTitle();
          $scope.$parent.isShopUser = $cookieStore.get('sdxfshoporgcat') == '1';
          init();
        }
      });

        }],
        tpl: tpl
    };
});
