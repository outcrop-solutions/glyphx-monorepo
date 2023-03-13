import 'mocha';
import {assert} from 'chai';
import * as colorConverter from '../../util/colorConverter';

const COLOR_TABLE = [
  {color: 'Black', rgb: '0,0,0', hsv: '0,0,0'},
  {color: 'White', rgb: '255,255,255', hsv: '0,0,100'},
  {color: 'Red', rgb: '255,0,0', hsv: '0,100,100'},
  {color: 'Lime', rgb: '0,255,0', hsv: '120,100,100'},
  {color: 'Blue', rgb: '0,0,255', hsv: '240,100,100'},
  {color: 'Yellow', rgb: '255,255,0', hsv: '60,100,100'},
  {color: 'Cyan', rgb: '0,255,255', hsv: '180,100,100'},
  {color: 'Magenta', rgb: '255,0,255', hsv: '300,100,100'},
  {color: 'Silver', rgb: '191,191,191', hsv: '0,0,75'},
  {color: 'Gray', rgb: '128,128,128', hsv: '0,0,50'},
  {color: 'Maroon', rgb: '128,0,0', hsv: '0,100,50'},
  {color: 'Olive', rgb: '128,128,0', hsv: '60,100,50'},
  {color: 'Green', rgb: '0,128,0', hsv: '120,100,50'},
  {color: 'Purple', rgb: '128,0,128', hsv: '300,100,50'},
  {color: 'Teal', rgb: '0,128,128', hsv: '180,100,50'},
  {color: 'Navy', rgb: '0,0,128', hsv: '240,100,50'},
];

describe.only('colorConverter', () => {
  context('convertRgbToHsv', () => {
    it('will convert rgb colors to hsv', () => {
      for (const color of COLOR_TABLE) {
        const rgb = color.rgb.split(',').map(x => parseInt(x));
        const hsv = colorConverter.convertRgbToHsv(rgb[0], rgb[1], rgb[2]);
        const expectedHsv = color.hsv.split(',').map(x => parseInt(x));
        assert.deepEqual(hsv, expectedHsv);
      }
    });
  });
  context('convertHsvToRgb', () => {
    it('will convert hsv colors to rgb', () => {
      for (const color of COLOR_TABLE) {
        const hsv = color.hsv.split(',').map(x => parseInt(x));
        const rgb = colorConverter.convertHsvToRgb(hsv[0], hsv[1], hsv[2]);
        const expectedRgb = color.rgb.split(',').map(x => parseInt(x));
        assert.deepEqual(rgb, expectedRgb);
      }
    });

    it('will convert colors with a negative hue', () => {
      const color = {color: 'NegNavy', rgb: '0,0,128', hsv: '-120,100,50'};

      const hsv = color.hsv.split(',').map(x => parseInt(x));
      const rgb = colorConverter.convertHsvToRgb(hsv[0], hsv[1], hsv[2]);
      const expectedRgb = color.rgb.split(',').map(x => parseInt(x));
      assert.deepEqual(rgb, expectedRgb);
    });
  });
});
