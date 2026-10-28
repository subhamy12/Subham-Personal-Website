const u_int8_t ledPins[] = {3, 5, 7, 9 };
unsigned long ledIntervals[4];
unsigned long lastToggleTime[] = { 0, 0, 0, 0 };
bool ledState[] = { false, false, false, false };

void setup() {

  for (int i = 0; i < 4; i++) {
    pinMode(ledPins[i], OUTPUT);
  }

  for (int i = 0; i < 4; i++) {
    ledIntervals[i] = random(1, 11) * 100;
  }

}

int count = 0;
bool doubleCount = true;

// if not wanting to do metronome change from true to false or vice versa
bool metronome = false;

void loop() {

  unsigned long currentTime = millis();
  if (metronome) {
    if (currentTime - lastToggleTime[0] >= 300) {
      lastToggleTime[0] = currentTime;
      ledState[0] = !ledState[0];
      digitalWrite(ledPins[0], ledState[0]);
      count++;
    }
    if (count == 1) {
      digitalWrite(ledPins[1], true);
      digitalWrite(ledPins[2], true);
      if (doubleCount) {
        digitalWrite(ledPins[3], true);
      }
    }
    if (count == 2) {
      digitalWrite(ledPins[1], false);
      digitalWrite(ledPins[2], false);
      digitalWrite(ledPins[3], false);
    }
    if (count == 5) {
      digitalWrite(ledPins[1], true);
    }
    if (count == 6) {
      digitalWrite(ledPins[1], false);
    }
    if (count == 8) {
      count = 0;
      doubleCount = !doubleCount;
    }
  }


  else {
    for (int i = 0; i < 4; i++) {
      if (currentTime - lastToggleTime[i] >= ledIntervals[i]) {
        lastToggleTime[i] = currentTime;
        ledState[i] = !ledState[i];
        digitalWrite(ledPins[i], ledState[i]);
        count++;
      }
    }
  }

  
}
