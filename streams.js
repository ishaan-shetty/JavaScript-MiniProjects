//Function for node of a stream
function snode(data, next){
  return {
    isEmpty: () => false,
    head: () => data,
    tail: next.get,
    toString: () => "snode(" + head.toString() + ", " + tail.toString() + ")" 
  }
}

//From Lecture Notes
let sempty = { 
  isEmpty: () => true,
  toString: () => 'sempty' 
};

//Function for memoizing stream values
function memo0(f){
  let r = {evaluated: false};
  return{
    get: function(){
      if(!r.evaluated){
        r = {evaluated: true, v: f()};
      }
      return r.v;
    },
    toString: function(){
      return r.evaluated? r.v.toString(): '<unevaluated>';
    }
  }
}

function addSeries(s,t){
  if(s.isEmpty() && t.isEmpty()){
    return sempty;
  }
  if(s.isEmpty()){
    return snode(0 + t.head(),memo0(() => addSeries(sempty, t.tail())));
  }
  if(t.isEmpty()){
    return snode(s.head() + 0,memo0(() => addSeries(s.tail(), sempty)));
  }

  return snode(s.head() + t.head(), memo0(() => addSeries(s.tail(), t.tail())));
}


function prodSeries(s,t){
  function prodSeriesHelper(s0, elem){
    if(s0.isEmpty()){
      return sempty;
    }
    return snode(s0.head() * elem, memo0(() => prodSeriesHelper(s0.tail(), elem)));
  }
  if(t.isEmpty()){
    return sempty;
  }
  let s1 = prodSeriesHelper(s, t.head());
  return addSeries(s1, snode(0, memo0(() => prodSeries(s, t.tail()))));
}

function derivSeries(s){
  function derivSeriesHelper(s0,i){
    if(s0.isEmpty()){
      return sempty;
    }
    return snode(s0.head() * i, memo0(() => derivSeriesHelper(s0.tail(), ++i)));
  }
  return derivSeriesHelper(s,0);
}



function coeff(s,n){
  let arr =[];
  for(let i = 0; i <= n; ++i){
    if(s.isEmpty()){
      return arr;
    }
    arr.push(s.head());
    s = s.tail();
  }
  return arr;
}

function evalSeries(s, n){
  let arr = coeff(s,n);
  
  function evalClosure(x){
    let sum = 0;
    for (let i = 0; i <= n; ++i){
      sum = sum + memo0(() => arr[i]*Math.pow(x,i)).get();
    }
    return sum;
  }
  return evalClosure;
}

function rec1Series(f,v){
  return snode(v, memo0(() => rec1Series(f, f(v))));
}

function expSeries(){
  function expSeriesHelper(i){
    let fact = 1;
    while(i > 0){
      fact = fact * i;
      --i;
    }
    return snode(1/fact, memo0(() => expSeriesHelper(++i)));
  }
  return expSeriesHelper(0);
}


function recurSeries(coeff, init){
  
  function createStream1Helper(i){
    if(i >= init.length){
      return sempty;
    }
    return snode(init[i], memo0(() => createStream1Helper(++i)));
  }
  function createStream1(){
    return createStream1Helper(0);
  }
  
  function stream2Val(a){
    let val = 0
    let j = a;
    for (let i = 0; j < init.length; ++i){
      val = val + coeff[i]*init[j];
      ++j;
    }
    return val;
  }
  function createStream2(a){
    let val = stream2Val(a);
    init.push(val);
    return snode(val, memo0(() => createStream2(++a)));
  }
  let s1 = createStream1();
  let s2 = createStream2(0);

  //Concats two streams; Taken from lecture notes
  function sappend(left, right) {
    if (left.isEmpty()) {
      return right;
    } 
    else {
      return snode(left.head(), memo0(() => sappend(left.tail(), right)));
    }
  }
  return sappend(s1,s2);
}


// let arr1 = [1,2,3];
// let arr2 = [5,6,7];

// console.log(recurSeries(arr1, arr2));

let s1 = snode(1, memo0(() => snode(2, memo0(() => snode(3,memo0(() => snode(4,memo0(() => sempty))))))));
let s2 = snode(0, memo0(() => snode(0, memo0(() => snode(0,memo0(() => snode(0,memo0(() => sempty))))))));
let s3 = snode(5, memo0(() => snode(6, memo0(() => sempty))));
let s4 = snode(0, memo0(() => snode(6, memo0(() => snode(7,memo0(() => snode(8,memo0(() => sempty))))))));
// console.log(prodSeries(s1,s2).tail().tail().head());

//Testing
test("Different length streams in AddSeries", function(){
  let ans = addSeries(s1,s3);
  let ans2 = addSeries(s3,s1);
  let s = [ans,ans2];

  s.map(st => {
    assert(st.head() === 6);
    assert(st.tail().head() === 8);
    assert(st.tail().tail().head() === 3);
    assert(st.tail().tail().tail().head() === 4);
    assert(st.tail().tail().tail().tail().isEmpty());
  });
});

test("Different length streams in prodSeries", function(){
  let ans = prodSeries(s1,s3);
  let ans2 = prodSeries(s3,s1);
  let s = [ans,ans2];

  s.map(st => {
    assert(st.head() === 5);
    assert(st.tail().head() === 16);
    assert(st.tail().tail().head() === 27);
    assert(st.tail().tail().tail().head() === 38); 
  });
});

test("prodSeries works on stream with 0", function(){
  let ans = prodSeries(s1,s4);
  let ans2 = prodSeries(s1,s2);

  assert(ans.head() === 0);
  assert(ans.tail().head() === 6);
  // console.log(ans.tail().tail().head());
  assert(ans.tail().tail().head() === 19);
  assert(ans.tail().tail().tail().head() === 40);

  assert(ans2.head() === 0);
  assert(ans2.tail().head() === 0);
  assert(ans2.tail().tail().head() === 0);
  assert(ans2.tail().tail().tail().head() === 0);
});

test("derivSeries returns correct values", function(){
  let ans = derivSeries(s1);
  let ans2 = derivSeries(s2);

  assert(ans.head() === 0);
  assert(ans.tail().head() === 2);
  assert(ans.tail().tail().head() === 6);
  assert(ans.tail().tail().tail().head() === 12);

  assert(ans2.head() === 0);
  assert(ans2.tail().head() === 0);
  assert(ans2.tail().tail().head() === 0);
  assert(ans2.tail().tail().tail().head() === 0);
});

test("coeff doesnt fail for order -1", function(){
  let ans = coeff(s1,-1);
  assert(ans.length === 0)
});

test("coeff doesnt fail when order not equal to stream length", function(){
  let ans = coeff(s1,6);
  let ans2 = coeff(s1,2);
  let s = [ans, ans2];

  s.map(st =>{
    assert(st[0] === 1);
    assert(st[1] === 2);
    assert(st[2] === 3);
  });

  assert(ans[3] === 4);
  assert(ans.length === 4);
  assert(ans2.length === 3);
});

test("rec1Series has right solution for root function", function(){
  let ans = rec1Series((x) => Math.sqrt(x), 100)
  assert(ans.head() === 100);
  assert(ans.tail().head() === 10);
  assert(ans.tail().tail().head() === Math.sqrt(10));
});






