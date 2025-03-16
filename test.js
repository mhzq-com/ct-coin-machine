var EventEmitter = require("events").EventEmitter
class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();
let m = 0;

myEmitter.once('event', () => {
  console.log("1st", ++m);
});
myEmitter.removeAllListeners("event");
myEmitter.once('event', () => {
  console.log("2nd");
  });
myEmitter.removeAllListeners("event");
myEmitter.once('event', () => {
  console.log("3rd");
});
//myEmitter.emit('event');

// Prints: 1
setTimeout(() => {
  
  myEmitter.emit('event');
}, 2000);