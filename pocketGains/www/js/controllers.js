var apiLink = "http://pocketgains.us";
//var apiLink= "http://52.37.226.62";
angular.module('starter.controllers', ["chart.js"])

.controller('AppCtrl', function($scope, userData, $http, $ionicModal, $ionicHistory) {
})

// ******************** Main Page (Dashboard) Controller **********************************

.controller('DashboardCtrl', function($scope, $state, userData, $http, $ionicModal, $ionicHistory,$stateParams, $ionicSlideBoxDelegate) {
    
  // User data
  $scope.username = userData.getUsername();
  $scope.user_id = userData.getId();

  $scope.firstAchievement = false;

  $http.get(apiLink + "/getHistory/" + $scope.user_id + "/2012-4-20 00:00:00")
    .success(function(workoutData) {
      if (workoutData != "\"no results found\"") {
        $scope.workoutHist = workoutData;

        $scope.workoutHist.sort(function(a, b) {
          return Date.parse(b.time_stamp) - Date.parse(a.time_stamp);
        });

        // This changes the time_stamp to daysBack for nicer display
        for (var key in $scope.workoutHist) {

          // check if there is a workout in the history that satisfies an achievement



          // Set todays date and the date of the workout
          todays_date = new Date();
          time_stamp = $scope.workoutHist[key]['time_stamp'];
          time_stamp = time_stamp.replace(/ /g,"T") + "Z";
          workout_date = new Date(time_stamp);

          var timeDiff = Math.abs(todays_date.getTime() - workout_date.getTime());
          var diffDays = Math.floor(timeDiff / (1000 * 3600 * 24)); 

          $scope.workoutHist[key]["daysBack"] = diffDays;
        }
      }
    })
    .error(function(data) {
        alert("API ERROR" + "\n" + "/getHistory");
    });

  // Modal for when an achievement is completed - celebrate the User
  $ionicModal.fromTemplateUrl('templates/completedAchievement-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  })

  $scope.openModal = function(achievement) {
    $scope.achievementTitle = achievement.name;
    $scope.achievementDesc = achievement.desc;
    $scope.modal.show();
  };

  $scope.closeModal = function() {
    $scope.modal.hide();
  };  

  $scope.completeAchievement = function(id) {
    $http.post(apiLink + "/completedAchievement", 
          {
            "user_id": $scope.user_id,
            "achieve_id": id
          }
      )
      .success(function(data) {
          $scope.openModal($scope.completedAchievement);
      })
      .error(function(data) {
          alert("API ERROR at " + apiLink + "\n" + "POST /completedAchievement");
      });
  }; 


  // ----- Get First achievement for creating account (gym rat) if not complete
  // Get list of completed achievements
  $http.get(apiLink + "/achievements/" + $scope.user_id )
      .success(function(data) {
          $scope.compAchievements = data;

          // check if the user has earned the first achievement yet
          for (i = 0; i < $scope.compAchievements.length; i++) {
            if($scope.compAchievements[i].achieve_id == 35) {
              $scope.firstAchievement = true;
            }
          }

          // IF the user has not yet earned the Gym Rat achieve, give it to them
          if ($scope.firstAchievement == false) {
            $http.get(apiLink + "/achievements")
              .success(function(data) {

                  var gymRat_id = 34;
                  console.log("User " + $scope.user_id + " earned achievement w/ id: " + data[gymRat_id].achieve_id);
                  $scope.completedAchievement = data[gymRat_id];

                  //POST that achievement was completed
                  $scope.completeAchievement(data[gymRat_id].achieve_id);
              })
              .error(function(data) {
                  alert("API ERROR at " + apiLink + "\n" + "/achievements");
              });
          }
      })
      .error(function(data) {
          alert("API ERROR at " + apiLink + "\n" + "/achievements/{user_id}");
      });

  $scope.workoutDashClick = function() {
    $state.go('app.workoutDashboard');
  }
  
 $scope.leaders = function() {
    $state.go('app.leaderboards');
  } 
  $scope.achievments = function() {
    $state.go('app.achievements');
  } 
})



.controller('ProfBuilderCtrl', function($scope, userData, $state, $ionicHistory, $ionicSlideBoxDelegate, $ionicSideMenuDelegate, $ionicModal, $http) {

  $ionicSideMenuDelegate.canDragContent(false);
  $ionicSlideBoxDelegate.enableSlide(false);

  // Data to be sent to API
  $scope.sex = "n";
  $scope.goal = "n";
  $scope.favs = [ ];
  $scope.interacted = [ ];

  // This is for when a workout button is clicked to show user 
  // which types they have already selected a workout for
  $scope.isActivated = false;

  $scope.disableSlide = function() {
    $ionicSlideBoxDelegate.enableSlide(false);
  };

  $scope.next = function() {
    $ionicSlideBoxDelegate.next();
  };

  $scope.slideChanged = function(index) {
    $scope.slideIndex = index;
  };

  $scope.selectMale = function() {
    console.log("Male selected!");
    $scope.sex = "Male";
    $ionicSlideBoxDelegate.next();
  }

  $scope.selectFemale = function() {
    console.log("Female selected!");
    $scope.sex = "Female";
    $ionicSlideBoxDelegate.next();
  }

  $scope.selectScale = function() {
    console.log("Lose Weight selected!");
    $scope.goal = "Lose Weight";
    $ionicSlideBoxDelegate.next();
  }

  $scope.selectMuscle = function() {
    console.log("Build Muscle selected!");
    $scope.goal = "Build Muscle";
    $ionicSlideBoxDelegate.next();
  }

  $scope.selectAthletics = function() {
    console.log("Improve Athletics selected!");
    $scope.goal = "Improve Athletics";
    $ionicSlideBoxDelegate.next();
  }

  $scope.selectRunning = function() {
    console.log("Running selected!");
    $scope.favs["cardio"] = "Running";
    $ionicSlideBoxDelegate.next();
  }

  $scope.selectCycling = function() {
    console.log("Cycling selected!");
    $scope.favs["cardio"] = "Cycling";
    $ionicSlideBoxDelegate.next();
  }

  $scope.selectSwimming = function() {
    console.log("Swimming selected!");
    $scope.favs["cardio"] = "Swimming";
    $ionicSlideBoxDelegate.next();
  }

  // Modal for selecting fav workout for each category

  $scope.workouts = [ ];
  $scope.nextText = "none";

  $ionicModal.fromTemplateUrl('templates/workoutSelectorProfBuilder-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  })

  $scope.openModal = function(category) {
    $scope.category = category;

    $http.get(apiLink + "/workouts/" + $scope.category)
    .success(function(data) {
        $scope.workouts = data;
        $scope.modal.show(); 
    })
    .error(function(data) {
        alert("API ERROR" + "\n" + "/workouts/type");
    });

       
    
  }

  $scope.selectFavWorkout = function(id, title) {
    console.log("User selected workout with id: " + id + " from the " + $scope.category + " category");
    
    // Change color of workout selector button to indicate a workout has already been chosen
    if ($scope.category == "arms") {
      $scope.interacted["arms"] = "workout-selector-interacted";
    } else if ($scope.category == "legs") {
      $scope.interacted["legs"] = "workout-selector-interacted";
    } else if ($scope.category == "back") {
      $scope.interacted["back"] = "workout-selector-interacted";
    } else if ($scope.category == "shoulders") {
      $scope.interacted["shoulders"] = "workout-selector-interacted";
    } else if ($scope.category == "chest") {
      $scope.interacted["chest"] = "workout-selector-interacted";
    }

    // If all the categorys have a selection, show the next button
    if ($scope.interacted["arms"] == "workout-selector-interacted" &&
        $scope.interacted["legs"] == "workout-selector-interacted" &&
        $scope.interacted["back"] == "workout-selector-interacted" &&
        $scope.interacted["shoulders"] == "workout-selector-interacted" &&
        $scope.interacted["chest"] == "workout-selector-interacted") {
      $scope.nextText = "block";
    }

    $scope.favs[$scope.category] = id;
    $scope.modal.hide();
  }

  $scope.profileBuilderFinish = function() {
    console.log(userData.getUsername() + " . " + userData.getPassword() + " . " + $scope.sex + " . " + $scope.goal + " . " + $scope.favs['arms']+ " . " + $scope.favs['legs']+ " . " + $scope.favs['back']+ " . " + $scope.favs['shoulders']+ " . " + $scope.favs['chest']+ " . " + $scope.favs['cardio']);
    $http.post(apiLink + "/createNewUser", 
        {
          "username": userData.getUsername(),
          "password": userData.getPassword(), 
          "sex": $scope.sex,
          "goal": $scope.goal,
          "arms": $scope.favs["arms"],
          "legs": $scope.favs["legs"],
          "back": $scope.favs["back"],
          "shoulders": $scope.favs["shoulders"],
          "chest": $scope.favs["chest"],
          "cardio": $scope.favs["cardio"]
        }
    )
    .success(function(data) {

        $ionicHistory.nextViewOptions({
          disableAnimate: true,
          disableBack: true
        });

        // Set the user_id for the entire app
        userData.setId(JSON.parse(data));
        console.log(JSON.parse(data));

        $state.go('app.dashboard');
        
    })
    .error(function(data) {
        alert("API ERROR" + "\n" + "/createNewUser");
    });
  }


})


// ******************** Login Page Controller **********************************

.controller('SignInCtrl', function($scope, $ionicHistory, $ionicModal, $ionicConfig, $ionicSideMenuDelegate, $state, $http, userData) {

    $scope.form = {};

    $ionicSideMenuDelegate.canDragContent(false);


    $scope.createAcc= function(){
      $scope.username = $scope.form.username;
      $scope.password = $scope.form.password;
      $scope.verifyPass = $scope.form.verifyPassword;

      if ($scope.password == $scope.verifyPass) {
        userData.setUsername($scope.username);
        userData.setPassword($scope.password);

        $state.go('app.profileBuilder');
        $scope.modal.hide();
      } else {
        $scope.message = "Passwords do not match!";
      }

      
    }
    
    $scope.login = function() {
      if($scope.form.username){
          $scope.username=$scope.form.username;
      }
      if($scope.form.password){
          $scope.password=$scope.form.password;
      }

      $http.post(apiLink + "/login", 
            {
              "username": $scope.username, 
              "password": $scope.password
            }
        )
        .success(function(data) {

          if (JSON.parse(data) != "invalid username or password") {

            $scope.user_id = JSON.parse(data);

            userData.setUsername($scope.username);
            userData.setId($scope.user_id);

            console.log("User " + userData.getUsername() + " login success.");

            $ionicHistory.nextViewOptions({
              disableAnimate: true,
              disableBack: true
            });

            $state.go('app.dashboard');

          } else {
            $scope.message = JSON.parse(data);
          }

        })
        .error(function(data) {
            $state.go('app.login');
            alert("API ERROR" + "\n" + "POST /login");
        });
    }

    // Modal for creating new account
    $ionicModal.fromTemplateUrl('templates/createAccount-modal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
    })

    $scope.openModal = function() {
      $scope.modal.show();    
    }
})

.controller('HomeTabCtrl', function($scope, userData, $http) {

  $scope.user_id = userData.getId();

  $http.get(apiLink + "/userData/" + $scope.user_id)
  .success(function(data) {
      data = data[0];
      $scope.labels = ['Cardio', 'Legs', 'Arms', 'Back', 'Shoulders', 'Chest'];
      $scope.userPoints =  {
                      "arms": data["arms"],
                      "legs": data["legs"],
                      "back": data["back"],
                      "shoulders": data["shoulders"],
                      "chest": data["chest"],
                      "cardio": data["cardio"]
                    };

      $scope.data = [[$scope.userPoints.cardio, $scope.userPoints.legs, $scope.userPoints.arms, $scope.userPoints.back, $scope.userPoints.shoulders, $scope.userPoints.chest]];
      

  })
  .error(function(data) {
      alert("API ERROR" + "\n" + "POST userData");
  });

  

})

.controller('AchieveCtrl', function($scope, $http, userData) {

  $scope.user_id = userData.getId();

  $http.get(apiLink + "/achievements")
    .success(function(data) {
        $scope.achievements = data;

        $http.get(apiLink + "/achievements/" + $scope.user_id)
          .success(function(data) {
              $scope.compAchievements = data;

              // Give a lock icon to all achievements
              for (i = 0; i < $scope.achievements.length; i++) {
                $scope.achievements[i].image = "lock";
              }

              // Give the check mark to completed achievements
              for (i = 0; i < $scope.compAchievements.length; i++) {
                $scope.achievements[$scope.compAchievements[i].achieve_id - 1].image = "checkmark_icon";    
              }
          })
          .error(function(data) {
              alert("API ERROR" + "\n" + "/achievements/{user_id}");
          });
    })
    .error(function(data) {
        alert("API ERROR" + "\n" + "/achievements");
    });
})
            
.controller('LeaderCtrl', function($scope, $state, userData, $http) {
  $scope.user_id = userData.getId();
    
  $http.get(apiLink + "/workoutTypes")
    .success(function(data) {
        $scope.buttons = data;
      
    })
    .error(function(data) {
        alert("API ERROR" + "\n" + "/workoutTypes");
    });
    
    $scope.showCard= function(workout){
        $state.go('app.leaderboard', {choice: workout});
    }
})

.controller('LeaderCatCtrl', function($scope, $http, userData, $ionicModal, $ionicHistory, $state, $ionicSlideBoxDelegate, $stateParams) {
    console.log($stateParams.choice);
    myChoice = $stateParams.choice;
    $http.get(apiLink + "/getLeaders/" + myChoice)
    .success(function(data) {
        $scope.leaders = data;

    })
    .error(function(data) {
        alert("API ERROR" + "\n" + "/getLeaders/");
    });
    
    $scope.showCard= function(workout){
        $state.go('app.leaderboard');
    }
    
    
})


.controller('WorkoutDashCtrl', function($scope, $http, userData, $ionicModal, $ionicHistory, $state, $ionicSlideBoxDelegate) {

  $scope.form = {};

  $scope.user_id = userData.getId();

  // -------------- Calculate the Suggested Workouts for the User -------------- //
  var date_twoDaysBack = new Date();
  var date_oneDayBack = new Date();
  var date_today = new Date();
  date_twoDaysBack.setDate(date_twoDaysBack.getDate()-2);
  date_oneDayBack.setDate(date_oneDayBack.getDate()-1);
  date_today.setDate(date_today.getDate());

  // Get workout history between one and two days back...
  $http.get(apiLink + "/getHistory/" + $scope.user_id + "/'" + date_twoDaysBack.toISOString() + "'/'" + date_oneDayBack.toISOString() + "'")
    .success(function(data) {

        //create array of types from these workouts
        var typesHist = [];
        for (var key in data) {
          // 'name' meane 'type' because DB fools...
          typesHist.push(data[key]['name']);
        }

        //track the count of types in the array
        var typesCount = [ ];
        typesCount["Arms"] = 0;
        typesCount["Legs"] = 0;
        typesCount["Shoulders"] = 0;
        typesCount["Back"] = 0;
        typesCount["Chest"] = 0;
        typesCount["Cardio"] = 0;
        for (var i=0; i<typesHist.length; i++) {
          if (typesHist[i] == "Arms") {
            typesCount["Arms"] += 1;
          } else if (typesHist[i] == "Legs") {
            typesCount["Legs"] += 1;
          } else if (typesHist[i] == "Shoulders") {
            typesCount["Shoulders"] += 1;
          } else if (typesHist[i] == "Back") {
            typesCount["Back"] += 1;
          } else if (typesHist[i] == "Chest") {
            typesCount["Chest"] += 1;
          } else if (typesHist[i] == "Cardio") {
            typesCount["Cardio"] += 1;
          }
        }

        // Find the category with the highest count
        var highestCount = 0;
        var highestCountType = "";
        for (var key in typesCount) {
          if (typesCount[key] > highestCount) {
            highestCountType = key;
          }
        }

        //Determine what workouts to choose based on highestCountType
        if (highestCountType == "Arms") {
          $http.get(apiLink + "/workouts/" + "Legs")
            .success(function(data) {
                $scope.suggestedWorkouts = data;
                $scope.suggestedWorkouts.splice(4);
                console.log($scope.suggestedWorkouts);
            })
            .error(function(data) {
                alert("API ERROR" + "\n" + "/workouts/{type}");
          });
        } else if (highestCountType == "Legs") {
          $http.get(apiLink + "/workouts/" + "Arms")
            .success(function(data) {
                $scope.suggestedWorkouts = data;
                $scope.suggestedWorkouts.splice(4);
                console.log($scope.suggestedWorkouts);
            })
            .error(function(data) {
                alert("API ERROR" + "\n" + "/workouts/{type}");
          });
        } else if (highestCountType == "Shoulders") {
          $http.get(apiLink + "/workouts/" + "Legs")
            .success(function(data) {
                $scope.suggestedWorkouts = data;
                $scope.suggestedWorkouts.splice(4);
                console.log($scope.suggestedWorkouts);
            })
            .error(function(data) {
                alert("API ERROR" + "\n" + "/workouts/{type}");
          });
        } else if (highestCountType == "Chest") {
          $http.get(apiLink + "/workouts/" + "Back")
            .success(function(data) {
                $scope.suggestedWorkouts = data;
                $scope.suggestedWorkouts.splice(4);
            })
            .error(function(data) {
                alert("API ERROR" + "\n" + "/workouts/{type}");
          });
        } else if (highestCountType == "Back") {
          $http.get(apiLink + "/workouts/" + "Chest")
            .success(function(data) {
                $scope.suggestedWorkouts = data;
                $scope.suggestedWorkouts.splice(4);
                console.log($scope.suggestedWorkouts);
            })
            .error(function(data) {
                alert("API ERROR" + "\n" + "/workouts/{type}");
          });
        } else if (highestCountType == "Cardio") {
          $http.get(apiLink + "/workouts/" + "Arms")
            .success(function(data) {
                $scope.suggestedWorkouts = data;
                $scope.suggestedWorkouts.splice(4);
                console.log($scope.suggestedWorkouts);
            })
            .error(function(data) {
                alert("API ERROR" + "\n" + "/workouts/{type}");
          });
        }

    })
    .error(function(data) {
        alert("API ERROR" + "\n" + "/getHistory");
    });

  // Get users favorite workouts
  $http.get(apiLink + "/favorites/" + $scope.user_id)
    .success(function(data) {
        $scope.favoriteWorkouts = data;
    })
    .error(function(data) {
        alert("API ERROR" + "\n" + "/favorites");
    });

   $http.get(apiLink + "/workoutTypes")
      .success(function(data) {
          $scope.workoutTypes = data;
          $scope.workoutTypes1 = data.slice(0,3);
          $scope.workoutTypes2 = data.slice(3,6);

      })
      .error(function(data) {
          alert("API ERROR" + "\n" + "/workoutTypes");
      });

    // Modal for active workout
    $ionicModal.fromTemplateUrl('templates/workoutActivity-modal.html', {
      id: '1',
      scope: $scope,
      animation: 'slide-in-left'
    }).then(function(modal) {
      $scope.modal = modal;
    })

    // Modal for selecting workout type
    $ionicModal.fromTemplateUrl('templates/typeSelector-modal.html', {
      id: '2',
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.typeModal = modal;
    })
    
    $ionicModal.fromTemplateUrl('templates/workoutSelector-modal.html', {
        id: '3',
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.workoutSelectorModal = modal;
      })

    $scope.closeModal = function(index) {
      if (index == 1) {
        $scope.modal.hide();
      } else if (index == 2) {
        $scope.typeModal.hide();
      }else if(index == 3){
          $scope.workoutSelectorModal.hide();
      }
          
    }

    $scope.openModal = function(index, activeTitle, activeId, activeDesc, type) {
      if (index == 1) {
        $scope.activeWorkout = activeTitle;
        $scope.workoutId = activeId;
        $scope.workoutDesc= activeDesc;
        console.log("Workout ID: " + $scope.workoutId);
        $scope.modal.show();  
         $scope.back = function() {
            $scope.modal.hide();
          } 
      } else if (index == 2) {
        $ionicSlideBoxDelegate.slide(0);
        // console.log("On slide #" + $ionicSlideBoxDelegate.currentIndex());
        $scope.typeModal.show();
         $scope.back = function() {
            $scope.typeModal.hide();
          } 

      } else if(index == 3){
          $scope.workoutType3 = type;
          $scope.loadWorkouts($scope.workoutType3);
          $scope.workoutSelectorModal.show();
           $scope.back = function() {
            $scope.workoutSelectorModal.hide();
          } 
      }
    }


    $scope.submitWorkout = function() {

      console.log(this.form.sets);
      $scope.user_id = userData.getId();
      $scope.workoutId = $scope.workoutId;
      $scope.reps = this.form.reps;
      $scope.sets = this.form.sets;
      $scope.weight = this.form.weight;
      $scope.points = 15;
      $scope.duration = "";

      console.log($scope.user_id + " . " + $scope.workoutId + " . " + $scope.reps + " . " + $scope.sets + " . " + $scope.weight + " . " + $scope.points + " . " + $scope.duration);

      $http.post(apiLink + "/addCompletedWorkout", 
        {
          "user_id": $scope.user_id,
          "workout_id": $scope.workoutId,
          "sets": $scope.sets,
          "reps": $scope.reps,
          "weight": $scope.weight,
          "points": $scope.points,
          "duration": $scope.duration
        }
      )
      .success(function(data) {
          $scope.addWorkoutResponse = data;
          console.log($scope.addWorkoutResponse)

          $ionicHistory.nextViewOptions({
            disableAnimate: true,
            disableBack: true
          });

          $scope.closeModal(2);
          $scope.closeModal(1);
          
      })
      .error(function(data) {
          alert("API ERROR" + "\n" + "POST /addCompletedWorkout" + "\n" + data);
      });
    }

    $scope.loadWorkouts = function(type) {
      $http.get(apiLink + "/workouts/" + type)
        .success(function(data) {
            $scope.workouts = data;
        })
        .error(function(data) {
            alert("API ERROR" + "\n" + "/workouts/{type}");
      });

      
    }
    
 $scope.home = function() {
    $state.go('app.dashboard');
  } 


    
    
})


