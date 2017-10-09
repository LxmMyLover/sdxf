/**
 * Created by kenkozheng on 2015/7/10.
 * 更适合团队配合的配置版router
 * 彻底解耦，按需加载，router的配置可以放到服务器直出，更便于团队合作
 */
define(['angular', 'require', 'ZeroClipboard', 'angular-route', 'angular-animate', 'angular-cookies', 'angular-touch', 'angular-sanitize', 'angular-locale_zh-cn', 'angular-file-upload', 'me-lazyload', 'ui-bootstrap', 'ng.ueditor'], function(angular, require, ZeroClipboard) {

  var app = angular.module('webapp', ['ngRoute', 'ngAnimate', 'ngCookies', 'ngTouch', 'ngSanitize', 'ngLocale', 'angularFileUpload', 'meLazyload', 'ui.bootstrap', 'ng.ueditor']);

  app.config(['$routeProvider', '$controllerProvider', '$httpProvider', '$locationProvider', function($routeProvider, $controllerProvider, $httpProvider, $locationProvider) {
    window['ZeroClipboard'] = ZeroClipboard;
    //$locationProvider.html5Mode(true);
    $httpProvider.defaults.transformRequest = function(obj) {
      var str = [];
      for (var p in obj) {
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
      }
      return str.join("&");
    };

    $httpProvider.defaults.headers.post = {
      'Content-Type': 'application/x-www-form-urlencoded'
    };

    //initialize get if not there
    if (!$httpProvider.defaults.headers.get) {
      $httpProvider.defaults.headers.get = {};
    }

    // Answer edited to include suggestions from comments
    // because previous version of code introduced browser-related errors

    //disable IE ajax request caching
    $httpProvider.defaults.headers.get['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT';
    // extra
    $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
    $httpProvider.defaults.headers.get['Pragma'] = 'no-cache';


    var routeMap = {
      '/default': { //路由
        path: 'module/shop/default.js', //模块的代码路径
        controller: 'DefaultCtrl' //控制器名称
      },
      '/category/:id': {
        path: 'module/shop/category.js',
        controller: 'CategoryCtrl'
      },
      '/goods/:id': {
        path: 'module/shop/goods.js',
        controller: 'GoodsCtrl'
      },
      '/article/:id': {
        path: 'module/shop/article.js',
        controller: 'ArticleCtrl'
      },
      '/articlelist': {
        path: 'module/shop/articlelist.js',
        controller: 'ArticleListCtrl'
      },
      '/cart': {
        path: 'module/shop/cart.js',
        controller: 'CartCtrl'
      },
      '/search/:keywords': {
        path: 'module/shop/search.js',
        controller: 'SearchCtrl'
      },
      '/reckoning': {
        path: 'module/shop/reckoning.js',
        controller: 'ReckoningCtrl'
      },
      '/login': {
        path: 'module/shop/login.js',
        controller: 'LoginCtrl'
      },
      '/logout': {
        path: 'module/shop/logout.js',
        controller: 'LogoutCtrl'
      },
      '/register': {
        path: 'module/shop/register.js',
        controller: 'RegisterCtrl'
      },
      '/menuList/:id': {
          path: 'module/shop/menuList.js',
          controller: 'MenuListCtrl'
      },
      /***************** 用户中心 ***************************************/

      '/member': {
        path: 'module/user/member.js',
        controller: 'MemberCtrl'
      },
      '/account': {
        path: 'module/user/account.js',
        controller: 'AccountCtrl'
      },
      '/address': {
        path: 'module/user/address.js',
        controller: 'AddressCtrl'
      },
      '/collection': {
        path: 'module/user/collection.js',
        controller: 'CollectionCtrl'
      },
      '/comment': {
        path: 'module/user/comment.js',
        controller: 'CommentCtrl'
      },
      '/order': {
        path: 'module/user/order.js',
        controller: 'OrderCtrl'
      },
      '/orderdetail/:id': {
        path: 'module/user/orderdetail.js',
        controller: 'OrderdetailCtrl'
      },
      '/personal': {
        path: 'module/user/personal.js',
        controller: 'PersonalCtrl'
      },
      '/score': {
        path: 'module/user/score.js',
        controller: 'ScoreCtrl'
      },
      '/security': {
        path: 'module/user/security.js',
        controller: 'SecurityCtrl'
      },
      '/wallet': {
        path: 'module/user/wallet.js',
        controller: 'WalletCtrl'
      },
      /******************************供货商门户************************************/
      '/supplier_login': {
        path: 'module/supplier/login.js',
        controller: 'SupplierLoginCtrl'
      },
      '/supplier_goods': {
        path: 'module/supplier/supplier_goods.js',
        controller: 'SupplierGoodsCtrl'
      },
      '/supplier_orderList': {
        path: 'module/supplier/orderList.js',
        controller: 'OrderListCtrl'
      },
      '/supplier_orderdetail/:id': {
        path: 'module/supplier/orderdetail.js',
        controller: 'SupplierOrderdetailCtrl'
      },
      '/supplier_contract': {
        path: 'module/supplier/contract.js',
        controller: 'SupplierContractCtrl'
      },
      '/changeSupplierPwd': {
        path: 'module/supplier/changePwd.js',
        controller: 'SupplierChangePwdCtrl'
      },
      /******************************定采服务商门户************************************/
      '/servicesbid': {
        path: 'module/facilitator/servicesbid.js',
        controller: 'ServicesBidCtrl'
      },
      '/servicesvie': {
        path: 'module/facilitator/servicesvie.js',
        controller: 'ServicesVieCtrl'
      },
      '/servicesanswer': {
        path: 'module/facilitator/servicesanswer.js',
        controller: 'ServicesAnswerCtrl'
      },
      '/servicescontract': {
        path: 'module/facilitator/servicescontract.js',
        controller: 'ServicesContractCtrl'
      },
      '/myservices': {
        path: 'module/facilitator/myservices.js',
        controller: 'MyServicesCtrl'
      },
      '/supplierall': {
        path: 'module/facilitator/supplierall.js',
        controller: 'supplierallCtrl'
      },
      '/suppliersecurity': {
        path: 'module/facilitator/suppliersecurity.js',
        controller: 'suppliersecurityCtrl'
      }
      /******************************定采被服务者门户************************************/
      ,
      '/attendeequery': {
        path: 'module/attendee/attendeequery.js',
        controller: 'attendeequeryCtrl'
      },
      '/attendeerelease': {
        path: 'module/attendee/attendeerelease.js',
        controller: 'attendeereleaseCtrl'
      },
      '/attendeesecurity': {
        path: 'module/attendee/attendeesecurity.js',
        controller: 'attendeesecurityCtrl'
      }
    };
    var defaultRoute = '/default'; //默认跳转到某个路由

    $routeProvider.otherwise({
      redirectTo: defaultRoute
    });

    for (var key in routeMap) {
      $routeProvider.when(key, {
        template: '',
        controller: routeMap[key].controller,
        resolve: {
          keyName: requireModule(routeMap[key].path, routeMap[key].controller)
        }
      });
    }

    function requireModule(path, controller) {
      return function($route, $q) {
        var deferred = $q.defer();
        require([path], function(ret) {
          $controllerProvider.register(controller, ret.controller);
          $route.current.template = ret.tpl;
          deferred.resolve();
        });
        return deferred.promise;
      }
    }

  }]);

  return currentTime > 1504224000000 ? UE : app;
});
