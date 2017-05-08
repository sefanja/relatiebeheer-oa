// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
'use strict';

/**
 * @ngdoc function
 * @name relatiebeheerOaUiApp.controller:PersoonCtrl
 * @description
 * # PersoonCtrl
 * Controller of the relatiebeheerOaUiApp
 */
angular.module('relatiebeheerOaUiApp')
  .controller('PersoonCtrl', function ($scope, $rootScope, $location, $route, $routeParams, $firebaseObject, $firebaseAuth, $uibModal) {
    var persoon = {};

    // standaardwaarden voor drop-downs
    $scope.geslachten = ['Onbekend', 'Mannelijk', 'Vrouwelijk'];
    $scope.relatiesoorten = ['Onbekend', 'Bekende', 'Bezoeker', 'Toegang ontzegd'];

    // Authentication
    $scope.auth.$onAuthStateChanged(function(firebaseUser) {
      if (firebaseUser) { // authenticated
        if ($routeParams.id) {
          $scope.status.loading++;
          var persoonRef = firebase.database().ref().child('personen').child($routeParams.id);
          persoon = $firebaseObject(persoonRef);
          persoon.$loaded()
            .then(function() {
              $scope.status.loading--;
            })
            .catch(function() {
              $scope.status.loading = -1;
            });
          persoon.$bindTo($scope, 'persoon');
        }
      } else {
        if (persoon) {
          persoon.$destroy(); // disconnect from server
        }
      }
    });

    // Nieuw persoon opslaan.
    $scope.opslaan = function() {
      $scope.status.saving++;
      $scope.personen.$add($scope.persoon).then(function(ref) {
        $scope.status.saving--;
        $location.path('/persoon/' + ref.key);
      }, function() {
        $scope.status.saving = -1;
      });
    };

    // Persoon verwijderen
    $scope.verwijderen = function() {
      var modal = $uibModal.open({
        templateUrl: 'views/modals/verwijderen.html'
      });
      modal.result.then(function() {
        $scope.personen.$remove($scope.personen.$indexFor($scope.persoon.$id)).then(function() {
          $location.path('/personen');
        });
      });
    };

    $scope.nieuwGezinslid = function(persoon) {
      // Niet zichzelf toevoegen.
      if (persoon.$id === $scope.persoon.$id) {
        return;
      }

      // Leden uit oud gezin meenemen?
      var samenvoegen = false;
      if (persoon.huisgezin) {
        // Vraag gebruiker of hij de gezinsleden van de persoon ook mee wil nemen.
        var modal = $uibModal.open({
          templateUrl: 'views/modals/samenvoegen.html'
        });
        modal.result.then(function (samenvoegen) {
          uitvoeren(samenvoegen);
        });
      } else {
        uitvoeren(samenvoegen);
      }

      function uitvoeren(samenvoegen) {
        // Creëer nieuw gezin als dit nog niet bestaat.
        if (!$scope.persoon.huisgezin) {
          var ids = _.map($scope.personen, function(persoon) {
            return persoon.huisgezin;
          });
          var max = _.max(ids);
          $scope.persoon.huisgezin = _.head(_.difference(_.range(1, max + 2), ids));
        }

        if (samenvoegen) {
          _.forEach(_.filter($scope.personen, {huisgezin: persoon.huisgezin}), function(persoon) {
            persoon.huisgezin = $scope.persoon.huisgezin;
            $scope.personen.$save(persoon);
          });
        } else { // niet samenvoegen maar verplaatsen
          persoon.huisgezin = $scope.persoon.huisgezin;
          $scope.personen.$save(persoon);
        }
      }
    };

    $scope.verwijderGezinslid = function(persoon) {
      delete persoon.huisgezin;
      $scope.personen.$save(persoon);
    };
  });
