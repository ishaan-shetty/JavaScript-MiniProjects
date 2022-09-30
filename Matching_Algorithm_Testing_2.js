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

function runOracle(f){
  let numTests = 10; //Number of tests of each type 
  let n = 6; //Number of candidates and companies 

  for (let i = 0; i < numTests; ++i) {
    let companies = generateInput(n);
    let candidates = generateInput(n);
   
    let run = f(companies, candidates);
    let trace = run.trace;
    let out = run.out;

    //Test 1: Ensures trace sends offer according to preference list
    test ('Trace sends offers according to preferences', function(){
      let test1Company = [];
      companies.forEach(x => test1Company.push(deepCopy2DArray(x)));
      let test1Candidate = [];
      candidates.forEach(x => test1Candidate.push(deepCopy2DArray(x)));

      trace.forEach(t => {
        let arr = t.fromCo? test1Company : test1Candidate;
        assert(t.to === arr[t.from].shift());
      }); 
    });

    //Test 2: Offers are based on traces
    test('Matching is a result of offers', function(){
      let matchings = [];
      companies.forEach(x => matchings.push(-1));

      trace.forEach(t => {
        let to = t.fromCo? t.to : t.from;
        let from = t.fromCo? t.from : t.to;
        let fromCo = t.fromCo;
        let currMatch1 = t.fromCo? matchings[t.from] : matchings.indexOf(t.from);
        let currMatch2 = t.fromCo? matchings.indexOf(t.to) : matchings[t.to];

          if(higherPreference(t.from, t.to, currMatch1, fromCo, matchings) && higherPreference(t.to, t.from, currMatch2, !fromCo, matchings)){
            matchings[from] = to;
            if (matchings.indexOf(to) !== matchings.lastIndexOf(to)){
              matchings[matchings.lastIndexOf(to)] = matchings.indexOf(to) === from? -1 : matchings[matchings.lastIndexOf(to)];
              matchings[matchings.indexOf(to)] = matchings.indexOf(to) === from? matchings[matchings.indexOf(to)] : -1;
            }
          }
      });
      out.forEach(o => assert(o.candidate === matchings[o.company]));
    });

    //Test 3: Trace and Out are not empty
    test("Trace and Out are not Empty", function(){
      assert(trace.length !== 0);
      assert(out.length !== 0);
    });

    //Test 4: Function doesnt match Candidate to two different Companies or vice versa
    test("Function doesnt match Candidate to two different Companies or vice versa", function(){
      let checkCompany = false;
      let checkCandidate = false;
      for (let j = 0; j < out.length ; ++j){
        for (let k = j + 1; k < out.length; ++k){
          checkCompany = out[j].company === out[k].company? true : checkCompany;
          checkCandidate = out[j].candidate === out[k].candidate? true : checkCandidate;
        }
        if (checkCompany || checkCandidate){
          break;
        }
      }
      assert(!checkCompany);
      assert(!checkCandidate);
    });

    function higherPreference(from, to, currMatch, fromCo, matchings){
      if(currMatch !== -1){
        let arr = fromCo? companies : candidates;
        return arr[from].indexOf(to) < arr[from].indexOf(currMatch);
      }
      return true;
    }

    function deepCopy2DArray(a){
      let temp = [];
      a.forEach(x => temp.push(x));
      return temp;
    }
  }
}

const oracleLib = require('oracle');
runOracle( oracleLib.traceWheat1);
runOracle(oracleLib.traceChaff1);
