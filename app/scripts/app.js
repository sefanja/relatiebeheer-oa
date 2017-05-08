'use strict';

/**
 * @ngdoc overview
 * @name relatiebeheerOaUiApp
 * @description
 * # relatiebeheerOaUiApp
 *
 * Main module of the application.
 */
angular
  .module('relatiebeheerOaUiApp', [
    'ngAnimate',
    'ngCookies',
    'ngMessages',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'smart-table',
    'ui.bootstrap',
    'firebase'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/aanmelden', {
        templateUrl: 'views/aanmelden.html',
        controller: 'AanmeldenCtrl'
      })
      .when('/personen', {
        templateUrl: 'views/personen.html',
        controller: 'PersonenCtrl',
        resolve: {
            currentAuth: ['Auth', function(Auth) {
            return Auth.$requireSignIn();
          }]
        }
      })
      .when('/persoon', {
        templateUrl: 'views/persoon.html',
        controller: 'PersoonCtrl',
        resolve: {
          currentAuth: ['Auth', function(Auth) {
            return Auth.$requireSignIn();
          }]
        }
      })
      .when('/persoon/:id', {
        templateUrl: 'views/persoon.html',
        controller: 'PersoonCtrl',
        resolve: {
          currentAuth: ['Auth', function(Auth) {
            return Auth.$requireSignIn();
          }]
        }
      })
      .otherwise({
        redirectTo: '/aanmelden'
      });
  }).factory('Auth', ['$firebaseAuth',
    function($firebaseAuth) {
      return $firebaseAuth();
    }
  ]).run(['$rootScope', '$location', function($rootScope, $location) {
    $rootScope.$on('$routeChangeError', function (event, next, previous, error) {
      if (error === 'AUTH_REQUIRED') {
        $location.path('/aanmelden');
      }
    });
  }]);
