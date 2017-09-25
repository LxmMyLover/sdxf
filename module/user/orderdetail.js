define(['angular', 'text!module/user/orderdetail.html'], function (angular, tpl) {

    //angular会自动根据controller函数的参数名，导入相应的服务
    return {
        controller: ['$scope', '$rootScope', '$routeParams', '$http', '$cookieStore', 'publicSrv', function ($scope, $rootScope, $routeParams, $http, $cookieStore, publicSrv) {

        	var params = {
	            orderId:$routeParams.id || 0
	        };

	        var init = function(){

	        	$http.post('webapi/shop/orderInfo.ashx?act=entity',params)
				.success(function(data){
					angular.extend($scope.orderInfo,data.entity);
				});

				$http.post('webapi/shop/deliveryOrder.ashx?act=list',params)
				.success(function(data){
				    $scope.deliveryOrder = data.list;
				});

				$http.post('webapi/shop/orderGoods.ashx?act=list',params)
				.success(function(data){
					$scope.orderGoods = data.list;
				});

	        };

        	$scope.orderInfo = {
				orderSn:'',//订单编号
				orderStatus:0,//订单状态
				shippingStatus:0,//配送状态
				payStatus:0,//付款状态
				addTime:0,//下单时间
				payTime:0,//付款时间
				shippingTime:0,//发货时间
				consignee:'',//收货人
				mobile:'',//手机
				tel:'',//电话
				zipCode:'',//邮编
				country:{regionId:1,regionName:'中国'},//国家
				province:{regionId:2,regionName:'北京'},//省
				city:{regionId:36,regionName:'北京'},//市
				district:{regionId:399,regionName:'东城区'},//区县
				address:'',//详细地址
				postScript:'',//订单附言
				goodsAmount:0,//商品总价
				shippingFee:0,//运费
				discount:0,//折扣
				surplus:0,//使用余额
				integralMoney:0,//使用积分
				bonus:0//使用红包
			};

			$scope.orderStatus = publicSrv.order.orderStatus;
			$scope.shippingStatus = publicSrv.order.shippingStatus;
			$scope.payStatus = publicSrv.order.payStatus;
			$scope.deliveryOrder = [];
			$scope.orderGoods = [];

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
