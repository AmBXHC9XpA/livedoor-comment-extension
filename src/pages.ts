import { xml2json } from 'xml-js';

export const getPages = async (url: string): Promise<string[]> => {
  const origin = new URL(url).origin;
  const response = await fetch(origin + '/index.rdf');
  if (!response.ok) {
    console.log(response);
    throw new Error();
  }

  const json = JSON.parse(
    xml2json(await response.text(), { compact: true, spaces: 2 }),
  );

  type Item = { link: { _text: string } };
  const items = json['rdf:RDF']['item'] as Item[];
  return items.map((item) => item.link._text);
};

export const getAllPages = async (
  sites: string[],
): Promise<Record<string, string[]>> => {
  return sites.reduce(
    async (prev, site) => {
      const acc = await prev;
      return {
        ...acc,
        [site]: await getPages(site),
      };
    },
    Promise.resolve({} as Record<string, string[]>),
  );
};
