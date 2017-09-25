define(['angular', 'text!module/user/comment.html'], function (angular, tpl) {

    //angular会自动根据controller函数的参数名，导入相应的服务
    return {
        controller: ['$scope', '$rootScope', '$routeParams', '$http', '$cookieStore', 'ScrollPagination', function ($scope, $rootScope, $routeParams, $http, $cookieStore, ScrollPagination) {

        	var init = function(){

        		angular.forEach(['current','history'],function(element,index){

		            var params = {
		                status:index,
				        pageSize:20
				    };

		    		var sp = new ScrollPagination({
						url:function(page){
							return 'webapi/shop/comment.ashx?act=list&pageIndex=' + page;
						},
						postData:params,
						beforeLoad: function(){
							$scope[element + 'NoMore'] = true;
				            $scope[element + 'LoadMore'] = false;
				            return $scope[element + 'Tab'];
				            //return $('#tab-' + element).is(':visible');
				        },
						afterLoad:function(data,pageIndex,totalItems){
							$scope[element + 'LoadMore'] = true;
							if($scope[element + 'List'].length){
								angular.forEach(data.list,function(item){
									$scope[element + 'List'].push(item);
								});
							}else{
								$scope[element + 'List'] = data.list;
							}
							!totalItems && sp.reset({totalItems:data.totalItems});
						},
						finished:function(){
							$scope[element + 'NoMore'] = false;
						},
						pageSize:params.pageSize,
						offset:10
					});

		    	});

        	};

        	$scope.currentList = [];
			$scope.historyList = [];
			$scope.currentTab = true;
			$scope.historyTab = false;

			$scope.select1 = function(){
				$scope.currentTab = true;
				$scope.historyTab = false;
			}
			$scope.select2 = function(){
				$scope.currentTab = false;
				$scope.historyTab = true;
			}

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
