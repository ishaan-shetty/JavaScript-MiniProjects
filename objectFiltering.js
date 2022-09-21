let tData = lib220.loadJSONFromURL('https://people.cs.umass.edu/~joydeepb/yelp.json'); 
class FluentRestaurants{
  
  constructor(jsonData){
    this.data = jsonData;
  }

  //Filters restaurants present in certain state
  fromState(stateStr){
    let data = this.data.filter(x => lib220.getProperty(x,'state').found).filter(x => lib220.getProperty(x,'state').value === stateStr);
    let returnObj= new FluentRestaurants(data);
    return returnObj;
  }

  //Filters restaurant with ratings less than or equal to given parameter
  ratingLeq(rating){
    let data = this.data.filter(x => lib220.getProperty(x,'stars').found).filter(x => lib220.getProperty(x,'stars').value <= rating);
    let returnObj= new FluentRestaurants(data);
    return returnObj;
  }

  //Filters restaurant with ratings greater than or equal to given parameter
  ratingGeq(rating){
    let data = this.data.filter(x => lib220.getProperty(x,'stars').found).filter(x => lib220.getProperty(x,'stars').value >= rating);
    let returnObj= new FluentRestaurants(data);
    return returnObj;
  }

  //Filters restaurants with having a certain category
  category(categoryStr){
    let data = this.data.filter(x => lib220.getProperty(x,'categories').found).filter(x => lib220.getProperty(x,'categories').value.some(y => y === categoryStr));
    let returnObj= new FluentRestaurants(data);
    return returnObj;
  }

  //Filters restaurant which have certain ambience
  hasAmbience(ambienceStr){
    let ambienceObj = this.data.filter(x => lib220.getProperty(x, 'attributes').found);
    ambienceObj = ambienceObj.filter(x=> lib220.getProperty(x.attributes, 'Ambience').found).filter(x => lib220.getProperty(x.attributes.Ambience, ambienceStr).found);
    let data = ambienceObj.filter(x => lib220.getProperty(x.attributes.Ambience, ambienceStr).value);
    let returnObj= new FluentRestaurants(data);
    return returnObj;
  }

  //Finds the bestPlace depending on stars and reviews
  //Returns a single Restaurant object
  bestPlace(){
    let maxRating = this.data.filter(x => lib220.getProperty(x, 'stars').found);

    //Returns empty object if no restaurant has star attribute
    if (maxRating.length === 0){
      return {};
    }

    maxRating = maxRating.reduce((acc, e) => Math.max(e.stars, acc), 0);
    let maxRatingObj = this.data.filter(x => x.stars === maxRating);

    if(maxRatingObj.length === 1){
      return maxRatingObj[0]
    }
    
    let maxReviews = maxRatingObj.filter(x => lib220.getProperty(x, 'review_count').found);

    if(maxReviews.length === 0){
      return maxRatingObj[0];
    }

    maxReviews = maxReviews.reduce((acc, e) => Math.max(e.review_count, acc), 0);
    let maxReviewsObj = maxRatingObj.filter(x => x.review_count === maxReviews);

    return maxReviewsObj[0];
  }

  //Finds the most reviews depending on review_count and stars
  //Returns a single Restaurant object
  mostReviews(){
    let maxReviews = this.data.filter(x => lib220.getProperty(x, 'review_count').found);
    
    //Returns empty object if no restaurant has review_count attribute
    if(maxReviews.length === 0){
      return {};
    }

    maxReviews = maxReviews.reduce((acc, e) => Math.max(e.review_count, acc), 0);
    let maxReviewsObj = this.data.filter(x => x.review_count === maxReviews);

    if(maxReviewsObj.length === 1){
      return maxReviewsObj[0];
    }

    let maxRating = maxReviewsObj.filter(x => lib220.getProperty(x, 'stars').found);

    if(maxRating.length === 0){
      return maxReviewsObj[0];
    }

    maxRating = maxRating.reduce((acc, e) => Math.max(e.stars, acc), 0);
    let maxRatingObj = maxReviewsObj.filter(x => x.stars === maxRating);

    return maxRatingObj[0];
  }
}


//Manual Testing
let f = new FluentRestaurants(tData);
// console.log(tData);
// console.log(lib220.getProperty(tData[1].attributes,'Ambience').found);
// console.log(lib220.getProperty(tData[1].attributes.Ambience,'romantic').value);
// console.log(f.bestPlace().name);
// console.log(f.mostReviews().name);
// console.log(tData.filter(x=> lib220.getProperty(x, 'Ambience'));
// console.log(f.category("Shopping"));


//Testing

//Data for testing different cases
const testData = [
{
  name: "Applebee's",
  state: "NC",
  stars: 4,
  review_count: 6,
  attributes: {
    Ambience: {
        romantic: true,
        intimate: false,
        classy: false,
        hipster: false,
        touristy: false,
        trendy: false,
        upscale: false,
        casual: false
    }
  }
},
 {
  name: "China Garden",
  state: "NC",
  stars: 4,
  review_count: 10,
  categories: [
      "Active Life",
      "Dog Parks",
      "Parks"
    ]
 },
 {
  name: "Beach Ventures Roofing",
  state: "AZ",
  stars: 3,
  review_count: 30,
 },
 {
  name: "Alpaul Automobile Wash",
  state: "NC",
  stars: 3,
  review_count: 30,
  categories: [
      "Dog Parks",
    ]
 }
];

const testData2 = [
{
  name: "Applebee's",
  review_count: 6,
 },
 {
  name: "China Garden",
  review_count: 10,
 },
 {
  name: "Beach Ventures Roofing",
  review_count: 30,
 },
 {
  name: "Alpaul Automobile Wash",
  review_count: 30,
 }
];

const testData3 = [
{
  name: "Applebee's",
  state: "NC",
 },
 {
  name: "China Garden",
  state: "NC",
 },
 {
  name: "Beach Ventures Roofing",
  state: "AZ",
 },
 {
  name: "Alpaul Automobile Wash",
  state: "NC",
 }
];

const testData4 = [
{
  name: "Applebee's",
  state: "NC",
  stars: 4,
 },
 {
  name: "China Garden",
  state: "NC",
  stars: 4,
 },
 {
  name: "Beach Ventures Roofing",
  state: "AZ",
  stars: 3,
 },
 {
  name: "Alpaul Automobile Wash",
  state: "NC",
  stars: 3,
 }
];


test("Usage for getProperty", function() {
 let obj = { x: 42, y: "hello"};
 assert(lib220.getProperty(obj, 'x').found === true);
 assert(lib220.getProperty(obj, 'x').value === 42);
 assert(lib220.getProperty(obj, 'y').value === "hello");
 assert(lib220.getProperty(obj, 'z').found === false);
});

test('fromState filters correctly', function() {
  let tObj = new FluentRestaurants(testData);
  let list = tObj.fromState('NC').data;
  assert(list.length === 3);
  assert(list[0].name === "Applebee's");
  assert(list[1].name === "China Garden");
  assert(list[2].name === "Alpaul Automobile Wash");
});

test('fromState returns empty object for data with no state property', function(){
  let tObj = new FluentRestaurants(testData2);
  let list = tObj.fromState('NC').data;
  assert(list.length === 0);
});

test('bestPlace tie-breaking', function() {
  let tObj = new FluentRestaurants(testData);
  let place = tObj.fromState('NC').bestPlace();
  assert(place.name === 'China Garden');
});

test('ratingLeq filters correctly', function(){
  let tObj = new FluentRestaurants(testData);
  let list = tObj.ratingLeq(3).data;
  assert(list.length === 2);
  assert(list[0].name === "Beach Ventures Roofing");
  assert(list[1].name === "Alpaul Automobile Wash");
});

test('ratingGeq filters correctly', function(){
  let tObj = new FluentRestaurants(testData);
  let list = tObj.ratingGeq(3).data;
  assert(list.length === 4);
  assert(list[0].name === "Applebee's");
  assert(list[1].name === "China Garden");
  assert(list[2].name === "Beach Ventures Roofing");
  assert(list[3].name === "Alpaul Automobile Wash");
});

test('hasAmbience filters correctly', function(){
  let tObj = new FluentRestaurants(testData);
  let list = tObj.hasAmbience('romantic').data;
  assert(list[0].name === "Applebee's");
  assert(list.length === 1);
  let list1 = tObj.hasAmbience('boring').data;
  assert(list1.length === 0);
});

test('categories filters correctly', function(){
  let tObj = new FluentRestaurants(testData);
  let list = tObj.category('Dog Parks').data;
  assert(list.length === 2);
  let list1 = tObj.category('Cycle Path').data;
  assert(list1.length === 0);
});

test('mostReviews selects correct Restaurant', function() {
  let tObj = new FluentRestaurants(testData);
  let place = tObj.mostReviews();
  assert(place.name === 'Beach Ventures Roofing');
});

test('bestPlace returns empty object when all restaurants lack stars', function(){
  let tObj = new FluentRestaurants(testData2);
  let place = tObj.bestPlace();
  assert(Object.keys(place).length === 0);
});

test('bestPlace doesnt fail for data with stars but no review field', function(){
  let tObj = new FluentRestaurants(testData4);
  let place = tObj.bestPlace();
  assert(place.name === "Applebee's");
});

test('mostReviews returns empty object when all restaurants lack review_count and stars', function(){
  let tObj = new FluentRestaurants(testData3);
  let place = tObj.mostReviews();
  assert(Object.keys(place).length === 0);
});

test('mostReviews doesnt fail for data with reviews but no star field', function(){
  let tObj = new FluentRestaurants(testData2);
  let place = tObj.mostReviews();
  assert(place.name === 'Beach Ventures Roofing');
});

