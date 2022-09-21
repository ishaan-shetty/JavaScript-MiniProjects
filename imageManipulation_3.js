function blurPixel(img, x, y){
  let rPixel = 0, gPixel = 0, bPixel = 0;
  let counter = 0;
  for (let i = x - 1; i <= x + 1; ++i){
    for (let j = y - 1; j <= y + 1; ++j){
      if (!(i < 0 || i >= img.width) && !(j < 0 || j >= img.height)){
        rPixel += img.getPixel(i,j)[0];
        gPixel += img.getPixel(i,j)[1];
        bPixel += img.getPixel(i,j)[2];
        ++counter;
      }
    }
  }
  rPixel /= counter;
  gPixel /= counter;
  bPixel /= counter;
  return [rPixel, gPixel, bPixel];  
}

function imageMapXY (img, func){
  let newImg = img.copy();
  for (let i = 0; i < img.width; ++i){
    for (let j = 0; j < img.height; ++j){
      newImg.setPixel(i,j, func(img, i, j));
    }
  }
  return newImg;
}

function blurImage (img){
  return imageMapXY(img, blurPixel);
}

function diffLeft(img, x, y){
  let pixel = img.getPixel(x,y);
  let m1 = (pixel[0] + pixel[1] + pixel[2])/3;
  let m2 = 0, pixel2 = [0,0,0];
  let pixelExist = false;

  if (x - 1 >= 0){
    pixel2 = img.getPixel(x-1,y);
    m2 = (pixel2[0] + pixel2[1] + pixel2[2])/3;
    pixelExist = true;
  }
  if(pixelExist){
    return [Math.abs(m2 - m1), Math.abs(m2 - m1), Math.abs(m2 - m1)];
  }
  return [0,0,0];
}

function highlightEdges(img){
  return imageMapXY(img, diffLeft);
}

function reduceFunctions (fa){
  function implementFunc(result,func){
    return func(result);
  }
  function reduceReturned(p){
    fa.reduce(implementFunc,p);
  }
  return reduceReturned;
}

function combineThree (img){
  let fa = [makeGrayish, blackenLow, shiftRGB];
  return imageMap(img, reduceFunctionss, fa);
}

function imageMap(img, func, fa){
  img = img.copy();

  for (let i = 0; i < img.width; ++i){
    for (let j = 0; j < img.height; ++j){
      img.setPixel(i,j, func([function(random){return img.getPixel(i,j);}, fa[0], fa[1], fa[2]]));
    }
  }
  return img;
}

function makeGrayish(pixel){
  if (!isGrayish(pixel)){
    let newPixel = [0,0,0];
    newPixel[0] = (pixel[0] + pixel[1] + pixel[2]) / 3;
    newPixel[1] = (pixel[0] + pixel[1] + pixel[2]) / 3;
    newPixel[2] = (pixel[0] + pixel[1] + pixel[2]) / 3;
    return newPixel;
  }
  return pixel;
}

function reduceFunctionss (fa){
  if (fa.length === 0){
    return;
  }
  if (fa.length === 1){
    return fa[0];
  }
  let pixel = fa[0];
  function implementFunc(result,func){
    return func(result);
  }
  return fa.reduce(implementFunc,pixel);
}

function isGrayish(pixel){
  let max = Math.max(pixel[0], pixel[1]);
  max = Math.max(max, pixel[2]);

  let min = Math.min(pixel[0], pixel[1]);
  min = Math.min(min, pixel[2]);

  return ((max - min) <= 1/3);
}

function blackenLow(pixel){
  function checkLower(val){
    if (val < 1/3){
      return 0;
    }
    return val;
  }
  return pixel.map(checkLower);
}

function shiftRGB(pixel){
  return [pixel[1], pixel[2], pixel[0]];
}


// // Manual Testing
// let url =
// 'https://people.cs.umass.edu/~joydeepb/robot.jpg';
// let robot = lib220.loadImageFromURL(url);
// robot.show();
// let newImg1 = blurImage (robot);
// newImg1.show();
// let newImg2 = highlightEdges (robot);
// newImg2.show();
// let newImg3 = combineThree (robot);
// newImg3.show();

//Test Cases

function pixelEq (p1, p2) {
  const epsilon = 0.002; // increase for repeated storing & rounding
  return [0,1,2].every(i => Math.abs(p1[i] - p2[i]) <= epsilon);
};

test("Checking Blur Function Pixel Value", function(){
  let inp = lib220.createImage(11, 11, [0.2, 0.2, 0.2]);
  
  inp.setPixel(5, 5, [0.1, 0.4, 0.7]);
  let out1 = blurPixel(inp, 5, 5);
  inp.setPixel(0, 5, [0.1, 0.4, 0.7]);
  let out2 = blurPixel(inp, 0, 5);
  inp.setPixel(10, 5, [0.1, 0.4, 0.7]);
  let out7 = blurPixel(inp, 10, 5);
  inp.setPixel(0, 0, [0.1, 0.4, 0.7]);
  let out3 = blurPixel(inp, 0, 0);
  inp.setPixel(0, 10, [0.1, 0.4, 0.7]);
  let out4 = blurPixel(inp, 0, 10);
  inp.setPixel(10, 0, [0.1, 0.4, 0.7]);
  let out5 = blurPixel(inp, 10, 0);
  inp.setPixel(10, 10, [0.1, 0.4, 0.7]);
  let out6 = blurPixel(inp, 10, 10);
  let out8 = blurPixel(inp, 4, 5);

  assert(pixelEq(out1, [0.189,0.222,0.256]));
  assert(pixelEq(out2, [0.183,0.233,0.283]));
  assert(pixelEq(out7, [0.183,0.233,0.283]));
  assert(pixelEq(out3, [0.175,0.250,0.325]));
  assert(pixelEq(out4, [0.175,0.250,0.325]));
  assert(pixelEq(out5, [0.175,0.250,0.325]));
  assert(pixelEq(out6, [0.175,0.250,0.325]));
  assert(pixelEq(out8, [0.189,0.222,0.256]));
});

test("Checking Blur Image Function", function(){
  let inp = lib220.createImage(11, 11, [0.2, 0.2, 0.2]);
  inp.setPixel(5, 5, [0.1, 0.4, 0.7]);
  let out = blurImage(inp);
  
  assert(pixelEq(out.getPixel(5,5), [0.189,0.222,0.256]));
  assert(pixelEq(out.getPixel(4,5), [0.189,0.222,0.256]));
  assert(pixelEq(out.getPixel(0,0), [0.2,0.2,0.2]));
});

test("Checking diffLeft Function", function(){
  let inp = lib220.createImage(11, 11, [0.2, 0.2, 0.2]);
  inp.setPixel(5,5, [0.3, 0.4, 0.7]);
  let out1 = diffLeft(inp, 5, 5);
  inp.setPixel(0,0, [0.1, 0.4, 0.7]);
  let out2 = diffLeft(inp, 0, 0);

  assert(pixelEq(out1, [0.267, 0.267, 0.267]));
  assert(pixelEq(out2, [0, 0, 0]));
});

test ("Checking highlight edges Function", function(){
  let inp = lib220.createImage(11, 11, [0.2, 0.2, 0.2]);
  inp.setPixel(5, 5, [0.8, 0.1, 0.7]);
  inp.setPixel(0, 0, [0.3, 0.9, 0.7]);
  inp.setPixel(10,0, [0.3, 0.9, 0.7]);
  let out = highlightEdges(inp);

  assert(pixelEq(out.getPixel(1,0), [0.4333, 0.4333, 0.4333]));
  assert(pixelEq(out.getPixel(6,5), [0.333, 0.333, 0.333]));
  assert(pixelEq(out.getPixel(0,0), [0,0,0]));
  assert(pixelEq(out.getPixel(8,0), [0, 0, 0]));
});

test("Checking Combine Three via Pixel Values", function(){
  let inp = lib220.createImage(11, 11, [0.2, 0.2, 0.2]);
  inp.setPixel(5, 5, [0.8, 0.1, 0.7]);
  inp.setPixel(10,10, [0.1, 0.3, 0.7]);
  let out = combineThree(inp);
  let expOut1 = makeGrayish(out.getPixel(5,5));
  expOut1 = blackenLow(expOut1);
  expOut1 = shiftRGB(expOut1);
  let expOut2 = makeGrayish(out.getPixel(0,0));
  expOut2 = blackenLow(expOut2);
  expOut2 = shiftRGB(expOut2);

  assert(pixelEq(out.getPixel(5,5), expOut1));
  assert(pixelEq(out.getPixel(0,0), expOut2));
  assert(pixelEq(out.getPixel(10,10), [0.367,0.367,0.367]));
});

test("Checking reduceFunction with random functions", function(){
  let f = x => x + 1;
  let g = x => x * x;
  let h = x => x / 2;

  let fa2 = [g, h, f];
  let fa3 = [];
  let fa4 = [f]
  
  let out2 = reduceFunctions(fa2);
  let out3 = reduceFunctions(fa3);
  let out4 = reduceFunctions(fa4);

  console.log(out2);
  console.log(out3);
  console.log(out4);
});