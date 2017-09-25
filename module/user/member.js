define(['angular', 'text!module/user/member.html'], function(angular, tpl) {

  //angular会自动根据controller函数的参数名，导入相应的服务
  return {
    controller: ['$scope', '$rootScope', '$routeParams', '$http', '$timeout', '$location', '$cookieStore', function($scope, $rootScope, $routeParams, $http, $timeout, $location, $cookieStore) {
      var init = function() {

        //会员信息
        $http.get('webapi/shop/users.ashx?act=entity')
          .success(function(data) {

            angular.extend($scope.users, data.entity);

            // $http.post('webapi/shop/userRank.ashx?act=entity', {
            //     rankId: data.entity.userRank
            //   })
            //   .success(function(data) {
            //     $scope.rankName = data.entity.rankName || '非会员';
            //   });

          });

        //成功购物
        $http.get('webapi/shop/orderInfo.ashx?act=successShopping')
          .success(function(data) {
            $scope.successShopping = data;
          });

        //累计消费
        $http.get('webapi/shop/orderInfo.ashx?act=totalAmount')
          .success(function(data) {
            $scope.totalAmount = data;
          });

        //近期订单数
        $http.post('webapi/shop/orderInfo.ashx?act=list', {
            status: 'current'
          })
          .success(function(data) {
            $scope.orderCurrentCount = data.totalItems;
          });

        //历史订单数
        $http.post('webapi/shop/orderInfo.ashx?act=list', {
            status: 'history'
          })
          .success(function(data) {
            $scope.orderHistoryCount = data.totalItems;
          });

        //红包
        // $http.post('webapi/shop/userBonus.ashx?act=list', {
        //     status: 'current',
        //     pageSize: 999
        //   })
        //   .success(function(data) {
        //     $scope.userBonusCount = data.totalItems;
        //
        //     for (var i in data.list) {
        //       $scope.userBonusMoney += data.list[i].typeMoney;
        //     }
        //   });

        //评论数(未审核)
        $http.post('webapi/shop/comment.ashx?act=list', {
            status: 0
          })
          .success(function(data) {
            $scope.commentHideCount = data.totalItems;
          });

        //评论数(已审核)
        $http.post('webapi/shop/comment.ashx?act=list', {
            status: 1
          })
          .success(function(data) {
            $scope.commentShowCount = data.totalItems;
          });

        //收藏数
        $http.get('webapi/shop/collectGoods.ashx?act=list')
          .success(function(data) {
            $scope.collectionCount = data.totalItems;
          });

      };

      $scope.users = {
        userName: '',
        userMoney: 0,
        payPoints: 0,
        rankPoints: 0
      };

      $scope.successShopping = 0;
      $scope.totalAmount = 0;
      $scope.orderCurrentCount = 0;
      $scope.orderHistoryCount = 0;

      $scope.userBonusCount = 0;
      $scope.userBonusMoney = 0;

      $scope.commentHideCount = 0;
      $scope.commentShowCount = 0;
      $scope.collectionCount = 0;

      $scope.rankName = '';

      $scope.logout = function() {

        var sm = new SimpleModal({
          width: 300,
          offsetTop: 150,
          hideFooter: true,
          autoClose: true
        });

        var url = '/default';

        $http.get('webapi/shop/users.ashx?act=logout')
          .success(function() {

            sm.on('hidden', function() {
              $timeout(function() {
                $cookieStore.remove('users');
                $location.path(url);
              });
            }).show({
              title: '提示消息',
              contents: '<p>退出登录成功</p>\
                            <p><a href="#' + url + '">如果您的浏览器没有自动跳转，请点击此链接</a></p>'
            });

          })
          .error(function() {
            sm.show({
              title: '提示消息',
              contents: '请求失败了，稍后重试！'
            });
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
