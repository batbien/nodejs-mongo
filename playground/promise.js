console.log("[START]");

// Casual call-back called before completion of the current run of event loop
/*
function doItRightNow(cb) {
  cb();
}

function doItRightNowBySetTimeoutZero(cb) {
  setTimeout(cb, 0);
}

function doItOneSecondLater(cb){
  setTimeout(cb, 1000);
}


doItRightNowBySetTimeoutZero(() => {console.log("callback is called immediately!");});
//doItOneSecondLater(() => {console.log("callback is called after 1000ms!");});

console.log("current run is not yet completed !");
*/


// Promise callback never be called before completion of the current run of event loop
/*
function promiseRightNow(cond) {
  return new Promise((resolve, reject) => {
    cond ? resolve("Resolved immediately") : reject("Rejected immediately");
  });
}

promiseRightNow(true)
  .then(msg => { console.log(msg); })
  .catch(err => { console.log(err); });

console.log("current run is not yet completed!");
*/




// Let's wrap the old-styled setTimeout with promiseRightNow

function foo(a) {
  return;
}
function foofoo(a) {
    return (a) => {
      foo(a);
    }
}

console.log('typeof(foo("bar")): ', typeof(foo("bar")));
console.log('typeof(foofoo("bar")): ', typeof(foofoo("bar")));
// setTimeout(foofoo("bar"), 2000);


function setTimeoutPromise(duration) {
  return new Promise((resolve, reject) => {
    // always resolve with a dummy message
    console.log(resolve);
    //console.log('typeof(resolve("bar")): ', typeof(resolve()));
    setTimeout(() => {resolve("dummy")}, duration);
  });
}

setTimeoutPromise(1000).then(
    (msg) => {
      console.log("resolve msg: ", msg);
      console.log("I am called after 1000ms");
    }
  )
  .catch(() => {console.log("err");})
