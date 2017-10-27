'use strict';

var app = angular.module('digitalServicesMapping', [

]);

app.controller('digitalServicesMappingCtrl', ['$scope', '$window', '$http', '$filter', 
  function($scope, $window, $http, $filter) {

    // Variables
    var lines, sankey;
    var structuredDataByKey = {};
    var setDataArray = [];
    var defaultLineWeight = 6;
    var filterObject = {};

    // Scope variables
    $scope.structuredDataByLine = [];
    $scope.structuredDataByLineCopy = [];
    $scope.columnHeadings = [];
    $scope.deDupArrays = [];
    $scope.filters = [];

    // Create Sankey visualisation
    //sankey = new Sankey();

    // Get CSV file from Google Sheets
    $http.get('https://docs.google.com/spreadsheets/d/e/2PACX-1vTBpn1SGb07pajD6kdpznEG6p3weD5ZUukT_wNefBREEx-8d5r03x_H_Jsh2nra-isRg7jTXsXI7cUB/pub?gid=0&single=true&output=csv').then(function(response){

      // Once we've got it, process data
      //console.log(response.data);
      splitLines(response.data);
      getKeys(response.data);
      createObject();

      // createArrays();
      // setVisualisationData();
      // setDataFormat();
      // setSankey();

    });

    // Watch structuredDataByLine to rebuild visualisation
    $scope.$watchCollection('structuredDataByLine', function(newVals, oldVals) {
      //console.log(newVals);
      resetSankey();
      createArrays();
      setVisualisationData();
      setDataFormat();
      setSankey();
      $('#sankey svg').attr('height', '2400');
    });

    // Filter data
    $scope.filterData = function(filterValue, checked, columnHeading) {
      // Reset data to unfiltered state
      $scope.structuredDataByLine = $scope.structuredDataByLineCopy;
      // Reset filter checkboxes
      $scope.filters = [];
      console.log($scope.structuredDataByLine);
      console.log($scope.structuredDataByLineCopy);
      console.log(filterObject);
      if(checked) {
        // Reset the filter onbject we use to filter data
        filterObject = [];
        filterObject[columnHeading] = filterValue;
        // Filter data
        var filteredData = $filter('filter')($scope.structuredDataByLine, filterObject);
        $scope.structuredDataByLine = filteredData;
        // Check checked checkbox we weve reset the filters
        $scope.filters[columnHeading] = [];
        $scope.filters[columnHeading][filterValue] = true;
      }
      // Iterate through lines in data
      // angular.forEach($scope.structuredDataByLine, function(line, index) {
      //   var lineRemoved = false;
      //   // Iterate through items in each line
      //   angular.forEach(line, function(value, key) {
      //     // If the corresponding checkbox in unchecked, remove from data
      //     if(!$scope.filters[columnHeading][filterValue] && !lineRemoved) {
      //       $scope.structuredDataByLine.splice(index, 1);
      //       var lineRemoved = true;
      //     }
      //   });
      // });
      console.log($scope.structuredDataByLine);
    }

    // Workout how many columns to include on filter
    $scope.getFilterColumnWidth = function(columnHeadingsLength) {
      return 12 / columnHeadingsLength
    }
    
    // Split each line in the CSV files
    var splitLines = function(data) {
      lines = data.split('\n');
    }

    // Get the column headings (first line of CSV)
    var getKeys = function(data) {
      $scope.columnHeadings = lines[0].split(',');
    }

    // Take each line in array and split into a object with key-value pairs based on column headings
    var createObject = function() {
      for(var i = 1; i < lines.length; i++) {
        var values = lines[i].split(',');
        $scope.structuredDataByLine[i - 1] = {};
        for(var j = 0; j < $scope.columnHeadings.length; j++) {
          $scope.structuredDataByLine[i - 1][$scope.columnHeadings[j]] = values[j];
        }
      }
      // Create a copy for resetting filter
      $scope.structuredDataByLineCopy = angular.copy($scope.structuredDataByLine);
    }

    // Take each value in each line and add to a relevant array
    var createArrays = function() {
      structuredDataByKey = [];
      for(var k = 0; k < $scope.columnHeadings.length; k++) {
        structuredDataByKey[$scope.columnHeadings[k]] = [];
        for(var l = 1; l < lines.length; l++) {
          var values = lines[l].split(',');
          structuredDataByKey[$scope.columnHeadings[k]][l-1] = values[k];
        }
      }
      console.log(structuredDataByKey);
    }

    // Set visualisation data stack
    var setVisualisationData = function() {
      $scope.deDupArrays = [];
      for(var m = 0; m < $scope.columnHeadings.length; m++) {
        var array = structuredDataByKey[$scope.columnHeadings[m]];
        $scope.deDupArrays[m] = _.uniq(array);
        //console.log($scope.deDupArrays[m]);
        sankey.stack(m, $scope.deDupArrays[m]);
      }
      console.log($scope.deDupArrays);
    }

    // Set array in correct format for visualisation 
    var setDataFormat = function() {
      setDataArray = [];
      for(var n = 0; n < $scope.columnHeadings.length - 1; n++) {
        for(var o = 0; o < $scope.structuredDataByLine.length; o++) {
          setDataArray[o + ($scope.structuredDataByLine.length * n)] = [ $scope.structuredDataByLine[o][$scope.columnHeadings[n]], defaultLineWeight, $scope.structuredDataByLine[o][$scope.columnHeadings[n + 1]] ];
        }
      }
      console.log(setDataArray);
    }

    // Reset Sankey stuff
    var resetSankey = function() {
      $('#sankey svg').remove();
      sankey = new Sankey();
    }

    // More Sankey stuff
    var setSankey = function() {
      sankey.setData([]);
      sankey.setData(setDataArray);
      sankey.draw();
    }

}]);