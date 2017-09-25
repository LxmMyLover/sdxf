define(['angular', 'text!module/user/address.html'], function(angular, tpl) {

  //angular会自动根据controller函数的参数名，导入相应的服务
  return {
    controller: ['$scope', '$rootScope', '$routeParams', '$http', '$cookieStore', '$q', function($scope, $rootScope, $routeParams, $http, $cookieStore, $q) {
      // $scope.$parent.isShopUser = true;
      var provinces = [];
      var citiesLookup = {};
      var districtsLookup = {};

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

        $http.get('webapi/shop/userAddress.ashx?act=entity')
          .success(function(data) {

            $scope.userAddress = angular.copy(data.entity, {});

            $scope.selectReady = true;

            sm_loading.hide();
          });
      };

      $scope.userAddress = {
        addressId: 0,
        consignee: '', //收货人
        mobile: '', //手机
        tel: '', //电话
        zipCode: '', //邮编
        country: {
          regionId: 1,
          regionName: '中国'
        }, //国家
        province: {
          regionId: 2,
          regionName: '北京'
        }, //省
        city: {
          regionId: 36,
          regionName: '北京'
        }, //市
        district: {
          regionId: 399,
          regionName: '东城区'
        }, //区县
        address: '' //详细地址
      };

      $scope.save = function() {

        $scope.myForm.$invalid = true;

        var sm = new SimpleModal({
          width: 300,
          center: true,
          hideFooter: true,
          autoClose: true
        });

        var params = {
          consignee: $scope.userAddress.consignee || '',
          mobile: $scope.userAddress.mobile || '',
          tel: $scope.userAddress.tel || '',
          zipCode: $scope.userAddress.zipCode || '',
          //country: $scope.userAddress.country.regionId,
          province: $scope.userAddress.province.regionId,
          city: $scope.userAddress.city.regionId,
          district: $scope.userAddress.district.regionId,
          address: $scope.userAddress.address || ''
        }
        if ($scope.userAddress.addressId) {
          params["addressId"] = $scope.userAddress.addressId;
        }

        $http.post('webapi/shop/userAddress.ashx?act=save', params)
          .success(function(data) {
            sm.show({
              title: '提示消息',
              contents: data.result ? '更新数据成功了' : '更新数据失败了'
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

      $scope.getProvinces = function() {

        var deferred = $q.defer();

        $http.get('webapi/shop/region.ashx?act=list&regionId=1')
          .success(function(data) {

            angular.forEach(data.list, function(item, index) {

              provinces.push({
                text: item.regionName,
                value: item.regionId
              });

            });

            deferred.resolve(provinces);

          });

        return deferred.promise;
      };

      $scope.getCities = function(values) {

        var deferred = $q.defer();

        $http.get('webapi/shop/region.ashx?act=list&regionId=' + values.province)
          .success(function(data) {

            if (values.province > 0) {
              var cities = [];

              angular.forEach(data.list, function(item, index) {

                cities.push({
                  text: item.regionName,
                  value: item.regionId
                });

              });

              citiesLookup[values.province] = cities;
            }

            deferred.resolve(citiesLookup[values.province] || []);

          });

        return deferred.promise;
      };

      $scope.getDistricts = function(values) {

        var deferred = $q.defer();

        $http.get('webapi/shop/region.ashx?act=list&regionId=' + values.city)
          .success(function(data) {

            if (values.city > 0) {
              var districts = [];

              angular.forEach(data.list, function(item, index) {

                districts.push({
                  text: item.regionName,
                  value: item.regionId
                });

              });

              districtsLookup[values.city] = districts;
            }

            deferred.resolve(districtsLookup[values.city] || []);

          });

        return deferred.promise;
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
