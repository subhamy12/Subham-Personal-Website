// A line-for-line JavaScript port of Flashing-Lights_Metronome.ino.
// The simulator calls setup() once, then loop() once per simulated millisecond.

export const LED_PINS = [3, 5, 7, 9];

// Arduino's random(min, max) returns min..max-1.
const random = (min, max) => min + Math.floor(Math.random() * (max - min));

export function createSketch(metronome) {
  const ledIntervals = [0, 0, 0, 0];
  const lastToggleTime = [0, 0, 0, 0];
  const ledState = [false, false, false, false];
  // What each pin is currently outputting (digitalWrite target).
  const pins = [false, false, false, false];
  let count = 0;
  let doubleCount = true;

  const digitalWrite = (index, value) => {
    pins[index] = value;
  };

  function setup() {
    for (let i = 0; i < 4; i++) {
      ledIntervals[i] = random(1, 11) * 100;
    }
  }

  function loop(currentTime) {
    if (metronome) {
      if (currentTime - lastToggleTime[0] >= 300) {
        lastToggleTime[0] = currentTime;
        ledState[0] = !ledState[0];
        digitalWrite(0, ledState[0]);
        count++;
      }
      if (count === 1) {
        digitalWrite(1, true);
        digitalWrite(2, true);
        if (doubleCount) {
          digitalWrite(3, true);
        }
      }
      if (count === 2) {
        digitalWrite(1, false);
        digitalWrite(2, false);
        digitalWrite(3, false);
      }
      if (count === 5) {
        digitalWrite(1, true);
      }
      if (count === 6) {
        digitalWrite(1, false);
      }
      if (count === 8) {
        count = 0;
        doubleCount = !doubleCount;
      }
    } else {
      for (let i = 0; i < 4; i++) {
        if (currentTime - lastToggleTime[i] >= ledIntervals[i]) {
          lastToggleTime[i] = currentTime;
          ledState[i] = !ledState[i];
          digitalWrite(i, ledState[i]);
          count++;
        }
      }
    }
  }

  setup();

  return {
    loop,
    state: () => ({ pins: [...pins], ledIntervals: [...ledIntervals], count, doubleCount }),
  };
}
