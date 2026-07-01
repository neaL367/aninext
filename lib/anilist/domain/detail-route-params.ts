export type SlugDetailParams = Promise<{ id: string; slug: string }>;

export type EntityDetailRouteParams = Promise<{
  category: string;
  id: string;
  slug: string;
}>;

export function toSlugDetailParams(params: EntityDetailRouteParams): SlugDetailParams {
  return params.then(({ id, slug }) => ({ id, slug }));
}
