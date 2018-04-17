import { Annotation } from '@atjson/document';
import { GDocs } from './schema';
import { GDocsStyleSlice } from './types';

export default function extractLinkStyles(linkStyles: GDocsStyleSlice[]): Annotation[] {
  type Link = GDocs.Link;
  let currentLink: Partial<Link> | null = null;
  let links: Link[] = [];

  for (let i = 0; i < linkStyles.length; i++) {
    let link = linkStyles[i];

    if (link === null) continue;

    // If we have a currentLink, and the current linkStyles[i] entry is not null,
    // then this means that the link is ending. Close up our current link and
    // push it into the list of found links.
    if (currentLink !== null) {
      currentLink.end = i;
      links.push(<Link>currentLink);

      currentLink = null;
    }

    // If the linkStyles[i] entry is not null, then we have a new link starting here.
    if (link.lnks_link !== null) {
      currentLink = {
        type: '-gdocs-lnks_link',
        start: i,
        attributes: {
          '-gdocs-ulnk_url': link.lnks_link.ulnk_url,
          '-gdocs-lnk_type': link.lnks_link.lnk_type
        }
      };
    }

  }

  return links;
}
