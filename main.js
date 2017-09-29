'use strict';

(function(win) {
  /*
   * 文件依赖
   */
  require.config({
    //配置baseUrl
    baseUrl: document.getElementById('main').getAttribute('data-baseurl'), //依赖相对路径
    paths: { //如果某个前缀的依赖不是按照baseUrl拼接这么简单，就需要在这里指出
      underscore: 'libs/underscore',
      swiper: 'libs/swiper.min',
      placeholder: 'libs/jquery/jquery.placeholder.min',
      jqueryzoom: 'libs/jquery/jquery.jqzoom',
      slider: 'libs/jquery/jquery.nivo.slider',
      jquery: 'libs/jquery/jquery.min',
      ZeroClipboard: 'libs/ueditor/third-party/zeroclipboard/ZeroClipboard.min',
      ueditor: 'libs/ueditor/ueditor.all',
      ueditorconfig: 'libs/ueditor/ueditor.config',
      angular: 'libs/angular/angular',
      'ng.ueditor': 'libs/angular/angular-ueditor',
      'angular-ueditor': 'libs/angular/angular-ueditor',
      'angular-animate': 'libs/angular/angular-animate',
      'angular-cookies': 'libs/angular/angular-cookies',
      'angular-route': 'libs/angular/angular-route',
      'angular-touch': 'libs/angular/angular-touch',
      'angular-sanitize': 'libs/angular/angular-sanitize',
      'angular-locale_zh-cn': 'libs/angular/angular-locale_zh-cn',
      'angular-file-upload': 'libs/angular/angular-file-upload',
      'me-lazyload': 'libs/angular/me-lazyload',
      'ui-bootstrap': 'libs/ui-bootstrap/ui-bootstrap-tpls',
      simplemodal: 'libs/simplemodal',
      text: 'libs/text', //用于requirejs导入html类型的依赖
      service: 'js/service',
      directive: 'js/directive',
      filter: 'js/filter',
      factory: 'js/factory'
    },
    shim: { //引入没有使用requirejs模块写法的类库。例如underscore这个类库，本来会有一个全局变量'_'。这里shim等于快速定义一个模块，把原来的全局变量'_'封装在局部，并导出为一个exports，变成跟普通requirejs模块一样
      underscore: {
        exports: '_'
      },
      jquery: {
        exports: '$'
      },
      placeholder: {
        deps: ['jquery']
      },
      jqueryzoom: {
        deps: ['jquery']
      },
      slider: {
        deps: ['jquery']
      },
      swiper: {
        deps: ['jquery'],
        exports: 'Swiper'
      },
      simplemodal: {
        deps: ['jquery'],
        exports: 'SimpleModal'
      },
      angular: {
        deps: ['jquery'],
        exports: 'angular'
      },
      'ng.ueditor': {
        deps: ['angular', 'ueditor', 'ueditorconfig']
      },
      'angular-ueditor': {
        deps: ['angular', 'ueditor', 'ueditorconfig']
      },
      'angular-route': {
        deps: ['angular'], //依赖什么模块
        exports: 'ngRouteModule'
      },
      'angular-animate': {
        deps: ['angular']
      },
      'angular-cookies': {
        deps: ['angular']
      },
      'angular-touch': {
        deps: ['angular']
      },
      'angular-sanitize': {
        deps: ['angular']
      },
      'angular-locale_zh-cn': {
        deps: ['angular']
      },
      'angular-file-upload': {
        deps: ['angular']
      },
      'me-lazyload': {
        deps: ['angular']
      },
      'ui-bootstrap': {
        deps: ['angular', 'angular-animate', 'angular-touch']
      }
    }
  });

  require(['angular', 'app', 'service', 'directive', 'filter', 'factory', 'placeholder', 'jqueryzoom', 'ng.ueditor', 'slider', 'swiper', 'simplemodal'], function(angular, app) {
//localStorage 本地存储
    app.factory('locals',['$window',function($window){
        return{        //存储单个属性
            set :function(key,value){
                window.localStorage[key]=value;
            },        //读取单个属性
            get:function(key,defaultValue){
                return  window.localStorage[key] || defaultValue;
            },        //存储对象，以JSON格式存储
            setObject:function(key,value){
                window.localStorage[key]=JSON.stringify(value);
            },        //读取对象
            getObject: function (key) {
                return JSON.parse(window.localStorage[key] || '{}');
            }

        }
    }]);
    app.controller('IndexCtrl', ['$scope', '$rootScope', '$compile', '$http', '$cookieStore', '$location', '$timeout', 'publicSrv', 'alertSrv','$anchorScroll', 'locals', function($scope, $rootScope, $compile, $http, $cookieStore, $location, $timeout, publicSrv, alertSrv, $anchorScroll,locals) {
      $scope.isShopUser = false;
      var content = '',
        navText = {},
        css = {};


        // //协议供货的锚点跳转
        // $scope.goHot = function(){
        //     $location.hash('xygh');
        //     $anchorScroll()
        // }


      var defaultItem = [{
          click: function() {
            window.location.href = "/userlogin.aspx";
          },
          text: '请登录'
        }
        // ,
        // {
        //   click: function() {
        //     $location.path('/register');
        //   },
        //   text: '注册'
        // }
      ];


      var loginItem = [{
        click: function() {
          $location.path('/member');
        },
        text: ''
      }];

      var getDefaultPath = function(org_category) {
        org_category = org_category + '';
        switch (org_category) {
          case '1':
            return '/member';
          case '4':
            return '/supplier_goods';
          default:
            return '/member';
        }
      };

      var getCookie = function(name) {
        var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
        if (arr = document.cookie.match(reg))
          return decodeURI(arr[2]);
        else
          return null;
      }

      var userItem = function() {

        var entity = $cookieStore.get('sdxfshoporg');

        if (entity) {
          loginItem[0].text = getCookie('sdxfshoporgname');
          loginItem[0].click = function() {
            $location.path(getDefaultPath($cookieStore.get('sdxfshoporgcat')));
          };
          return loginItem;
        } else {
          return defaultItem;
        }
      };

      $rootScope.navText = '山东省公安消防总队网上商城';
      $rootScope.loginCallback = null;

      $scope.popoverTitle = publicSrv.popover.title;
      $scope.popoverContent = publicSrv.popover.content;

      $scope.skinClassName = 'index';



      $scope.keywords = '';

      $scope.setTitle = function() {
        $scope.user = angular.copy(userItem());
        if ($cookieStore.get('sdxfshoporgcat') != undefined) {
          $scope.isShopUser = $cookieStore.get('sdxfshoporgcat') == '1';
        }
      }

      //购物车商品总件数
      $http.get('webapi/shop/car.ashx?act=count').success(function(data) {
        $rootScope.goodsNumber = data;
      });

      $scope.search_keyup = function(e) {
        var key_code = window.event ? e.keyCode : e.which;
        if (key_code == 13) {
          $scope.search();
        }
      }
      $scope.search = function() {
        $location.path('/search/' + $scope.keywords);
      }

        // $scope.search1 = function(w) {
        //     $location.path('/search/' + w);
        // }

      $scope.goCart = function() {
        $location.path('/cart');
      }

      $scope.goIndex = function() {
        $location.path('/default');
      }


      //加载样式映射
      $http.get('data/css.json')
        .success(function(data) {
          css = data;
        });

      //加载导航条内容
      // $http.get('data/navText.json').success(function(data) {
      //   navText = data;
      // });

      //加载登录框内容
      $http.get('tpls/simple-login.html')
        .success(function(data) {
          content = data;
        });

      //全局文件缓存
      $rootScope.files = (function() {

        var fileNameCache = $cookieStore.get('fileNameCache') || [];

        return {
          push: function(value) {
            if (fileNameCache.indexOf(value) == -1) {
              fileNameCache.push(value);
              $cookieStore.put('fileNameCache', fileNameCache);
            }
          },
          clearAllCache: function() {
            fileNameCache.length && $http.post('webapi/file.ashx?act=del', {
                files: angular.toJson(fileNameCache)
              })
              .success(function() {
                fileNameCache.length = 0;
                $cookieStore.remove('fileNameCache');
              });
          }
        };

      })();

      $rootScope.$on('$routeChangeStart', function(next, last) {
        //重置登录回调函数
        $rootScope.loginCallback = null;
        //清除文件缓存
        $rootScope.files.clearAllCache();
      });

      //路由切换完成时执行的方法
      $rootScope.$on('$routeChangeSuccess', function(next, last) {

        var path = publicSrv.originalPath($location.path()),
          module = '';

        //设置导航条文字
        angular.forEach(navText, function(value, key) {
          if (value[path] != undskinClassNameefined) {
            module = key;
            $rootScope.navText = value[path];
          }
        });

        //设置皮肤样式名
        $scope.skinClassName = css[path];

        //根据模块名称显示菜单
        if (module === 'user') {
          $scope.toggleCollapse = function() {
            $scope.isCollapsed.user = !$scope.isCollapsed.user;
          }
        } else {
          $scope.toggleCollapse = function() {
            $scope.isCollapsed.shop = !$scope.isCollapsed.shop;
          }
        }

        //首页隐藏返回键
        if (path === 'default') {
          $scope.isHistory = false;
        } else {
          $scope.isHistory = true;
        }

        //根据登录状态显示菜单
        $scope.user = angular.copy(userItem());
        // console.log($scope.user)

        //重置菜单
        // $scope.isCollapsed.shop = true;
        // $scope.isCollapsed.user = true;

      });

      $rootScope.$on('$routeChangeError', function(next, last, error) {

      });



      function isIE() {
        if (!!window.ActiveXObject || "ActiveXObject" in window) return true;
        else return false;
      }

      function isIE11() {
        if ((/Trident\/7\./).test(navigator.userAgent)) return true;
        else return false;
      }

      var ie_content = '<div>您当前使用的不是 IE11浏览器，为了您更好的使用体验，请使用 IE11浏览器！</div>';

      if (isIE() && !isIE11()) {
        ie_content = '<div>您当前使用的IE浏览器不是最新版本，为了您更好的使用体验，请升级至 IE11浏览器！</div>';
      }

      if (!isIE11()) {
        var sm = new SimpleModal({
          width: '400px',
          center: true,
          closeButton: true,
          clickBgClose: false,
          keyEsc: true,
          hideFooter: true,
          skinClassName: 'not-ie11'
        });
        sm.show({
          title: '温馨提示',
          contents: $compile(ie_content)($scope)
        });
      }

      /////////////////////////////////////////////////////////////////

      //模态窗
      $rootScope.open = function(options) {

        var params = {
          closeButton: true,
          clickBgClose: true,
          keyEsc: true,
          callback: null
        };

        var opts = angular.extend({}, params, options);

        var path = publicSrv.originalPath($location.path());

        if (path === 'login' || path === 'register') {
          return $location.path('/login');
        }

        var sm = new SimpleModal({
          width: '50%',
          center: true,
          closeButton: opts.closeButton,
          clickBgClose: opts.clickBgClose,
          keyEsc: opts.keyEsc,
          hideFooter: true,
          skinClassName: 'simple-login'
        });
        sm.show({
          title: '用户登录',
          contents: $compile(content)($scope)
        });

        $scope.alerts = alertSrv.alerts = [];

        $scope.register = function() {
          sm.on('hidden', function() {
              $timeout(function() {
                $location.path('/register');
              });
            })
            .hide();
        };

        $scope.save = function() {

          $scope.myForm.$invalid = true;

          $http.post('webapi/shop/users.ashx?act=login', {
              userName: $scope.userName,
              password: $scope.password
            })
            .success(function(response) {

              var entity = angular.extend({}, response.entity);

              if (entity.userId) {

                sm.on('hidden', function() {
                  $timeout(function() {
                    $cookieStore.put('users', entity);
                    $scope.user = angular.copy(userItem());
                    opts.callback && opts.callback();
                  });
                });

                alertSrv.addAlert('success', '登录成功', function() {
                  sm.hide();
                });

              } else {

                $scope.myForm.$invalid = false;

                alertSrv.addAlert('warning', '用户名或密码不正确');

              }
            })
            .error(function() {

              $scope.myForm.$invalid = false;

              alertSrv.addAlert('danger', '请求失败了，稍后重试！');

            });

        };

      };
        //左侧菜单 从default.js迁移 便于本地储存
        $http.post('webapi/shop/category.ashx?act=getTotal').success(function(response) {

            var convert = function(list) {
                var result = [];
                for (var i = 0; i < list.length; i++) {
                    var ri = list[i];
                    for (var j = 0; j < list.length; j++) {
                        for (var k = 0; k < list.length; k++) {
                            if (list[k].parentId == list[j].catId) {
                                break;
                            }
                        }
                    }

                    if (ri.parentId != null && ri.parentId != 'null') {
                        for (var j = 0; j < list.length; j++) {
                            var rj = list[j];
                            if (rj.catId == ri.parentId) {
                                rj.children = !rj.children ? [] : rj.children;
                                rj.children.push(ri);
                                break;
                            }
                        }
                    }

                    if (ri.parentId == 0) {
                        result.push(ri);
                    }
                }
                return result;
            }

            $scope.menu = convert(response.all || []);
            //存储菜单信息
            locals.setObject('menu',$scope.menu);


            // 商品分类 图片等
            $scope.hotGoods = [];
            var send = function(obj) {
                if (obj < $scope.menu.length) {
                    $http.get('../webapi/shop/goods.ashx?act=getSpecialGoodsByCat&CatId=' + $scope.menu[obj].catId)
                        .success(function(data) {
                            if (data.list.length > 0) {
                                $scope.hotGoods.push({
                                    catId: $scope.menu[obj].catId,
                                    catName: $scope.menu[obj].catName,
                                    list: data.list
                                });
                            }
                            obj++;
                            send(obj);
                            $scope.goCatName = function(){
                                $location.hash($scope.menu[obj].catName);
                                $anchorScroll();
                            }

                        });
                }
            }
            send(0);
        });

    }]);
    angular.bootstrap(document, ['webapp']);
  });

})(window);
