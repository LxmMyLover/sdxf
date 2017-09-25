define(['angular', 'text!module/supplier/changePwd.html'], function(angular, tpl) {

  //angular会自动根据controller函数的参数名，导入相应的服务
  return {
    controller: ['$scope', '$rootScope', '$routeParams', '$http', '$cookieStore', '$location', '$timeout', function($scope, $rootScope, $routeParams, $http, $cookieStore, $location, $timeout) {
      $scope.save = function() {

        $scope.myForm.$invalid = true;

        var sm = new SimpleModal({
          width: 300,
          center: true,
          hideFooter: true,
          autoClose: true
        });

        var url = '/userlogin.aspx';

        $http.post('webapi/shop/users.ashx?act=updatePassword', {
            oldPassword: $scope.oldPassword,
            password: $scope.newPassword
          })
          .success(function(data) {
            data.result && sm.on('hidden', function() {
              $timeout(function() {
                //退出登录
                $http.get('webapi/shop/users.ashx?act=logout')
                  .success(function() {
                    $cookieStore.remove('userName');
                    $location.path(url);
                  });
              });
            });
            sm.show({
              title: '提示消息',
              contents: data.result ? '<p>密码修改成功，请退出重新登录！</p>\
				        <p><a href="#' + url + '">如果您的浏览器没有自动跳转，请点击此链接</a></p>' : data.msg
            });
          })
          .error(function(data) {
            sm.show({
              title: '提示消息',
              contents: '更新数据失败了！'
            });
          })['finally'](function() { // .finally的写法在IE8报错
            $scope.myForm.$invalid = false;
          });
      };


      $http.get('webapi/shop/users.ashx?act=checkLogin').success(function(response) {
        //检测是否登录
        if (response.result != undefined && response.result == "9999") {
          window.location.href = "/userlogin.aspx";
          return false;
        } else {
          $scope.$parent.setTitle();
        }
      });

    }],
    tpl: tpl
  };
});
