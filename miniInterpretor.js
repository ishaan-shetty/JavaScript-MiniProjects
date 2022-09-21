//Function used to find the state where a variable is stored. Used to handle scoping of variables
/**Since each scope has a link to its upper level scope- This loops through the scopes till either 
the variable is found or no upper scope is present**/
//lookup(state: State, x: string): State
function lookup(state, x){
  while(!lib220.getProperty(state, x).found && lib220.getProperty(state, 'originalState').found){
    state = lib220.getProperty(state, 'originalState').value;
  }
  return state;
}

//Check if a variable is present in current state
//checkVariablePresence(state: State, name: String): void
function checkVariablePresence(state, name){
  if(!lib220.getProperty(state, name).found){
    console.log('Variable not declared');
    assert(false);
  }
}

//interpExpression(state: State, e: Expr): number | boolean
function interpExpression(state, e){

  //Function to check expression kind
  const checkKind = (st => e.kind === st);

  if(checkKind('error')){
    assert(false);
  }

  //For expression of kind operator
  else if(checkKind('operator')){
    let e1 = interpExpression(state, e.e1);
    let e2 = interpExpression(state, e.e2);
    const checkOperator = (st => e.op === st);
    
    //Takes care of short circuit evaluation
    if(typeof(e1) === 'boolean' && checkOperator('||') && e1){
      return true;
    }
    if(typeof(e1) === 'boolean' && checkOperator('&&') && !e1){
      return false;
    }

    if(checkOperator('===')){
      return e1 === e2;
    }

    //Ensures operation are done on same variable type
    if (typeof(e1) !== typeof(e2)){
      console.log('Operation on different types');
      assert(false);
    }

    //Ensures that mathematical/numerical operations are not done on booleans
    else if (typeof(e1) !== 'boolean'){
      if(checkOperator('*')){
        return e1 * e2;
      }
      else if(checkOperator('-')){
        return e1 - e2;
      }
      else if(checkOperator('+')){
        return e1 + e2;
      }
      else if(checkOperator('/')){
        return e1 / e2;
      }
      else if(checkOperator('>')){
        return e1 > e2;
      }
      else if(checkOperator('<')){
        return e1 < e2;
      }
      else{
        console.log('Operator not recognized');
        assert(false);
      }
    }

    //Ensure boolean operations are not performed on numbers
    else if(typeof(e1) !== 'number'){
      if(checkOperator('&&')){
        return e1 && e2;
      }
      else if(checkOperator('||')){
        return e1 || e2;
      }
      else{
        console.log('Operator not recognized');
        assert(false);
      }
    }

    else{
      console.log('Operation not possible on the type');
      assert(false);
    }
  }

  //For expression of kind number
  else if(checkKind('number') || checkKind('boolean')){
    return e.value;
  }

  //For expression of kind variable
  else if(checkKind('variable')){
    let stateToSearch = lookup(state, e.name);
    
    checkVariablePresence(stateToSearch, e.name);

    return lib220.getProperty(stateToSearch, e.name).value;
  }
}

//interpStatement(state: State, p: Stmt): void
function interpStatement(state, p){

  //Function to check statement kind
  //checkKind(st: String): boolean
  const checkKind = (st => p.kind === st);

  if(checkKind('let')){
    lib220.setProperty(state, p.name, interpExpression(state, p.expression));
  }

  else if(checkKind('assignment')){
    let stateToSearch = lookup(state, p.name);

    checkVariablePresence(stateToSearch, p.name);

    lib220.setProperty(stateToSearch, p.name, interpExpression(state, p.expression));
  }

  else if(checkKind('if')){
    let newState = {originalState: state};

    if(interpExpression(state,p.test)){
      interpBlock(newState, p.truePart);
    }
    else{
      interpBlock(newState, p.falsePart);
    }
  }

  else if(checkKind('while')){
    let newState = {originalState: state};
    while(interpExpression(newState, p.test)){
      interpBlock(newState, p.body);
    }
  }

  else if(checkKind('print')){
    console.log(interpExpression(state, p.expression));
  }

  else{
    console.log('Kind not recognized');
    assert(false);
  }
}

//Used to run blocks of codes
//interpBlock(state: State, p: Stmt[]): void
function interpBlock(state, p){
  p.reduce((state,st) => {
    interpStatement(state, st);
    return state;
  }, state);
}

//interpProgram(p: Stmt[]): State
function interpProgram(p){
  let state = {};
  interpBlock(state, p);
  return state;
}

//Testing
test("multiplication with a variable", function() {
  let r = interpExpression({ x: 10 }, parser.parseExpression("x * 2").value);
  assert(r === 20);
});

test("assignment", function() {
  let st = interpProgram(parser.parseProgram("let x = 10; x = 20;").value);
  assert(st.x === 20);
});

test('Short circuit expressions do not fail', function(){
  let st = interpProgram(parser.parseProgram("let x = true || 2;").value);
  assert(st.x === true);

  let st1 = interpProgram(parser.parseProgram("let x = true === 2;").value);
  assert(st1.x === false);

  let st2 = interpProgram(parser.parseProgram("let y = 0; let x = y===0 || 1;").value);
  assert(st2.x === true);

  let st3 = interpProgram(parser.parseProgram("let x = false && 1;").value);
  assert(st3.x === false);
});

test("variables in while/if block not present in returned state", function(){
  let st = interpProgram(parser.parseProgram("let x = 1 + 9; if(x===10){let y = 2;}else{}").value);
  assert(!lib220.getProperty(st, 'y').found);

  let st1 = interpProgram(parser.parseProgram("let x = 1 + 9; while(x>0){let y = 2; x = x - 1;}").value);
  assert(!lib220.getProperty(st1, 'y').found);

  let st2 = interpProgram(parser.parseProgram("let x = 1 + 9; if(x===1){let y = 0;}else{if(x === 10){let z = 0; x = 2;}else{}}").value);
  assert(!lib220.getProperty(st2, 'y').found);
  assert(!lib220.getProperty(st2, 'z').found);
  assert(lib220.getProperty(st2, 'x').value === 2);
});

test('redefinition doesnt affect original state', function(){
  let p1 =
  [
    {
      kind: "let",
      name: "x",
      expression: {
        kind: "operator",
        op: "+",
        e1: {kind: "number",value: 1},
        e2: {kind: "number",value: 9}
      }
    },
    {
      kind: "if",
      test: {
        kind: "operator",
        op: ">",
        e1: {kind: "variable", name: "x"},
        e2: {kind: "number", value: 0}
      },
      truePart: [
        {
          kind: "assignment",
          name: "x",
          expression: {kind: "number",value: 3}
        },
        {
          kind: "let",
          name: "x",
          expression: {kind: "boolean", value: true}
        }
      ],
      falsePart: []
    }
  ] 
  let st1 = interpProgram(p1);
  assert(lib220.getProperty(st1, 'x').value === 3);
});



