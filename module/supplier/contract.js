/**
 * Modify by melody on 2017/8/6.
 */
define(['angular', 'text!module/supplier/contract.html'], function(angular, tpl) {

  //angular会自动根据controller函数的参数名，导入相应的服务
  return {
    controller: ['$scope', '$routeParams', '$http', '$modal', 'alertSrv', function($scope, $routeParams, $http, $modal, alertSrv) {
      //获取服务列表
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

        $http.get('webapi/shop/orderInfo.ashx?act=supplierContractList')
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

      $scope.download = function(id) {
        window.open('webapi/download.ashx?orderSn=' + id);
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

      /////////////////////////////////////////////////////////////////


      //模态窗
      $scope.open = function(item) {
        var modalInstance = $modal.open({
          templateUrl: 'myModalContent.html',
          controllerAs: 'vm',
          size: 'lg',
          controller: ['$modalInstance', function($modalInstance) {
            var vm = this;

            vm.entity = angular.extend({
              servicesID: 0,
              servicesMode: "1"
            }, item || {});
            vm.alerts = alertSrv.alerts = [];
            //获取服务信息
            if (vm.entity.servicesID != 0) {
              $http.get('../webapi/facilitator/services.ashx?act=entity&servicesId=' + vm.entity.servicesID)
                .success(function(data) {
                  if (data.result != undefined && data.result == "9999") {
                    window.location.href = "/userlogin.aspx";
                    return false;
                  }
                  angular.extend(vm.entity, data.entity);
                  vm.entity.servicesBegin = $scope.getLocalTime(vm.entity.servicesBegin);
                  vm.entity.servicesEnd = $scope.getLocalTime(vm.entity.servicesEnd);
                });
            };
            vm.cancel = function() {
              $modalInstance.dismiss("cancel");
            };
            //初始化日期选择器
            vm.format = 'yyyy/MM/dd';
            vm.popup = {
              opened: [false, false]
            };

            vm.open = function($event, index) {
              $event.preventDefault();
              $event.stopPropagation();

              vm.popup.opened[index] = true;
            };
          }]
        });

        modalInstance.closed.then(function() {
          $scope.bind();
        });
      };
    }],
    tpl: tpl
  };
});
