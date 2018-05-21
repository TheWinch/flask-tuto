import { buildSearchUrl } from './service-utils';

describe('buildSearchUrl', () => {
    const BASE_URL = '/v1/base/';

    it('adds one criterion for each seach term', () => {
        const result = buildSearchUrl(BASE_URL, 'term1 term2');

        expect(result).toEqual('/v1/base/?name=term1,term2');
    });

    it('works with no seach term', () => {
        const result = buildSearchUrl(BASE_URL);

        expect(result).toEqual('/v1/base/');
    });

    it('ignores page if no size is given', () => {
        const result = buildSearchUrl(BASE_URL, null, 5);

        expect(result).toEqual('/v1/base/');
    });

    it('defaults page to 1', () => {
        const result = buildSearchUrl(BASE_URL, null, null, 5);

        expect(result).toEqual('/v1/base/?limit=5&page=1');
    });

    it('can paginate search terms', () => {
        const result = buildSearchUrl(BASE_URL, 'term1 term2', 2, 5);

        expect(result).toEqual('/v1/base/?limit=5&page=2&name=term1,term2');
    });

    it('encodes commas in search terms', () => {
        const result = buildSearchUrl(BASE_URL, 'term1,term2 term3');

        expect(result).toEqual('/v1/base/?name=term1%2Cterm2,term3');
    });

    it('encodes special characters in seach terms', () => {
        const result = buildSearchUrl(BASE_URL, 'term@!1 term2');

        expect(result).toEqual('/v1/base/?name=term%40!1,term2');
    });
});
