define(['angular', 'text!module/user/order.html'], function(angular, tpl) {

  //angular会自动根据controller函数的参数名，导入相应的服务
  return {
    controller: ['$scope', '$rootScope', '$routeParams', '$http', '$window', '$cookieStore', 'ScrollPagination', 'publicSrv', function($scope, $rootScope, $routeParams, $http, $window, $cookieStore, ScrollPagination, publicSrv) {
      // $scope.$parent.isShopUser = true;
      var init = function() {

        angular.forEach(['current', 'history'], function(element, index) {

          var params = {
            status: element,
            pageSize: 20
          };

          var sp = new ScrollPagination({
            url: function(page) {
              return 'webapi/shop/orderInfo.ashx?act=list&pageIndex=' + page;
            },
            postData: params,
            beforeLoad: function() {
              $scope[element + 'NoMore'] = true;
              $scope[element + 'LoadMore'] = false;
              return $scope[element + 'Tab'];
              //return $('#tab-' + element).is(':visible');
            },
            afterLoad: function(data, pageIndex, totalItems) {
              $scope[element + 'LoadMore'] = true;
              if ($scope[element + 'List'].length) {
                angular.forEach(data.list, function(item) {
                  $scope[element + 'List'].push(item);
                });
              } else {
                $scope[element + 'List'] = data.list;
              }!totalItems && sp.reset({
                totalItems: data.totalItems
              });
            },
            finished: function() {
              $scope[element + 'NoMore'] = false;
            },
            pageSize: params.pageSize,
            offset: 10
          });

        });

      };

      $scope.currentList = [];
      $scope.historyList = [];
      $scope.currentTab = true;
      $scope.historyTab = false;

      $scope.select1 = function() {
        $scope.currentTab = true;
        $scope.historyTab = false;
        $http.post('webapi/shop/orderInfo.ashx?act=list', {
          status: 'current',
          PageSize: 20
        }).success(function(response) {
          $scope.currentList = response.list;
        });
      }
      $scope.select2 = function() {
        $scope.currentTab = false;
        $scope.historyTab = true;
        $http.post('webapi/shop/orderInfo.ashx?act=list', {
          status: 'history',
          PageSize: 20
        }).success(function(response) {
          $scope.historyList = response.list;
        });
      }

      $scope.orderStatus = function(orderStatus, payStatus, shippingStatus) {

        //未确认
        var status = publicSrv.order.orderStatus[orderStatus];

        if (orderStatus > 0) status = publicSrv.order.orderStatus[orderStatus];
        if (payStatus > 0) status = publicSrv.order.payStatus[payStatus];
        if (shippingStatus > 0) status = publicSrv.order.shippingStatus[shippingStatus];

        //退货
        if (orderStatus == 4) status = publicSrv.order.orderStatus[orderStatus];

        return status;
      };

      $scope.cancel = function(type, index) {

        var sm = new SimpleModal({
          width: 300,
          center: true,
          btn_ok: '确定',
          btn_cancel: '取消',
            callback: function() {
              sm.on('hidden', function() {

                var sm_loading = new SimpleModal({
                  width: '20%',
                  center: true,
                  show: true,
                  overlayOpacity: 0.1,
                  clickBgClose: false,
                  keyEsc: false,
                  loading_icon: '/images/loading.gif',
                  skinClassName: 'loading'
                });

                sm_loading.show({
                  model: 'modal-loading'
                });

                var sm2 = new SimpleModal({
                  width: 300,
                  center: true,
                  hideFooter: true,
                  autoClose: true
                });

                $http.post('webapi/shop/orderInfo.ashx?act=save', {
                    orderId: $scope[type + 'List'][index].orderId
                  })
                  .success(function(data) {
                    if (data.result) {
                      $scope[type + 'List'][index].orderStatus = 2;
                      data.msg = '订单已取消';
                    } else {
                      data.msg = data.msg || '取消订单失败了！';
                    }
                    sm2.show({
                      title: '提示消息',
                      contents: data.msg
                    });
                  })
                  .error(function(data) {
                    sm2.show({
                      title: '提示消息',
                      contents: '取消订单失败了！'
                    });
                  })['finally'](function() { // .finally的写法在IE8报错
                    sm_loading.hide();
                  });
              }).hide();
            }
        });

        sm.show({
          model: 'modal-confirm',
          title: '确认操作',
          contents: '您确认要取消该订单吗？取消后此订单将视为无效订单'
        });
      };

      $scope.payment = function(type, index) {

      };

      $scope.confirm = function(type, index) {
        var sm = new SimpleModal({
          width: 300,
          center: true,
          btn_ok: '确定',
          btn_cancel: '取消'
        });
        sm.show({
          model: 'modal-confirm',
          title: '确认操作',
          contents: '你确认已经收到货物了吗？',
          callback: function() {

            sm.on('hidden', function() {

              var sm_loading = new SimpleModal({
                width: '20%',
                center: true,
                show: true,
                overlayOpacity: 0.1,
                clickBgClose: false,
                keyEsc: false,
                loading_icon: '/images/loading.gif',
                skinClassName: 'loading'
              });

              sm_loading.show({
                model: 'modal-loading'
              });

              var sm2 = new SimpleModal({
                width: 300,
                center: true,
                hideFooter: true,
                autoClose: true
              });

              $http.post('webapi/shop/orderInfo.ashx?act=save', {
                  orderId: $scope[type + 'List'][index].orderId
                })
                .success(function(data) {
                  if (data.result) {
                    if (data.payUrl) {
                      data.msg = '<p>正在前往，' + data.payName + '，请登录后完成确认收货的操作</p>\
							    			<p><a href="' + data.payUrl + '">如果您的浏览器没有自动跳转，请点击此链接</a></p>';
                    } else {
                      $scope[type + 'List'][index].shippingStatus = 2;
                      data.msg = '交易成功！';
                    }
                  } else {
                    data.msg = data.msg || '确认收货失败了！';
                  }
                  sm2.on('hidden', function() {
                    if (data.payUrl) $window.location.href = data.payUrl;
                  }).show({
                    title: '提示消息',
                    contents: data.msg
                  });
                })
                .error(function(data) {
                  sm2.show({
                    title: '提示消息',
                    contents: '确认收货失败了！'
                  });
                })['finally'](function() { // .finally的写法在IE8报错
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
