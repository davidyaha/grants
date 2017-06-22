// @flow

import { Set } from 'immutable';
import { composeAll, UniversalSet } from '../src/utils';

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

describe('UniversalSet', () => {
  const universalSet = UniversalSet();

  it('should return universal set when union is applied with any set', () => {
    const someSet = Set(['rock', 'paper', 'scissors']);
    const union = universalSet.union(someSet);
    expect(union).toEqual(universalSet);
    expect(union.has('rock')).toBe(true);
  });

  it('should return set when intersect is applied with any set', () => {
    const someSet = Set(['rock', 'paper', 'scissors']);
    const otherSet = Set(['rock', 'clay']);
    const emptySet = Set();
    expect(universalSet.intersect(someSet)).toBe(someSet);
    expect(universalSet.intersect(someSet, otherSet)).toEqual(Set(['rock']));
    expect(universalSet.intersect(someSet, emptySet)).toEqual(emptySet);
  });

  it('should have all members', () => {
    expect(universalSet.includes('rock')).toBe(true);
    expect(universalSet.has('paper')).toBe(true);
  });

  it('shuld be a superset of any other set', () => {
    const someSet = Set(['rock', 'paper', 'scissors']);
    const emptySet = Set();
    expect(universalSet.isSuperset(someSet)).toBe(true);
    expect(universalSet.isSuperset(emptySet)).toBe(true);
    expect(universalSet.isSuperset(universalSet)).toBe(true);
  });

  it('shuld never be a subset of any other set', () => {
    const someSet = Set(['rock', 'paper', 'scissors']);
    const emptySet = Set();
    expect(universalSet.isSubset(someSet)).toBe(false);
    expect(universalSet.isSubset(emptySet)).toBe(false);
  });
});