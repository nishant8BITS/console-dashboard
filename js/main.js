$( document ).ready(function() {
  //Create a reference to firebase
  var checkOutFirebaseReference = new Firebase('https://mcd-checkin-teser.firebaseio.com/');

  //Get all the users and put them in array
  var usersRef = checkOutFirebaseReference.child("users"),
      userDict = {};

  //Get all the orders and put them in an array
  var orderRef = checkOutFirebaseReference.child("order"),
      orderDict = {};

  // Populate the users dropdown from FB
  loadUsersFromFB();

  // SET VALUES TO GUI
  var displayNameVal = $('#displayNameInput').val(),
      tableServiceEnabledVal = $('#tableServiceDropdown').find(':selected').val(),
      fineBoundaryVal = $('#boundaryDropdown').find(':selected').val(),
      wifiVal = $('#wifiDropdown').find(':selected').val(),
      bleVal = $('#bleDropdown').find(':selected').val(),
      currentViewVal = $('#iphone-scrn').find(':selected').val(),
      foodOrderVal = $('#orderDropdown').find(':selected').val(),
      nameVal = "User",
      emailVal = "user@email.com",
      beaconsEnabled = true,
      driveThruVal = $('#driveThruDropdown').find(':selected').val(),
      locationServicesVal = $('#locationServicesDropdown').find(':selected').val(),
      pickUpTableVal = $('#pickUpTableDropdown').find(':selected').val();

  // iPhone states
  var iphoneImg = ["/img/assets/1.png", "/img/assets/2.png", "/img/assets/3.png",
    "/img/assets/4.png", "/img/assets/5.png", "/img/assets/6.png", "/img/assets/7.png", "/img/assets/8.png",
    "/img/assets/9.png", "/img/assets/10.png", "/img/assets/11.png", "/img/assets/12.png", "/img/assets/13.png",
    "/img/assets/14.png", "/img/assets/15.png", "/img/assets/16.png", "/img/assets/17.png", "/img/assets/18.png",
    "/img/assets/19.png", "/img/assets/20.png", "/img/assets/21.png", "/img/assets/22.png", "/img/assets/23.png",
    "/img/assets/24.png", "/img/assets/25.png", "/img/assets/26.png", "/img/assets/27.png", "/img/assets/28.png", 
    "/img/assets/29.png", "/img/assets/30.png"
  ];

  // Status ticker states
  var statusTick = ["Waiting", "Assembled", "Delivered"];

  var listeningUserChanges = false;


  function loadUsersFromFB() {
    usersRef.once("value", function(snapshot) {
    console.log('loaduserFromFB');
      // populate select once needs a private var
      var userDict = snapshot.val(),
          currentUser,
          objUserDropdown = $('#userDropdown'), // Cached the Dropdown Object for Performance optimization
          objUserDpDn = "";

      for (var key in userDict) {
        if (userDict.hasOwnProperty(key)) {
          currentUser = userDict[key];
          objUserDropdown.append($('<option></option>').val(key).html(currentUser.user.name));
          loadUsersInformationFromFB(currentUser, userDict);
        }
      }
    });
  };


  function loadUsersInformationFromFB() {
    usersRef.on("value", function(snapshot) {
    console.log('loaduserinfoFromFB');
      var currentUser;
      for (var key in userDict) {
        if (userDict.hasOwnProperty(key)) {
          /*
            Never Declare variable in loop because everytime new variable is created
            So It's hit performance
           */ 
          currentUser = userDict[key]; 
        }
      }
    })
  };

  $("#load-usr").on('click', function(event) {
    console.log('init');
    google.maps.event.addDomListener(window, 'load', checkMap);
    //Save some line (As JS is executed and sent to client side so make it Less line code If possible)
    $('#selected-usr-panel,#rgt-col,#far-rgt-col').removeClass("hidden");

    var usrSelVal = $('#userDropdown').val(),
        schemaSelVal = $('#schemaDropdown').val();

    usersRef.child(usrSelVal).on('value', function(data) {
      loadCurrentUser(data.val());
    })

    switch (schemaSelVal) {
      case "schema-a":
        // Make code consistent If Jquery Being used, Used everywhere unless It's need of using 
        // Plain JavaScript
        $('#bleDropdown').prop("disabled", true);
        $('#wifiDropdown').prop("disabled", false);
        console.log('schema-a');
        break;
      case "schema-b":
        $('#bleDropdown').prop("disabled", false);
        $('#wifiDropdown').prop("disabled", true);
        break;
      default:
        alert("A Schema hasn't been selected");
    }
  });



  function loadCurrentUser(currentUser) {
    console.log('changed value of user', currentUser)
    var beaconsEnabledReturn = currentUser.beaconsEnabled,
        currentViewReturn = currentUser.currentView,
        tableServiceEnabledReturn = currentUser.tableServiceEnabled,
        wifiOverideReturn = currentUser.wifiOverride,
        displayNameReturn = currentUser.user.displayName,
        geoFenceEventMethodReturn = currentUser.geoFenceEventMethod,
        currentLocation = currentUser.currentLocation || {},
        currentLocationLatReturn = currentLocation.latitude,
        currentLocationLongReturn = currentLocation.longitude;

    console.log("HIT " + displayNameReturn);
    console.log(currentLocationLatReturn);
    console.log(currentLocationLongReturn);

    checkView(currentViewReturn, displayNameReturn, currentUser);
    checkTable(tableServiceEnabledReturn);
    checkWifi(wifiOverideReturn);
    checkDisplayName(displayNameReturn);
    checkGeofenceEvent(geoFenceEventMethodReturn);

    if (parseInt(currentViewReturn) == 8) loadOrders(displayNameReturn, currentUser);
    checkMap(currentLocationLatReturn, currentLocationLongReturn)
  }

  function loadOrders(displayNameReturn, currentUser) {
    console.log('bar');
    orderRef.limitToLast(1).on("value", function(snapshot) {
      var orderDict = snapshot.val(),
          order,
          orderStatusReturn, 
          fineBoundaryReturn,
          orderNumberReturn,
          orderCodeReturn,
          eta,
          created;
      console.log(orderDict);

      for (var key in orderDict) {
        if (orderDict.hasOwnProperty(key)) {
          order = order[key];
          console.log("0000")
          if (displayNameReturn == currentUser.user.displayName.toString()) {

            console.log(order);
            orderStatusReturn = order.status.orderStatus;
            fineBoundaryReturn = order.status.fineBoundary;
            orderNumberReturn = order.orderNumber;

            orderCodeReturn = order.orderCode;
            eta = order.status.eta;
            created = order.orderCreationTime;

            console.log('1111');
            checkFineBoundary(fineBoundaryReturn);
            console.log('22222211');

            console.log("////////////// ORDER STATUS  " + orderStatusReturn);
            console.log("////////////// FINE BOUNDARY  " + fineBoundaryReturn);
            console.log("////////////// ORDER NUMBER  " + orderNumberReturn);

            console.log("//////////////CURRENTORDER ", order);
            console.log("//////////////CURRENTORDER ETA " + eta);
            console.log("//////////////CURRENTORDER CREATED " + created);

          } else {
            console.log("9999")
          }
        }
      }

    });
  }


  // console.log("DISPLAY NAME ON LOAD ORDERS: " + displayNameReturn);
  // console.log("CURRENT USER ON LOAD ORDERS: " + currentUser);
  // orderRef.orderByChild("userId").on("child_added", function(snapshot) {
  //   var currentUsersOrder = snapshot.val();
  //
  //   for (var key in currentUsersOrder) {
  //     var value = currentUsersOrder[key];
  //     console.log("Current User Order Object: " + value);
  //   }
  //
  //
  //   console.log("////////////// currentUserSORDER  " + currentUsersOrder);
  //   console.log("//////////////////////////// ////////////// //////////////  currentUserSORDER SNAPSHOT  " + snapshot.key());
  //   // console.log("//////////////////////////////////////////////////////////" + userId);
  //
  //   var orderStatusReturn = currentUsersOrder.status.orderStatusReturn;
  //   var fineBoundaryReturn = currentUsersOrder.status.fineBoundary;
  //   var orderNumberReturn = currentUsersOrder.orderNumber;
  //   var orderCodeReturn = currentUsersOrder.orderCode;
  //   var latitudeReturn = currentUsersOrder.status.currentLocation.latitude;
  //   var longitudeReturn = currentUsersOrder.status.currentLocation.longitude;
  //
  //   console.log("////////////// LONGITUDE  " + longitudeReturn);
  //   console.log("////////////// LATITUDE  " + latitudeReturn);
  //   console.log("////////////// ORDER NUMBER  " + orderNumberReturn);
  //   console.log("////////////// ORDER STATUS  " + orderStatusReturn);
  //   console.log("////////////// FINE BOUNDARY  " + fineBoundaryReturn);
  //
  //   checkOrderStatusReturn(orderStatusReturn);
  //   checkFineBoundary(fineBoundaryReturn);
  //   checkMap(latitudeReturn, longitudeReturn);
  // });

  // orderRef.orderByChild("userId").limitToLast(1).on('child_changed', function(childSnapshot) {
  //   console.log("changed longitude " + longitudeReturn);
  //   console.log("changed latitude " + latitudeReturn);
  //
  //   var currentUsersOrder = childSnapshot.val();
  //
  //   var latitudeReturn = currentUsersOrder.status.currentLocation.latitude;
  //   var longitudeReturn = currentUsersOrder.status.currentLocation.longitude;
  //   checkMap(latitudeReturn, longitudeReturn);
  //
  // })


  // $(".form-trackr").change(function() {
  //   changeListener();
  // });
  //
  $('input').change(function(e) {
    var userId = $('#userDropdown').val(),
        displayNameVal = $('#displayNameInput').val(),
        tableServiceVal = $('#tableServiceDropdown').val(),
        fineBoundaryVal = $('#boundaryDropdown').val(),
        wifiVal = $('#wifiDropdown').val(),
        bleVal = $('#bleDropdown').val(),
        currentViewVal = $('#iphone-scrn').val(),
        foodOrderVal = $('#orderDropdown').val(),
        driveThruVal = $('#driveThruDropdown').val(),
        locationServicesVal = $('#locationServicesDropdown').val(),
        pickUpTableVal = $('#pickUpTableDropdown').val();


        usersRef.child(userId).child('user').update({
              "displayName" : displayNameVal
        });
  })

  function checkMap(currentLocationLatReturn, currentLocationLongReturn) {
    console.log("foo");
    var myLatlng = new google.maps.LatLng(currentLocationLatReturn, currentLocationLongReturn),
        mapOptions = {
           zoom: 20,
           center: myLatlng
        },
       map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    var marker = new google.maps.Marker({
      position: myLatlng,
      map: map
    });
  }

  function checkGeofenceEvent(geoFenceEventMethodReturn) {
    switch (parseInt(geoFenceEventMethodReturn)) {
      case 0 && "0":
        $("#geoFenceDropdown").val("ios");
        break;
      case 1:
        $("#geoFenceDropdown").val("proximity-kit");
        break;
      case 2:
        $("#geoFenceDropdown").val("off");
        break;
      default:
        $("#geoFenceDropdown").val(tableServiceEnabledVal);
    }
  }

  function checkTable(tableReturn) {
    switch (tableReturn) {
      case true:
        $("#tableServiceDropdown").val("true");
        break;
      case false:
        $("#tableServiceDropdown").val("false");
        break;
      default:
        $("#tableServiceDropdown").val(tableServiceEnabledVal);
    }
  }

  function checkWifi(wifiOverideReturn) {
    switch (wifiOverideReturn) {
      case true:
        $("#wifiDropdown").val("true");
        break;
      case false:
        $("#wifiDropdown").val("false");
        break;
      default:
        $("#wifiDropdown").val(wifiVal);
    }
  }

  function checkDisplayName(displayNameReturn) {
    $('input#displayNameInput').val(displayNameReturn);
  }


  function checkFineBoundary(fineBoundaryReturn) {
    switch (fineBoundaryReturn) {
      case true:
        console.log("i am in bool true")
        $("#boundaryDropdown").val("true");
        break;
      case false:
        console.log("i am in bool false")
        $("#boundaryDropdown").val("false");
        break;
      default:
        console.log("i am in default")
        $("#boundaryDropdown").val(fineBoundaryVal);
    }
  }

  function checkBle(beaconsEnabledReturn) {
    switch (bleReturn) {
      case true:
        $("#bleDropdown").val("true");
        break;
      case false:
        $("#bleDropdown").val("false");
        break;
      default:
        $("#bleDropdown").val(bleVal);
        console.log(bleVal);
    }
  }

  function checkView(currentViewReturn, displayNameReturn, currentUser) {

    switch (parseInt(currentViewReturn)) {
      case 0:
        $('#iphone-scrn').css("background-image", "url(" + iphoneImg[0] + ")");
        $('#led').css("background-color", "#ff5021");
        $('#status-tick').html(statusTick[0]);
        break;
      case 1:
        $('#iphone-scrn').css("background-image", "url(" + iphoneImg[1] + ")");
        $('#led').css("background-color", "#ff5021");
        $('#status-tick').html(statusTick[0]);
        break;
      case 2:
        $('#iphone-scrn').css("background-image", "url(" + iphoneImg[2] + ")");
        $('#led').css("background-color", "#ff5021");
        $('#status-tick').html(statusTick[0]);
        break;
      case 3:
        $('#iphone-scrn').css("background-image", "url(" + iphoneImg[3] + ")");
        $('#led').css("background-color", "#ff5021");
        $('#status-tick').html(statusTick[0]);
        break;
      case 4:
        $('#iphone-scrn').css("background-image", "url(" + iphoneImg[4] + ")");
        $('#led').css("background-color", "#ff5021");
        $('#status-tick').html(statusTick[0]);
        break;
      case 5:
        $('#iphone-scrn').css("background-image", "url(" + iphoneImg[5] + ")");
        $('#led').css("background-color", "#ff5021");
        $('#status-tick').html(statusTick[0]);
        break;
      case 6:
        $('#iphone-scrn').css("background-image", "url(" + iphoneImg[6] + ")");
        $('#led').css("background-color", "#ff5021");
        $('#status-tick').html(statusTick[0]);
        break;
      case 7:
        $('#iphone-scrn').css("background-image", "url(" + iphoneImg[7] + ")");
        $('#led').css("background-color", "#ff5021");
        $('#status-tick').html(statusTick[0]);
        console.log("I SHOULD BE HERE");
        loadOrders(displayNameReturn, currentUser);
        break;
      case 8:
        $('#iphone-scrn').css("background-image", "url(" + iphoneImg[8] + ")");
        $('#led').css("background-color", "#ff5021");
        $('#status-tick').html(statusTick[0]);
        break;
      case 9:
        $('#iphone-scrn').css("background-image", "url(" + iphoneImg[9] + ")");
        $('#led').css("background-color", "#ff5021");
        $('#status-tick').html(statusTick[0]);
        break;
      case 10:
        $('#iphone-scrn').css("background-image", "url(" + iphoneImg[10] + ")");
        $('#led').css("background-color", "#ffc400");
        $('#status-tick').html(statusTick[1]);
        break;
      case 11:
        $('#iphone-scrn').css("background-image", "url(" + iphoneImg[11] + ")");
        $('#led').css("background-color", "#ffc400");
        $('#status-tick').html(statusTick[1]);
        break;
      case 12:
        $('#iphone-scrn').css("background-image", "url(" + iphoneImg[12] + ")");
        $('#led').css("background-color", "#ffc400");
        $('#status-tick').html(statusTick[1]);
        break;
      case 13:
        $('#iphone-scrn').css("background-image", "url(" + iphoneImg[13] + ")");
        $('#led').css("background-color", "#ffc400");
        $('#status-tick').html(statusTick[1]);
        break;
      case 14:
        $('#iphone-scrn').css("background-image", "url(" + iphoneImg[14] + ")");
        $('#led').css("background-color", "#ffc400");
        $('#status-tick').html(statusTick[1]);
        break;
      case 15:
        $('#iphone-scrn').css("background-image", "url(" + iphoneImg[15] + ")");
        $('#led').css("background-color", "#ffc400");
        $('#status-tick').html(statusTick[1]);
        break;
      case 16:
        $('#iphone-scrn').css("background-image", "url(" + iphoneImg[16] + ")");
        $('#led').css("background-color", "#ffc400");
        $('#status-tick').html(statusTick[1]);
        break;
      case 17:
        $('#iphone-scrn').css("background-image", "url(" + iphoneImg[17] + ")");
        $('#led').css("background-color", "#ffc400");
        $('#status-tick').html(statusTick[1]);
        break;
      case 18:
        $('#iphone-scrn').css("background-image", "url(" + iphoneImg[18] + ")");
        $('#led').css("background-color", "#ffc400");
        $('#status-tick').html(statusTick[1]);
        break;
      case 19:
        $('#iphone-scrn').css("background-image", "url(" + iphoneImg[19] + ")");
        $('#led').css("background-color", "#ffc400");
        $('#status-tick').html(statusTick[1]);
        break;
      case 20:
        $('#iphone-scrn').css("background-image", "url(" + iphoneImg[20] + ")");
        $('#led').css("background-color", "#1cc466");
        $('#status-tick').html(statusTick[2]);
        break;
      case 21:
        $('#iphone-scrn').css("background-image", "url(" + iphoneImg[21] + ")");
        $('#led').css("background-color", "#1cc466");
        $('#status-tick').html(statusTick[2]);
        break;
      case 22:
        $('#iphone-scrn').css("background-image", "url(" + iphoneImg[22] + ")");
        $('#led').css("background-color", "#1cc466");
        $('#status-tick').html(statusTick[2]);
        break;
      case 23:
        $('#iphone-scrn').css("background-image", "url(" + iphoneImg[23] + ")");
        $('#led').css("background-color", "#1cc466");
        $('#status-tick').html(statusTick[2]);
        break;
      case 24:
        $('#iphone-scrn').css("background-image", "url(" + iphoneImg[24] + ")");
        $('#led').css("background-color", "#1cc466");
        $('#status-tick').html(statusTick[2]);
        break;
      case 25:
        $('#iphone-scrn').css("background-image", "url(" + iphoneImg[25] + ")");
        $('#led').css("background-color", "#1cc466");
        $('#status-tick').html(statusTick[2]);
        break;
      case 26:
        $('#iphone-scrn').css("background-image", "url(" + iphoneImg[26] + ")");
        $('#led').css("background-color", "#1cc466");
        $('#status-tick').html(statusTick[2]);
        break;
      case 27:
        $('#iphone-scrn').css("background-image", "url(" + iphoneImg[27] + ")");
        $('#led').css("background-color", "#1cc466");
        $('#status-tick').html(statusTick[2]);
        break;
      case 28:
        $('#iphone-scrn').css("background-image", "url(" + iphoneImg[28] + ")");
        $('#led').css("background-color", "#1cc466");
        $('#status-tick').html(statusTick[2]);
        break;
      case 29:
        $('#iphone-scrn').css("background-image", "url(" + iphoneImg[29] + ")");
        $('#led').css("background-color", "#1cc466");
        $('#status-tick').html(statusTick[2]);
        break;
      default:
        $("#iphone-scrn").val(currentViewVal);
    }
  }

  function checkOrderStatusReturn(orderStatusReturn) {
    switch (orderStatusReturn) {
      case "Delivered":
        $("#orderDropdown").val("Delivered");
        break;
      case "Assembled":
        $("#orderDropdown").val("Assembled");
        break;
      default:
        $("#orderDropdown").val(foodOrderVal);
    }
  }

  function driveThru(driveThruReturn) {
    switch (driveThruReturn) {
      case true:
        $("#driveThruDropdown").val("true");
        break;
      case false:
        $("#driveThruDropdown").val("false");
        break;
      default:
        $("#driveThruDropdown").val(driveThruVal);
    }
  }

  function locationServices(locationServicesReturn) {
    switch (locationServicesReturn) {
      case true:
        $("#locationServicesDropdown").val("true");
        break;
      case false:
        $("#locationServicesDropdown").val("false");
        break;
      default:
        $("#locationServicesDropdown").val(locationServicesVal);
    }
  }

  function pickUpTable(pickUpTableReturn) {
    switch (pickUpTableReturn) {
      case true:
        $("#pickUpTableDropdown").val("true");
        break;
      case false:
        $("#pickUpTableDropdown").val("false");
        break;
      default:
        $("#pickUpTableDropdown").val(pickUpTableVal);
    }
  }
});