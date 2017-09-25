define(['angular', 'text!module/user/personal.html'], function(angular, tpl) {

  //angular会自动根据controller函数的参数名，导入相应的服务
  return {
    controller: ['$scope', '$rootScope', '$routeParams', '$http', '$cookieStore', function($scope, $rootScope, $routeParams, $http, $cookieStore) {
      // $scope.$parent.isShopUser = true;
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

      var init = function() {

        sm_loading.show({
          model: 'modal-loading'
        });

        $http.get('webapi/shop/users.ashx?act=entity')
          .success(function(data) {

            angular.extend($scope.users, data.entity);

            //时间戳转日期
            $scope.users.birthday = new Date($scope.users.birthday);

            sm_loading.hide();
          });

      };

      $scope.users = {
        userName: '',
        birthday: '',
        sex: 0,
        email: '',
        msn: '',
        qq: '',
        officePhone: '',
        homePhone: '',
        mobilePhone: ''
      };

      //初始化日期选择器
      $scope.format = 'yyyy-MM-dd';
      $scope.popup = {
        opened: false
      };

      $scope.open = function($event) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.popup.opened = true;
      };

      $scope.save = function() {

        $scope.myForm.$invalid = true;

        var sm = new SimpleModal({
          width: 300,
          center: true,
          hideFooter: true,
          autoClose: true
        });

        //日期转时间戳
        $scope.users.birthday = $scope.users.birthday.getTime();

        $http.post('webapi/shop/users.ashx?act=save', $scope.users)
          .success(function(data) {
            sm.show({
              title: '提示消息',
              contents: data.result ? '更新数据成功了' : data.msg
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
          $scope.$parent.isShopUser = $cookieStore.get('sdxfshoporgcat') == '1';
          init();
        }
      });

    }],
    tpl: tpl
  };
});
