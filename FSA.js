
class FSA{
  constructor(){
    
    //State class (Inside constructor to prevent user from accessing while allowing FSA methods to work with it)
    class State{
      constructor(name){
        this.name = name;
        this.transitions = {};
      }
      getName(){
        return this.name;
      }
      setName(s){
        this.name = s;
        return this;
      }
      clearTransitions(){
        this.transitions = {};
      }
      addTransition(e,s){
        let transitionState = statesCreated.find(x => x.getName() === s);
        
        //If the state to transition into hasn't been defined
        if(transitionState === undefined){
          FSAThis.createState(s, []);
        }
        
        transitionState = statesCreated.find(x => x.getName() === s);

        if(lib220.getProperty(this.transitions, e).found){
          let arr = lib220.getProperty(this.transitions, e).value;
          arr.push(transitionState);
          lib220.setProperty(this.transitions, e, arr);
        }
        else{
          lib220.setProperty(this.transitions, e, [transitionState]);
        }

        return this;
      }
      nextState(e){
        if(!lib220.getProperty(this.transitions, e).found){
          return undefined;
        }

        let arr = this.nextStates(e);
        let rand = Math.floor(Math.random() * arr.length);
        
        let next = arr[rand];

        return next;
      }
      nextStates(e){
        if(!lib220.getProperty(this.transitions, e).found){
          return undefined;
        }
        return lib220.getProperty(this.transitions, e).value;
      } 
    }

    let state = undefined;
    let statesCreated = [];
    let FSAThis = this;
    
    this.nextState = (e) => {
      if(state === undefined){
        return this;
      }
      let next = state.nextState(e)
      state = next;

      return this;
    };

    this.createState = (s, transitions) => {
      let ns = new State(s);
      
      let stateToFind = statesCreated.findIndex(x => x.getName() === s);
      if(stateToFind === -1){
        statesCreated.push(ns);
      }
      else{
        ns = statesCreated[stateToFind];
        ns.clearTransitions();
      }

      //Makes first created state as the current state of FSA
      if(statesCreated.length === 1){
        state = ns;  
      }

      let tempThis = this;
      transitions.map(o => {
        tempThis.addTransition(ns.getName(), o);  
      });

      return this;
    }

    this.addTransition = (s, t) => {
      let stateToAdd = statesCreated.find(x => x.getName() === s);

      if(stateToAdd === undefined){
        stateToAdd = new State(s);
        statesCreated.push(stateToAdd);
      }
      stateToAdd.addTransition(Object.keys(t)[0], lib220.getProperty(t, Object.keys(t)[0]).value);
      
      return this;
    }

    this.showState = () => {
      if(state === undefined){
        return undefined;
      }
      return state.getName();
    }

    this.renameState = (oldName, newName) => {
      let stateToFind = statesCreated.find(x => x.getName() === oldName);
      if (stateToFind === undefined){
        return this;
      }
      stateToFind.setName(newName);
      
      return this;
    }
    
    this.createMemento = () => {
      let newMemento = new Memento();
      if(state === undefined){
        newMemento.storeState(undefined);
      }
      else{
        newMemento.storeState(state.getName());
      }
      return newMemento;
    }

    this.restoreMemento = (m) => {
      let stateToRestore = m.getState();

      let nextIndex = statesCreated.findIndex(x => x.getName() === stateToRestore);

      if(nextIndex === -1){
        return this;
      }
      state = statesCreated[nextIndex];
      return this;
    }

    class Memento{
      constructor(){
        let name ="";
        
        this.storeState = (s) =>{
          name = s;
        }
        this.getState = () =>{
          return name;
        }
        Object.freeze(this);  
      }
    }
    Object.freeze(this);
  }
}

//Testing
let machine = new FSA().createState("delicates, low", [{mode: "normal, low"}, {temp: "delicates, medium"}])
                         .createState("normal, low", [{mode: "delicates, low"}, {temp: "normal, medium"}])
                         .createState("delicates, medium", [{mode: "normal, medium"},{temp: "delicates, low"}])
                         .createState("normal, medium", [{mode: "delicates, medium"},{temp: "normal, high"}])
                         .createState("normal, high", [{mode: "delicates, medium"},{temp: "normal, low"}]);


test('Next state and show state works and createState assigns first state to current state', function(){
  assert(machine.showState() === "delicates, low");
  assert(machine.nextState('mode').showState() === "normal, low");
  assert(machine.nextState('temp').nextState('mode').showState() === "delicates, medium");
  });

test('New state successfully overrides original state', function(){
  let test2Machine = new FSA().createState("delicates, low", [{mode: "normal, low"}, {temp: "delicates, medium"}])
                         .createState("normal, low", [{mode: "delicates, low"}, {temp: "normal, medium"}])
                         .createState("delicates, medium", [{mode: "normal, medium"},{temp: "delicates, low"}])
                         .createState("normal, low", [{mode: "delicates, medium"},{temp: "normal, high"}])
                         .createState("normal, high", [{mode: "delicates, high"},{temp: "normal, low"}]);
  
  assert(test2Machine.showState() === "delicates, low");
  assert(test2Machine.nextState('mode').showState() === "normal, low");
  assert(test2Machine.nextState('temp').showState() === "normal, high");
  assert(test2Machine.nextState('mode').showState() === "delicates, high");
});

test("Rename state succesfully renames and doesn't mess up other transitions", function(){
  machine.renameState("normal, medium", "new normal");
  assert(machine.nextState('mode').showState() === 'new normal');
  assert(machine.nextState('temp').showState() === 'normal, high');
  assert(machine.nextState('temp').nextState('temp').showState() === 'new normal');
});

let currState = machine.createMemento(); //Stores new normal state

test("Program successfully creates and restore memento", function(){
  machine.nextState('temp').nextState('mode');
  machine.restoreMemento(currState); 
  assert(machine.showState() === 'new normal');
});

test("Add transition adds multiple transitions to an event", function(){
  machine.addTransition('new normal', {temp: 'normal, low'});

  let check = [false, false];
  for(let i = 0; i < 100; ++i){
    machine.nextState('temp');
    if(machine.showState() === 'normal, low'){
      check[0] = true;
    }
    if(machine.showState() === 'normal, high'){
      check[1] = true;
    }
    machine.restoreMemento(currState);
  }
  assert(check[0] && check[1]);

  machine.nextState('mode');
  assert(machine.showState() === 'delicates, medium' || machine.showState() === 'delicates, low');
});

machine.restoreMemento(currState);

test('Machine doesnt break on empty transitions', function(){
let test3Machine = new FSA().createState("delicates, low", [{mode: "normal, low"}, {temp: "delicates, medium"}])
                         .createState("normal, low", [{mode: "delicates, low"}, {temp: "normal, medium"}])
                         .createState("delicates, medium", []);

assert(test3Machine.nextState('temp').nextState('mode').showState() === undefined)
});

test('Memento created when state is undefined stores and restores undefined', function(){
  let test4Machine = new FSA( );
  assert(test4Machine.showState() === undefined);
  let mem = test4Machine.createMemento()
  test4Machine.createState("delicates, low", [{mode: "normal, low"}, {temp: "delicates, medium"}]);
  assert(test4Machine.showState() === 'delicates, low');
});



