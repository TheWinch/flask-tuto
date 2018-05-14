import { ImmutableArrays } from './immutable-arrays';

describe('ImmutableArrays', () => {
    it('adds elements into a new instance', () => {
        const sourceArray = [1, 2, 3, 4];

        const destArray = ImmutableArrays.append(sourceArray, 5);

        expect(destArray).not.toBe(sourceArray);
        expect(destArray).toEqual([1, 2, 3, 4, 5]);
        expect(sourceArray).toEqual([1, 2, 3, 4]);
    });

    it('removes matching elements into a new instance', () => {
        const sourceArray = [1, 2, 3, 2, 4];

        const destArray = ImmutableArrays.remove(sourceArray, 2);

        expect(destArray).not.toBe(sourceArray);
        expect(destArray).toEqual([1, 3, 4]);
        expect(sourceArray).toEqual([1, 2, 3, 2, 4]);
    });

    it('returns a copy of the original array when no matching element to remove is found', () => {
        const sourceArray = [1, 2, 3, 4];

        const destArray = ImmutableArrays.remove(sourceArray, 5);

        expect(destArray).not.toBe(sourceArray);
        expect(destArray).toEqual([1, 2, 3, 4]);
        expect(sourceArray).toEqual([1, 2, 3, 4]);
    });

    it('replaces all matching elements into a new instance', () => {
        const sourceArray = [1, 2, 3, 2, 4];

        const destArray = ImmutableArrays.replaceElement(sourceArray, 2, 5);

        expect(destArray).not.toBe(sourceArray);
        expect(destArray).toEqual([1, 5, 3, 5, 4]);
        expect(sourceArray).toEqual([1, 2, 3, 2, 4]);
    });

    it('returns a copy of the original array when no matching element to replace is found', () => {
        const sourceArray = [1, 2, 3, 4];

        const destArray = ImmutableArrays.replaceElement(sourceArray, 5, 6);

        expect(destArray).not.toBe(sourceArray);
        expect(destArray).toEqual([1, 2, 3, 4]);
        expect(sourceArray).toEqual([1, 2, 3, 4]);
    });

    it('removes all elements into a new instance when using a matcher', () => {
        const sourceArray = [1, 2, 3, 4];

        const destArray = ImmutableArrays.removeMatching(sourceArray, (n) => n % 2 === 0);

        expect(destArray).not.toBe(sourceArray);
        expect(destArray).toEqual([1, 3]);
        expect(sourceArray).toEqual([1, 2, 3, 4]);
    });
});
