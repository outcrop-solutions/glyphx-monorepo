//Courtesy of chatGpt
export function convertRgbToHsv(inputRed: number, inputGreen: number, inputBlue: number): [number, number, number] {
  // Make inputRed, inputGreen, and inputBlue fractions of 1
  inputRed = inputRed / 255;
  inputGreen = inputGreen / 255;
  inputBlue = inputBlue / 255;

  // Find the maximum and minimum values of inputRed, inputGreen, and inputBlue
  const max = Math.max(inputRed, inputGreen, inputBlue);
  const min = Math.min(inputRed, inputGreen, inputBlue);
  const diff = max - min;

  // Calculate hue
  let hue = 0;
  if (diff === 0) {
    hue = 0;
  } else if (max === inputRed) {
    hue = ((inputGreen - inputBlue) / diff) % 6;
  } else if (max === inputGreen) {
    hue = (inputBlue - inputRed) / diff + 2;
  } else {
    hue = (inputRed - inputGreen) / diff + 4;
  }
  hue = Math.round(hue * 60);
  if (hue < 0) {
    hue += 360;
  }

  // Calculate saturation
  let saturation = 0;
  if (max !== 0) {
    saturation = diff / max;
  }
  saturation = Math.round(saturation * 100);

  // Calculate value
  const value = Math.round(max * 100);

  return [hue, saturation, value];
}

//also courtasy of chatGpt
export function convertHsvToRgb(h: number, s: number, v: number): [number, number, number] {
  // Convert the hue to a value between 0 and 360 degrees
  let hue = h % 360;
  if (hue < 0) {
    hue += 360;
  }

  // Convert the saturation and value to fractions of 1
  const saturation = s / 100;
  const value = v / 100;

  // Calculate the chroma
  const c = value * saturation;

  // Calculate the x value
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));

  // Calculate the m value
  const m = value - c;

  // Calculate the RGB values
  let r = 0;
  let g = 0;
  let b = 0;
  if (hue >= 0 && hue < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (hue >= 60 && hue < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (hue >= 120 && hue < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (hue >= 180 && hue < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (hue >= 240 && hue < 300) {
    r = x;
    g = 0;
    b = c;
  } else {
    r = c;
    g = 0;
    b = x;
  }

  // Add the m value to each RGB component and convert to 8-bit integer
  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  return [r, g, b];
}
