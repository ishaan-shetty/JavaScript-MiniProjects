// let robot = lib220.loadImageFromURL('https://people.cs.umass.edu/~joydeepb/robot.jpg');
// let robot = lib220.createImage(10, 10, [1,1,1]);


// Question 1: Removes Blue and Green shades from Image
function removeBlueAndGreen(Image){
  let robot = Image.copy();  
  for(let i = 0; i < robot.width; ++i){
      for (let j = 0; j < robot.height; ++j){
        robot.setPixel(i, j, [robot.getPixel(i,j)[0],0,0]);
      }
  }
  return robot;
}

//Question 2: Shifts RGB
function shiftRGB(Image){
  let robot = Image.copy();  
  for(let i = 0; i < robot.width; ++i){
      for (let j = 0; j < robot.height; ++j){
          robot.setPixel(i, j, [robot.getPixel(i,j)[1],robot.getPixel(i,j)[2],robot.getPixel(i,j)[0]]);
      }
  }
  return robot;
}

// Question 3
function imageMap(Image, func){
  let robot = Image.copy();

  for (let i = 0; i < robot.width; ++i){
    for (let j = 0; j < robot.height; ++j){
      robot.setPixel(i,j, func(robot.getPixel(i,j)));
    }
  }
  return robot;
}

//Question 4
function mapToRedHelper(pixel){
  return [pixel[0], 0, 0];
}
function mapToRed(Image){
  return imageMap(Image, mapToRedHelper);
}

function mapToGBRHelper(pixel){
  return [pixel[1], pixel[2], pixel[0]];
}
function mapToGBR(Image){
  return imageMap(Image, mapToGBRHelper);
}

//Question 5
function increaseContrast(Image){
  let robot = Image.copy();

  robot = imageMap(Image, adjustContrast);
  return robot;
}

function adjustContrast(pixel){
  if (pixel[0] > 0.5){
    pixel[0] = pixel[0] + 0.1 * (1 - pixel[0]);
  }
  else{
    pixel[0] = pixel[0] - 0.1 * pixel[0];
  }
  if (pixel[1] > 0.5){
    pixel[1] = pixel[1] + 0.1 * (1 - pixel[1]);
  }
  else{
    pixel[1] = pixel[1] - 0.1 * pixel[1];
  }
  if (pixel[2] > 0.5){
    pixel[2] = pixel[2] + 0.1 * (1 - pixel[2])
  }
  else{
    pixel[2] = pixel[2] - 0.1 * pixel[2];
  }
  return [pixel[0], pixel[1], pixel[2]];
}

//Test Cases

test('removeBlueAndGreen function definition is correct', function() {
  const white = lib220.createImage(10, 10, [1,1,1]);
  removeBlueAndGreen(white).getPixel(0,0);
// Checks that code runs. Need to use assert to check properties.
});

test('No blue or green in removeBlueAndGreen result', function() {
// Create a test image, of size 10 pixels x 10 pixels, and set it to all white.
  const white = lib220.createImage(10, 10, [1,1,1]);
// Get the result of the function.
  const shouldBeRed = removeBlueAndGreen(white);
// Read the center pixel.
  const pixelValue = shouldBeRed.getPixel(5, 5);
// The red channel should be unchanged.
  assert(pixelValue[0] === 1);
// The green channel should be 0.
  assert(pixelValue[1] === 0);
// The blue channel should be 0.
  assert(pixelValue[2] === 0);
});

function pixelEq (p1, p2) {
  const epsilon = 0.002;
  for (let i = 0; i < 3; ++i) {
    if (Math.abs(p1[i] - p2[i]) > epsilon) {
      return false;
    }
  }
  return true;
};

test('Check pixel equality', function() {
  const inputPixel = [0.5, 0.5, 0.5];
// Create a test image, of size 10 pixels x 10 pixels, and set it to the inputPixel
  const image = lib220.createImage(10, 10, inputPixel);
// Process the image.
  const outputImage = removeBlueAndGreen(image);
// Check the center pixel.
  const centerPixel = outputImage.getPixel(5, 5);
  assert(pixelEq(centerPixel, [0.5, 0, 0]));
// Check the top-left corner pixel.
  const cornerPixel = outputImage.getPixel(0, 0);
  assert(pixelEq(cornerPixel, [0.5, 0, 0]));
});

test('Check contrast operation', function(){
  let inp = [0.1,0.3,0.7];
  let out = adjustContrast(inp);
  assert(out[0] === 0.09);
  assert(out[1] === 0.27);
  assert(out[2] === 0.73); 
});

function checkContrast(){
  let out = increaseContrast(robot);
  let outPixel, robotPixel;

  for (let i = 0; i < robot.width; ++i){
    for (let j = 0; j < robot.height; ++j){
      outPixel = out.getPixel(i,j);
      robotPixel = robot.getPixel(i,j);

      for (let k = 0; k <= 2; ++k){
        if (robotPixel[k] > 0.5 && Math.abs (outPixel[k] - (robotPixel[k] + 0.1 * (1 - robotPixel[k]))) > 0.002){
          return false;
        }
        else if (robotPixel[k] < 0.5 && Math.abs(outPixel[k] - (robotPixel[k] - 0.1 * robotPixel[k])) > 0.002){
          return false;
        }
      }
    }
  }
  return true;
}

test('Check contrast function', function(){
  assert(checkContrast(), true);
});

//Map to red test
test('Check map to red', function(){
  const inputPixel = [0.5, 0.5, 0.5];
  const inp = lib220.createImage(10, 10, inputPixel);
  let out = mapToRed(inp);
  let res = true;

  //Ensures input and output have same dimensions
  if(out.width !== inp.width && out.height !== inp.height){
    res = false;
  }

  for (let i = 0; i < inp.width; ++i){
    for (let j = 0; j < inp.height; ++j){
      let pixel = out.getPixel(i,j);
      if (pixel[0] !== inp.getPixel(i,j)[0] && pixel[1] !== 0 && pixel[2] !== 0){
        res = false;
      }
    }
  }
  assert(res, true);
});