/**
 * Modify by melody on 2017/8/11.
 */

define(['angular', 'text!module/supplier/orderList.html'], function(angular, tpl) {

  //angular会自动根据controller函数的参数名，导入相应的服务
  return {
    controller: ['$scope', '$routeParams', '$http', '$modal', 'alertSrv', function($scope, $routeParams, $http, $modal, alertSrv) {
      $scope.bind = function() {

        var sm = new SimpleModal({
          width: '20%',
          center: true,
          show: true,
          overlayOpacity: 0.1,
          clickBgClose: false,
          keyEsc: false,
          loading_icon: './images/loading.gif',
          skinClassName: 'loading'
        });

        sm.show({
          model: 'modal-loading'
        });

        $http.get('webapi/shop/orderInfo.ashx?act=SupplierContractList')
          .success(function(response) {
            if (response.result != undefined && response.result == "9999") {
              window.location.href = "/userlogin.aspx";
              return false;
            }
            $scope.list = response.list;
            angular.forEach($scope.list, function(item) {
              item.addTime = new Date(item.addTime).toLocaleString();
            });
          })['finally'](function() {
            sm.hide();
          });
      };

      $http.get('webapi/shop/users.ashx?act=checkLogin').success(function(response) {
        //检测是否登录
        if (response.result != undefined && response.result == "9999") {
          window.location.href = "/userlogin.aspx";
          return false;
        } else {
          $scope.$parent.setTitle();
          $scope.bind();
        }
      });


    }],
    tpl: tpl
  };
});
