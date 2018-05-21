export function buildSearchUrl(baseUrl: string, searchTerms?: string, page?: number, pageSize?: number): string {
    const parameters = [];
    if (pageSize) {
      parameters.push('limit=' + pageSize);
      if (!page) {
        page = 1;
      }
      parameters.push('page=' + page);
    }
    if (searchTerms) {
      searchTerms = searchTerms.trim();
      const terms = searchTerms.split(' ');
      const encodedTerms = [];
      terms.forEach((term) => {
        encodedTerms.push(encodeURIComponent(term));
      });
      parameters.push('name=' + encodedTerms.join(','));
    }
    let url = baseUrl;
    if (parameters.length > 0) {
      url = url + '?' + parameters.join('&');
    }
    return url;
}
