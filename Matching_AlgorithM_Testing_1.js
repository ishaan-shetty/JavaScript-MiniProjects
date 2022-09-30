function generateInput(n){
  function randomlet(min, max){
    return Math.floor(Math.random() * (max - min)) + min;
  }
  let preferences = [];
  let tempArray = [];
  let random = 0;
  for (let i = 0; i < n; ++i){
    for (let j = 0; j < n; ++j){
      do{
        random = randomlet(0,n);
      }while (tempArray.includes(random));
      tempArray.push(random);
    }
    preferences.push(tempArray);
    tempArray = [];
  }
  return preferences;
}

function oracle (f){
  let numTests = 10; //Number of tests of each type 
  let n = 6; //Number of candidates and companies 

  for (let i = 0; i < numTests; ++i) {
    let companies = generateInput(n);
    let candidates = generateInput(n);
    let hires = f(companies, candidates);

    //Test 1: Length of hires and companies are equal
    test('Hires length is correct', function() {
    assert(companies.length === hires.length);
    });
    test ("Hire Length not equal to 0", function(){
      assert(hires.length > 0);
    });

    // Test 2: (Tests generateInput Function) Contains All Candidates and Companies
    test('Contains All Candidates and Companies', function(){
      for (let j = 0; j < n; ++j){
        for (let k = 0; k < n; ++k){
            let checkTest2 = 0;
            for (let m = 0; m < n; ++m){
              checkTest2 = companies[j].includes(m)? checkTest2 + 1 : checkTest2;
            }
            assert(checkTest2 === n);
            checkTest2 = 0;
            for (let m = 0; m < n; ++m){
              checkTest2 = candidates[j].includes(m)? checkTest2 + 1 : checkTest2;
            }
            assert(checkTest2 === n);
        }
      }
    });


    //Test 3: Function doesnt match Candidate to two differenct Companies or vice versa
    test("Function doesnt match Candidate to two differenct Companies or vice versa", function(){
      let checkCompany = false;
      let checkCandidate = false;
      for (let j = 0; j < hires.length ; ++j){
        for (let k = j + 1; k < hires.length; ++k){
          checkCompany = hires[j].company === hires[k].company? true : checkCompany;
          checkCandidate = hires[j].candidate === hires[k].candidate? true : checkCandidate;
        }
        if (checkCompany || checkCandidate){
          break;
        }
      }
      assert(!checkCompany);
      assert(!checkCandidate);
    });

    // Test 4: Checks if hires matches without focusing on priority
    test ("Function matches company and candidate according to priority", function(){
      let checkTest4 = 0;
      for (let j = 0; j < hires.length; ++j){
        checkTest4 = hires[j].candidate === hires[j].company? ++checkTest4 : checkTest4;
      }
        assert (checkTest4 !== n);
    });
    
    //Test 5: Hires Includes all candidates and companies
    test ("Checking if Hire includes all companies and candidates", function(){
      let checkTest5Company = false;
      let checkTest5Candidate = false;
      for (let j = 0; j < companies.length; ++j){
        checkTest5Company = false;
        checkTest5Candidate = false
        for (let k = 0; k < hires.length; ++k){
          checkTest5Company = hires[k].company === j? true : checkTest5Company;
          checkTest5Candidate = hires[k].candidate === j? true : checkTest5Candidate;
        }
        assert(checkTest5Company);
        assert(checkTest5Candidate);
        }
    });

    // Test 6: Function doesn't fail with 1 company and candidate array
    test("Function handles single company and candidate array", function(){
      let newCompanies = generateInput(1);
      let newCandidates = generateInput(1);
      let newHires = f(newCompanies, newCandidates);
      assert (newHires.length === 1);
      assert(newHires[0].company === 0);
      assert(newHires[0].candidate === 0);
    });
      
    //Test 8: Function maintains output stability (Doesnt match against Preference)
    test('Function maintains output stability',function(){
      assert(checkStability(hires,companies,candidates));
    });

    //Test 9: Tests checkStability function
    test('Tests checkStability Function', function(){
      let test9Companies = [[0,1,2], [0,2,1], [1,0,2]];
      let test9Candidates = [[1,2,0], [2,1,0], [1,0,2]];
      let test9HiresWheat = wheat1(test9Companies, test9Candidates);
      let test9HiresChaff = chaff1(test9Companies, test9Candidates);

      assert(checkStability(test9HiresWheat, test9Companies, test9Candidates));
      assert(!checkStability(test9HiresChaff, test9Companies, test9Candidates));
    });

  }

  function checkStability (hires, companies, candidates){
    let higherPreferenceComp = [];
    let higherPreferenceCand =[];
    let check = false;
    for (let j = 0; j < companies.length; ++j){
      let temp = higherPreferences (j, j);
      higherPreferenceComp.push (temp[0]);
      higherPreferenceCand.push(temp[1]);
    }


    for (let j = 0; j < higherPreferenceComp.length; ++j){   
      let tempArrComp = higherPreferenceComp[j];
      for (let k = 0; k < tempArrComp.length; ++k){
        let tempArrCand = higherPreferenceCand[tempArrComp[k]];
        if (tempArrCand.indexOf(j) !== -1){
          check = true;
          return !check;
        }
      } 
    }
    return !check;
    
    function findHiresIndexComp(ind){
      for (let j = 0; j < hires.length; ++j){
        if (hires[j].company === ind){
          return hires[j].candidate;
        }
      }
    }
    function findHiresIndexCand(ind){
      for (let j = 0; j < hires.length; ++j){
        if (hires[j].candidate === ind){
          return hires[j].company;
        }
      }
    }

    function higherPreferences (currCompany, currCandidate){
      let preferences = [];
      let jointPreferences = [];
      let candforComp = findHiresIndexComp(currCompany);
      let compforCand = findHiresIndexCand(currCandidate);

      for (let j = 0; j < companies.length; ++j){
        if(companies[currCompany][j] === candforComp){
          jointPreferences.push(preferences);
          break;
        }
        preferences.push(companies[currCompany][j]);
      }

      preferences = [];

      for (let j = 0; j < candidates.length; ++j){
        if(candidates[currCandidate][j] === compforCand){
          jointPreferences.push(preferences);
          break;
        }
        preferences.push(candidates[currCandidate][j]);
      }
      return jointPreferences;      
    } 
  }
}




oracle(wheat1);
oracle(chaff1);