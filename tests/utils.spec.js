// @flow

import { composeAll } from '../src/utils';

describe('composeAll', () => {
  it('should allow to compose more then two functions togather', () => {
    const foo = () => 'foo';
    const bar = () => 'bar';
    const boo = () => 'boo';

    const composed = composeAll(foo, bar, boo);
    expect(composed()).toBe('foo');
  });

  it('should accept multiple arguments for last function', () => {
    const foo = (arg1: any, arg2: any) => `${arg1} ${arg2}`;
    const emphesize = (val: any) => `${val}!`;
    const toUpper = (str: string) => str.toUpperCase();

    const composed = composeAll(toUpper, emphesize, foo);

    expect(composed('hello', 'world')).toBe('HELLO WORLD!');
  });
});