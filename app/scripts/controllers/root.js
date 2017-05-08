'use strict';

/**
 * @ngdoc function
 * @name relatiebeheerOaUiApp.controller:RootCtrl
 * @description
 * # RootCtrl
 * Controller of the relatiebeheerOaUiApp
 */
angular.module('relatiebeheerOaUiApp')
  .controller('RootCtrl', function ($scope, $rootScope, $location, $firebaseObject, $firebaseArray, $firebaseAuth) {

    // Status: 0 = default, >0 = busy, <0 = error.
    $scope.status = {
      loading: 0,
      saving: 0,
      deleting: 0
    };

    // Authentication
    $scope.auth = $firebaseAuth();
    $scope.auth.$onAuthStateChanged(function(firebaseUser) {
      $scope.firebaseUser = firebaseUser;
      if (firebaseUser) { // if authenticated
        $scope.status.loading++;
        var personenRef = firebase.database().ref().child('personen');
        $scope.personen = $firebaseArray(personenRef);
        $scope.personen.$loaded()
          .then(function() {
            $scope.status.loading--;
            verwijderEenpersoonshuishoudens();
          })
          .catch(function() {
            $scope.status.loading = -1;
          });
      } else { // if not authenticated (after sign out)
        if ($scope.personen) {
          $scope.personen.$destroy(); // disconnect from server
        }
        $location.path('/aanmelden');
      }
    });

    function verwijderEenpersoonshuishoudens() {
      var huisgezinnen = _.groupBy($scope.personen, 'huisgezin');
      delete huisgezinnen[undefined];
      var eenpersoonshuishoudens = _.filter(huisgezinnen, {length: 1});
      _.forEach(eenpersoonshuishoudens, function(lid) {
        delete lid[0].huisgezin;
        $scope.personen.$save(lid[0]);
      });
    }

    // Huidige locatie als actief markeren in navigatiebar.
    $scope.getActiveClass = function (path) {
      return $location.path() === path ? 'active' : '';
    };

    $scope.getters = {
      donateursstatus: function (persoon) {
        if (persoon.donateur) {
          return 'zelf';
        } else if (persoon.huisgezin) {
          if (_.filter($scope.personen, {huisgezin: persoon.huisgezin, donateur: true}).length > 0) {
            return 'gezin';
          }
        }
      },
      naam: function (persoon) {
        if (!persoon) { return ''; }
        var naam = persoon.roepnaam ? persoon.roepnaam : '';
        naam += persoon.tussenvoegsels ? ' ' + persoon.tussenvoegsels : '';
        naam += persoon.achternaam ? ' ' + persoon.achternaam : '';
        naam = naam.trim();
        return naam;
      }
    };

    $scope.bewerk = function(id) {
      $location.path('/persoon/' + id);
    };

    $scope.naarExcel = function() {
      alasql("SELECT * INTO CSV('personen.csv', {headers:true}) FROM ?", [$scope.personen]);
    };
  });
