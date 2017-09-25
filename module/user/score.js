define(['angular', 'text!module/user/score.html'], function (angular, tpl) {

    //angular会自动根据controller函数的参数名，导入相应的服务
    return {
        controller: ['$scope', '$rootScope', '$routeParams', '$http', '$cookieStore', 'ScrollPagination', function ($scope, $rootScope, $routeParams, $http, $cookieStore, ScrollPagination) {

        	var params = {
	            accountType:'paypoints',
			    pageSize:20
			};

			var init = function(){

				$http.get('webapi/shop/users.ashx?act=entity')
				.success(function(data){
					angular.extend($scope.users,data.entity);
				});

                var sp = new ScrollPagination({
					url:function(page){
						return 'webapi/shop/accountLog.ashx?act=list&pageIndex=' + page;
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

        	$scope.users = {
				payPoints:0
			};

			$scope.list = [];

      $http.get('webapi/shop/users.ashx?act=checkLogin').success(function(response) {
        //检测是否登录
        if (response.result != undefined && response.result == "9999") {
          window.location.href = "/userlogin.aspx";
          return false;
        } else {
          init();
        }
      });

        }],
        tpl: tpl
    };
});
