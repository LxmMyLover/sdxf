define(['angular', 'text!module/shop/reckoning.html'], function(angular, tpl) {

  //angular会自动根据controller函数的参数名，导入相应的服务
  return {
    controller: ['$scope', '$rootScope', '$routeParams', '$http', '$cookieStore', '$q', '$location', '$timeout', function($scope, $rootScope, $routeParams, $http, $cookieStore, $q, $location, $timeout) {
      $scope.$parent.isShopUser = true;
      $scope.$parent.setTitle();
      var provinces = [];
      var citiesLookup = {};
      var districtsLookup = {};

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

      $scope.users = {
        userMoney: 0, //可用资金
        frozenMoney: 0, //冻结资金
        payPoints: 0 //消费积分
      };

      $scope.goodsAmount = 0; //商品总价
      $scope.shippingFee = 0; //运费
      $scope.discount = 0; //折扣
      $scope.surplus = 0; //使用余额
      $scope.integralMoney = 0; //使用积分
      $scope.integralScale = 0.01; //积分换算比例
      $scope.integral = 0; //积分购买额度
      $scope.bonus = 0; //使用红包
      $scope.postScript = ''; //订单附言
      $scope.orderAmount = 0; //订单总费用
      $scope.clist = []; //商品清单
      $scope.status = {
        users: {
          loader: true,
          error: false,
          html: ''
        },
        address: {
          loader: true,
          error: false,
          html: ''
        },
        cart: {
          loader: true,
          error: false,
          html: ''
        }
      };


      //使用余额允许的最大值
      $scope.maxSurplus = function() {
        return Math.min(
          $scope.users.userMoney -
          $scope.users.frozenMoney,

          $scope.goodsAmount +
          $scope.shippingFee -
          $scope.discount -
          $scope.integralMoney * $scope.integralScale -
          $scope.bonus
        );
      };

      //使用积分允许的最大值
      $scope.maxIntegralMoney = function() {
        return Math.min(
          Math.min($scope.users.payPoints, $scope.integral), (
            $scope.goodsAmount +
            $scope.shippingFee -
            $scope.discount -
            $scope.surplus -
            $scope.bonus
          ) * 100);
      };

      $scope.ajaxUsers = function() {
        $scope.status.users = {
          loader: true,
          error: false,
          html: '正在努力加载中...'
        };
        $http.get('webapi/shop/users.ashx?act=entity')
          .success(function(data) {
            angular.extend($scope.users, data.entity);
            $scope.status.users = {
              loader: false,
              error: false
            };
          })
          .error(function(data) {
            $scope.status.users = {
              loader: false,
              error: true,
              html: '读取用户信息失败了，请<a href="" ng-click="ajaxUsers()"> <strong>点击刷新</strong> </a>重试！'
            };
          });
      };

      $scope.ajaxAddress = function() {
        $scope.status.address = {
          loader: true,
          error: false,
          html: '正在努力加载中...'
        };
        $http.get('webapi/shop/userAddress.ashx?act=entity')
          .success(function(data) {
            $scope.userAddress = angular.copy(data.entity, {});

            //联动下拉就绪
            $scope.selectReady = true;

            $scope.status.address = {
              loader: false,
              error: false
            };

            //如果没有填写过收货信息，则展开表单
            if (!$scope.userAddress.addressId) {
              $scope.isCollapsed = false;
            }
          })
          .error(function(data) {
            $scope.status.address = {
              loader: false,
              error: true,
              html: '读取收货人信息失败了，请<a href="" class="alert-link" ng-click="ajaxAddress()"> 点击刷新 </a>重试！'
            };
          });
      };

      $scope.ajaxCart = function() {
        $scope.status.cart = {
          loader: true,
          error: false,
          html: '正在努力加载中...'
        };
        $http.get('webapi/shop/car.ashx?act=list')
          .success(function(data) {
            $scope.clist = data.list;

            angular.forEach(data.list, function(item) {
              $scope.goodsAmount += item.goodsPrice * item.goodsNumber;
            });
            $scope.status.cart = {
              loader: false,
              error: false
            };


              //采购数量的加减函数
              $scope.plus = function(i) {//添加数量
                  var model = $scope.clist[i];
                  $scope.money = $scope.clist[0].goodsNumber*$scope.clist[0].goodsPrice;
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
              $scope.minus = function(i) {//减少数量

                  var model = $scope.clist[i];
                  $scope.money = $scope.clist[0].goodsNumber*$scope.clist[0].goodsPrice;
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

              $scope.update = function(i) {//数量的变化绑定

                  var model = $scope.clist[i];

                  if (!regexp.test(model.goodsNumber) || parseFloat(model.goodsNumber) < 1) {
                      model.goodsNumber = 1;
                  }
                  // $scope.money = $scope.clist[0].goodsNumber*$scope.clist[0].goodsPrice;
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
              $scope.money = $scope.clist[0].goodsNumber*$scope.clist[0].goodsPrice;
              console.log($scope.clist)

          })
          .error(function(data) {
            $scope.status.cart = {
              loader: false,
              error: true,
              html: '读取商品清单失败了，请<a href="" class="alert-link" ng-click="ajaxCart"> 点击刷新 </a>重试！'
            };
          });
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
            $scope.isCollapsed = true;
          })
          .error(function(data) {
            sm.show({
              title: '提示消息',
              contents: '请求失败了，稍后重试！'
            });
          })['finally'](function() { // .finally的写法在IE8报错
            $scope.myForm.$invalid = false;
          });
      };

      if (typeof UE === 'undefined' || typeof UE.ui === 'undefined') {
        UE = baidu.editor;
      }

      var uploadEditor = UE.getEditor("uploadEditor", {
        isShow: false,
        focus: false,
        enableAutoSave: false,
        autoSyncData: false,
        autoFloatEnabled: false,
        wordCount: false,
        sourceEditor: null,
        scaleEnabled: true,
        toolbars: [
          ["attachment"]
        ]
      });
      // 附件上传
      function _afterUpfile(t, result) {
        var fileHtml = '';
        for (var i in result) {
          $scope.filePath = '/libs' + result[i].url;
          fileHtml += '<li><a href="/libs' + result[i].url + '" target="_blank">' + result[i].url + '</a></li>';
        }
        document.getElementById('upload_file_wrap').innerHTML = fileHtml;
      }
      uploadEditor.ready(function() {
        // 监听插入附件
        uploadEditor.addListener("afterUpfile", _afterUpfile);
      });

      $scope.upload_file = function() {
        var dialog = uploadEditor.getDialog("attachment");
        dialog.title = '附件上传';
        dialog.render();
        dialog.open();
      };

      $scope.postReckoning = function() {

        var sm = new SimpleModal({
          width: 300,
          center: true,
          hideFooter: true,
          autoClose: true
        });

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

        if ($cookieStore.get('sdxfshoporgcat') != '1') {
          sm.show({
            title: '提示消息',
            contents: '您不是采购者，不能下单！'
          });
          return;
        }

        // if (!$scope.filePath) {
        //   sm.show({
        //     title: '提示消息',
        //     contents: '请先上传附件！'
        //   });
        //   return;
        // }

        sm_loading.show({
          model: 'modal-loading'
        });

        var url = '/payment';

        $http.post('webapi/shop/orderInfo.ashx?act=save', {
            filePath: $scope.filePath || '',
            postScript: $scope.postScript,
            surplus: $scope.surplus,
            integral: $scope.integralMoney,
            integralMoney: $scope.integralMoney * $scope.integralScale,
            bonus: $scope.bonus,
            discount: $scope.discount,
            goodsAmount: $scope.goodsAmount,
            orderAmount: $scope.goodsAmount +
              $scope.shippingFee -
              $scope.discount -
              $scope.surplus -
              $scope.integralMoney * $scope.integralScale -
              $scope.bonus
          })
          .success(function(data) {
            data.result && sm.on('hidden', function() {
              $timeout(function() {
                $location.path(url);
                sm_loading.hide();
              });
            });
            sm.show({
              title: '提示消息',
              contents: data.result ? '<p>订单提交成功！</p>\
					    <p><a href="#' + url + '">如果您的浏览器没有自动跳转，请点击此链接</a></p>' : data.msg
            });
          })
          .error(function(data) {
            sm.show({
              title: '提示消息',
              contents: '订单提交失败了！'
            });
            console, log(data);
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

        if (values.province) {
          $http.get('webapi/shop/region.ashx?act=list&regionId=' + values.province).success(function(data) {

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
        } else {
          deferred.resolve([]);
        }

        return deferred.promise;
      };

      $scope.getDistricts = function(values) {

        var deferred = $q.defer();

        if (values.city) {
          $http.get('webapi/shop/region.ashx?act=list&regionId=' + values.city).success(function(data) {

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
        } else {
          deferred.resolve([]);
        }

        return deferred.promise;
      };


      $scope.$watch('userAddress.province.regionId', function(newValue, oldValue) {

        $scope.userAddress.province.regionName = '省';

        angular.forEach(provinces, function(item, index) {
          if (item.value == newValue)
            $scope.userAddress.province.regionName = item.text;
        })
      });

      $scope.$watch('userAddress.city.regionId', function(newValue, oldValue) {

        $scope.userAddress.city.regionName = '市';

        angular.forEach(citiesLookup[$scope.userAddress.province.regionId], function(item, index) {
          if (item.value == newValue)
            $scope.userAddress.city.regionName = item.text;
        })
      });

      $scope.$watch('userAddress.district.regionId', function(newValue, oldValue) {

        $scope.userAddress.district.regionName = '区';

        angular.forEach(districtsLookup[$scope.userAddress.city.regionId], function(item, index) {
          if (item.value == newValue)
            $scope.userAddress.district.regionName = item.text;
        })
      });

      $http.get('webapi/shop/users.ashx?act=checkLogin').success(function(response) {
        //检测是否登录
        // if (response.result != undefined && response.result == "9999") {
        //   window.location.href = "/userlogin.aspx";
        //   return false;
        // } else {
          $scope.ajaxUsers();
          $scope.ajaxAddress();
          $scope.ajaxCart();
        // }
      });

    }],
    tpl: tpl
  };
});
