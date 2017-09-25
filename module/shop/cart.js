define(['angular', 'text!module/shop/cart.html'], function(angular, tpl) {

  //angular会自动根据controller函数的参数名，导入相应的服务
  return {
    controller: ['$scope', '$routeParams', '$http', function($scope, $routeParams, $http) {
      $scope.$parent.isShopUser = true;
      $scope.$parent.setTitle();
      var regexp = /^([1-9][0-9]*)$/;

      $scope.list = [];
      $scope.totalMoney = 0;
      $scope.status = {
        loader: true,
        error: false
      };

      //监听数组变化
      $scope.$watch('list', function(oldValue, newValue) {

        //清空总金额
        $scope.totalMoney = 0;

        //累计总金额
        angular.forEach($scope.list, function(item) {
          $scope.totalMoney += item.goodsNumber * item.goodsPrice;
        });

      }, true);

      $scope.bind = function() {
        $http.get('webapi/shop/car.ashx?act=list')
          .success(function(data) {
            $scope.list = data.list;
            $scope.status.loader = false;
            $scope.status.error = false;
          })
          .error(function(data) {
            $scope.status.loader = false;
            $scope.status.error = true;
          });
      };

      $scope.del = function(i) {

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
                hideFooter: true
              });

              $http.post('webapi/shop/car.ashx?act=del', {
                  recId: $scope.list[i].recId
                })
                .success(function(data) {
                  if (data.result) {
                    $scope.list.splice(i, 1);
                  } else {
                    sm2.show({
                      title: '提示消息',
                      contents: '删除数据失败了！'
                    });
                  }
                })
                .error(function(data) {
                  sm2.show({
                    title: '提示消息',
                    contents: '删除数据失败了！'
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
          contents: '是否确认将该商品从购物车移除？'
        });
      };

      $scope.plus = function(i) {

        var model = $scope.list[i];

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

        var sm = new SimpleModal({
          width: 300,
          center: true,
          hideFooter: true
        });

        $http.post('webapi/shop/car.ashx?act=save', {
            recId: model.recId,
            goodsPrice: model.goodsPrice,
            goodsNumber: ++model.goodsNumber
          })
          .success(function(data) {
            if (data.result) {

            } else {
              sm.show({
                title: '提示消息',
                contents: data.msg
              });
            }
          })
          .error(function(data) {
            sm.show({
              title: '提示消息',
              contents: '更新数据失败了！'
            });
          })['finally'](function() { // .finally的写法在IE8报错
            sm_loading.hide();
          });
      };

      $scope.minus = function(i) {

        var model = $scope.list[i];

        if (model.goodsNumber > 1) {

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

          var sm = new SimpleModal({
            width: 300,
            center: true,
            hideFooter: true
          });

          $http.post('webapi/shop/car.ashx?act=save', {
              recId: model.recId,
              goodsPrice: model.goodsPrice,
              goodsNumber: --model.goodsNumber
            })
            .success(function(data) {
              if (data.result) {

              } else {
                sm.show({
                  title: '提示消息',
                  contents: data.msg
                });
              }
            })
            .error(function(data) {
              sm.show({
                title: '提示消息',
                contents: '更新数据失败了！'
              });
            })['finally'](function() { // .finally的写法在IE8报错
              sm_loading.hide();
            });
        }
      };

      $scope.update = function(i) {

        var model = $scope.list[i];

        if (!regexp.test(model.goodsNumber) || parseFloat(model.goodsNumber) < 1) {
          model.goodsNumber = 1;
        }

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

        var sm = new SimpleModal({
          width: 300,
          center: true,
          hideFooter: true
        });

        $http.post('webapi/shop/car.ashx?act=save', {
            recId: model.recId,
            goodsPrice: model.goodsPrice,
            goodsNumber: model.goodsNumber
          })
          .success(function(data) {
            if (data.result) {

            } else {
              sm.show({
                title: '提示消息',
                contents: data.msg
              });
            }
          })
          .error(function(data) {
            sm.show({
              title: '提示消息',
              contents: '更新数据失败了！'
            });
          })['finally'](function() { // .finally的写法在IE8报错
            sm_loading.hide();
          });
      };

      //初始化
      $scope.bind();

    }],
    tpl: tpl
  };
});
