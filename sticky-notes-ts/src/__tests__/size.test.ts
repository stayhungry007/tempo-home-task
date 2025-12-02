import { parseAndClampSize } from '../utils/size';

describe('parseAndClampSize', () => {
  test('parses integers and clamps to min width', () => {
    expect(parseAndClampSize('200', 'w')).toBe(200);
    expect(parseAndClampSize('79', 'w')).toBe(80); // below min -> clamp
    expect(parseAndClampSize('', 'w')).toBe(80); // empty -> min
    expect(parseAndClampSize('  300  ', 'w')).toBe(300); // trims
  });

  test('parses integers and clamps to min height', () => {
    expect(parseAndClampSize('150', 'h')).toBe(150);
    expect(parseAndClampSize('10', 'h')).toBe(60); // below min -> clamp
    expect(parseAndClampSize('abc', 'h')).toBe(60); // invalid -> min
  });

  test('floats are floored', () => {
    expect(parseAndClampSize('123.9', 'w')).toBe(123);
    expect(parseAndClampSize('60.1', 'h')).toBe(60);
  });
});
