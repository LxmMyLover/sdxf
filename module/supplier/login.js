/**
 * Modify by melody on 2017/8/6.
 */
define(['angular', 'text!module/supplier/login.html'], function(angular, tpl) {

  return {
    controller: ['$scope', '$cookieStore', '$compile', '$http', '$location', function($scope, $cookieStore, $compile, $http, $location) {

      $cookieStore.remove('users');
      $scope.$parent.isShopUser = false;

      $scope.errMsg = "";
      var content = '';

      var sm = new SimpleModal({
        width: '50%',
        center: true,
        closeButton: false,
        clickBgClose: false,
        keyEsc: true,
        hideFooter: true,
        skinClassName: 'simple-login'
      });

      //加载登录框内容
      $http.get('tpls/supplier-login.html')
        .success(function(data) {
          content = data;
          sm.show({
            title: '供应商登录',
            contents: $compile(content)($scope)
          });
        });

      $scope.login = function() {
        $http.get('webapi/suppliers/logininit.ashx?act=login&password=' + $scope.password).success(function(data) {
          if (data.result) {
            sm.hide();
            $location.path('/supplier_goods');
          } else {
            $scope.errMsg = "密码不正确！"
          }
        });
      }

    }],
    tpl: tpl
  };
});
