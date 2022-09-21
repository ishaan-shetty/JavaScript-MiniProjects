function imageMapXY (img, func){
  img = img.copy();
  for (let i = 0; i < img.width; ++i){
    for (let j = 0; j < img.height; ++j){
      img.setPixel(i,j, func(img, i, j));
    }
  }
  return img;
}

function imageMask (img, condFunc, maskValue){
  function imageMaskHelper(img, i, j){
    if (condFunc (img, i, j)){
      return maskValue;
    }
    else{
      return img.getPixel(i,j);
    }
  }
  return imageMapXY(img, imageMaskHelper);
}

function imageMapCond (img, condFunc, func){
  function imageMapCondHelper(img, i, j){
    if (condFunc(img, i, j)){
      return func(img.getPixel(i,j));
    }
    else{
      return img.getPixel(i,j);
    }
  }
  return imageMapXY(img, imageMapCondHelper);
}

function isGrayish(pixel){
  let max = Math.max(pixel[0], pixel[1]);
  max = Math.max(max, pixel[2]);

  let min = Math.min(pixel[0], pixel[1]);
  min = Math.min(min, pixel[2]);

  return ((max - min) <= 1/3);
}

function makeGrayish (img){
  return imageMapXY(img, makeGrayishHelper);
}

function makeGrayishHelper(img, i, j){
  let pixel = img.getPixel(i,j);
  if (!isGrayish(pixel)){
    let newPixel = [0,0,0];
    newPixel[0] = (pixel[0] + pixel[1] + pixel[2]) / 3;
    newPixel[1] = (pixel[0] + pixel[1] + pixel[2]) / 3;
    newPixel[2] = (pixel[0] + pixel[1] + pixel[2]) / 3;
    return newPixel;
  }

  return pixel;
}

function grayHalfImage(img){
  return imageMapXY(img, grayHalfImageHelper);
}

function grayHalfImageHelper(img, i, j){
  if (j < img.height/2){
    return makeGrayishHelper(img, i, j);
  }
  else{
    return img.getPixel(i,j);
  }
}

function blackenLow(img){
  return imageMapXY(img, blackenLowHelper);
}

function blackenLowHelper(img, i, j){
  let pixel = img.getPixel(i,j);

  function checkLower(val){
    if (val < 1/3){
      return 0;
    }
    return val;
  }
  return pixel.map(checkLower);
}

let url =
'https://people.cs.umass.edu/~joydeepb/robot.jpg';
let robot = lib220.loadImageFromURL(url);
robot.show();
let newImg1 = grayHalfImage (robot);
newImg1.show();
let newImg2 = makeGrayish(robot);
newImg2.show();
let newImg3 = blackenLow(robot);
newImg3.show();


// Test Cases
test('imageMapXY function definition is correct', function() {
  function identity(image, x, y) { return image.getPixel(x, y); }
  let inputImage = lib220.createImage(10, 10, [0, 0, 0]);
  let outputImage = imageMapXY(inputImage, identity);
  let p = outputImage.getPixel(0, 0); // output should be an image, getPixel works
  assert(p.every(c => c === 0)); // every pixel channel is 0
  assert(inputImage !== outputImage); // output should be a different image object
});

function pixelEq (p1, p2) {
  const epsilon = 0.002; // increase for repeated storing & rounding
  return [0,1,2].every(i => Math.abs(p1[i] - p2[i]) <= epsilon);
};
test('identity function with imageMapXY', function() {
  let identityFunction = function(image, x, y ) {
    return image.getPixel(x, y);
  };
  let inputImage = lib220.createImage(10, 10, [0.2, 0.2, 0.2]);
  inputImage.setPixel(0, 0, [0.5, 0.5, 0.5]);
  inputImage.setPixel(5, 5, [0.1, 0.2, 0.3]);
  inputImage.setPixel(2, 8, [0.9, 0.7, 0.8]);
  let outputImage = imageMapXY(inputImage, identityFunction);
  assert(pixelEq(outputImage.getPixel(0, 0), [0.5, 0.5, 0.5]));
  assert(pixelEq(outputImage.getPixel(5, 5), [0.1, 0.2, 0.3]));
  assert(pixelEq(outputImage.getPixel(2, 8), [0.9, 0.7, 0.8]));
  assert(pixelEq(outputImage.getPixel(9, 9), [0.2, 0.2, 0.2]));
});

test('MakeGrayish ensures all pixels are grayish', function(){
  let inp = lib220.createImage(10, 10, [0.2, 0.2, 0.2]);
  let out = makeGrayish(inp);
  let res = true;

  for (let i = 0; i < out.width; ++i){
    for (let j = 0; j < out.height; ++j){
      if(!isGrayish(out.getPixel(i,j))){
        res = false;
        break;
      }
    }
  }
  assert(res);
});

test('Blacken Low  Correctly modifies pixel', function(){
  let inp = lib220.createImage(10, 10, [0.2, 0.2, 0.2]);
  let out = blackenLow(inp);
  let res = true;
  for (let i = 0; i < out.width; ++i){
    for (let j = 0; j < out.height; ++j){
      let pixel = out.getPixel(i,j);
      if (pixel.map(x => x < 1/3 && x !== 0) === [false,false,false]){
        res = false;
        break;
      }
    }
  }
  assert(res);
});

test('Checking pixel equality on half gray Image', function(){
  let inp = lib220.createImage(10, 10, [0.2, 0.2, 0.2]);
  inp.setPixel(5, 5, [0.1, 0.4, 0.7]);
  inp.setPixel(1, 1, [0.1, 0.1, 0.7]);
  let out = grayHalfImage(inp);
  assert(pixelEq(out.getPixel(5, 5), [0.1, 0.4, 0.7]));
  assert(isGrayish(out.getPixel(1,1)));
  assert(pixelEq(out.getPixel(1, 1), [0.3, 0.3, 0.3]));
});

test('Testing isGrayish on different pixel values', function(){
  assert(isGrayish([0.1,0.1,0.1]));
  assert(isGrayish([0,0,0]));
  assert(isGrayish([1,1,1]));
  assert(!isGrayish([0.1,0.2,0.7]))
});

test('Blacken Low Pixel Check', function(){
  let inp = lib220.createImage(10, 10, [0.2, 0.2, 0.2]);
  inp.setPixel(5, 5, [0.1, 0.4, 0.7]);
  inp.setPixel(1, 1, [0.1, 0.1, 0.7]);
  inp.setPixel(2,2,[1/3,1/3,1/3]);
  inp.setPixel(3,3,[0.3,0.3,0.3]);
  let out = blackenLow(inp);
  console.log(out.getPixel(2,2));
  assert(pixelEq(out.getPixel(5, 5), [0,0.4,0.7]));
  assert(pixelEq(out.getPixel(1, 1), [0,0,0.7]));
  assert(pixelEq(out.getPixel(2, 2), [1/3,1/3,1/3]));
  assert(pixelEq(out.getPixel(3, 3), [0,0,0]));
});