// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
'use strict';

/**
 * @ngdoc function
 * @name relatiebeheerOaUiApp.controller:AanmeldenCtrl
 * @description
 * # AanmeldenCtrl
 * Controller of the relatiebeheerOaUiApp
 */
angular.module('relatiebeheerOaUiApp')
  .controller('AanmeldenCtrl', function ($scope, $location, $firebaseAuth) {
    $scope.auth = $firebaseAuth();
    $scope.auth.$onAuthStateChanged(function(firebaseUser) {
      if (firebaseUser) {
        $location.path('/personen');
      }
    });
  });
